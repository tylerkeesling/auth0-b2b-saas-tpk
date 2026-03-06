'use client'

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'

import { getMyAccountError } from '@/lib/mfa-utils'
import {
  myAccount,
  MyAccountApiError,
  type CreateAuthenticationMethodResponse,
} from '@/lib/my-account'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp'
import { Label } from '@/components/ui/label'

interface SmsEnrollmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function SmsEnrollmentDialog({
  open,
  onOpenChange,
  onSuccess,
}: SmsEnrollmentDialogProps) {
  const [step, setStep] = useState<'phone' | 'verify'>('phone')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [challengeData, setChallengeData] =
    useState<CreateAuthenticationMethodResponse | null>(null)
  const [sending, setSending] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [otp, setOtp] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setStep('phone')
      setPhoneNumber('')
      setChallengeData(null)
      setOtp('')
      setError(null)
    }
  }, [open])

  const handleSendCode = async () => {
    if (!phoneNumber.trim()) return

    // Basic validation: must start with + and have digits
    if (!/^\+\d[\d\s()-]*\d$/.test(phoneNumber.trim())) {
      setError(
        'Please enter a valid phone number starting with a country code (e.g. +1).'
      )
      return
    }

    setSending(true)
    setError(null)

    try {
      const { data } = await myAccount.authenticationMethods.create({
        type: 'phone',
        phone_number: phoneNumber.trim(),
      })
      setChallengeData(data)
      setStep('verify')
    } catch (err) {
      if (err instanceof MyAccountApiError) {
        setError(getMyAccountError(err))
      } else {
        setError('Failed to send verification code. Please try again.')
      }
    } finally {
      setSending(false)
    }
  }

  const handleVerify = async () => {
    if (!challengeData || otp.length !== 6) return

    setVerifying(true)
    setError(null)

    try {
      await myAccount.authenticationMethods.verify(challengeData.id, {
        auth_session: challengeData.auth_session,
        otp,
      })
      onSuccess()
    } catch (err) {
      if (err instanceof MyAccountApiError) {
        setError(getMyAccountError(err))
      } else {
        setError('Verification failed. Please try again.')
      }
      setOtp('')
    } finally {
      setVerifying(false)
    }
  }

  const handleResend = async () => {
    setSending(true)
    setError(null)
    setOtp('')

    try {
      const { data } = await myAccount.authenticationMethods.create({
        type: 'phone',
        phone_number: phoneNumber.trim(),
      })
      setChallengeData(data)
    } catch (err) {
      if (err instanceof MyAccountApiError) {
        setError(getMyAccountError(err))
      } else {
        setError('Failed to resend code. Please try again.')
      }
    } finally {
      setSending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false}>
        {step === 'phone' ? (
          <>
            <DialogHeader>
              <DialogTitle>Set up phone message</DialogTitle>
              <DialogDescription>
                Enter your phone number to receive a verification code via SMS.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-4">
              <div className="space-y-2">
                <Label htmlFor="phone-number">Phone number</Label>
                <Input
                  id="phone-number"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSendCode()
                  }}
                />
              </div>

              {error && <p className="text-destructive text-sm">{error}</p>}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSendCode}
                disabled={!phoneNumber.trim() || sending}
              >
                {sending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Send code
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Verify your phone</DialogTitle>
              <DialogDescription>
                Enter the 6-digit code sent to {phoneNumber}.
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col items-center gap-4 py-4">
              <InputOTP
                maxLength={6}
                value={otp}
                onChange={setOtp}
                onComplete={handleVerify}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>

              {error && <p className="text-destructive text-sm">{error}</p>}

              <button
                type="button"
                className="text-muted-foreground hover:text-foreground text-xs underline"
                onClick={handleResend}
                disabled={sending}
              >
                {sending ? 'Sending...' : "Didn't receive a code? Resend"}
              </button>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setStep('phone')}>
                Back
              </Button>
              <Button
                onClick={handleVerify}
                disabled={otp.length !== 6 || verifying}
              >
                {verifying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Verify
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
