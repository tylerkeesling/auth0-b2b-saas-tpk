"use client"

import { useState } from "react"

import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { SubmitButton } from "@/components/submit-button"

import { toggleMfa } from "./actions"

async function handleToggleMfa(formData: FormData) {
  await toggleMfa(formData)
}

type ToggleMfaProps = {
  enforceMfa?: boolean
}

export function ToggleMfaForm({ enforceMfa = false }: ToggleMfaProps) {
  const [isEnabled, setIsEnabled] = useState(enforceMfa)

  return (
    <form className="flex items-center gap-3" action={handleToggleMfa}>
      <Label htmlFor="toggle-mfa" className="text-sm font-medium">
        Enable MFA
      </Label>
      <Switch
        id="toggle-mfa"
        checked={isEnabled}
        onCheckedChange={(checked) => setIsEnabled(checked)}
      />
      <input type="hidden" name="toggle-mfa" value={isEnabled.toString()} />
      <SubmitButton size="sm" variant="outline">
        Save
      </SubmitButton>
    </form>
  )
}
