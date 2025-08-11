"use client"

import { Trash2 } from "lucide-react"
import moment from "moment"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
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
  if (!passkeys || passkeys.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between space-x-2">
              <Label className="flex flex-col space-y-2">
                <p className="text-muted-foreground max-w-fit leading-snug font-normal">
                  You currently do not have any registered passkeys.
                </p>
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-4 md:p-6">
        {/* Header Row */}
        <div className="border-muted mb-2 grid grid-cols-[2fr_1fr_1fr_auto] items-center gap-4 border-b pb-2">
          <span className="text-muted-foreground font-semibold tracking-wider">
            Name
          </span>
          <span className="text-muted-foreground font-semibold tracking-wider">
            Last Used
          </span>
          <span />
          <span className="w-9"></span>
        </div>
        {passkeys.map((passkey, idx) => (
          <div key={passkey.id}>
            {idx > 0 && <Separator className="my-4" />}
            <form
              className="grid grid-cols-[2fr_1fr_1fr_auto] items-center gap-4 py-2"
              action={async (formData: FormData) => {
                const { error } = await revokePasskey(formData)
                if (error) {
                  toast.error(error)
                } else {
                  toast.success("Your passkey has been deleted.")
                }
              }}
            >
              <div>
                <Label className="flex flex-col space-y-1">
                  <span className="font-mono leading-6 break-all">
                    {passkey.id}
                  </span>
                  <span className="text-muted-foreground leading-snug font-normal">
                    {passkey.user_agent}
                  </span>
                </Label>
              </div>
              <div>
                <span className="text-sm">
                  {moment(passkey.last_auth_at).format(
                    "MMMM DD, YYYY, hh:mm:ss A"
                  )}
                </span>
              </div>
              <div>
                <Badge
                  variant="default"
                  className="pointer-events-none h-fit bg-green-300 font-light text-black"
                >
                  {passkey.credential_device_type === "single_device"
                    ? "DEVICE BOUND"
                    : "SYNCED"}
                </Badge>
              </div>
              <div className="flex justify-end">
                <input
                  type="hidden"
                  id="authentication_method_id"
                  name="authentication_method_id"
                  value={passkey.id}
                />
                <SubmitButton
                  variant="destructive"
                  aria-label="Delete passkey"
                  size="icon"
                >
                  <Trash2 className="h-4 w-4" />
                </SubmitButton>
              </div>
            </form>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
