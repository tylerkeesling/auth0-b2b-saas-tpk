import { beforeEach, describe, expect, it, vi } from 'vitest'

import { onExecutePostLogin } from '../security-policies.js'

// ---------------------------------------------------------------------------
// Factories
// ---------------------------------------------------------------------------

const DASHBOARD_CLIENT_ID = 'dashboard-client-id'

function createEvent(overrides = {}) {
  const mfaPolicy =
    overrides.mfaPolicy !== undefined
      ? overrides.mfaPolicy
      : {
          enforce: true,
          providers: ['otp'],
          skipForPasskey: false,
          skipForFederation: false,
          skipForDomains: [],
        }

  const base = {
    client: { client_id: DASHBOARD_CLIENT_ID },
    secrets: { DASHBOARD_CLIENT_ID },
    transaction: { protocol: 'oidc-basic-profile' },
    organization: {
      metadata: {
        mfaPolicy: JSON.stringify(mfaPolicy),
      },
    },
    authentication: { methods: [] },
    user: {
      email: 'user@example.com',
      multifactor: ['guardian'],
    },
  }

  // Shallow-merge per top-level key
  const event = { ...base }
  for (const key of Object.keys(overrides)) {
    if (key === 'mfaPolicy') continue // already handled
    if (
      typeof overrides[key] === 'object' &&
      overrides[key] !== null &&
      !Array.isArray(overrides[key])
    ) {
      event[key] = { ...base[key], ...overrides[key] }
    } else {
      event[key] = overrides[key]
    }
  }

  return event
}

