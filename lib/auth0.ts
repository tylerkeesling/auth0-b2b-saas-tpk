import { Auth0Client } from '@auth0/nextjs-auth0/server'

import sessionStore from './session-store'

export const appClient = new Auth0Client({
  authorizationParameters: {
    audience: process.env.AUTH0_AUDIENCE,
    scope: {
      ['demonstration']: 'openid email profile offline_access',
      [`https://${process.env.NEXT_PUBLIC_AUTH0_DOMAIN}/me/`]:
        'openid email profile offline_access read:me:factors read:me:authentication_methods delete:me:authentication_methods create:me:authentication_methods',
    },
  },
  sessionStore,
  async beforeSessionSaved(session) {
    return {
      ...session,
      user: {
        ...session.user,
      },
    }
  },
})

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
