import { redirect } from 'next/navigation'

import { appClient } from '@/lib/auth0'
import { managementClient } from '@/lib/auth0-manage'
import { PageHeader } from '@/components/page-header'

import UserSessions from './user-sessions'

export default async function Profile() {
  const session = await appClient.getSession()

  if (!session) {
    return redirect('/auth/login?returnTo=/dashboard/account/sessions')
  }

  const userId = session?.user.sub

  const sessionsResponse = await managementClient.users.getSessions({
    user_id: userId,
  })
  const sessions = sessionsResponse.data.sessions

  return (
    <div className="space-y-2">
      <PageHeader
        title="Active Sessions"
        description="Manage your account's active sessions."
      />
      <UserSessions user={session!.user} sessions={sessions} />
    </div>
  )
}
