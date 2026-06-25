import { NextResponse, type NextRequest } from 'next/server'

import { appClient } from '@/lib/auth0'
import { myAccountClient } from '@/lib/my-account-client'

const REDIRECT_URI = `${process.env.APP_BASE_URL}/api/connected-accounts/callback`
const SUCCESS_REDIRECT = '/dashboard/account/sign-in-methods'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  if (error) {
    console.error(
      'Connected account flow error:',
      error,
      searchParams.get('error_description')
    )
    return NextResponse.redirect(
      new URL(
        `${SUCCESS_REDIRECT}?connect_error=${encodeURIComponent(error)}`,
        request.url
      )
    )
  }

  if (!code) {
    return NextResponse.redirect(new URL(SUCCESS_REDIRECT, request.url))
  }

  const session = await appClient.getSession()

  if (!session) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  const authSession = session.user._pendingConnectSession as string | undefined

  if (!authSession) {
    console.error('No pending connect session found')
    return NextResponse.redirect(
      new URL(`${SUCCESS_REDIRECT}?connect_error=session_expired`, request.url)
    )
  }

  try {
    await myAccountClient.connectedAccounts.complete({
      auth_session: authSession,
      connect_code: code,
      redirect_uri: REDIRECT_URI,
    })

    // Clear the pending session
    await appClient.updateSession({
      ...session,
      user: {
        ...session.user,
        _pendingConnectSession: undefined,
      },
    })

    return NextResponse.redirect(
      new URL(`${SUCCESS_REDIRECT}?connected=true`, request.url)
    )
  } catch (err) {
    console.error('Failed to complete connected account flow', err)
    return NextResponse.redirect(
      new URL(
        `${SUCCESS_REDIRECT}?connect_error=completion_failed`,
        request.url
      )
    )
  }
}
