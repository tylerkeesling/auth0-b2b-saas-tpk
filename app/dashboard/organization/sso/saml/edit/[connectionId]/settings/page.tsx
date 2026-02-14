import { redirect } from 'next/navigation'

import { appClient } from '@/lib/auth0'
import { managementClient } from '@/lib/auth0-manage'
import { getOrCreateDomainVerificationToken } from '@/lib/domain-verification'

import { UpdateSamlConnectionForm } from './update-saml-connection-form'

export default async function UpdateSamlConnection({
  params,
}: {
  params: Promise<{ connectionId: string }>
}) {
  const { connectionId } = await params
  const session = await appClient.getSession()

  if (!session) {
    return redirect('/auth/login')
  }

  // ensure that the connection ID being fetched is owned by the organization
  const enabledConnection =
    (await managementClient.organizations.enabledConnections.get(
      session.user.org_id!,
      connectionId
    )) as any

  if (!enabledConnection) {
    redirect('/dashboard/organization/sso')
  }

  const [domainVerificationToken, connection] = (await Promise.all([
    getOrCreateDomainVerificationToken(session!.user.org_id!),
    managementClient.connections.get(connectionId),
  ])) as any[]

  return (
    <div>
      <UpdateSamlConnectionForm
        connection={{
          id: connection.id,
          name: connection.name,
          displayName: connection.display_name,
          assignMembershipOnLogin: enabledConnection.assign_membership_on_login,
          options: {
            signInUrl: connection.options.signInEndpoint,
            signOutUrl: connection.options.signOutEndpoint,
            userIdAttribute: connection.options.user_id_attribute,
            protocolBinding: connection.options.protocolBinding,
            domainAliases: connection.options.domain_aliases,
            signRequest: connection.options.signSAMLRequest,
          },
        }}
        domainVerificationToken={domainVerificationToken}
      />
    </div>
  )
}
