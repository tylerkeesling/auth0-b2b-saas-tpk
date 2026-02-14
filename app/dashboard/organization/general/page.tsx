import { redirect } from 'next/navigation'

import { appClient } from '@/lib/auth0'
import { managementClient } from '@/lib/auth0-manage'
import { PageHeader } from '@/components/page-header'

import { DisplayNameForm } from './display-name-form'

export default async function GeneralSettings() {
  const session = await appClient.getSession()

  if (!session) {
    redirect('/auth/login')
  }

  const { data: org } = await managementClient.organizations.get({
    // @ts-ignore
    id: session.user.org_id,
  })

  return (
    <div className="space-y-2">
      <PageHeader
        title="General Settings"
        description="Update your organization's general settings."
      />

      <DisplayNameForm
        organization={{
          id: org.id,
          slug: org.name,
          displayName: org.display_name,
          logoUrl: org.branding?.logo_url,
        }}
      />
    </div>
  )
}
