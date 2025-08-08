import { redirect } from "next/navigation"

import { appClient } from "@/lib/auth0"
import { managementClient } from "@/lib/auth0-manage"
import { PageHeader } from "@/components/page-header"

import { PasskeyForm } from "./passkey-form"

export default async function Profile() {
  const session = await appClient.getSession()

  if (!session) {
    return redirect("/api/auth/login?returnTo=/dashboard/account/passkeys")
  }

  const userId = session?.user.sub

  const { data: enrollments } =
    await managementClient.users.getAuthenticationMethods({ id: userId })

  const passkeys: any[] = enrollments.filter((enrollment: any) => {
    return enrollment.type.includes("passkey")
  })

  return (
    <div className="space-y-2">
      <PageHeader title="Passkeys" description="Manage your passkeys." />

      <PasskeyForm passkeys={passkeys} />
    </div>
  )
}
