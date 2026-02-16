'use client'

import {
  CheckCircle2,
  Globe,
  Laptop,
  Monitor,
  Smartphone,
  Trash2,
} from 'lucide-react'
import { toast } from 'sonner'
import { UAParser } from 'ua-parser-js'

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

import { deleteSession } from './actions'

interface KeyValueMap {
  [key: string]: any
}

type UserSessionsProps = { user: KeyValueMap; sessions?: KeyValueMap[] }

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

function getAuthMethodLabel(methods?: { name?: string }[]): string | null {
  const name = methods?.[0]?.name
  if (!name) return null
  const labels: Record<string, string> = {
    pwd: 'Password',
    passkey: 'Passkey',
    federated: 'Social / SSO',
    mfa: 'MFA',
    sms: 'SMS',
    email: 'Email',
  }
  return labels[name] ?? name
}

function formatDate(dateString: string) {
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  } catch {
    return 'Unknown'
  }
}

export default function UserSessions({ user, sessions }: UserSessionsProps) {
  return (
    <div className="bg-card rounded-lg border">
      {!sessions ? (
        <div className="flex flex-col items-center justify-center px-4 py-10">
          <Monitor className="text-muted-foreground/40 mb-3 h-10 w-10" />
          <p className="text-muted-foreground text-sm">
            There was a problem loading your sessions. Try again later.
          </p>
        </div>
      ) : sessions.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-4 py-10">
          <Monitor className="text-muted-foreground/40 mb-3 h-10 w-10" />
          <p className="text-muted-foreground text-sm">No active sessions</p>
        </div>
      ) : (
        <div>
          {sessions
            .sort(({ id }) => (id === user.sid ? -1 : 1))
            .map((session, idx) => {
              const { id } = session
              const lastUA = new UAParser(
                session.device?.last_user_agent || 'unknown'
              ).getResult()
              const DeviceIcon = getDeviceIcon(
                session.device?.last_user_agent || ''
              )
              const isCurrent = id === user.sid
              const authMethod = getAuthMethodLabel(
                session.authentication?.methods
              )

              return (
                <div key={`session-${idx}-${id}`}>
                  {idx > 0 && <Separator />}
                  <div className="grid grid-cols-[auto_1fr] items-center gap-x-3 gap-y-1 p-4 md:grid-cols-[36px_1fr_1fr_1fr_88px] md:items-center md:gap-x-6">
                    <div className="bg-muted row-span-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg md:row-span-1">
                      <DeviceIcon className="text-muted-foreground h-4 w-4" />
                    </div>

                    <div className="col-span-1 min-w-0 md:col-span-1">
                      <p className="truncate text-sm font-medium">
                        {lastUA.browser.name ?? 'Unknown browser'} on{' '}
                        {lastUA.os.name ?? 'Unknown OS'}
                        {isCurrent && (
                          <Badge
                            variant="outline"
                            className="ml-2 inline-flex shrink-0 border-emerald-500/20 bg-emerald-500/10 text-emerald-600"
                          >
                            <CheckCircle2 className="mr-1 h-3 w-3" />
                            Current
                          </Badge>
                        )}
                      </p>
                      <p className="text-muted-foreground text-xs md:hidden">
                        Last active{' '}
                        {timeAgo(
                          session.last_interacted_at || session.updated_at
                        )}
                        {session.device?.last_ip && (
                          <> &middot; IP: {session.device.last_ip}</>
                        )}
                      </p>
                      <p className="text-muted-foreground/70 text-xs md:hidden">
                        {authMethod && (
                          <>Signed in via {authMethod} &middot; </>
                        )}
                        {formatDate(session.created_at)}
                      </p>
                    </div>

                    <div className="hidden min-w-0 md:block">
                      <p className="text-muted-foreground text-xs">
                        Last active{' '}
                        {timeAgo(
                          session.last_interacted_at || session.updated_at
                        )}
                      </p>
                      {session.device?.last_ip && (
                        <p className="text-muted-foreground/70 text-xs">
                          IP: {session.device.last_ip}
                        </p>
                      )}
                    </div>

                    <div className="hidden min-w-0 md:block">
                      {authMethod && (
                        <p className="text-muted-foreground text-xs">
                          Signed in via {authMethod}
                        </p>
                      )}
                      <p className="text-muted-foreground/70 text-xs">
                        {formatDate(session.created_at)}
                      </p>
                    </div>

                    <div className="col-start-2 flex items-center md:col-start-auto">
                      {!isCurrent ? (
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
                              <AlertDialogTitle>
                                Revoke session
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently sign out this session. The
                                device will need to sign in again to access the
                                account.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <form
                                action={async (formData: FormData) => {
                                  const { error } =
                                    await deleteSession(formData)
                                  if (error) {
                                    toast.error(error)
                                  } else {
                                    toast.success('Session has been revoked.')
                                  }
                                }}
                              >
                                <input
                                  type="hidden"
                                  name="session_id"
                                  value={session.id}
                                />
                                <SubmitButton variant="destructive">
                                  Revoke
                                </SubmitButton>
                              </form>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      ) : (
                        <div />
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
        </div>
      )}
    </div>
  )
}
