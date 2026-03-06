'use client'

import { useCallback, useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'

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
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp'

interface TotpEnrollmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

function extractSecretFromUri(uri: string): string | null {
  try {
    const url = new URL(uri)
    return url.searchParams.get('secret')
  } catch {
    return null
  }
}

export function TotpEnrollmentDialog({
  open,
  onOpenChange,
  onSuccess,
}: TotpEnrollmentDialogProps) {
  const [step, setStep] = useState<'setup' | 'verify'>('setup')
  const [challengeData, setChallengeData] =
    useState<CreateAuthenticationMethodResponse | null>(null)
  const [creating, setCreating] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [otp, setOtp] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [createError, setCreateError] = useState<string | null>(null)

  const createEnrollment = useCallback(async () => {
    setCreating(true)
    setCreateError(null)

    try {
      const { data } = await myAccount.authenticationMethods.create({
        type: 'totp',
      })
      setChallengeData(data)
      setStep('setup')
    } catch (err) {
      if (err instanceof MyAccountApiError) {
        setCreateError(getMyAccountError(err))
      } else {
        setCreateError('Failed to set up authenticator. Please try again.')
      }
    } finally {
      setCreating(false)
    }
  }, [])

  useEffect(() => {
    if (open) {
      setStep('setup')
      setChallengeData(null)
      setOtp('')
      setError(null)
      setCreateError(null)
      createEnrollment()
    }
  }, [open, createEnrollment])

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

  const secret = challengeData?.totp_uri
    ? extractSecretFromUri(challengeData.totp_uri)
    : null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false}>
        {creating ? (
          <div className="flex flex-col items-center justify-center py-10">
            <Loader2 className="text-muted-foreground mb-3 h-8 w-8 animate-spin" />
            <p className="text-muted-foreground text-sm">
              Setting up authenticator...
            </p>
          </div>
        ) : createError ? (
          <>
            <DialogHeader>
              <DialogTitle>Set up authenticator app</DialogTitle>
              <DialogDescription>{createError}</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={createEnrollment}>Try again</Button>
            </DialogFooter>
          </>
        ) : step === 'setup' && challengeData?.totp_uri ? (
          <>
            <DialogHeader>
              <DialogTitle>Set up authenticator app</DialogTitle>
              <DialogDescription>
                Scan this QR code with your authenticator app (e.g. Google
                Authenticator, Authy), then click Next to verify.
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col items-center gap-4 py-4">
              <div className="rounded-lg border bg-white p-3">
                <QRCodeSVG value={challengeData.totp_uri} size={200} />
              </div>
              {secret && (
                <div className="w-full">
                  <p className="text-muted-foreground mb-1 text-xs">
                    Can&apos;t scan? Enter this key manually:
                  </p>
                  <code className="bg-muted block rounded px-3 py-2 font-mono text-xs break-all">
                    {secret}
                  </code>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={() => setStep('verify')}>Next</Button>
            </DialogFooter>
          </>
        ) : step === 'verify' ? (
          <>
            <DialogHeader>
              <DialogTitle>Verify your code</DialogTitle>
              <DialogDescription>
                Enter the 6-digit code from your authenticator app to complete
                setup.
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
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setStep('setup')}>
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
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
