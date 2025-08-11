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
    <form className="" action={handleToggleMfa}>
      <Label className="mr-2" htmlFor="toggle-mfa">
        Enable MFA?
      </Label>
      <Switch
        className="mr-2"
        id="toggle-mfa"
        checked={isEnabled}
        onCheckedChange={(checked) => setIsEnabled(checked)}
      />
      <input type="hidden" name="toggle-mfa" value={isEnabled.toString()} />
      <SubmitButton>Save</SubmitButton>
    </form>
  )
}
