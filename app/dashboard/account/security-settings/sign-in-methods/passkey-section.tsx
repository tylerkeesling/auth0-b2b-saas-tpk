'use client'

import {
  Fingerprint,
  Globe,
  Laptop,
  Monitor,
  Smartphone,
  Trash2,
} from 'lucide-react'
import { toast } from 'sonner'

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

interface PasskeySectionProps {
  passkeys: Passkey[]
}

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

export function PasskeySection({ passkeys }: PasskeySectionProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] lg:gap-10">
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
          <div className="flex flex-col items-center justify-center px-4 py-10">
            <Fingerprint className="text-muted-foreground/40 mb-3 h-10 w-10" />
            <p className="text-muted-foreground text-sm">
              No passkeys registered
            </p>
          </div>
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
          </div>
        )}
      </div>
    </div>
  )
}
