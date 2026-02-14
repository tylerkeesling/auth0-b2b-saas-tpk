import { type NextRequest } from 'next/server'

import { appClient, onboardingClient } from './lib/auth0'

// Helper function to detect onboarding routes
const isOnboardingRoute = (pathname: string): boolean => {
  return pathname.startsWith('/onboarding')
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Route to appropriate Auth0 client based on path
  if (isOnboardingRoute(pathname)) {
    // Use onboarding client for organization creation flow
    return await onboardingClient.middleware(request)
  } else {
    // Use app client for main application routes
    return await appClient.middleware(request)
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
}
