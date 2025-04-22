"use client"

import { useState } from "react"
import { X } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function IpRestrictions() {
  const [enableIpRestrictions, setEnableIpRestrictions] = useState(false)
  const [allowedIps, setAllowedIps] = useState<string[]>([
    "192.168.1.0/24",
    "10.0.0.1",
  ])
  const [blockedIps, setBlockedIps] = useState<string[]>(["1.2.3.4"])
  const [newIpInput, setNewIpInput] = useState("")
  const [activeTab, setActiveTab] = useState("allow")

  const addIp = () => {
    if (!newIpInput.trim()) return

    if (activeTab === "allow") {
      setAllowedIps([...allowedIps, newIpInput])
    } else {
      setBlockedIps([...blockedIps, newIpInput])
    }

    setNewIpInput("")
  }

  const removeIp = (ip: string, type: "allow" | "block") => {
    if (type === "allow") {
      setAllowedIps(allowedIps.filter((item) => item !== ip))
    } else {
      setBlockedIps(blockedIps.filter((item) => item !== ip))
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>
              IP Restrictions{" "}
              <Badge
                variant="outline"
                className="no-pointer-events bg-amber-50 text-amber-700"
              >
                Under Construction
              </Badge>
            </CardTitle>

            <CardDescription>
              Control access to your application based on IP addresses
            </CardDescription>
          </div>
          <Switch
            checked={enableIpRestrictions}
            onCheckedChange={setEnableIpRestrictions}
          />
        </div>
      </CardHeader>
      <CardContent
        className={
          enableIpRestrictions
            ? "space-y-6"
            : "pointer-events-none space-y-6 opacity-50"
        }
      >
        <Tabs
          defaultValue="allow"
          value={activeTab}
          onValueChange={setActiveTab}
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="allow">Allowed IPs</TabsTrigger>
            <TabsTrigger value="block">Blocked IPs</TabsTrigger>
          </TabsList>
          <TabsContent value="allow" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="allowed-ip">
                Add allowed IP address or CIDR range
              </Label>
              <div className="flex gap-2">
                <Input
                  id="allowed-ip"
                  placeholder="e.g. 192.168.1.1 or 10.0.0.0/24"
                  value={newIpInput}
                  onChange={(e) => setNewIpInput(e.target.value)}
                />
                <Button onClick={addIp}>Add</Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Current allowed IPs</Label>
              {allowedIps.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No allowed IPs configured
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {allowedIps.map((ip) => (
                    <Badge
                      key={ip}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {ip}
                      <button
                        onClick={() => removeIp(ip, "allow")}
                        className="ml-1 rounded-full p-0.5 hover:bg-muted"
                      >
                        <X className="h-3 w-3" />
                        <span className="sr-only">Remove</span>
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="block" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="blocked-ip">
                Add blocked IP address or CIDR range
              </Label>
              <div className="flex gap-2">
                <Input
                  id="blocked-ip"
                  placeholder="e.g. 192.168.1.1 or 10.0.0.0/24"
                  value={newIpInput}
                  onChange={(e) => setNewIpInput(e.target.value)}
                />
                <Button onClick={addIp}>Add</Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Current blocked IPs</Label>
              {blockedIps.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No blocked IPs configured
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {blockedIps.map((ip) => (
                    <Badge
                      key={ip}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {ip}
                      <button
                        onClick={() => removeIp(ip, "block")}
                        className="ml-1 rounded-full p-0.5 hover:bg-muted"
                      >
                        <X className="h-3 w-3" />
                        <span className="sr-only">Remove</span>
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <div className="rounded-md bg-muted p-4">
          <div className="text-sm">
            <h4 className="font-medium">Notes:</h4>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>IP restrictions apply to all users in your organization</li>
              <li>
                You can use CIDR notation (e.g., 192.168.1.0/24) to specify IP
                ranges
              </li>
              <li>
                If you enable IP restrictions with no allowed IPs, all IPs will
                be blocked
              </li>
              <li>
                Your current IP is automatically detected and added to allowed
                IPs
              </li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
