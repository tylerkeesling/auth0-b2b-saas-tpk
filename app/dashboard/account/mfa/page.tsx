import { redirect } from 'next/navigation'
import { ShieldCheck } from 'lucide-react'

import { appClient } from '@/lib/auth0'
import { managementClient } from '@/lib/auth0-manage'
import { SUPPORTED_PROVIDERS } from '@/lib/mfa-policy'
import { Separator } from '@/components/ui/separator'

import { MfaPage } from './mfa-page'

export default async function MfaSettingsPage() {
  const session = await appClient.getSession()

  if (!session) {
    return redirect('/auth/login?returnTo=/dashboard/account/mfa')
  }

  const userId = session.user.sub

  const [factorsResponse, enrollmentsResponse, userMetadataResponse, org] =
    await Promise.all([
      managementClient.guardian.factors.list(),
      managementClient.users.authenticationMethods.list(userId),
      managementClient.users.get(userId, { fields: 'user_metadata' }),
      managementClient.organizations.get(session.user.org_id!) as any,
    ])

  const factors = factorsResponse as any[]
  const enrollments = enrollmentsResponse.data
  const preferredMethod =
    (userMetadataResponse as any).user_metadata?.preferred_mfa_method ?? null

  // Parse org MFA policy to get enabled providers
  let orgEnabledProviders: string[] = []
  try {
    if (org.metadata?.mfaPolicy) {
      const mfaPolicy = JSON.parse(org.metadata.mfaPolicy)
      orgEnabledProviders = (mfaPolicy.providers ?? []).map((p: string) =>
        p === 'phone' ? 'sms' : p
      )
    }
  } catch {
    // Fall back to empty (show all globally enabled factors)
  }

  const filteredFactors = factors
    .filter((factor: any) => {
      return SUPPORTED_PROVIDERS.includes(factor.name)
    })
    .map((factor: any) => {
      const enrollmentInfo = enrollments.find((enrollment: any) => {
        let factorName: string = factor.name

        if (factor.name === 'push-notification') {
          factorName = 'guardian'
        }

        if (factor.name === 'sms' || factor.name === 'voice') {
          factorName = 'phone'
        }

        return enrollment.type.includes(factorName)
      })

      const orgEnabled =
        orgEnabledProviders.length === 0 ||
        orgEnabledProviders.includes(factor.name)

      return {
        name: factor.name,
        tenantEnabled: factor.enabled,
        orgEnabled,
        enrollmentId: enrollmentInfo?.id,
      }
    })

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

      <MfaPage factors={filteredFactors} preferredMethod={preferredMethod} />
    </div>
  )
}
