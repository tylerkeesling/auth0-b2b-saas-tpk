import { redirect } from "next/navigation"

import { appClient } from "@/lib/auth0"
import { PageHeader } from "@/components/page-header"

import UserLogs from "./user-logs"

export default async function LogsPage() {
  const session = await appClient.getSession()

  if (!session) {
    return redirect("/auth/login?returnTo=/dashboard/account/logs")
  }

  const userId = session.user.sub

  return (
    <div className="space-y-2">
      <PageHeader
        title="Activity Logs"
        description="View your account activity and authentication events."
      />
      <UserLogs userId={userId} />
    </div>
  )
}
