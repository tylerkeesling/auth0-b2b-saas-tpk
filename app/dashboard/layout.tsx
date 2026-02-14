import { redirect } from "next/navigation"
import { Auth0Provider } from "@auth0/nextjs-auth0"

import { appClient } from "@/lib/auth0"
import { managementClient } from "@/lib/auth0-manage"
import { getRole } from "@/lib/roles"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarBreadcrumbs } from "@/components/sidebar-breadcrumbs"
import { ModeToggle } from "@/components/mode-toggle"

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await appClient.getSession()

  // if the user is not authenticated, redirect to login
  if (!session?.user) {
    redirect("/auth/login")
  }

  const { data: orgs } = await managementClient.users.getUserOrganizations({
    id: session.user.sub,
  })

  // if the user does not belong to any organizations, redirect to onboarding
  if (!orgs.length) {
    redirect("/onboarding/create")
  }

  const role = getRole(session.user)

  return (
    <Auth0Provider user={session.user}>
      <SidebarProvider>
        <AppSidebar
          organizations={orgs.map((o) => ({
            id: o.id,
            slug: o.name,
            displayName: o.display_name!,
            logoUrl: o.branding?.logo_url,
          }))}
          currentOrgId={session.user.org_id ?? ""}
          user={{
            name: session.user.name ?? "",
            email: session.user.email ?? "",
            picture: session.user.picture ?? "",
          }}
          userRole={role}
        />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center justify-between gap-2 px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <SidebarBreadcrumbs />
            </div>
            <ModeToggle />
          </header>
          <main className="flex flex-1 flex-col gap-4 p-4 pt-0">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </Auth0Provider>
  )
}
