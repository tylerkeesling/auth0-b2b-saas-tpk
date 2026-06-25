'use server'

import { appClient } from '@/lib/auth0'

export async function getMyAccountAccessToken(scope: string): Promise<string> {
  const session = await appClient.getSession()

  if (!session) {
    throw new Error('Not authenticated')
  }

  const audience = `https://${process.env.NEXT_PUBLIC_AUTH0_DOMAIN}/me/`
  const token = await appClient.getAccessToken({ audience, scope })

  if (typeof token === 'string') {
    return token
  }

  return token.token
}
