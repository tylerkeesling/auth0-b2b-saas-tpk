import { MyAccountClient } from '@auth0/myaccount-js'

export const myAccountClient = new MyAccountClient({
  domain: process.env.NEXT_PUBLIC_AUTH0_DOMAIN!,
  fetcher: async (url, init, authParams) => {
    const proxyUrl = new URL(url).pathname
    return fetch(proxyUrl, {
      ...init,
      headers: {
        'content-type': 'application/json',
        ...init?.headers,
        scope: authParams?.scope?.join(' ') ?? '',
      },
    })
  },
})
