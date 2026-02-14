import { redirect } from 'next/navigation'

import { appClient } from '@/lib/auth0'
import { decodeToken } from '@/lib/token-utils'
import { PageHeader } from '@/components/page-header'

import { RefreshTokenForm } from './refresh-token-form'
import { TokenCard } from './token-card'

export default async function Profile() {
  const session = await appClient.getSession()

  if (!session) {
    return redirect('/auth/login?returnTo=/dashboard/account/tokens')
  }

  const idTokenResult = session.tokenSet.idToken
    ? decodeToken(session.tokenSet.idToken)
    : { success: false as const, error: 'No ID token available' }

  const accessTokenResult = session.tokenSet.accessToken
    ? decodeToken(session.tokenSet.accessToken)
    : { success: false as const, error: 'No access token available' }

  return (
    <div className="space-y-2">
      <PageHeader
        title="Tokens"
        description="View your ID Token and Access Token."
      />
      <TokenCard
        title="ID Token"
        description={
          <>
            An ID token is an artifact that proves{' '}
            <span className="font-bold">the user has been authenticated.</span>
          </>
        }
        result={idTokenResult}
      />
      <TokenCard
        title="Access Token"
        description={
          <>
            An access token is an artifact that{' '}
            <span className="font-bold">
              allows the client application to access the user&apos;s resources.
            </span>
          </>
        }
        result={accessTokenResult}
      />
      <RefreshTokenForm />
    </div>
  )
}
