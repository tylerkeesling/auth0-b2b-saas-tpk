'use server'

import { appClient } from '@/lib/auth0'
import { myAccountClient } from '@/lib/my-account-client'

const REDIRECT_URI = `${process.env.APP_BASE_URL}/api/connected-accounts/callback`

export async function initiateConnectedAccount(
  connection: string
): Promise<{ connectUrl: string }> {
  const session = await appClient.getSession()

  if (!session) {
    throw new Error('Not authenticated')
  }

  const result = await myAccountClient.connectedAccounts.create({
    connection,
    redirect_uri: REDIRECT_URI,
  })

  // Store auth_session in the user's session so the callback route can complete the flow
  await appClient.updateSession({
    ...session,
    user: {
      ...session.user,
      _pendingConnectSession: result.auth_session,
    },
  })

  // connect_uri is the base URL; ticket is appended as a query param to initiate the flow
  const connectUrl = `${result.connect_uri}?ticket=${result.connect_params.ticket}`

  return { connectUrl }
}
