import { appClient } from "@/lib/auth0"
import { managementClient } from "@/lib/auth0-manage"
import { DEFAULT_MFA_POLICY, DEFAULT_SESSION_POLICY } from "@/lib/mfa-policy"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PageHeader } from "@/components/page-header"

import { IpRestrictions } from "./ip-restrictions"
import { MfaPolicyForm } from "./mfa-policy-form"
import { SessionSettings } from "./session-settings"

export default async function SecurityPolicies() {
  const session = await appClient.getSession()
  const { data: org } = await managementClient.organizations.get({
    //@ts-ignore
    id: session!.user.org_id,
  })

  return (
    <div className="space-y-2">
      <PageHeader
        title="Security Policies"
        description="Manage the security policies of your organization."
      />

      <Tabs defaultValue="mfa" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="mfa">MFA Policy</TabsTrigger>
          <TabsTrigger value="session">Session Settings</TabsTrigger>
          <TabsTrigger value="ip-restrictions">IP Restrictions</TabsTrigger>
        </TabsList>
        <TabsContent value="mfa">
          <MfaPolicyForm
            organization={{
              id: org.id,
              slug: org.name,
              displayName: org.display_name,
              mfaPolicy: org.metadata?.mfaPolicy
                ? JSON.parse(org.metadata.mfaPolicy)
                : DEFAULT_MFA_POLICY,
            }}
          />
        </TabsContent>
        <TabsContent value="session">
          <SessionSettings
            sessionPolicy={
              org.metadata?.sessionPolicy
                ? JSON.parse(org.metadata.sessionPolicy)
                : DEFAULT_SESSION_POLICY
            }
          />
        </TabsContent>
        <TabsContent value="ip-restrictions">
          <IpRestrictions />
        </TabsContent>
      </Tabs>
    </div>
  )
}
