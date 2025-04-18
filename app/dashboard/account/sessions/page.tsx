import { appClient, managementClient } from "@/lib/auth0"
import { PageHeader } from "@/components/page-header"

import UserSessions from "./user-sessions"

export default appClient.withPageAuthRequired(
  async function Profile() {
    const session = await appClient.getSession()
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
  },
  { returnTo: "/dashboard/account/sessions" }
)
