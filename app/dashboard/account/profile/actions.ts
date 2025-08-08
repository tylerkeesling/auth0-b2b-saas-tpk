"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { appClient } from "@/lib/auth0"
import { managementClient } from "@/lib/auth0-manage"

export async function updateProfile(formData: FormData) {
  const session = await appClient.getSession()

  if (!session) {
    return redirect("/auth/login")
  }

  const name = formData.get("name")

  if (!name || typeof name !== "string") {
    return {
      error: "Name is required.",
    }
  }

  try {
    await managementClient.users.update(
      {
        id: session.user.sub,
      },
      {
        name,
      }
    )

    // update the cached local session to reflect the new profile across the app
    await appClient.updateSession({
      ...session,
      user: {
        ...session.user,
        name,
      },
    })
    revalidatePath("/", "layout")
  } catch (error) {
    console.error("failed to update profile", error)
    return {
      error: "Failed to update your profile.",
    }
  }

  return {}
}

export async function deleteAccount() {
  const session = await appClient.getSession()

  if (!session) {
    return redirect("/auth/login")
  }

  try {
    await managementClient.users.delete({
      id: session.user.sub,
    })

    return {}
  } catch (error) {
    console.error("failed to delete account", error)
    return {
      error: "Failed to delete your account.",
    }
  }
}
