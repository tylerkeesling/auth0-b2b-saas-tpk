'use client'

import Link from 'next/link'
import { Building2, Radio, UserCircle } from 'lucide-react'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar'
import { NavMain } from '@/components/nav-main'
import { NavUser } from '@/components/nav-user'
import { OrgSidebarSwitcher } from '@/components/org-sidebar-switcher'

interface Organization {
  id: string
  slug: string
  displayName: string
  logoUrl?: string
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  organizations: Organization[]
  currentOrgId: string
  user: { name: string; email: string; picture: string }
  userRole: string
}

const orgItems = [
  { title: 'General Settings', href: '/dashboard/organization/general' },
  { title: 'Members', href: '/dashboard/organization/members' },
  { title: 'SSO', href: '/dashboard/organization/sso' },
  {
    title: 'Security Policies',
    href: '/dashboard/organization/security-policies',
  },
]

const accountItems = [
  { title: 'Tokens', href: '/dashboard/account/tokens' },
  { title: 'Profile', href: '/dashboard/account/profile' },
  { title: 'Sign-in Methods', href: '/dashboard/account/sign-in-methods' },
  {
    title: 'Multifactor Authentication',
    href: '/dashboard/account/mfa',
  },
  { title: 'Passkeys', href: '/dashboard/account/passkeys' },
  { title: 'Sessions', href: '/dashboard/account/sessions' },
  { title: 'Logs', href: '/dashboard/account/logs' },
]

export function AppSidebar({
  organizations,
  currentOrgId,
  user,
  userRole,
  ...props
}: AppSidebarProps) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <OrgSidebarSwitcher
          organizations={organizations}
          currentOrgId={currentOrgId}
        />
      </SidebarHeader>
      <SidebarContent>
        <NavMain title="My Account" icon={UserCircle} items={accountItems} />
        <NavMain
          title="My Organization"
          icon={Building2}
          items={orgItems}
          disabled={userRole !== 'admin'}
        />
        <SidebarGroup>
          <SidebarGroupLabel>Other</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Event Stream">
                <Link href="/dashboard/event-stream">
                  <Radio />
                  <span>Event Stream</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
