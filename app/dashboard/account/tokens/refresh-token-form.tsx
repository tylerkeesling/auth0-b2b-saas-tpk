"use client"

import { toast } from "sonner"

import {
  Card,
  CardAction,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { SubmitButton } from "@/components/submit-button"

import { refreshTokens } from "./actions"

export function RefreshTokenForm() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Refresh Token</CardTitle>
        <CardAction>
          <form
            action={async () => {
              const { error } = await refreshTokens()

              if (error) {
                toast.error(error)
              } else {
                toast.success("Your tokens have been refreshed.")
              }
            }}
          >
            <SubmitButton variant="default">Refresh Token</SubmitButton>
          </form>
        </CardAction>
      </CardHeader>
    </Card>
  )
}
