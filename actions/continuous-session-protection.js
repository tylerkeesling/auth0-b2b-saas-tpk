/** @import {Event, PostLoginAPI} from "@auth0/actions/post-login/v3" */

/**
 * Continuous Session Protection
 *
 * Evaluates session and refresh token signals during login and token
 * refresh flows to detect suspicious activity. When risk is detected
 * the session and/or refresh token are revoked.
 *
 * @param {Event} event - Details about the user and the context in which they are logging in.
 * @param {PostLoginAPI} api - Interface whose methods can be used to change the behavior of the login.
 */
exports.onExecutePostLogin = async (event, api) => {
  console.log(
    '[CSP] Starting — user:',
    event.user.user_id,
    'client:',
    event.client.client_id
  )

  if (event.client.client_id !== event.secrets.DASHBOARD_CLIENT_ID) {
    console.log('[CSP] Skipping — client_id mismatch')
    return
  }

  const isRefreshTokenExchange =
    event?.transaction?.protocol === 'oauth2-refresh-token'

  console.log(
    '[CSP] Flow:',
    isRefreshTokenExchange ? 'refresh-token-exchange' : 'interactive-login'
  )

  // --- Risk assessment checks (available on all flows) ---

  const riskAssessment = event?.authentication?.riskAssessment
  if (riskAssessment) {
    const { assessments } = riskAssessment
    console.log('[CSP] Risk assessments:', JSON.stringify(assessments))

    // Impossible travel — revoke session when confidence is high
    if (
      assessments?.ImpossibleTravel?.code ===
        'impossible_travel_from_last_login' &&
      assessments.ImpossibleTravel.confidence === 'high'
    ) {
      console.log('[CSP] REVOKING — impossible travel detected')
      return revokeSession(
        api,
        isRefreshTokenExchange,
        'Impossible travel detected'
      )
    }

    // Untrusted IP — deny when the IP is on a known deny list
    if (assessments?.UntrustedIP?.code === 'found_on_deny_list') {
      console.log(
        '[CSP] REVOKING — untrusted IP:',
        assessments.UntrustedIP.details?.ip
      )
      return revokeSession(
        api,
        isRefreshTokenExchange,
        'Request from untrusted IP'
      )
    }
  } else {
    console.log('[CSP] No risk assessment data available')
  }

  // --- Refresh token rotation checks ---

  if (isRefreshTokenExchange && event.refresh_token) {
    const rt = event.refresh_token
    console.log(
      '[CSP] Refresh token device — initial_ip:',
      rt.device?.initial_ip,
      'last_ip:',
      rt.device?.last_ip
    )

    // IP drift — the refresh token is being used from a different IP
    if (rt.device?.initial_ip && rt.device?.last_ip) {
      if (rt.device.initial_ip !== rt.device.last_ip) {
        console.log('[CSP] IP drift detected on refresh token')
        // Only revoke when combined with a new/unknown device signal
        if (riskAssessment?.assessments?.NewDevice?.code === 'no_match') {
          console.log('[CSP] REVOKING — IP drift + unknown device')
          return revokeSession(
            api,
            isRefreshTokenExchange,
            'Refresh token used from new IP and unknown device'
          )
        }
        console.log('[CSP] IP drift but device is known — allowing')
      }
    }
  }

  // --- Session anomaly checks ---

  if (event.session?.device) {
    const session = event.session
    console.log(
      '[CSP] Session device — ua:',
      session.device.initial_user_agent,
      '→',
      session.device.last_user_agent,
      'asn:',
      session.device.initial_asn,
      '→',
      session.device.last_asn
    )

    // User-agent change within the same session
    if (
      session.device.initial_user_agent &&
      session.device.last_user_agent &&
      session.device.initial_user_agent !== session.device.last_user_agent
    ) {
      console.log('[CSP] Flagging user-agent change')
      // Flag in session metadata for downstream consumers
      api.session.setMetadata('csp_ua_changed', 'true')
    }

    // ASN hop — session is being used from a different network
    if (
      session.device.initial_asn &&
      session.device.last_asn &&
      session.device.initial_asn !== session.device.last_asn
    ) {
      console.log('[CSP] Flagging ASN change')
      api.session.setMetadata('csp_asn_changed', 'true')
    }
  } else {
    console.log('[CSP] No session device data available')
  }

  console.log('[CSP] Complete — no revocation needed')
}

/**
 * Revoke the session (and refresh token when applicable) with a reason.
 *
 * During refresh token exchange flows `api.refreshToken.revoke()` is used.
 * During interactive login flows `api.session.revoke()` is used instead.
 *
 * @param {PostLoginAPI} api
 * @param {boolean} isRefreshTokenExchange
 * @param {string} reason
 */
function revokeSession(api, isRefreshTokenExchange, reason) {
  if (isRefreshTokenExchange) {
    api.refreshToken.revoke(reason)
  } else {
    api.session.revoke(reason)
  }
}
