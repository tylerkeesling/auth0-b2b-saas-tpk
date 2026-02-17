import { beforeEach, describe, expect, it, vi } from 'vitest'

const { onExecutePostLogin } = require('../continuous-session-protection')

function createEvent(overrides: Record<string, any> = {}) {
  return {
    client: { client_id: 'dashboard-client' },
    secrets: { DASHBOARD_CLIENT_ID: 'dashboard-client' },
    transaction: { protocol: 'oidc-basic-profile' },
    authentication: { methods: [] },
    user: {
      sub: 'auth0|123',
      email: 'user@example.com',
    },
    ...overrides,
  }
}

function createApi() {
  return {
    session: {
      revoke: vi.fn(),
      setMetadata: vi.fn(),
    },
    refreshToken: {
      revoke: vi.fn(),
    },
  }
}

describe('continuous-session-protection action', () => {
  let api: ReturnType<typeof createApi>

  beforeEach(() => {
    api = createApi()
  })

  describe('early exits', () => {
    it('does nothing when client_id does not match DASHBOARD_CLIENT_ID', async () => {
      const event = createEvent({
        client: { client_id: 'other-client' },
      })

      await onExecutePostLogin(event, api)

      expect(api.session.revoke).not.toHaveBeenCalled()
      expect(api.refreshToken.revoke).not.toHaveBeenCalled()
      expect(api.session.setMetadata).not.toHaveBeenCalled()
    })

    it('does nothing when there are no risk signals or session device data', async () => {
      const event = createEvent()

      await onExecutePostLogin(event, api)

      expect(api.session.revoke).not.toHaveBeenCalled()
      expect(api.refreshToken.revoke).not.toHaveBeenCalled()
      expect(api.session.setMetadata).not.toHaveBeenCalled()
    })
  })

  describe('impossible travel', () => {
    it('revokes the session on high-confidence impossible travel during login', async () => {
      const event = createEvent({
        authentication: {
          methods: [],
          riskAssessment: {
            assessments: {
              ImpossibleTravel: {
                code: 'impossible_travel_from_last_login',
                confidence: 'high',
              },
            },
          },
        },
      })

      await onExecutePostLogin(event, api)

      expect(api.session.revoke).toHaveBeenCalledWith(
        'Impossible travel detected'
      )
      expect(api.refreshToken.revoke).not.toHaveBeenCalled()
    })

    it('revokes the refresh token on impossible travel during token exchange', async () => {
      const event = createEvent({
        transaction: { protocol: 'oauth2-refresh-token' },
        authentication: {
          methods: [],
          riskAssessment: {
            assessments: {
              ImpossibleTravel: {
                code: 'impossible_travel_from_last_login',
                confidence: 'high',
              },
            },
          },
        },
      })

      await onExecutePostLogin(event, api)

      expect(api.refreshToken.revoke).toHaveBeenCalledWith(
        'Impossible travel detected'
      )
      expect(api.session.revoke).not.toHaveBeenCalled()
    })

    it('does not revoke when impossible travel confidence is not high', async () => {
      const event = createEvent({
        authentication: {
          methods: [],
          riskAssessment: {
            assessments: {
              ImpossibleTravel: {
                code: 'impossible_travel_from_last_login',
                confidence: 'medium',
              },
            },
          },
        },
      })

      await onExecutePostLogin(event, api)

      expect(api.session.revoke).not.toHaveBeenCalled()
      expect(api.refreshToken.revoke).not.toHaveBeenCalled()
    })

    it('does not revoke for non-impossible travel codes', async () => {
      const event = createEvent({
        authentication: {
          methods: [],
          riskAssessment: {
            assessments: {
              ImpossibleTravel: {
                code: 'substantial_travel_from_last_login',
                confidence: 'high',
              },
            },
          },
        },
      })

      await onExecutePostLogin(event, api)

      expect(api.session.revoke).not.toHaveBeenCalled()
      expect(api.refreshToken.revoke).not.toHaveBeenCalled()
    })
  })

  describe('untrusted IP', () => {
    it('revokes the session when IP is on deny list during login', async () => {
      const event = createEvent({
        authentication: {
          methods: [],
          riskAssessment: {
            assessments: {
              UntrustedIP: { code: 'found_on_deny_list', confidence: 'high' },
            },
          },
        },
      })

      await onExecutePostLogin(event, api)

      expect(api.session.revoke).toHaveBeenCalledWith(
        'Request from untrusted IP'
      )
    })

    it('revokes the refresh token when IP is on deny list during token exchange', async () => {
      const event = createEvent({
        transaction: { protocol: 'oauth2-refresh-token' },
        authentication: {
          methods: [],
          riskAssessment: {
            assessments: {
              UntrustedIP: { code: 'found_on_deny_list', confidence: 'high' },
            },
          },
        },
      })

      await onExecutePostLogin(event, api)

      expect(api.refreshToken.revoke).toHaveBeenCalledWith(
        'Request from untrusted IP'
      )
      expect(api.session.revoke).not.toHaveBeenCalled()
    })

    it('does not revoke when IP is not on deny list', async () => {
      const event = createEvent({
        authentication: {
          methods: [],
          riskAssessment: {
            assessments: {
              UntrustedIP: {
                code: 'not_found_on_deny_list',
                confidence: 'high',
              },
            },
          },
        },
      })

      await onExecutePostLogin(event, api)

      expect(api.session.revoke).not.toHaveBeenCalled()
      expect(api.refreshToken.revoke).not.toHaveBeenCalled()
    })
  })

  describe('refresh token IP drift', () => {
    it('revokes when IP changed and device is unknown', async () => {
      const event = createEvent({
        transaction: { protocol: 'oauth2-refresh-token' },
        authentication: {
          methods: [],
          riskAssessment: {
            assessments: {
              NewDevice: { code: 'no_match', confidence: 'high' },
            },
          },
        },
        refresh_token: {
          id: 'rt_123',
          created_at: '2026-01-01T00:00:00Z',
          device: {
            initial_ip: '1.2.3.4',
            last_ip: '5.6.7.8',
          },
        },
      })

      await onExecutePostLogin(event, api)

      expect(api.refreshToken.revoke).toHaveBeenCalledWith(
        'Refresh token used from new IP and unknown device'
      )
    })

    it('does not revoke when IP changed but device is known', async () => {
      const event = createEvent({
        transaction: { protocol: 'oauth2-refresh-token' },
        authentication: {
          methods: [],
          riskAssessment: {
            assessments: {
              NewDevice: { code: 'match', confidence: 'high' },
            },
          },
        },
        refresh_token: {
          id: 'rt_123',
          created_at: '2026-01-01T00:00:00Z',
          device: {
            initial_ip: '1.2.3.4',
            last_ip: '5.6.7.8',
          },
        },
      })

      await onExecutePostLogin(event, api)

      expect(api.refreshToken.revoke).not.toHaveBeenCalled()
      expect(api.session.revoke).not.toHaveBeenCalled()
    })

    it('does not revoke when IP has not changed', async () => {
      const event = createEvent({
        transaction: { protocol: 'oauth2-refresh-token' },
        authentication: {
          methods: [],
          riskAssessment: {
            assessments: {
              NewDevice: { code: 'no_match', confidence: 'high' },
            },
          },
        },
        refresh_token: {
          id: 'rt_123',
          created_at: '2026-01-01T00:00:00Z',
          device: {
            initial_ip: '1.2.3.4',
            last_ip: '1.2.3.4',
          },
        },
      })

      await onExecutePostLogin(event, api)

      expect(api.refreshToken.revoke).not.toHaveBeenCalled()
      expect(api.session.revoke).not.toHaveBeenCalled()
    })

    it('does not check IP drift during interactive login', async () => {
      const event = createEvent({
        authentication: {
          methods: [],
          riskAssessment: {
            assessments: {
              NewDevice: { code: 'no_match', confidence: 'high' },
            },
          },
        },
        refresh_token: {
          id: 'rt_123',
          created_at: '2026-01-01T00:00:00Z',
          device: {
            initial_ip: '1.2.3.4',
            last_ip: '5.6.7.8',
          },
        },
      })

      await onExecutePostLogin(event, api)

      expect(api.refreshToken.revoke).not.toHaveBeenCalled()
      expect(api.session.revoke).not.toHaveBeenCalled()
    })
  })

  describe('session anomaly detection', () => {
    it('sets csp_ua_changed metadata when user-agent changes', async () => {
      const event = createEvent({
        session: {
          id: 'sess_123',
          device: {
            initial_user_agent: 'Mozilla/5.0 Chrome/120',
            last_user_agent: 'Mozilla/5.0 Firefox/121',
            initial_asn: 'AS1234',
            last_asn: 'AS1234',
          },
        },
      })

      await onExecutePostLogin(event, api)

      expect(api.session.setMetadata).toHaveBeenCalledWith(
        'csp_ua_changed',
        'true'
      )
      expect(api.session.setMetadata).not.toHaveBeenCalledWith(
        'csp_asn_changed',
        'true'
      )
    })

    it('sets csp_asn_changed metadata when ASN changes', async () => {
      const event = createEvent({
        session: {
          id: 'sess_123',
          device: {
            initial_user_agent: 'Mozilla/5.0 Chrome/120',
            last_user_agent: 'Mozilla/5.0 Chrome/120',
            initial_asn: 'AS1234',
            last_asn: 'AS5678',
          },
        },
      })

      await onExecutePostLogin(event, api)

      expect(api.session.setMetadata).toHaveBeenCalledWith(
        'csp_asn_changed',
        'true'
      )
      expect(api.session.setMetadata).not.toHaveBeenCalledWith(
        'csp_ua_changed',
        'true'
      )
    })

    it('sets both metadata flags when user-agent and ASN change', async () => {
      const event = createEvent({
        session: {
          id: 'sess_123',
          device: {
            initial_user_agent: 'Mozilla/5.0 Chrome/120',
            last_user_agent: 'Mozilla/5.0 Firefox/121',
            initial_asn: 'AS1234',
            last_asn: 'AS5678',
          },
        },
      })

      await onExecutePostLogin(event, api)

      expect(api.session.setMetadata).toHaveBeenCalledWith(
        'csp_ua_changed',
        'true'
      )
      expect(api.session.setMetadata).toHaveBeenCalledWith(
        'csp_asn_changed',
        'true'
      )
    })

    it('does not set metadata when user-agent and ASN are unchanged', async () => {
      const event = createEvent({
        session: {
          id: 'sess_123',
          device: {
            initial_user_agent: 'Mozilla/5.0 Chrome/120',
            last_user_agent: 'Mozilla/5.0 Chrome/120',
            initial_asn: 'AS1234',
            last_asn: 'AS1234',
          },
        },
      })

      await onExecutePostLogin(event, api)

      expect(api.session.setMetadata).not.toHaveBeenCalled()
    })

    it('does not set metadata when session device data is missing', async () => {
      const event = createEvent({
        session: { id: 'sess_123' },
      })

      await onExecutePostLogin(event, api)

      expect(api.session.setMetadata).not.toHaveBeenCalled()
    })
  })

  describe('risk check priority', () => {
    it('impossible travel takes precedence over untrusted IP', async () => {
      const event = createEvent({
        authentication: {
          methods: [],
          riskAssessment: {
            assessments: {
              ImpossibleTravel: {
                code: 'impossible_travel_from_last_login',
                confidence: 'high',
              },
              UntrustedIP: { code: 'found_on_deny_list', confidence: 'high' },
            },
          },
        },
      })

      await onExecutePostLogin(event, api)

      expect(api.session.revoke).toHaveBeenCalledTimes(1)
      expect(api.session.revoke).toHaveBeenCalledWith(
        'Impossible travel detected'
      )
    })
  })
})
