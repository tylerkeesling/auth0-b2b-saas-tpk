"use client"

import { useEffect, useState } from "react"
import { InfoIcon as InfoCircle } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { SubmitButton } from "@/components/submit-button"

import { updateSessionPolicy } from "./actions"

export function SessionSettings({
  sessionPolicy,
}: {
  sessionPolicy: { sessionLifetimeMs: number; idleTimeoutMs: number }
}) {
  const [sessionLifetime, setSessionLifetime] = useState(
    sessionPolicy ? Math.floor(sessionPolicy.sessionLifetimeMs / 60 / 1000) : 24
  )
  const [idleTimeout, setIdleTimeout] = useState(
    sessionPolicy ? Math.floor(sessionPolicy.idleTimeoutMs / 60 / 1000) : 30
  )

  useEffect(() => {
    console.log("sessionLifetime", sessionLifetime)
    console.log("idleTimeout", idleTimeout)
  }, [sessionLifetime, idleTimeout])

  // Placeholder state for disabled fields
  const [maxConcurrentSessions] = useState(5)
  const [enforceSignOut] = useState(false)

  return (
    <Card>
      <form
        action={async (formData: FormData) => {
          // Convert minutes to ms before sending to server action
          formData.set(
            "session_lifetime_ms",
            (Number(sessionLifetime) * 60 * 1000).toString()
          )
          formData.set(
            "idle_timeout_ms",
            (Number(idleTimeout) * 60 * 1000).toString()
          )
          const { error } = await updateSessionPolicy(formData)
          if (error) {
            toast.error(error)
          } else {
            toast.success("The organization's session policy has been updated.")
          }
        }}
      >
        <CardHeader>
          <CardTitle>Session Management</CardTitle>
          <CardDescription>
            Configure how user sessions are managed
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Label htmlFor="session-lifetime" className="font-medium">
                Session lifetime
              </Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <InfoCircle className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">
                      The maximum duration a user can remain logged in before
                      requiring re-authentication.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Select
              value={sessionLifetime.toString()}
              onValueChange={(value) =>
                setSessionLifetime(Number.parseInt(value))
              }
              name="session_lifetime_minutes"
            >
              <SelectTrigger>
                <SelectValue placeholder="Select session lifetime" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="8">8 hours</SelectItem>
                <SelectItem value="12">12 hours</SelectItem>
                <SelectItem value="24">24 hours</SelectItem>
                <SelectItem value="48">48 hours</SelectItem>
                <SelectItem value="168">7 days</SelectItem>
                <SelectItem value="336">14 days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Label htmlFor="idle-timeout" className="font-medium">
                    Idle timeout
                  </Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <InfoCircle className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">
                          Automatically sign out users after a period of
                          inactivity.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <p className="text-sm text-muted-foreground">
                  {idleTimeout} minutes
                </p>
              </div>
            </div>
            <Slider
              id="idle-timeout"
              min={5}
              max={60}
              step={5}
              value={[idleTimeout]}
              onValueChange={(values) => setIdleTimeout(values[0])}
              name="idle_timeout_minutes"
            />
          </div>

          <div className="space-y-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Label htmlFor="max-sessions" className="font-medium">
                  Maximum concurrent sessions
                </Label>
                <Badge
                  variant="outline"
                  className="no-pointer-events bg-amber-50 text-amber-700"
                >
                  Coming Soon
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Limit the number of devices a user can be logged in
                simultaneously.
              </p>
            </div>
            <Select
              value={maxConcurrentSessions.toString()}
              disabled
              // onValueChange={(value) =>
              //   setMaxConcurrentSessions(Number.parseInt(value))
              // }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select maximum sessions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 session</SelectItem>
                <SelectItem value="2">2 sessions</SelectItem>
                <SelectItem value="3">3 sessions</SelectItem>
                <SelectItem value="5">5 sessions</SelectItem>
                <SelectItem value="10">10 sessions</SelectItem>
                <SelectItem value="0">Unlimited</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Label htmlFor="enforce-signout" className="font-medium">
                  Enforce sign out on browser close
                </Label>
                <Badge
                  variant="outline"
                  className="no-pointer-events bg-amber-50 text-amber-700"
                >
                  Coming Soon
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Users will be required to log in again after closing their
                browser.
              </p>
            </div>
            <Switch id="enforce-signout" checked={enforceSignOut} disabled />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <SubmitButton>Save</SubmitButton>
        </CardFooter>
      </form>
    </Card>
  )
}
