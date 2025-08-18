"use server"

import { revalidatePath } from "next/cache"
import { type SessionData } from "@auth0/nextjs-auth0/types"

import { managementClient } from "@/lib/auth0-manage"
import { withServerActionAuth } from "@/lib/with-server-action-auth"

export const updateOrganization = withServerActionAuth(
  async function updateOrganization(formData: FormData, session: SessionData) {
    const displayName = formData.get("display_name")
    const logoUrl = formData.get("logo_url")

    if (!displayName || typeof displayName !== "string") {
      return {
        error: "Display name is required.",
      }
    }

    // Validate logo URL if provided
    if (logoUrl && typeof logoUrl === "string" && logoUrl.trim() !== "") {
      try {
        new URL(logoUrl)
      } catch {
        return {
          error: "Invalid logo URL format.",
        }
      }
    }

    try {
      const updateData: {
        display_name: string
        branding?: {
          logo_url?: string
        }
      } = {
        display_name: displayName,
      }

      // Only include branding if logo_url is provided
      if (logoUrl && typeof logoUrl === "string") {
        const trimmedUrl = logoUrl.trim()
        if (trimmedUrl !== "") {
          updateData.branding = {
            logo_url: trimmedUrl,
          }
        } else {
          // Clear logo if empty string is provided
          updateData.branding = {
            logo_url: undefined,
          }
        }
      }

      await managementClient.organizations.update(
        {
          //@ts-ignore
          id: session.user.org_id,
        },
        updateData
      )

      revalidatePath("/", "layout")
    } catch (error) {
      console.error("failed to update organization", error)
      return {
        error: "Failed to update the organization.",
      }
    }

    return {}
  },
  {
    role: "admin",
  }
)
