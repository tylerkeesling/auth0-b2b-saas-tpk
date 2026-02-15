'use client'

import { Fragment } from 'react'
import { usePathname } from 'next/navigation'

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

const routeMap: Record<string, { label: string; group?: string }> = {
  '/dashboard': { label: 'Home' },
  // Organization
  '/dashboard/organization/general': {
    label: 'General Settings',
    group: 'My Organization',
  },
  '/dashboard/organization/members': {
    label: 'Members',
    group: 'My Organization',
  },
  '/dashboard/organization/sso': { label: 'SSO', group: 'My Organization' },
  '/dashboard/organization/security-policies': {
    label: 'Security Policies',
    group: 'My Organization',
  },
  // Account
  '/dashboard/account/tokens': { label: 'Tokens', group: 'My Account' },
  '/dashboard/account/profile': { label: 'Profile', group: 'My Account' },
  '/dashboard/account/security-settings/mfa': {
    label: 'Multifactor Authentication',
    group: 'My Account',
  },
  '/dashboard/account/passkeys': { label: 'Passkeys', group: 'My Account' },
  '/dashboard/account/security-settings/sign-in-methods': {
    label: 'Sign-in Methods',
    group: 'My Account',
  },
  '/dashboard/account/sessions': { label: 'Sessions', group: 'My Account' },
  '/dashboard/account/logs': { label: 'Logs', group: 'My Account' },
  // Event Stream
  '/dashboard/event-stream': { label: 'Event Stream' },
}

export function resolveBreadcrumbs(pathname: string) {
  // Check for exact match first
  const exact = routeMap[pathname]
  if (exact) {
    const crumbs: { label: string; href?: string }[] = []
    if (exact.group) {
      crumbs.push({ label: exact.group })
    }
    crumbs.push({ label: exact.label })
    return crumbs
  }

  // Handle SSO sub-routes: /dashboard/organization/sso/...
  if (pathname.startsWith('/dashboard/organization/sso/')) {
    const crumbs: { label: string; href?: string }[] = [
      { label: 'My Organization' },
      { label: 'SSO', href: '/dashboard/organization/sso' },
    ]
    // Extract last segment as page label
    const segments = pathname.split('/').filter(Boolean)
    const lastSegment = segments[segments.length - 1]
    const pageLabel = lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1)
    crumbs.push({ label: pageLabel })
    return crumbs
  }

  // Fallback: try matching the closest parent route
  const sortedRoutes = Object.keys(routeMap).sort((a, b) => b.length - a.length)
  for (const route of sortedRoutes) {
    if (pathname.startsWith(route) && route !== '/dashboard') {
      const match = routeMap[route]
      const crumbs: { label: string; href?: string }[] = []
      if (match.group) {
        crumbs.push({ label: match.group })
      }
      crumbs.push({ label: match.label, href: route })
      // Add remaining path as last crumb
      const remainder = pathname.slice(route.length).replace(/^\//, '')
      if (remainder) {
        const segments = remainder.split('/').filter(Boolean)
        const lastSegment = segments[segments.length - 1]
        const pageLabel =
          lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1)
        crumbs.push({ label: pageLabel })
      }
      return crumbs
    }
  }

  return [{ label: 'Home' }]
}

export function SidebarBreadcrumbs() {
  const pathname = usePathname()
  const crumbs = resolveBreadcrumbs(pathname)

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {crumbs.map((crumb, index) => (
          <Fragment key={index}>
            {index > 0 && <BreadcrumbSeparator />}
            <BreadcrumbItem>
              {index === crumbs.length - 1 ? (
                <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
              ) : crumb.href ? (
                <BreadcrumbLink href={crumb.href}>{crumb.label}</BreadcrumbLink>
              ) : (
                <span className="text-muted-foreground">{crumb.label}</span>
              )}
            </BreadcrumbItem>
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
