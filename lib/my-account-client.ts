import { MyAccountClient } from '@auth0/myaccount-js'

import { getMyAccountAccessToken } from '@/app/dashboard/account/sign-in-methods/actions'

export const myAccountClient = new MyAccountClient({
  domain: process.env.NEXT_PUBLIC_AUTH0_DOMAIN!,
  token: async ({ scope }) => {
    const token = await getMyAccountAccessToken(scope)
    return token
  },
})
