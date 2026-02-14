/**
 * Handler that will be called during the execution of a PostLogin flow.
 *
 * @param {Event} event - Details about the user and the context in which they are logging in.
 * @param {PostLoginAPI} api - Interface whose methods can be used to change the behavior of the login.
 */
exports.onExecutePostLogin = async (event, api) => {
  if (event.client.client_id !== event.secrets.DASHBOARD_CLIENT_ID) return
  if (event?.transaction?.protocol === "oauth2-refresh-token") return

  const mfaPolicy = JSON.parse(event.organization?.metadata.mfaPolicy || "{}")

  if (mfaPolicy.enforce) {
    let isUsingPasskey = false
    let isUsingFederation = false

    for (const method of event?.authentication?.methods || []) {
      if (method.name === "passkey") isUsingPasskey = true
      if (method.name === "federated") isUsingFederation = true
    }

    /* Skip MFA if using Passkeys */
    if (mfaPolicy.skipForPasskey && isUsingPasskey) return
    /* Skip MFA if using SSO / federation */
    if (mfaPolicy.skipForFederation && isUsingFederation) return

    // user is not enrolled in any factors but MFA is enforced
    if (!event.user.multifactor || event.user.multifactor.length === 0) {
      return api.authentication.enrollWithAny(
        mfaPolicy.providers.map((p) => ({ type: p }))
      )
    }

    if (mfaPolicy.skipForDomains.length > 0) {
      // ensure a reasonable format for the email
      const splitEMail = (event.user.email || "").split("@")
      if (splitEMail.length !== 2) {
        return api.access.deny("Email is invalid")
      }

      const domain = splitEMail[1].toLowerCase()

      // if the MFA policy is set to enforce and the domain is not part
      // of the list of domains to handle MFA externally at the IdP
      if (!mfaPolicy.skipForDomains.includes(domain)) {
        api.authentication.challengeWithAny(
          mfaPolicy.providers.map((p) => ({ type: p }))
        )
      }
    } else {
      api.authentication.challengeWithAny(
        mfaPolicy.providers.map((p) => ({ type: p }))
      )
    }
  }
}