function createApi() {
  return {
    authentication: {
      enrollWithAny: vi.fn(),
      challengeWithAny: vi.fn(),
    },
    access: {
      deny: vi.fn(),
    },
  }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('security-policies action', () => {
  let api

  beforeEach(() => {
    api = createApi()
  })

  // #1 — Wrong client ID → no-op
  it('does nothing when the client_id does not match DASHBOARD_CLIENT_ID', async () => {
    const event = createEvent({ client: { client_id: 'other-client' } })
    await onExecutePostLogin(event, api)

    expect(api.authentication.enrollWithAny).not.toHaveBeenCalled()
    expect(api.authentication.challengeWithAny).not.toHaveBeenCalled()
    expect(api.access.deny).not.toHaveBeenCalled()
  })

  // #2 — Refresh token flow → no-op
  it('does nothing for oauth2-refresh-token protocol', async () => {
    const event = createEvent({
      transaction: { protocol: 'oauth2-refresh-token' },
    })
    await onExecutePostLogin(event, api)

    expect(api.authentication.enrollWithAny).not.toHaveBeenCalled()
    expect(api.authentication.challengeWithAny).not.toHaveBeenCalled()
    expect(api.access.deny).not.toHaveBeenCalled()
  })

  // #3 — enforce=false → no-op
  it('does nothing when enforce is false', async () => {
    const event = createEvent({ mfaPolicy: { enforce: false } })
    await onExecutePostLogin(event, api)

    expect(api.authentication.enrollWithAny).not.toHaveBeenCalled()
    expect(api.authentication.challengeWithAny).not.toHaveBeenCalled()
    expect(api.access.deny).not.toHaveBeenCalled()
  })

  // #4 — Passkey + skipForPasskey → skip MFA
  it('skips MFA when user authenticated with passkey and skipForPasskey is true', async () => {
    const event = createEvent({
      mfaPolicy: {
        enforce: true,
        providers: ['otp'],
        skipForPasskey: true,
        skipForFederation: false,
        skipForDomains: [],
      },
      authentication: { methods: [{ name: 'passkey' }] },
    })
    await onExecutePostLogin(event, api)

    expect(api.authentication.enrollWithAny).not.toHaveBeenCalled()
    expect(api.authentication.challengeWithAny).not.toHaveBeenCalled()
    expect(api.access.deny).not.toHaveBeenCalled()
  })

  // #5 — Federation + skipForFederation → skip MFA
  it('skips MFA when user authenticated via federation and skipForFederation is true', async () => {
    const event = createEvent({
      mfaPolicy: {
        enforce: true,
        providers: ['otp'],
        skipForPasskey: false,
        skipForFederation: true,
        skipForDomains: [],
      },
      authentication: { methods: [{ name: 'federated' }] },
    })
    await onExecutePostLogin(event, api)

    expect(api.authentication.enrollWithAny).not.toHaveBeenCalled()
    expect(api.authentication.challengeWithAny).not.toHaveBeenCalled()
    expect(api.access.deny).not.toHaveBeenCalled()
  })

  // #6 — No multifactor enrolled → enrollWithAny
  it('enrolls user when they have no multifactor methods', async () => {
    const event = createEvent({
      user: { email: 'user@example.com', multifactor: [] },
    })
    await onExecutePostLogin(event, api)

    expect(api.authentication.enrollWithAny).toHaveBeenCalledWith([
      { type: 'otp' },
    ])
    expect(api.authentication.challengeWithAny).not.toHaveBeenCalled()
  })

  it('enrolls user when multifactor is undefined', async () => {
    const event = createEvent({
      user: { email: 'user@example.com' },
    })
    // multifactor is missing entirely
    delete event.user.multifactor
    await onExecutePostLogin(event, api)

    expect(api.authentication.enrollWithAny).toHaveBeenCalledWith([
      { type: 'otp' },
    ])
  })

  // #7 — Enrolled, empty skipForDomains → challengeWithAny
  it('challenges enrolled user when skipForDomains is empty', async () => {
    const event = createEvent()
    await onExecutePostLogin(event, api)

    expect(api.authentication.challengeWithAny).toHaveBeenCalledWith([
      { type: 'otp' },
    ])
    expect(api.authentication.enrollWithAny).not.toHaveBeenCalled()
  })

  // #8 — Enrolled, domain IN skipForDomains → no challenge
  it('skips challenge when user email domain is in skipForDomains', async () => {
    const event = createEvent({
      mfaPolicy: {
        enforce: true,
        providers: ['otp'],
        skipForPasskey: false,
        skipForFederation: false,
        skipForDomains: ['example.com'],
      },
      user: { email: 'user@example.com', multifactor: ['guardian'] },
    })
    await onExecutePostLogin(event, api)

    expect(api.authentication.challengeWithAny).not.toHaveBeenCalled()
    expect(api.authentication.enrollWithAny).not.toHaveBeenCalled()
    expect(api.access.deny).not.toHaveBeenCalled()
  })

  // #9 — Enrolled, domain NOT in skipForDomains → challengeWithAny
  it('challenges enrolled user when email domain is not in skipForDomains', async () => {
    const event = createEvent({
      mfaPolicy: {
        enforce: true,
        providers: ['otp', 'sms'],
        skipForPasskey: false,
        skipForFederation: false,
        skipForDomains: ['corp.co'],
      },
      user: { email: 'user@example.com', multifactor: ['guardian'] },
    })
    await onExecutePostLogin(event, api)

    expect(api.authentication.challengeWithAny).toHaveBeenCalledWith([
      { type: 'otp' },
      { type: 'sms' },
    ])
  })

  // #10 — Enrolled, skipForDomains set, invalid email → deny
  it('denies access when email has no @ and skipForDomains is set', async () => {
    const event = createEvent({
      mfaPolicy: {
        enforce: true,
        providers: ['otp'],
        skipForPasskey: false,
        skipForFederation: false,
        skipForDomains: ['example.com'],
      },
      user: { email: 'invalid-email', multifactor: ['guardian'] },
    })
    await onExecutePostLogin(event, api)

    expect(api.access.deny).toHaveBeenCalledWith('Email is invalid')
    expect(api.authentication.challengeWithAny).not.toHaveBeenCalled()
  })

  it('denies access when email has multiple @ signs', async () => {
    const event = createEvent({
      mfaPolicy: {
        enforce: true,
        providers: ['otp'],
        skipForPasskey: false,
        skipForFederation: false,
        skipForDomains: ['example.com'],
      },
      user: { email: 'user@bad@example.com', multifactor: ['guardian'] },
    })
    await onExecutePostLogin(event, api)

    expect(api.access.deny).toHaveBeenCalledWith('Email is invalid')
  })

  // #11 — Passkey used but skipForPasskey=false → still challenge
  it('challenges even when passkey is used if skipForPasskey is false', async () => {
    const event = createEvent({
      authentication: { methods: [{ name: 'passkey' }] },
    })
    await onExecutePostLogin(event, api)

    expect(api.authentication.challengeWithAny).toHaveBeenCalledWith([
      { type: 'otp' },
    ])
  })

  // #12 — Federation used but skipForFederation=false → still challenge
  it('challenges even when federation is used if skipForFederation is false', async () => {
    const event = createEvent({
      authentication: { methods: [{ name: 'federated' }] },
    })
    await onExecutePostLogin(event, api)

    expect(api.authentication.challengeWithAny).toHaveBeenCalledWith([
      { type: 'otp' },
    ])
  })

  // #13 — Domain matching is case-insensitive
  it('matches email domain case-insensitively against skipForDomains', async () => {
    const event = createEvent({
      mfaPolicy: {
        enforce: true,
        providers: ['otp'],
        skipForPasskey: false,
        skipForFederation: false,
        skipForDomains: ['example.com'],
      },
      user: { email: 'User@EXAMPLE.COM', multifactor: ['guardian'] },
    })
    await onExecutePostLogin(event, api)

    expect(api.authentication.challengeWithAny).not.toHaveBeenCalled()
    expect(api.access.deny).not.toHaveBeenCalled()
  })
})
