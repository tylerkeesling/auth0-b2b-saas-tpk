import { appClient, managementClient } from "@/lib/auth0"
import { PageHeader } from "@/components/page-header"

import { PasskeyForm } from "./passkey-form"

export default appClient.withPageAuthRequired(
  async function Profile() {
    const session = await appClient.getSession()
    const userId = session?.user.sub

    const { data: enrollments } =
      await managementClient.users.getAuthenticationMethods({ id: userId })

    const passkeys: any[] = enrollments.filter((enrollment: any) => {
      return enrollment.type.includes("passkey")
    })

    return (
      <div className="space-y-2">
        <PageHeader
          title="Passkeys"
          description="Manage your passkeys."
        />

        <PasskeyForm passkeys={passkeys} />
      </div>
    )
  },
  { returnTo: "/dashboard/account/passkeys" }
)
