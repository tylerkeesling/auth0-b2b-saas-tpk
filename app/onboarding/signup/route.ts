import { NextRequest } from 'next/server'

import { onboardingClient } from '@/lib/auth0'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const loginHint = searchParams.get('login_hint')

  return await onboardingClient.startInteractiveLogin({
    authorizationParameters: {
      screen_hint: 'signup',
      login_hint: loginHint || undefined,
    },
    returnTo: '/onboarding/create',
  })
}
