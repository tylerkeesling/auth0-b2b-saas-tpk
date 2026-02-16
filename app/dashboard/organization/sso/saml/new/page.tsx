import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

import { appClient } from '@/lib/auth0'
import { getOrCreateDomainVerificationToken } from '@/lib/domain-verification'
import { Button } from '@/components/ui/button'

import { CreateSamlConnectionForm } from './create-saml-connection-form'

export default async function CreateSamlConnection() {
  const session = await appClient.getSession()

  const domainVerificationToken = await getOrCreateDomainVerificationToken(
    //@ts-ignore
    session!.user.org_id
  )

  return (
    <div className="space-y-1">
      <div className="px-2 py-3">
        <Button variant="link" asChild className="px-0">
          <Link
            href="/dashboard/organization/sso"
            className="text-muted-foreground hover:text-accent-foreground flex items-center text-sm"
          >
            <ArrowLeft className="mr-1.5 size-4" />
            Back to connections
          </Link>
        </Button>
      </div>

      <CreateSamlConnectionForm
        domainVerificationToken={domainVerificationToken}
      />
    </div>
  )
}
