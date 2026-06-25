'use client'

import { ConnectedAccountsSection } from './connected-accounts-section'
import { EmailSection } from './email-section'
import { PasskeySection } from './passkey-section'
import { PasswordSection } from './password-section'

export type Passkey = {
  id: string
  last_auth_at: string
  user_agent: string
  credential_device_type?: string
}

interface SignInMethodsPageProps {
  email: string
  emailVerified: boolean
  passkeys: Passkey[]
  lastPasswordReset: string | null
  createdAt: string | null
  userId: string
}

export function SignInMethodsPage({
  email,
  emailVerified,
  passkeys,
  lastPasswordReset,
  createdAt,
  userId,
}: SignInMethodsPageProps) {
  return (
    <div className="space-y-8">
      <EmailSection email={email} emailVerified={emailVerified} />

      <PasswordSection
        lastPasswordReset={lastPasswordReset}
        createdAt={createdAt}
      />

      <PasskeySection passkeys={passkeys} userId={userId} />

      <ConnectedAccountsSection />
    </div>
  )
}
