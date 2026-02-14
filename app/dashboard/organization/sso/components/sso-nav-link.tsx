'use client'

import Link from 'next/link'
import { useParams, useSelectedLayoutSegment } from 'next/navigation'

import { cn } from '@/lib/utils'

export default function SsoNavLink({
  slug,
  children,
}: {
  slug: string
  children: React.ReactNode
}) {
  const { connectionId } = useParams<{ connectionId: string }>()
  const segment = useSelectedLayoutSegment()
  const isActive = slug === segment

  return (
    <Link
      href={`/dashboard/organization/sso/oidc/edit/${connectionId}/${slug}`}
      className={cn(
        isActive
          ? 'text-primary font-semibold underline underline-offset-12'
          : 'text-muted-foreground hover:text-foreground font-normal transition-colors'
      )}
    >
      {children}
    </Link>
  )
}
