import Link from "next/link"
import { redirect } from "next/navigation"
import { ArrowLeftIcon } from "@radix-ui/react-icons"

import { appClient } from "@/lib/auth0"
import { getRole } from "@/lib/roles"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface OrganizationLayoutProps {
  children: React.ReactNode
}

export default async function OrganizationLayout({
  children,
}: OrganizationLayoutProps) {
  const session = await appClient.getSession()

  if (!session?.user) {
    redirect("/auth/login")
  }

  if (getRole(session.user) !== "admin") {
    return (
      <div className="flex items-center justify-center">
        <Card className="w-[450px]">
          <CardHeader>
            <CardTitle>Unauthorized</CardTitle>
            <CardDescription className="space-y-1.5">
              <p>
                You&apos;re currently logged in with the role of{" "}
                <span className="font-semibold">{getRole(session.user)}</span>.
              </p>
              <p>
                Log in as an Organization member with the{" "}
                <span className="font-semibold">admin</span> role to manage your
                Organization&apos;s settings.
              </p>
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Link href="/dashboard/account/profile" className="w-full">
              <Button className="w-full">
                <ArrowLeftIcon className="mr-2 h-4 w-4" /> Go Back
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return <div className="mx-auto w-full max-w-6xl">{children}</div>
}
