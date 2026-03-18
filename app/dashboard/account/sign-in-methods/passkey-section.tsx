'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Fingerprint,
  Globe,
  Laptop,
  Loader2,
  Monitor,
  Smartphone,
  Trash2,
} from 'lucide-react'
import { toast } from 'sonner'

import { myAccount, type PasskeyEnrollment } from '@/lib/my-account'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { SubmitButton } from '@/components/submit-button'

import { revokePasskey } from './actions'
import type { Passkey } from './sign-in-methods-page'

// --- Base64url helpers for WebAuthn ---

function base64UrlToBuffer(base64url: string): ArrayBuffer {
  const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/')
  const padded = base64.padEnd(
    base64.length + ((4 - (base64.length % 4)) % 4),
    '='
  )
  const binary = atob(padded)
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0))
  return bytes.buffer as ArrayBuffer
}

function bufferToBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (const byte of bytes) {
    binary += String.fromCharCode(byte)
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

// --- Helpers ---

function getDeviceIcon(userAgent: string) {
  const ua = userAgent.toLowerCase()
  if (
    ua.includes('iphone') ||
    ua.includes('android') ||
    ua.includes('mobile')
  ) {
    return Smartphone
  }
  if (
    ua.includes('macintosh') ||
    ua.includes('mac os') ||
    ua.includes('laptop')
  ) {
    return Laptop
  }
  if (ua.includes('windows') || ua.includes('linux')) {
    return Monitor
  }
  return Globe
}

function timeAgo(dateString: string) {
  try {
    const now = Date.now()
    const then = new Date(dateString).getTime()
    const seconds = Math.floor((now - then) / 1000)

    const intervals: [number, string][] = [
      [31536000, 'year'],
      [2592000, 'month'],
      [604800, 'week'],
      [86400, 'day'],
      [3600, 'hour'],
      [60, 'minute'],
    ]

    for (const [secs, label] of intervals) {
      const count = Math.floor(seconds / secs)
      if (count >= 1) {
        return `${count} ${label}${count > 1 ? 's' : ''} ago`
      }
    }
    return 'just now'
  } catch {
    return 'Unknown'
  }
}

// --- Component ---

interface PasskeySectionProps {
  passkeys: Passkey[]
  userId: string
}

export function PasskeySection({ passkeys, userId }: PasskeySectionProps) {
  const router = useRouter()
  const [enrolling, setEnrolling] = useState(false)

  async function enrollPasskey() {
    setEnrolling(true)

    try {
      // Step 1: Start enrollment via My Account API
      const { data: enrollment } = await myAccount.authenticationMethods.create(
        {
          type: 'passkey',
          connection: 'SaaStart-Shared-Database',
          identity_user_id: userId.split('|').pop()!,
        }
      )

      const { auth_session, authn_params_public_key: options } =
        enrollment as PasskeyEnrollment

      // Step 2: Browser WebAuthn ceremony
      if (!navigator.credentials) {
        throw new Error(
          'WebAuthn is not available. Passkeys require a secure (HTTPS) context.'
        )
      }

      const credential = (await navigator.credentials.create({
        publicKey: {
          ...options,
          challenge: base64UrlToBuffer(options.challenge),
          user: {
            ...options.user,
            id: base64UrlToBuffer(options.user.id),
          },
          excludeCredentials: options.excludeCredentials?.map((c) => ({
            ...c,
            id: base64UrlToBuffer(c.id),
          })),
        },
      })) as PublicKeyCredential | null

      if (!credential) {
        throw new DOMException('No credential returned.', 'NotAllowedError')
      }

      const attestation =
        credential.response as AuthenticatorAttestationResponse

      // Step 3: Verify enrollment via My Account API
      await myAccount.authenticationMethods.verify(credential.id, {
        auth_session,
        authn_response: {
          id: credential.id,
          rawId: bufferToBase64Url(credential.rawId),
          response: {
            attestationObject: bufferToBase64Url(attestation.attestationObject),
            clientDataJSON: bufferToBase64Url(attestation.clientDataJSON),
          },
          type: 'public-key',
        },
      })

      toast.success('Passkey added.')
      router.refresh()
    } catch (err) {
      if (err instanceof DOMException && err.name === 'NotAllowedError') {
        toast('Passkey enrollment cancelled.')
      } else {
        toast.error(
          err instanceof Error
            ? err.message
            : 'Failed to add passkey. Please try again.'
        )
      }
    } finally {
      setEnrolling(false)
    }
  }

  const addRow = (
    <button
      onClick={enrollPasskey}
      disabled={enrolling}
      className="hover:bg-muted/50 flex w-full items-center gap-3 p-4 text-left transition-colors disabled:pointer-events-none"
    >
      <div className="bg-muted flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
        {enrolling ? (
          <Loader2 className="text-muted-foreground h-4 w-4 animate-spin" />
        ) : (
          <Fingerprint className="text-muted-foreground h-4 w-4" />
        )}
      </div>
      <p className="text-muted-foreground text-sm">
        {enrolling
          ? 'Setting up passkey…'
          : passkeys.length === 0
            ? 'Add a passkey?'
            : 'Add a passkey'}
      </p>
    </button>
  )

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] lg:items-start lg:gap-10">
      <div className="mb-4 lg:mb-0">
        <div className="mb-1.5 flex items-center gap-2.5">
          <Fingerprint className="text-muted-foreground h-4 w-4" />
          <h2 className="text-foreground text-sm font-semibold">Passkeys</h2>
        </div>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Passkeys provide a more secure and convenient way to sign in using
          biometrics or your device&apos;s screen lock.
        </p>
      </div>

      <div className="bg-card rounded-lg border">
        {passkeys.length === 0 ? (
          addRow
        ) : (
          <div>
            {passkeys.map((passkey, idx) => {
              const DeviceIcon = getDeviceIcon(passkey.user_agent)

              return (
                <div key={passkey.id}>
                  {idx > 0 && <Separator />}
                  <div className="flex items-center justify-between gap-4 p-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="bg-muted flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
                        <DeviceIcon className="text-muted-foreground h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium">{passkey.id}</p>
                        <p className="text-muted-foreground truncate text-xs">
                          {passkey.user_agent}
                        </p>
                        <p className="text-muted-foreground/70 text-xs">
                          Last used {timeAgo(passkey.last_auth_at)}
                        </p>
                      </div>
                    </div>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground hover:text-destructive shrink-0"
                        >
                          <Trash2 className="mr-1.5 h-4 w-4" />
                          Revoke
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Revoke passkey</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently remove this passkey. You will
                            no longer be able to use it to sign in.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <form
                            action={async (formData: FormData) => {
                              const { error } = await revokePasskey(formData)
                              if (error) {
                                toast.error(error)
                              } else {
                                toast.success('Passkey has been revoked.')
                              }
                            }}
                          >
                            <input
                              type="hidden"
                              name="authentication_method_id"
                              value={passkey.id}
                            />
                            <SubmitButton variant="destructive">
                              Revoke
                            </SubmitButton>
                          </form>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              )
            })}
            <Separator />
            {addRow}
          </div>
        )}
      </div>
    </div>
  )
}
