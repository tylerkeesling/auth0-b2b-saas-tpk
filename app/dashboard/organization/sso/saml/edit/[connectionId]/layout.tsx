import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

import { Button } from '@/components/ui/button'

import SsoNavLink from '../../../components/sso-nav-link'

interface EditOidcConnectionLayoutProps {
  children: React.ReactNode
  params: Promise<{ connectionId: string }>
}

export default async function EditOidcConnectionLayout({
  children,
}: EditOidcConnectionLayoutProps) {
  return (
    <div className="space-y-2">
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

      <div className="space-y-4">
        <nav className="space-x-6 border-b px-6 py-2 text-sm">
          <SsoNavLink slug="settings">Settings</SsoNavLink>
          <SsoNavLink slug="provisioning">Provisioning</SsoNavLink>
        </nav>

        <div>{children}</div>
      </div>
    </div>
  )
}
