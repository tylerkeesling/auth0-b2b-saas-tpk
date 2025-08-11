import { redirect } from "next/navigation"

import { appClient } from "@/lib/auth0"
import { managementClient } from "@/lib/auth0-manage"

import { ScimForm } from "../../../../components/provisioning/scim-form"

export default async function Provisioning({
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

  let scimConfig
  let scimTokens
  try {
    ;[{ data: scimConfig }, { data: scimTokens }] = await Promise.all([
      managementClient.connections.getScimConfiguration({
        id: connectionId,
      }),
      managementClient.connections.getScimTokens({
        id: connectionId,
      }),
    ])
  } catch (e: any) {
    // Throw if error is not 404 (SCIM is not enabled for this connection)
    if (e.statusCode !== 404) {
      throw e
    }
  }

  return (
    <div>
      <ScimForm
        scimConfig={
          scimConfig
            ? {
                userIdAttribute: scimConfig.user_id_attribute,
              }
            : null
        }
        scimTokens={(scimTokens || []).map((tkn) => ({
          id: tkn.token_id,
          lastUsedAt: tkn.last_used_at,
          createdAt: tkn.created_at,
        }))}
      />
    </div>
  )
}
