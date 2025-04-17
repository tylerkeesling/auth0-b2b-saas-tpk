"use client"

import { Trash2 } from "lucide-react"
import moment from "moment"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { SubmitButton } from "@/components/submit-button"

import { revokePasskey } from "./actions"

export type Passkey = {
  id: string
  last_auth_at: string
  user_agent: string
  credential_device_type?: string
}

interface PasskeyProps {
  passkeys?: Passkey[]
}

export function PasskeyForm({ passkeys }: PasskeyProps) {
  return (
    <Card>
      {/* <CardHeader>
        <CardTitle>Passkeys</CardTitle>
      </CardHeader> */}
      <CardContent className="pt-6">
        {!passkeys || passkeys.length === 0 ? (
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between space-x-2">
              <Label className="flex flex-col space-y-2">
                <p className="max-w-fit font-normal leading-snug text-muted-foreground">
                  You currently do not have any registered passkeys.
                </p>
              </Label>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {passkeys.map((passkey) => (
              <form
                key={passkey.id}
                className="flex w-full items-center justify-between gap-4"
                action={async (formData: FormData) => {
                  const { error } = await revokePasskey(formData)
                  if (error) {
                    toast.error(error)
                  } else {
                    toast.success("Your passkey has been deleted.")
                  }
                }}
              >
                <Label className="flex flex-col space-y-1">
                  <span className="leading-6">{passkey.id}</span>
                  <p className="max-w-fit font-normal leading-snug text-muted-foreground">
                    <span>{passkey.user_agent}</span>
                  </p>
                </Label>
                <Label>
                  <span>
                    {moment(passkey.last_auth_at).format(
                      "MMMM DD, YYYY \\a\\t HH:mm:ss"
                    )}
                  </span>
                </Label>
                <Label>
                  <Badge
                    variant="default"
                    className="ml-3 h-fit bg-slate-400 font-light text-black"
                  >
                    {passkey.credential_device_type === "single_device"
                      ? "DEVICE BOUND"
                      : "Other"}
                  </Badge>
                </Label>
                <input
                  type="hidden"
                  id="authentication_method_id"
                  name="authentication_method_id"
                  value={passkey.id}
                />
                <SubmitButton
                  variant="destructive"
                  className="ml-4"
                  aria-label="Delete passkey"
                >
                  <Trash2 className="h-4 w-4" />
                </SubmitButton>
              </form>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
