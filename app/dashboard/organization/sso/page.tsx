import { appClient } from '@/lib/auth0'
import { managementClient } from '@/lib/auth0-manage'
import { PageHeader } from '@/components/page-header'

import { ConnectionsList } from './connections-list'

export default async function SSO() {
  const session = await appClient.getSession()
  const connectionsResponse =
    await managementClient.organizations.enabledConnections.list(
      session!.user.org_id!
    )
  const connections = connectionsResponse.data as any[]

  return (
    <div className="space-y-2">
      <PageHeader
        title="Single Sign-On"
        description="Configure SSO for your organization."
      />

      <ConnectionsList
        connections={connections
          // filter out the default connection ID assigned to all organizations
          .filter((c) => c.connection_id !== process.env.DEFAULT_CONNECTION_ID)
          .map((c) => ({
            id: c.connection_id,
            name: c.connection.name,
            strategy: c.connection.strategy,
            assignMembershipOnLogin: c.assign_membership_on_login,
          }))}
      />
    </div>
  )
}
