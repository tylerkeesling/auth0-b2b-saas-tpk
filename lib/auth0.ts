// import { initAuth0 } from "@auth0/nextjs-auth0"
import { Auth0Client } from '@auth0/nextjs-auth0/server'

import sessionStore from './session-store'

export const appClient = new Auth0Client({
  authorizationParameters: {
    audience: process.env.AUTH0_AUDIENCE,
    // scope: process.env.AUTH0_SCOPE,
  },
  sessionStore,
  async beforeSessionSaved(session, idToken) {
    return {
      ...session,
      user: {
        ...session.user,
      },
    }
  },
})

// export const onboardingClient = initAuth0({
//   clientID: process.env.AUTH0_MANAGEMENT_CLIENT_ID,
//   clientSecret: process.env.AUTH0_MANAGEMENT_CLIENT_SECRET,
//   // baseURL: process.env.APP_BASE_URL,
//   issuerBaseURL: `https://${process.env.NEXT_PUBLIC_AUTH0_DOMAIN}`,
//   secret: process.env.SESSION_ENCRYPTION_SECRET,
//   routes: {
//     callback: "/onboarding/callback",
//     postLogoutRedirect: "/",
//   },
// })

export const onboardingClient = new Auth0Client({
  clientId: process.env.AUTH0_MANAGEMENT_CLIENT_ID,
  clientSecret: process.env.AUTH0_MANAGEMENT_CLIENT_SECRET,
  authorizationParameters: {
    // scope: process.env.AUTH0_SCOPE,
  },
  routes: {
    callback: '/onboarding/callback',
    logout: '/',
  },
})

// export const appClient = initAuth0({
//   clientID: process.env.AUTH0_CLIENT_ID,
//   clientSecret: process.env.AUTH0_CLIENT_SECRET,
//   // baseURL: process.env.APP_BASE_URL,
//   issuerBaseURL: `https://${process.env.NEXT_PUBLIC_AUTH0_DOMAIN}`,
//   secret: process.env.SESSION_ENCRYPTION_SECRET,
//   backchannelLogout: {
//     store: new Store(),
//   },
// })
