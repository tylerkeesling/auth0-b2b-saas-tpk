"use client"

import { useRouter } from "next/navigation"
import { ChevronsUpDown, Plus, Check } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar"

interface Organization {
  id: string
  slug: string
  displayName: string
  logoUrl?: string
}

interface OrgSidebarSwitcherProps {
  organizations: Organization[]
  currentOrgId: string
}

export function OrgSidebarSwitcher({
  organizations,
  currentOrgId,
}: OrgSidebarSwitcherProps) {
  const router = useRouter()
  const { isMobile } = useSidebar()

  const organization = organizations.find((org) => org.id === currentOrgId)

  if (!organization) return null

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="size-8 rounded-lg">
                <AvatarImage
                  src={organization.logoUrl}
                  alt={organization.displayName}
                />
                <AvatarFallback className="rounded-lg">
                  {organization.displayName[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {organization.displayName}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Organizations
            </DropdownMenuLabel>
            {organizations.map((org) => (
              <DropdownMenuItem
                key={org.id}
                onClick={() => {
                  window.location.href = `/auth/login?organization=${org.slug}&returnTo=/dashboard`
                }}
                className="gap-2 p-2"
              >
                <Avatar className="size-6 rounded-sm">
                  <AvatarImage src={org.logoUrl} alt={org.displayName} />
                  <AvatarFallback className="rounded-sm">
                    {org.displayName[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="truncate">{org.displayName}</span>
                {org.id === currentOrgId && (
                  <Check className="ml-auto size-4" />
                )}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="gap-2 p-2"
              onClick={() => router.push("/onboarding/create")}
            >
              <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                <Plus className="size-4" />
              </div>
              <div className="font-medium text-muted-foreground">
                Create Organization
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
