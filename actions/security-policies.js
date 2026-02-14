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

  const mfaPolicy = parseMfaPolicy(event.organization?.metadata.mfaPolicy)

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

  api.authentication.challengeWithAny(factors)
}

/**
 * Parse the raw mfaPolicy JSON string from org metadata into a validated object.
 * Guarantees that `providers` and `skipForDomains` are always arrays.
 *
 * @param {string | undefined} raw - JSON string from `event.organization.metadata.mfaPolicy`
 * @returns {{ enforce: boolean, providers: string[], skipForPasskey: boolean, skipForFederation: boolean, skipForDomains: string[] }}
 */
function parseMfaPolicy(raw) {
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
}

/**
 * Convert an array of provider name strings into the factor objects
 * expected by `enrollWithAny` and `challengeWithAny`.
 *
 * NOTE: The Auth0 v3 PostLogin API expects `"phone"` (not `"sms"`) for
 * enroll/challenge, and `"email"` is only valid for challenge (not enroll).
 * The dashboard form already maps sms→phone via its checkbox values, so
 * the values arriving here should already be correct. SUPPORTED_PROVIDERS
 * in the form lists `"sms"` and `"email"` for display purposes only.
 *
 * @param {string[]} providers
 * @returns {{ type: string }[]}
 */
function toFactors(providers) {
  return providers.map((p) => ({ type: p }))
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
