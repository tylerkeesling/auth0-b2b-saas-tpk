import { redirect } from 'next/navigation'

import { appClient } from '@/lib/auth0'
import { PageHeader } from '@/components/page-header'

import { DebugPage } from './debug-page'

export default async function MyAccountDebugPage() {
  const session = await appClient.getSession()

  if (!session) {
    return redirect('/auth/login?returnTo=/dashboard/account/my-account-debug')
  }

  return (
    <div className="space-y-2">
      <PageHeader
        title="My Account API"
        description="Debug console for the My Account API client."
      />
      <DebugPage />
    </div>
  )
}
