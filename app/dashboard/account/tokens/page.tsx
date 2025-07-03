import { Code } from "bright"
import { jwtDecode } from "jwt-decode"

import { appClient } from "@/lib/auth0"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { PageHeader } from "@/components/page-header"

import { RefreshTokenForm } from "./refresh-token-form"

function decodeToken(token: string) {
  try {
    const jwtPayloadJson = jwtDecode(token)
    const stringifiedJson = JSON.stringify(jwtPayloadJson, null, 2)
    return stringifiedJson
  } catch (error) {
    console.error(error)
    return "The token is opaque or malformed. Please refer to https://community.auth0.com/t/why-is-my-access-token-not-a-jwt-opaque-token/31028"
  }
}

function TokenCard({ title, description, token }: { title: string; description: React.ReactNode; token: string | undefined }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid w-full items-center gap-1.5">
          <Code
            theme="material-darker"
            className="m-0! rounded-xl! text-sm"
            lang="json"
          >
            {token}
          </Code>
        </div>
      </CardContent>
    </Card>
  )
}

export default appClient.withPageAuthRequired(
  async function Profile() {
    const session = await appClient.getSession()

    const idToken = session?.idToken && decodeToken(session.idToken)
    const accessToken = session?.accessToken && decodeToken(session.accessToken)

    return (
      <div className="space-y-2">
        <PageHeader
          title="Tokens"
          description="View your ID Token and Access Token."
        />
        <TokenCard
          title="ID Token"
          description={
            <>An ID token is an artifact that proves <span className="font-bold">the user has been authenticated.</span></>
          }
          token={idToken}
        />
        <TokenCard
          title="Access Token"
          description={
            <>An access token is an artifact that <span className="font-bold">allows the client application to access the user&apos;s resources.</span></>
          }
          token={accessToken}
        />
        <RefreshTokenForm />
      </div>
    )
  },
  { returnTo: "/dashboard/account/tokens" }
)
