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
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar'

export interface NavItem {
  title: string
  href: string
  children?: { title: string; href: string }[]
}

interface NavMainProps {
  title: string
  icon: LucideIcon
  items: NavItem[]
  disabled?: boolean
}

function isRouteActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + '/')
}

export function NavMain({ title, icon: Icon, items, disabled }: NavMainProps) {
  const pathname = usePathname()

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{title}</SidebarGroupLabel>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton>
            <Icon />
            <span>{title}</span>
          </SidebarMenuButton>
          <SidebarMenuSub>
            {items.map((item) => (
              <SidebarMenuSubItem key={item.href}>
                {disabled ? (
                  <SidebarMenuSubButton className="pointer-events-none opacity-50">
                    <span>{item.title}</span>
                  </SidebarMenuSubButton>
                ) : item.children ? (
                  <>
                    <span className="text-muted-foreground px-2 py-1 text-xs font-medium">
                      {item.title}
                    </span>
                    <SidebarMenuSub>
                      {item.children.map((child) => (
                        <SidebarMenuSubItem key={child.href}>
                          <SidebarMenuSubButton
                            asChild
                            isActive={isRouteActive(pathname, child.href)}
                          >
                            <Link href={child.href}>
                              <span>{child.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </>
                ) : (
                  <SidebarMenuSubButton
                    asChild
                    isActive={isRouteActive(pathname, item.href)}
                  >
                    <Link href={item.href}>
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuSubButton>
                )}
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  )
}
