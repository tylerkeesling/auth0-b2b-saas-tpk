'use client'

import { useRouter } from 'next/navigation'
import {
  Bell,
  CheckCircle2,
  Fingerprint,
  Key,
  KeyRound,
  Mail,
  ShieldCheck,
  Smartphone,
  Star,
  Trash2,
  type LucideIcon,
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
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { SubmitButton } from '@/components/submit-button'

import {
  createEnrollment,
  deleteEnrollment,
  setPreferredMethod,
} from './actions'

export type MfaFactor = {
  name: string
  tenantEnabled: boolean
  orgEnabled: boolean
  enrollmentId?: string
}

interface MfaFactorsSectionProps {
  factors: MfaFactor[]
  preferredMethod: string | null
}

const factorIcons: Record<string, LucideIcon> = {
  sms: Smartphone,
  email: Mail,
  otp: KeyRound,
  'push-notification': Bell,
  'webauthn-roaming': Key,
  'webauthn-platform': Fingerprint,
}

const factorsMeta: Record<string, { title: string; description: string }> = {
  sms: {
    title: 'Phone Message',
    description: 'Receive a verification code via SMS',
  },
  'push-notification': {
    title: 'Push Notification',
    description: 'Verify via Auth0 Guardian push notification',
  },
  otp: {
    title: 'One-time Password',
    description: 'Use an authenticator app like Google Authenticator',
  },
  email: {
    title: 'Email',
    description: 'Receive a verification code via email',
  },
  'webauthn-roaming': {
    title: 'Security Keys',
    description: 'Use a FIDO2-compliant security key',
  },
  'webauthn-platform': {
    title: 'Device Biometrics',
    description: "Use your device's built-in biometrics",
  },
}

interface IPopupWindow {
  width: number
  height: number
  title: string
  url: string
  focus: boolean
  scrollbars: boolean
}

function openPopupWindow(popupOptions: IPopupWindow): Window | null {
  const dualScreenLeft = window.screenLeft ?? window.screenX
  const dualScreenTop = window.screenTop ?? window.screenY

  const width =
    window.innerWidth || document.documentElement.clientWidth || screen.width
  const height =
    window.innerHeight || document.documentElement.clientHeight || screen.height

  const systemZoom = window.devicePixelRatio || 1

  const defaultWidth = 600
  const defaultHeight = 400

  const popupWidth = Math.min(popupOptions.width || defaultWidth, width)
  const popupHeight = Math.min(popupOptions.height || defaultHeight, height)

  const left = (width - popupWidth) / 2 / systemZoom + dualScreenLeft
  const top = (height - popupHeight) / 2 / systemZoom + dualScreenTop

  const newWindow = window.open(
    popupOptions.url,
    popupOptions.title,
    `scrollbars=${popupOptions.scrollbars ? 'yes' : 'no'},
     width=${popupWidth / systemZoom},
     height=${popupHeight / systemZoom},
     top=${top},
     left=${left}`
  )

  if (newWindow) {
    newWindow.opener = null
    if (popupOptions.focus) {
      newWindow.focus()
    }
  }

  return newWindow
}

export function MfaFactorsSection({
  factors,
  preferredMethod,
}: MfaFactorsSectionProps) {
  const router = useRouter()

  const visibleFactors = factors
    .filter((factor) => factor.enrollmentId || factor.tenantEnabled)
    .sort((a, b) => {
      const aDisabled = !a.orgEnabled && !a.enrollmentId ? 1 : 0
      const bDisabled = !b.orgEnabled && !b.enrollmentId ? 1 : 0
      return aDisabled - bDisabled
    })

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] lg:items-start lg:gap-10">
      <div className="mb-4 lg:mb-0">
        <div className="mb-1.5 flex items-center gap-2.5">
          <ShieldCheck className="text-muted-foreground h-4 w-4" />
          <h2 className="text-foreground text-sm font-semibold">MFA factors</h2>
        </div>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Add a second layer of security to your account. When MFA is required,
          you&apos;ll need to verify your identity with one of these methods.
        </p>
      </div>

      <div className="bg-card rounded-lg border">
        {visibleFactors.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-4 py-10">
            <ShieldCheck className="text-muted-foreground/40 mb-3 h-10 w-10" />
            <p className="text-muted-foreground text-sm">
              No MFA factors available
            </p>
          </div>
        ) : (
          <div>
            {visibleFactors.map((factor, idx) => {
              const meta = factorsMeta[factor.name]
              const Icon = factorIcons[factor.name] ?? ShieldCheck
              const isPreferred = preferredMethod === factor.name

              if (!meta) return null

              const isGreyedOut = !factor.orgEnabled && !factor.enrollmentId

              return (
                <div key={factor.name}>
                  {idx > 0 && <Separator />}
                  <div
                    className={`flex items-center justify-between gap-4 p-4${isGreyedOut ? 'opacity-50' : ''}`}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="bg-muted flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
                        <Icon className="text-muted-foreground h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium">{meta.title}</p>
                          {factor.enrollmentId && (
                            <Badge
                              variant="outline"
                              className="shrink-0 border-emerald-500/20 bg-emerald-500/10 text-emerald-600"
                            >
                              <CheckCircle2 className="mr-1 h-3 w-3" />
                              Enrolled
                            </Badge>
                          )}
                          {factor.enrollmentId && isPreferred && (
                            <Badge
                              variant="outline"
                              className="shrink-0 border-blue-500/20 bg-blue-500/10 text-blue-600"
                            >
                              <Star className="mr-1 h-3 w-3" />
                              Preferred
                            </Badge>
                          )}
                        </div>
                        <p className="text-muted-foreground text-xs">
                          {meta.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      {factor.enrollmentId && !isPreferred && (
                        <form
                          action={async (formData: FormData) => {
                            const { error } = await setPreferredMethod(formData)
                            if (error) {
                              toast.error(error)
                            } else {
                              toast.success('Preferred MFA method updated.')
                            }
                          }}
                        >
                          <input
                            type="hidden"
                            name="factor_name"
                            value={factor.name}
                          />
                          <SubmitButton variant="ghost" size="sm">
                            Set as preferred
                          </SubmitButton>
                        </form>
                      )}

                      {factor.enrollmentId ? (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="mr-1.5 h-4 w-4" />
                              Remove
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Remove MFA enrollment
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently remove your {meta.title}{' '}
                                enrollment. You will no longer be able to use it
                                for multifactor authentication.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <form
                                action={async (formData: FormData) => {
                                  const { error } =
                                    await deleteEnrollment(formData)
                                  if (error) {
                                    toast.error(error)
                                  } else {
                                    toast.success(
                                      'Enrollment removed successfully.'
                                    )
                                  }
                                }}
                              >
                                <input
                                  type="hidden"
                                  name="enrollment_id"
                                  value={factor.enrollmentId}
                                />
                                <input
                                  type="hidden"
                                  name="factor_name"
                                  value={factor.name}
                                />
                                <SubmitButton variant="destructive">
                                  Remove
                                </SubmitButton>
                              </form>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      ) : isGreyedOut ? (
                        <div className="flex flex-col items-end gap-1">
                          <Button variant="default" size="sm" disabled>
                            Enroll
                          </Button>
                          <p className="text-muted-foreground text-xs">
                            Not enabled by your organization
                          </p>
                        </div>
                      ) : (
                        <form
                          action={async (formData: FormData) => {
                            const { error, ticketUrl } =
                              await createEnrollment(formData)

                            if (error) {
                              toast.error(error)
                              return
                            }

                            const enrollmentPopupWindow = openPopupWindow({
                              url: ticketUrl!,
                              title: 'MFA Enrollment',
                              width: 420,
                              height: 680,
                              scrollbars: true,
                              focus: true,
                            })

                            const timer = setInterval(async () => {
                              if (
                                enrollmentPopupWindow &&
                                enrollmentPopupWindow.closed
                              ) {
                                clearInterval(timer)
                                router.refresh()
                              }
                            }, 200)
                          }}
                        >
                          <input
                            type="hidden"
                            name="factor_name"
                            value={factor.name}
                          />
                          <SubmitButton variant="default" size="sm">
                            Enroll
                          </SubmitButton>
                        </form>
                      )}
                    </div>
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
