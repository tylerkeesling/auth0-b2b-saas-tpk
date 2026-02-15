import { beforeEach, describe, expect, it, vi } from 'vitest'

// We need to import the CJS module
const { onExecutePostLogin } = require('../security-policies')

function createEvent(overrides: Record<string, any> = {}) {
  return {
    client: { client_id: 'dashboard-client' },
    secrets: { DASHBOARD_CLIENT_ID: 'dashboard-client' },
    transaction: { protocol: 'oidc-basic-profile' },
    organization: {
      metadata: {
        mfaPolicy: JSON.stringify({
          enforce: true,
          providers: ['otp', 'sms', 'email'],
        }),
      },
    },
    authentication: { methods: [] },
    user: {
      sub: 'auth0|123',
      email: 'user@example.com',
      multifactor: ['guardian'],
      user_metadata: {},
    },
    ...overrides,
  }
}

function createApi() {
  return {
    authentication: {
      challengeWith: vi.fn(),
      challengeWithAny: vi.fn(),
      enrollWithAny: vi.fn(),
    },
    access: {
      deny: vi.fn(),
    },
  }
}

describe('security-policies action', () => {
  let api: ReturnType<typeof createApi>

  beforeEach(() => {
    api = createApi()
  })

  describe('challengeWith preferred method', () => {
    it('uses challengeWith when user has a preferred method in the providers list', async () => {
      const event = createEvent({
        user: {
          sub: 'auth0|123',
          email: 'user@example.com',
          multifactor: ['guardian'],
          user_metadata: { preferred_mfa_method: 'otp' },
        },
      })

      await onExecutePostLogin(event, api)

      expect(api.authentication.challengeWith).toHaveBeenCalledWith(
        { type: 'otp' },
        {
          additionalFactors: [{ type: 'phone' }, { type: 'email' }],
        }
      )
      expect(api.authentication.challengeWithAny).not.toHaveBeenCalled()
    })

    it('maps sms preferred method to phone type for challengeWith', async () => {
      const event = createEvent({
        user: {
          sub: 'auth0|123',
          email: 'user@example.com',
          multifactor: ['guardian'],
          user_metadata: { preferred_mfa_method: 'sms' },
        },
      })

      await onExecutePostLogin(event, api)

      expect(api.authentication.challengeWith).toHaveBeenCalledWith(
        { type: 'phone' },
        {
          additionalFactors: [{ type: 'otp' }, { type: 'email' }],
        }
      )
      expect(api.authentication.challengeWithAny).not.toHaveBeenCalled()
    })

    it('falls back to challengeWithAny when preferred method is not in providers', async () => {
      const event = createEvent({
        user: {
          sub: 'auth0|123',
          email: 'user@example.com',
          multifactor: ['guardian'],
          user_metadata: { preferred_mfa_method: 'webauthn-roaming' },
        },
      })

      await onExecutePostLogin(event, api)

      expect(api.authentication.challengeWithAny).toHaveBeenCalledWith([
        { type: 'otp' },
        { type: 'phone' },
        { type: 'email' },
      ])
      expect(api.authentication.challengeWith).not.toHaveBeenCalled()
    })

    it('falls back to challengeWithAny when no preferred method is set', async () => {
      const event = createEvent()

      await onExecutePostLogin(event, api)

      expect(api.authentication.challengeWithAny).toHaveBeenCalledWith([
        { type: 'otp' },
        { type: 'phone' },
        { type: 'email' },
      ])
      expect(api.authentication.challengeWith).not.toHaveBeenCalled()
    })

    it('falls back to challengeWithAny when org disables the preferred factor', async () => {
      const event = createEvent({
        organization: {
          metadata: {
            mfaPolicy: JSON.stringify({
              enforce: true,
              providers: ['sms', 'email'],
            }),
          },
        },
        user: {
          sub: 'auth0|123',
          email: 'user@example.com',
          multifactor: ['guardian'],
          user_metadata: { preferred_mfa_method: 'otp' },
        },
      })

      await onExecutePostLogin(event, api)

      expect(api.authentication.challengeWithAny).toHaveBeenCalledWith([
        { type: 'phone' },
        { type: 'email' },
      ])
      expect(api.authentication.challengeWith).not.toHaveBeenCalled()
    })

    it('excludes preferred factor from additionalFactors', async () => {
      const event = createEvent({
        organization: {
          metadata: {
            mfaPolicy: JSON.stringify({
              enforce: true,
              providers: ['otp', 'sms'],
            }),
          },
        },
        user: {
          sub: 'auth0|123',
          email: 'user@example.com',
          multifactor: ['guardian'],
          user_metadata: { preferred_mfa_method: 'otp' },
        },
      })

      await onExecutePostLogin(event, api)

      expect(api.authentication.challengeWith).toHaveBeenCalledWith(
        { type: 'otp' },
        { additionalFactors: [{ type: 'phone' }] }
      )
    })
  })

  describe('early exits', () => {
    it('does nothing when client_id does not match DASHBOARD_CLIENT_ID', async () => {
      const event = createEvent({
        client: { client_id: 'other-client' },
      })

      await onExecutePostLogin(event, api)

      expect(api.authentication.challengeWith).not.toHaveBeenCalled()
      expect(api.authentication.challengeWithAny).not.toHaveBeenCalled()
    })

    it('does nothing for refresh token transactions', async () => {
      const event = createEvent({
        transaction: { protocol: 'oauth2-refresh-token' },
      })

      await onExecutePostLogin(event, api)

      expect(api.authentication.challengeWith).not.toHaveBeenCalled()
      expect(api.authentication.challengeWithAny).not.toHaveBeenCalled()
    })

    it('does nothing when MFA is not enforced', async () => {
      const event = createEvent({
        organization: {
          metadata: {
            mfaPolicy: JSON.stringify({ enforce: false, providers: ['otp'] }),
          },
        },
      })

      await onExecutePostLogin(event, api)

      expect(api.authentication.challengeWith).not.toHaveBeenCalled()
      expect(api.authentication.challengeWithAny).not.toHaveBeenCalled()
    })

    it('skips MFA for passkey when skipForPasskey is true', async () => {
      const event = createEvent({
        organization: {
          metadata: {
            mfaPolicy: JSON.stringify({
              enforce: true,
              providers: ['otp'],
              skipForPasskey: true,
            }),
          },
        },
        authentication: { methods: [{ name: 'passkey' }] },
      })

      await onExecutePostLogin(event, api)

      expect(api.authentication.challengeWith).not.toHaveBeenCalled()
      expect(api.authentication.challengeWithAny).not.toHaveBeenCalled()
    })

    it('skips MFA for federation when skipForFederation is true', async () => {
      const event = createEvent({
        organization: {
          metadata: {
            mfaPolicy: JSON.stringify({
              enforce: true,
              providers: ['otp'],
              skipForFederation: true,
            }),
          },
        },
        authentication: { methods: [{ name: 'federated' }] },
      })

      await onExecutePostLogin(event, api)

      expect(api.authentication.challengeWith).not.toHaveBeenCalled()
      expect(api.authentication.challengeWithAny).not.toHaveBeenCalled()
    })
  })

  describe('enrollment', () => {
    it('calls enrollWithAny when user has no multifactor enrollments', async () => {
      const event = createEvent({
        user: {
          sub: 'auth0|123',
          email: 'user@example.com',
          multifactor: [],
          user_metadata: {},
        },
      })

      await onExecutePostLogin(event, api)

      expect(api.authentication.enrollWithAny).toHaveBeenCalledWith([
        { type: 'otp' },
        { type: 'phone' },
        { type: 'email' },
      ])
    })
  })

  describe('skipForDomains', () => {
    it('skips MFA for users with exempt email domains', async () => {
      const event = createEvent({
        organization: {
          metadata: {
            mfaPolicy: JSON.stringify({
              enforce: true,
              providers: ['otp'],
              skipForDomains: ['example.com'],
            }),
          },
        },
      })

      await onExecutePostLogin(event, api)

      expect(api.authentication.challengeWith).not.toHaveBeenCalled()
      expect(api.authentication.challengeWithAny).not.toHaveBeenCalled()
    })

    it('denies access when email is invalid', async () => {
      const event = createEvent({
        organization: {
          metadata: {
            mfaPolicy: JSON.stringify({
              enforce: true,
              providers: ['otp'],
              skipForDomains: ['example.com'],
            }),
          },
        },
        user: {
          sub: 'auth0|123',
          email: 'invalid-email',
          multifactor: ['guardian'],
          user_metadata: {},
        },
      })

      await onExecutePostLogin(event, api)

      expect(api.access.deny).toHaveBeenCalledWith('Email is invalid')
    })

    it('still challenges when domain is not in exempt list', async () => {
      const event = createEvent({
        organization: {
          metadata: {
            mfaPolicy: JSON.stringify({
              enforce: true,
              providers: ['otp'],
              skipForDomains: ['other.com'],
            }),
          },
        },
      })

      await onExecutePostLogin(event, api)

      expect(api.authentication.challengeWithAny).toHaveBeenCalled()
    })
  })
})
