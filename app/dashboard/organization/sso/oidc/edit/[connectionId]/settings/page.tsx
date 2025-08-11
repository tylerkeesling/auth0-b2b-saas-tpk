import { redirect } from "next/navigation"

import { appClient } from "@/lib/auth0"
import { managementClient } from "@/lib/auth0-manage"
import { getOrCreateDomainVerificationToken } from "@/lib/domain-verification"

import { UpdateOidcConnectionForm } from "./update-oidc-connection-form"

export default async function UpdateOidcConnection({
  params,
}: {
  params: Promise<{ connectionId: string }>
}) {
  const { connectionId } = await params
  const session = await appClient.getSession()

  if (!session) {
    return redirect("/auth/login")
  }

  // ensure that the connection ID being fetched is owned by the organization
  const { data: enabledConnection } =
    await managementClient.organizations.getEnabledConnection({
      //@ts-ignore
      id: session.user.org_id,
      connectionId,
    })

  if (!enabledConnection) {
    redirect("/dashboard/organization/sso")
  }

  const [domainVerificationToken, { data: connection }] = await Promise.all([
    //@ts-ignore
    getOrCreateDomainVerificationToken(session!.user.org_id),
    managementClient.connections.get({ id: connectionId }),
  ])

  return (
    <div>
      <UpdateOidcConnectionForm
        connection={{
          id: connection.id,
          name: connection.name,
          displayName: connection.display_name,
          assignMembershipOnLogin: enabledConnection.assign_membership_on_login,
          options: {
            discoveryUrl: connection.options.discovery_url,
            domainAliases: connection.options.domain_aliases,
            clientId: connection.options.client_id,
            clientSecret: connection.options.client_secret,
            scope: connection.options.scope,
            type: connection.options.type,
          },
        }}
        domainVerificationToken={domainVerificationToken}
      />
    </div>
  )
}
