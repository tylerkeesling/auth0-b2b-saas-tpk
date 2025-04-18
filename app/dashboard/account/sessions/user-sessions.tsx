"use client"

import moment from "moment"
import { toast } from "sonner"
import { UAParser } from "ua-parser-js"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { SubmitButton } from "@/components/submit-button"

import { deleteSession } from "./actions"

interface KeyValueMap {
  [key: string]: any
}

type UserSessionsProps = {
  user: KeyValueMap
  sessions?: KeyValueMap[]
}

export default function UserSessions({ user, sessions }: UserSessionsProps) {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Active Sessions</CardTitle>
          <CardDescription>
            Manage the active sessions for your account.
          </CardDescription>
        </CardHeader>

        <CardContent className="grid gap-6 p-4 pt-0 md:p-6 md:pt-0">
          {!sessions && (
            <div className="flex flex-col gap-6">
              <Separator />
              <div className="flex items-center justify-between space-x-2">
                <Label className="flex flex-col space-y-2">
                  <p className="max-w-fit font-normal leading-snug text-muted-foreground">
                    There was a problem listing all user sessions. Try again
                    later.
                  </p>
                </Label>
              </div>
            </div>
          )}

          {sessions &&
            sessions
              .sort(({ id }) => (id === user.sid ? -1 : 1))
              .map((session, idx) => {
                const { id } = session
                const lastUA = new UAParser(
                  session.device?.last_user_agent || "unknown"
                ).getResult()

                return (
                  <div
                    key={`session-${idx}-${id}`}
                    className="flex flex-col gap-6"
                  >
                    {idx > 0 && <Separator />}
                    <div
                      key={id}
                      className="flex flex-col items-center justify-between space-y-6 md:flex-row md:space-x-2 md:space-y-0"
                    >
                      <Label className="flex flex-col space-y-1">
                        <span className="leading-6">
                          {`Session on ${lastUA.browser.name} - ${lastUA.os.name} [${lastUA.os.version}]`}

                          {id === user.sid && (
                            <Badge
                              variant="default"
                              className="ml-3 h-fit bg-green-300 font-light text-black hover:bg-green-300"
                            >
                              Current
                            </Badge>
                          )}
                        </span>
                        <p className="max-w-fit font-normal leading-snug text-muted-foreground">
                          Last activity{" "}
                          <span
                            className="cursor-help underline decoration-dotted"
                            title={session.updated_at}
                          >
                            {moment(session.updated_at).fromNow()}
                          </span>{" "}
                          from location{" "}
                          <span
                            className="cursor-help underline decoration-dotted"
                            title={session.device?.last_ip}
                          >
                            {session.device?.last_ip}
                          </span>
                          .
                          <br />
                          First sign-in on{" "}
                          <span
                            className="cursor-help underline decoration-dotted"
                            title={session.created_at}
                          >
                            {moment(session.created_at).format(
                              "MMMM DD, YYYY \\a\\t HH:MM:SS"
                            )}
                          </span>
                          .
                        </p>
                      </Label>
                      <div className="flex items-center justify-end space-x-24 md:min-w-24">
                        <form
                          action={async (formData: FormData) => {
                            const { error } = await deleteSession(formData)

                            if (error) {
                              toast.error(error)
                              return
                            }

                            toast.success("Session signed out successfully.")
                          }}
                        >
                          <input
                            type="hidden"
                            name="session_id"
                            value={session.id}
                          />
                          <SubmitButton
                            className="h-fit min-w-24"
                            variant="outline"
                          >
                            Sign Out
                          </SubmitButton>
                        </form>
                      </div>
                    </div>
                  </div>
                )
              })}
        </CardContent>
      </Card>
    </>
  )
}
