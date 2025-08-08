"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { appClient } from "@/lib/auth0"

export async function refreshTokens() {
  const session = await appClient.getSession()

  if (!session) {
    return redirect("/auth/login")
  }

  try {
    await appClient.getAccessToken({ refresh: true })

    revalidatePath("/dashboard/account/tokens", "layout")
  } catch (error) {
    console.error("failed to refresh tokens", error)
    return {
      error: "Failed to refresh your tokens. Is the offline_access scope present?",
    }
  }

  return {}
}
