import { redirect } from 'next/navigation'
import { Monitor } from 'lucide-react'

import { appClient } from '@/lib/auth0'
import { managementClient } from '@/lib/auth0-manage'
import { Separator } from '@/components/ui/separator'

import UserSessions from './user-sessions'

export default async function Profile() {
  const session = await appClient.getSession()

  if (!session) {
    return redirect('/auth/login?returnTo=/dashboard/account/sessions')
  }

  const userId = session?.user.sub

  const sessionsResponse = await managementClient.users.sessions.list(userId)
  const sessions = sessionsResponse.data

  return (
    <div className="space-y-8">
      <header>
        <div className="mb-2 flex items-center gap-2.5">
          <Monitor className="text-muted-foreground h-5 w-5" />
          <h1 className="text-foreground text-xl font-semibold tracking-tight">
            Active Sessions
          </h1>
        </div>
        <p className="text-muted-foreground max-w-md text-sm leading-relaxed">
          Manage your account&apos;s active sessions. You can revoke any session
          to sign out that device.
        </p>
      </header>

      <Separator />

      <UserSessions user={session!.user} sessions={sessions} />
    </div>
  )
}
