import { redirect } from 'next/navigation'
import { ShieldCheck } from 'lucide-react'

import { appClient } from '@/lib/auth0'
import { managementClient } from '@/lib/auth0-manage'
import { Separator } from '@/components/ui/separator'

import { MfaV2FactorsSection } from './mfa-v2-factors-section'

export default async function MfaV2SettingsPage() {
  const session = await appClient.getSession()

  if (!session) {
    return redirect('/auth/login?returnTo=/dashboard/account/mfa-v2')
  }

  const org = session.user.org_id
    ? ((await managementClient.organizations.get(session.user.org_id)) as any)
    : null

  let orgEnabledProviders: string[] = []
  try {
    if (org?.metadata?.mfaPolicy) {
      const mfaPolicy = JSON.parse(org.metadata.mfaPolicy)
      orgEnabledProviders = mfaPolicy.providers ?? []
    }
  } catch {
    // Fall back to empty (no org restriction)
  }

  return (
    <div className="space-y-8">
      <header>
        <div className="mb-2 flex items-center gap-2.5">
          <ShieldCheck className="text-muted-foreground h-5 w-5" />
          <h1 className="text-foreground text-xl font-semibold tracking-tight">
            Multifactor Authentication
          </h1>
        </div>
        <p className="text-muted-foreground max-w-md text-sm leading-relaxed">
          Manage your account&apos;s multifactor authentication enrollments. Add
          a second layer of security to protect your account.
        </p>
      </header>

      <Separator />

      <MfaV2FactorsSection orgEnabledProviders={orgEnabledProviders} />
    </div>
  )
}
