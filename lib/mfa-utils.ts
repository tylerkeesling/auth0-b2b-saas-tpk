import {
  Bell,
  Fingerprint,
  Key,
  KeyRound,
  Mail,
  Smartphone,
  type LucideIcon,
} from 'lucide-react'

import { type MyAccountApiError } from '@/lib/my-account'

// --- Icons (keyed by API factor type) ---

export const factorIcons: Record<string, LucideIcon> = {
  phone: Smartphone,
  email: Mail,
  totp: KeyRound,
  'push-notification': Bell,
  'webauthn-roaming': Key,
  'webauthn-platform': Fingerprint,
}

// --- Metadata (keyed by API factor type) ---

export const factorsMeta: Record<
  string,
  { title: string; description: string }
> = {
  phone: {
    title: 'Phone Message',
    description: 'Receive a verification code via SMS',
  },
  'push-notification': {
    title: 'Push Notification',
    description: 'Verify via Auth0 Guardian push notification',
  },
  totp: {
    title: 'One-time Password',
    description: 'Use an authenticator app like Google Authenticator',
  },
  email: {
    title: 'Email',
    description: 'Receive a verification code via email',
  },
  'webauthn-roaming': {
    title: 'Security Keys',
    description: 'Use a FIDO2-compliant security key',
  },
  'webauthn-platform': {
    title: 'Device Biometrics',
    description: "Use your device's built-in biometrics",
  },
}

// --- Factor type → org policy provider name mapping ---
// My Account API uses different names than org metadata for some factors

const factorTypeToProvider: Record<string, string> = {
  phone: 'sms',
  totp: 'otp',
}

export function getProviderName(factorType: string): string {
  return factorTypeToProvider[factorType] ?? factorType
}

// --- Error mapping ---

export function getMyAccountError(err: MyAccountApiError): string {
  switch (err.statusCode) {
    case 400:
      return 'Invalid verification code. Please try again.'
    case 401:
      return 'Your session has expired. Please log in again.'
    case 403:
      return 'Insufficient permissions for this action.'
    case 409:
      return 'This factor is already enrolled.'
    case 429:
      return 'Too many attempts. Please wait a moment and try again.'
    default:
      return 'Something went wrong. Please try again.'
  }
}
