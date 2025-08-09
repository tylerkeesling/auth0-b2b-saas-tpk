import { redirect } from "next/navigation"

import { appClient } from "@/lib/auth0"
import { PageHeader } from "@/components/page-header"

import { DeleteAccountForm } from "./delete-account-form"
import { DisplayProfileForm } from "./display-name-form"

export default async function Profile() {
  const session = await appClient.getSession()

  if (!session) {
    return redirect("/auth/login?returnTo=/dashboard/account/profile")
  }

  const userId = session?.user.sub

  return (
    <div className="space-y-2">
      <PageHeader
        title="Profile"
        description="Manage your personal information."
      />

      <DisplayProfileForm profile={session!.user as any} />
      <DeleteAccountForm />
    </div>
  )
}
