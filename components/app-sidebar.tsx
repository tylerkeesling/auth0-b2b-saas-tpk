'use client'

import Link from 'next/link'
import {
  KeyRound,
  Link as LinkIcon,
  Lock,
  LogIn,
  Monitor,
  Radio,
  ScrollText,
  Settings,
  ShieldCheck,
  UserCircle,
  Users,
} from 'lucide-react'

import { useDevFlag } from '@/lib/dev-flags'
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

const accountItems = [
  { title: 'Tokens', href: '/dashboard/account/tokens', icon: KeyRound },
  { title: 'Profile', href: '/dashboard/account/profile', icon: UserCircle },
  {
    title: 'Sign-in Methods',
    href: '/dashboard/account/sign-in-methods',
    icon: LogIn,
  },
  {
    title: 'Multifactor Authentication',
    href: '/dashboard/account/mfa',
    icon: ShieldCheck,
  },
  { title: 'Sessions', href: '/dashboard/account/sessions', icon: Monitor },
  { title: 'Logs', href: '/dashboard/account/logs', icon: ScrollText },
]

const mfaV2Item = {
  title: 'MFA (My Account)',
  href: '/dashboard/account/mfa-v2',
  icon: ShieldCheck,
}

const orgItems = [
  {
    title: 'General Settings',
    href: '/dashboard/organization/general',
    icon: Settings,
  },
  {
    title: 'Members',
    href: '/dashboard/organization/members',
    icon: Users,
  },
  { title: 'SSO', href: '/dashboard/organization/sso', icon: LinkIcon },
  {
    title: 'Security Policies',
    href: '/dashboard/organization/security-policies',
    icon: Lock,
  },
]

export function AppSidebar({
  organizations,
  currentOrgId,
  user,
  userRole,
  ...props
}: AppSidebarProps) {
  const [showMfaV2] = useDevFlag('show-mfa-v2')
  const items = showMfaV2 ? [...accountItems, mfaV2Item] : accountItems

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <OrgSidebarSwitcher
          organizations={organizations}
          currentOrgId={currentOrgId}
        />
      </SidebarHeader>
      <SidebarContent>
        <NavMain title="My Account" items={items} />
        <NavMain
          title="My Organization"
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
