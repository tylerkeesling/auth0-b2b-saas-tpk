export interface MfaPolicy {
  enforce: boolean
  providers: string[]
  skipForPasskey: boolean
  skipForFederation: boolean
  skipForDomains: string[]
}

export const DEFAULT_MFA_POLICY: MfaPolicy = {
  enforce: false,
  providers: [],
  skipForPasskey: false,
  skipForFederation: false,
  skipForDomains: [],
}

export const SUPPORTED_PROVIDERS = [
  "sms",
  "email",
  "otp",
  "push-notification",
  "webauthn-roaming",
  "webauthn-platform",
]
