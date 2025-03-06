"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  DotsVerticalIcon,
  GearIcon,
  PersonIcon,
  PlusIcon,
  TrashIcon,
} from "@radix-ui/react-icons"
import { toast } from "sonner"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { SubmitButton } from "@/components/submit-button"

import { createSSOEnrollemnt } from "./actions"
import { deleteConnection } from "./oidc/new/actions"

interface Props {
  connections: {
    id: string
    name: string
    strategy: string
    assignMembershipOnLogin: boolean
  }[]
}

interface IPopupWindow {
  width: number
  height: number
  title: string
  url: string
  focus: boolean
  scrollbars: boolean
}

function openPopupWindow(popupOptions: IPopupWindow): Window | null {
  {
    const dualScreenLeft =
      window.screenLeft !== undefined ? window.screenLeft : window.screenX
    const dualScreenTop =
      window.screenTop !== undefined ? window.screenTop : window.screenY

    const width = window.innerWidth
      ? window.innerWidth
      : document.documentElement.clientWidth
        ? document.documentElement.clientWidth
        : screen.width
    const height = window.innerHeight
      ? window.innerHeight
      : document.documentElement.clientHeight
        ? document.documentElement.clientHeight
        : screen.height

    // const systemZoom = width / window.screen.availWidth
    const systemZoom = window.devicePixelRatio || 1
    const left = (width - popupOptions.width) / 2 / systemZoom + dualScreenLeft
    const top = (height - popupOptions.height) / 2 / systemZoom + dualScreenTop
    const newWindow = window.open(
      popupOptions.url,
      popupOptions.title,
      `scrollbars=${popupOptions.scrollbars ? "yes" : "no"},
      width=${popupOptions.width / systemZoom},
      height=${popupOptions.height / systemZoom},
      top=${top},
      left=${left}
      `
    )
    newWindow!.opener = null
    if (popupOptions.focus) {
      newWindow!.focus()
    }
    return newWindow
  }
}

export function ConnectionsList({ connections }: Props) {
  const router = useRouter()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configured Connections</CardTitle>
        <CardDescription>
          The currently active SSO connections for your organization.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableCaption>
            {connections.length} configured connections.
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Strategy</TableHead>
              <TableHead>Auto-Membership</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {connections.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="w-[250px] font-medium">
                  {c.name}
                </TableCell>
                <TableCell>{c.strategy}</TableCell>
                <TableCell>
                  {c.assignMembershipOnLogin ? (
                    <Badge>Enabled</Badge>
                  ) : (
                    <Badge variant="secondary">Disabled</Badge>
                  )}
                </TableCell>
                <TableCell className="flex justify-end">
                  <AlertDialog>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="outline">
                          <DotsVerticalIcon className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-[160px]">
                        {c.strategy === "oidc" && (
                          <>
                            <DropdownMenuItem asChild>
                              <Link
                                href={`/dashboard/organization/sso/oidc/edit/${c.id}/settings`}
                              >
                                <GearIcon className="mr-1 size-4" />
                                Settings
                              </Link>
                            </DropdownMenuItem>

                            <DropdownMenuItem asChild>
                              <Link
                                href={`/dashboard/organization/sso/oidc/edit/${c.id}/provisioning`}
                              >
                                <PersonIcon className="mr-1 size-4" />
                                Provisioning
                              </Link>
                            </DropdownMenuItem>
                          </>
                        )}

                        {c.strategy === "samlp" && (
                          <>
                            <DropdownMenuItem asChild>
                              <Link
                                href={`/dashboard/organization/sso/saml/edit/${c.id}/settings`}
                              >
                                <GearIcon className="mr-1 size-4" />
                                Settings
                              </Link>
                            </DropdownMenuItem>

                            <DropdownMenuItem asChild>
                              <Link
                                href={`/dashboard/organization/sso/saml/edit/${c.id}/provisioning`}
                              >
                                <PersonIcon className="mr-1 size-4" />
                                Provisioning
                              </Link>
                            </DropdownMenuItem>
                          </>
                        )}
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem className="text-destructive">
                            <TrashIcon className="mr-1 size-4" />
                            Delete
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Delete Connection {c.name}?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete the connection and all
                          users who have authenticated with it.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={async () => {
                            const { error } = await deleteConnection(c.id)
                            if (error) {
                              return toast.error(error)
                            }
                            toast.success("The connection has been deleted.")
                          }}
                        >
                          Continue
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <form
          action={async () => {
            // @ts-ignore
            const { error, ticketUrl } = await createSSOEnrollemnt()

            if (error) {
              toast.error(error)
              return
            }

            const enrollmentPopupWindow = openPopupWindow({
              url: ticketUrl!,
              title: "SSO Enrollment",
              width: 1080,
              height: 768,
              scrollbars: true,
              focus: true,
            })

            const timer = setInterval(async () => {
              if (enrollmentPopupWindow && enrollmentPopupWindow.closed) {
                clearInterval(timer)
                router.refresh()
              }
            }, 200)
          }}
          className="ml-auto space-y-8"
        >
          <SubmitButton variant="outline" className="ml-auto flex gap-2">
            <PlusIcon className="mr-1 size-4" />
            Auth0 Self-Service SSO
          </SubmitButton>
        </form>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button>
              <PlusIcon className="mr-1 size-4" />
              Or Build Your Own UI
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[160px]">
            <DropdownMenuItem asChild>
              <Link href="/dashboard/organization/sso/oidc/new">OIDC</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/organization/sso/saml/new">SAML</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardFooter>
    </Card>
  )
}
