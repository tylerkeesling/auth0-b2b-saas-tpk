"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { appClient, managementClient } from "@/lib/auth0"

export async function createEnrollment(formData: FormData) {
  const session = await appClient.getSession()

  if (!session) {
    return redirect("/api/auth/login")
  }

  let factorName = formData.get("factor_name")

  if (!factorName || typeof factorName !== "string") {
    return {
      error: "Factor name is required.",
    }
  }

  try {
    const userId = session?.user.sub

    if (factorName === "sms" || factorName === "voice") {
      factorName = "phone"
    }

    const { data: enrollmentTicket } =
      await managementClient.guardian.createEnrollmentTicket({
        user_id: userId,
        //@ts-ignore
        factor: factorName,
        allow_multiple_enrollments: true,
      })

    revalidatePath("/dashboard/account/security", "layout")

    return {
      ticketUrl: enrollmentTicket.ticket_url,
    }
  } catch (error) {
    console.error("failed to create enrollment ticket", error)
    return {
      error: "Failed to create an enrollment ticket.",
    }
  }
}

export async function deleteEnrollment(formData: FormData) {
  const session = await appClient.getSession()

  if (!session) {
    return redirect("/api/auth/login")
  }

  let enrollmentId = formData.get("enrollment_id")

  if (!enrollmentId || typeof enrollmentId !== "string") {
    return {
      error: "Enrollment ID is required.",
    }
  }

  try {
    const userId = session?.user.sub

    await managementClient.users.deleteAuthenticationMethod({
      id: userId,
      authentication_method_id: enrollmentId,
    })

    revalidatePath("/dashboard/account/security", "layout")

    return {}
  } catch (error) {
    console.error("failed to delete enrollment", error)
    return {
      error: "Failed to delete enrollment.",
    }
  }
}

export async function deleteSession(formData: FormData) {
  const session = await appClient.getSession()

  if (!session) {
    return redirect("/api/auth/login")
  }

  let sessionId = formData.get("session_id")

  if (!sessionId || typeof sessionId !== "string") {
    return {
      error: "Enrollment ID is required.",
    }
  }
  try {
    await managementClient.sessions.delete({ id: sessionId })

    revalidatePath("/dashboard/account/security", "layout")

    return {}
  } catch (error) {
    return {
      error: "Failed to delete session.",
    }
  }
}

export async function toggleMfa(formData: FormData) {
  const session = await appClient.getSession()

  if (!session) {
    return redirect("/api/auth/login")
  }

  const userId = session.user.sub

  let enforceMfa = formData.get("toggle-mfa") === "true"

  const data = {
    user_metadata: {
      enforce_mfa: enforceMfa,
    },
  }
  try {
    await managementClient.users.update({ id: userId }, data)

    revalidatePath("/dashboard/account/security", "layout")

    return {}
  } catch (error) {
    return {
      error: "Failed to toggle MFA.",
    }
  }
}
