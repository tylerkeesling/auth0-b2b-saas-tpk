'use server'

import { revalidatePath } from 'next/cache'
import { type SessionData } from '@auth0/nextjs-auth0/types'

import { managementClient } from '@/lib/auth0-manage'
import {
  DEFAULT_MFA_POLICY,
  DEFAULT_SESSION_POLICY,
  SUPPORTED_PROVIDERS,
} from '@/lib/mfa-policy'
import { withServerActionAuth } from '@/lib/with-server-action-auth'

export const updateMfaPolicy = withServerActionAuth(
  async function updateMfaPolicy(formData: FormData, session: SessionData) {
    const enforce = !!formData.get('enforce')
    const skipForPasskey = !!formData.get('skip_for_passkey')
    const skipForDomains = formData.get('skip_for_domains')
    const providers = SUPPORTED_PROVIDERS.map((p) => formData.get(p)).filter(
      Boolean
    )

    const parsedSkipForDomains =
      skipForDomains && typeof skipForDomains === 'string'
        ? skipForDomains.split(',').map((d) => d.trim())
        : []

    try {
      const { data: org } = await managementClient.organizations.get({
        //@ts-ignore
        id: session!.user.org_id,
      })

      await managementClient.organizations.update(
        {
          //@ts-ignore
          id: session.user.org_id,
        },
        {
          metadata: {
            ...org.metadata,
            mfaPolicy: JSON.stringify({
              ...DEFAULT_MFA_POLICY,
              enforce,
              skipForPasskey,
              skipForDomains: parsedSkipForDomains,
              providers,
            }),
          },
        }
      )

      revalidatePath('/dashboard/organization/security-policies')
    } catch (error) {
      console.error("failed to update the organization's MFA policy", error)
      return {
        error: "Failed to update the organization's MFA policy.",
      }
    }

    return {}
  },
  {
    role: 'admin',
  }
)

export const updateSessionPolicy = withServerActionAuth(
  async function updateSessionPolicy(formData: FormData, session: SessionData) {
    const sessionLifetimeMs = formData.get('session_lifetime_ms')
    const idleTimeoutMs = formData.get('idle_timeout_ms')

    try {
      const { data: org } = await managementClient.organizations.get({
        //@ts-ignore
        id: session!.user.org_id,
      })

      await managementClient.organizations.update(
        {
          //@ts-ignore
          id: session.user.org_id,
        },
        {
          metadata: {
            ...org.metadata,
            sessionPolicy: JSON.stringify({
              ...DEFAULT_SESSION_POLICY,
              sessionLifetimeMs: sessionLifetimeMs
                ? Number(sessionLifetimeMs)
                : DEFAULT_SESSION_POLICY.sessionLifetimeMs,
              idleTimeoutMs: idleTimeoutMs
                ? Number(idleTimeoutMs)
                : DEFAULT_SESSION_POLICY.idleTimeoutMs,
            }),
          },
        }
      )

      const metadata = {
        sessionPolicy: JSON.stringify({
          ...DEFAULT_SESSION_POLICY,
          sessionLifetimeMs: sessionLifetimeMs
            ? Number(sessionLifetimeMs)
            : DEFAULT_SESSION_POLICY.sessionLifetimeMs,
          idleTimeoutMs: idleTimeoutMs
            ? Number(idleTimeoutMs)
            : DEFAULT_SESSION_POLICY.idleTimeoutMs,
        }),
      }

      console.log('metadata', metadata)

      revalidatePath('/dashboard/organization/security-policies')
    } catch (error) {
      console.error("failed to update the organization's session policy", error)
      return {
        error: "Failed to update the organization's session policy.",
      }
    }

    return {}
  },
  {
    role: 'admin',
  }
)
