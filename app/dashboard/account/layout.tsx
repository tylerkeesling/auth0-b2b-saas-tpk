import { SidebarNav } from "@/components/sidebar-nav"

const sidebarNavItems = [
  {
    title: "Tokens",
    href: "/dashboard/account/tokens",
  },
  {
    title: "Profile",
    href: "/dashboard/account/profile",
  },
  {
    title: "Multifactor Authentication",
    href: "/dashboard/account/security",
  },
  {
    title: "Passkeys",
    href: "/dashboard/account/passkeys",
  },
  {
    title: "Sessions",
    href: "/dashboard/account/sessions",
  },
]

interface AccountLayoutProps {
  children: React.ReactNode
}

export default async function AccountLayout({ children }: AccountLayoutProps) {
  return (
    <div className="space-y-1">
      <div className="flex min-h-full flex-col space-y-8 lg:flex-row lg:space-y-0 lg:space-x-4">
        <aside className="lg:w-1/5">
          <SidebarNav items={sidebarNavItems} />
        </aside>
        <div className="bg-sidebar rounded-2xl border p-2 shadow-xs lg:w-4/5">
          <div className="mx-auto max-w-6xl">{children}</div>
        </div>
      </div>
    </div>
  )
}
