import Link from "next/link"
import { ArrowRightIcon } from "@radix-ui/react-icons"

import { Button } from "@/components/ui/button"

export default async function DashboardHome() {
  return (
    <div className="flex flex-1 grow flex-col gap-4 lg:gap-6">
      <div className="bg-field flex flex-1 items-center justify-center rounded-3xl border shadow-xs">
        <div className="flex max-w-[500px] flex-col items-center gap-1 text-center">
          <h3 className="text-2xl font-bold tracking-tight">
            Explore the SaaS Starter
          </h3>
          <p className="text-muted-foreground mt-3">
            This reference app demonstrates how to build a multi-tenant B2B SaaS
            application powered by Auth0 by Okta.
          </p>
          <p className="text-muted-foreground mt-3">
            Head over to the Settings Dashboard to explore common administrative
            capabilities like membership management, single sign-on
            configuration, and security policies.
          </p>
          <div className="mt-8">
            <Link href="/dashboard/organization/general" className="w-full">
              <Button className="w-full">
                Navigate to Settings
                <ArrowRightIcon className="ml-2 size-4" />
              </Button>
            </Link>
          </div>
          <p className="text-muted-foreground mt-3">
            (You must be logged in with an &quot;admin&quot; role in your
            organization.)
          </p>
        </div>
      </div>
    </div>
  )
}
