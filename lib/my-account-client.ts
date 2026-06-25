import { MyAccountClient } from '@auth0/myaccount-js'

import { getMyAccountAccessToken } from '@/lib/my-account-token'

export const myAccountClient = new MyAccountClient({
  domain: process.env.NEXT_PUBLIC_AUTH0_DOMAIN!,
  token: async ({ scope }) => {
    const token = await getMyAccountAccessToken(scope)
    return token
  },
})
