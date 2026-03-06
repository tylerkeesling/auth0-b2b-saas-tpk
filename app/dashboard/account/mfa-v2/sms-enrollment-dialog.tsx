'use client'

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'

import { getMyAccountError } from '@/lib/mfa-utils'
import {
  myAccount,
  MyAccountApiError,
  type PhoneEnrollment,
} from '@/lib/my-account'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

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
  const [agreed, setAgreed] = useState(false)
  const [challengeData, setChallengeData] = useState<PhoneEnrollment | null>(
    null
  )
  const [sending, setSending] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [otp, setOtp] = useState('')
  const [error, setError] = useState<string | null>(null)

  const fullNumber = `+1${phoneNumber.replace(/\D/g, '')}`

  useEffect(() => {
    if (open) {
      setStep('phone')
      setPhoneNumber('')
      setAgreed(false)
      setChallengeData(null)
      setOtp('')
      setError(null)
    }
  }, [open])

  const handleSendCode = async () => {
    const digits = phoneNumber.replace(/\D/g, '')
    if (!digits) return

    setSending(true)
    setError(null)

    try {
      const { data } = await myAccount.authenticationMethods.create({
        type: 'phone',
        phone_number: fullNumber,
        preferred_authentication_method: 'sms',
      })
      setChallengeData(data as PhoneEnrollment)
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
        otp_code: otp,
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
        phone_number: fullNumber,
        preferred_authentication_method: 'sms',
      })
      setChallengeData(data as PhoneEnrollment)
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
              <DialogTitle>Add your mobile phone number</DialogTitle>
              <DialogDescription>
                We&apos;ll send you a secure, one-time verification code.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Phone number</Label>
                <div className="flex gap-2">
                  <Select defaultValue="+1">
                    <SelectTrigger className="w-[80px] shrink-0">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="+1">+1</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    type="tel"
                    placeholder="(555) 123-4567"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && agreed) handleSendCode()
                    }}
                  />
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Checkbox
                  id="sms-agree"
                  checked={agreed}
                  onCheckedChange={(v) => setAgreed(v === true)}
                  className="mt-0.5"
                />
                <Label
                  htmlFor="sms-agree"
                  className="text-muted-foreground text-xs leading-normal font-normal"
                >
                  I agree to receive account verification texts at this number.
                </Label>
              </div>

              <p className="text-muted-foreground text-[11px] leading-relaxed">
                Msg &amp; data rates may apply.
              </p>

              {error && <p className="text-destructive text-sm">{error}</p>}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSendCode}
                disabled={!phoneNumber.replace(/\D/g, '') || !agreed || sending}
              >
                {sending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Send Code
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Verify your phone</DialogTitle>
              <DialogDescription>
                Enter the 6-digit code sent to {fullNumber}.
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
