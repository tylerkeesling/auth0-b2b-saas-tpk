/** @import {Event, PostLoginAPI} from "@auth0/actions/post-login/v3" */

/**
 * Handler that will be called during the execution of a PostLogin flow.
 *
 * @param {Event} event - Details about the user and the context in which they are logging in.
 * @param {PostLoginAPI} api - Interface whose methods can be used to change the behavior of the login.
 */
exports.onExecutePostLogin = async (event, api) => {
  if (event.client.client_id !== event.secrets.DASHBOARD_CLIENT_ID) return
  if (event?.transaction?.protocol === 'oauth2-refresh-token') return

  const mfaPolicy = parseMfaPolicy(event.organization?.metadata?.mfaPolicy)

  if (!mfaPolicy.enforce) return

  let isUsingPasskey = false
  let isUsingFederation = false

  for (const method of event?.authentication?.methods || []) {
    if (method.name === 'passkey') isUsingPasskey = true
    if (method.name === 'federated') isUsingFederation = true
  }

  if (mfaPolicy.skipForPasskey && isUsingPasskey) return
  if (mfaPolicy.skipForFederation && isUsingFederation) return

  const factors = toFactors(mfaPolicy.providers)

  // User is not enrolled in any factors but MFA is enforced
  if (!event.user.multifactor || event.user.multifactor.length === 0) {
    return api.authentication.enrollWithAny(factors)
  }

  // When skipForDomains is configured, validate email and check exemption
  if (mfaPolicy.skipForDomains.length > 0) {
    const domain = getEmailDomain(event.user.email)
    if (domain === null) {
      return api.access.deny('Email is invalid')
    }

    const exemptDomains = mfaPolicy.skipForDomains.map((d) => d.toLowerCase())
    if (exemptDomains.includes(domain)) return
  }

  // Use the user's preferred MFA method as the default factor if set
  const preferred = event.user.user_metadata?.preferred_mfa_method
  const preferredFactor = preferred ? toFactor(preferred) : null

  if (preferredFactor && factors.some((f) => f.type === preferredFactor.type)) {
    const additionalFactors = factors.filter(
      (f) => f.type !== preferredFactor.type
    )
    api.authentication.challengeWith(preferredFactor, {
      additionalFactors,
    })
  } else {
    api.authentication.challengeWithAny(factors)
  }
}

/**
 * Parse the raw mfaPolicy JSON string from org metadata into a validated object.
 * Guarantees that `providers` and `skipForDomains` are always arrays.
 *
 * @param {string | undefined} raw - JSON string from `event.organization.metadata.mfaPolicy`
 * @returns {{ enforce: boolean, providers: string[], skipForPasskey: boolean, skipForFederation: boolean, skipForDomains: string[] }}
 */
function parseMfaPolicy(raw) {
  try {
    const parsed = JSON.parse(raw || '{}')
    return {
      enforce: !!parsed.enforce,
      providers: Array.isArray(parsed.providers) ? parsed.providers : [],
      skipForPasskey: !!parsed.skipForPasskey,
      skipForFederation: !!parsed.skipForFederation,
      skipForDomains: Array.isArray(parsed.skipForDomains)
        ? parsed.skipForDomains
        : [],
    }
  } catch {
    return {
      enforce: false,
      providers: [],
      skipForPasskey: false,
      skipForFederation: false,
      skipForDomains: [],
    }
  }
}

/**
 * Convert an array of provider name strings into the factor objects
 * expected by `enrollWithAny`, `challengeWith`, and `challengeWithAny`.
 *
 * Handles the sms→phone mapping since the dashboard form stores "sms"
 * but the Actions API expects "phone".
 *
 * @param {string[]} providers
 * @returns {{ type: string }[]}
 */
function toFactors(providers) {
  return providers.map((p) => toFactor(p))
}

/**
 * Convert a single provider name into a factor object.
 * Handles the sms→phone mapping since the guardian factor name is "sms"
 * but the Actions API expects "phone".
 *
 * @param {string} provider
 * @returns {{ type: string }}
 */
function toFactor(provider) {
  if (provider === 'sms') {
    return { type: 'phone' }
  }
  return { type: provider }
}

/**
 * Extract and lowercase the domain portion of an email address.
 *
 * @param {string} email
 * @returns {string | null} lowercased domain, or `null` if the email format is invalid
 */
function getEmailDomain(email) {
  const parts = (email || '').split('@')
  if (parts.length !== 2) return null
  return parts[1].toLowerCase()
}
