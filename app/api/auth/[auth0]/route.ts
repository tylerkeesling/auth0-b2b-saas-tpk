import { redirect } from "next/navigation"
import { NextRequest } from "next/server"
import { HandlerError } from "@auth0/nextjs-auth0"

import { appClient } from "@/lib/auth0"
import { generateOrgAndFQDN } from "@/lib/utils"

const handler = appClient.handleAuth({
  login: appClient.handleLogin((request) => {
    // NOTE: this is a typing issue. The request Object here is of type NextRequest (not NextApiRequest)
    // as this is a route handler.
    // See: https://nextjs.org/docs/app/building-your-application/routing/route-handlers#url-query-parameters
    // @ts-ignore
    const searchParams = request.nextUrl.searchParams
    // const organization = searchParams.get("organization")
    const invitation = searchParams.get("invitation")
    const connection = searchParams.get("connection")

    // @ts-ignore
    const { orgName, domain } = generateOrgAndFQDN(request)

    return {
      authorizationParams: {
        organization: orgName,
        redirect_uri: `${domain}/api/auth/callback`,
        // if the user is accepting an invite, we need to forward it to Auth0
        invitation,
        connection,
      },
      returnTo: `${domain}/dashboard/account/tokens`,
    }
  }),
  signup: appClient.handleLogin({
    authorizationParams: {
      screen_hint: "signup",
    },
    returnTo: "/",
  }),
  callback: appClient.handleCallback((request) => {
    // @ts-ignore
    const { domain: redirectUri } = generateOrgAndFQDN(request)
    return { redirectUri }
  }),
  logout: appClient.handleLogout((request) => {
    // @ts-ignore
    const { domain: returnTo } = generateOrgAndFQDN(request)
    return { returnTo }
  }),
  onError(_req: NextRequest, error: HandlerError) {
    console.error(error)
    redirect(
      `/api/auth/error?error=${error.cause?.message || "An error occured while authenticating the user."}`
    )
  },
})

export { handler as GET, handler as POST }
