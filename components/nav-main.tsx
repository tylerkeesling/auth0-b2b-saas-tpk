'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { type LucideIcon } from 'lucide-react'

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

export interface NavItem {
  title: string
  href: string
  icon: LucideIcon
}

interface NavMainProps {
  title: string
  items: NavItem[]
  disabled?: boolean
}

function isRouteActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + '/')
}

export function NavMain({ title, items, disabled }: NavMainProps) {
  const pathname = usePathname()

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{title}</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.href}>
            {disabled ? (
              <SidebarMenuButton
                className="pointer-events-none opacity-50"
                tooltip={item.title}
              >
                <item.icon />
                <span>{item.title}</span>
              </SidebarMenuButton>
            ) : (
              <SidebarMenuButton
                asChild
                isActive={isRouteActive(pathname, item.href)}
                tooltip={item.title}
              >
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            )}
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
