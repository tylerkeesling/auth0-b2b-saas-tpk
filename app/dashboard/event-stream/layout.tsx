import { redirect } from "next/navigation"

import { appClient } from "@/lib/auth0"

interface AccountLayoutProps {
  children: React.ReactNode
}

export default async function AccountLayout({ children }: AccountLayoutProps) {
  const session = await appClient.getSession()

  // if the user is not authenticated, redirect to login
  if (!session?.user) {
    redirect("/api/auth/login")
  }

  return (
    <div className="space-y-1">
      <div className="min-h-full rounded-2xl border border-border bg-field p-2 shadow-xs">
        <div className="mx-auto">{children}</div>
      </div>
    </div>
  )
}
