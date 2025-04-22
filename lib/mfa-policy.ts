export interface MfaPolicy {
  enforce: boolean
  providers: string[]
  skipForPasskey: boolean
  skipForFederation: boolean
  skipForDomains: string[]
}

export interface SessionPolicy {
  sessionLifetimeMs: number
  idleTimeoutMs: number
  // maxConcurrentSessions: number // not available yet
  // enforceSignOut: boolean       // roadmap item
}

export interface IpRestrictionPolicy {
  allowlist: string[]
  blocklist: string[]
}

export const DEFAULT_MFA_POLICY: MfaPolicy = {
  enforce: false,
  providers: [],
  skipForPasskey: false,
  skipForFederation: false,
  skipForDomains: [],
}

export const DEFAULT_SESSION_POLICY: SessionPolicy = {
  sessionLifetimeMs: 10080000,
  idleTimeoutMs: 1800000,
}

export const SUPPORTED_PROVIDERS = [
  "sms",
  "email",
  "otp",
  "push-notification",
  "webauthn-roaming",
  "webauthn-platform",
]
