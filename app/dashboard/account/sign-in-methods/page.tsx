import { redirect } from 'next/navigation'
import { Shield } from 'lucide-react'

import { appClient } from '@/lib/auth0'
import { managementClient } from '@/lib/auth0-manage'
import { Separator } from '@/components/ui/separator'

import { SignInMethodsPage } from './sign-in-methods-page'

export default async function SecuritySettingsSignInMethods() {
  const session = await appClient.getSession()

  if (!session) {
    return redirect('/auth/login?returnTo=/dashboard/account/sign-in-methods')
  }

  const userId = session.user.sub

  const [enrollmentsResponse, userResponse] = await Promise.all([
    managementClient.users.authenticationMethods.list(userId),
    managementClient.users.get(userId),
  ])
  const enrollments = enrollmentsResponse.data

  const passkeys: any[] = enrollments.filter((enrollment: any) => {
    return enrollment.type.includes('passkey')
  })

  return (
    <div className="space-y-8">
      <header>
        <div className="mb-2 flex items-center gap-2.5">
          <Shield className="text-muted-foreground h-5 w-5" />
          <h1 className="text-foreground text-xl font-semibold tracking-tight">
            Sign-in methods
          </h1>
        </div>
        <p className="text-muted-foreground max-w-md text-sm leading-relaxed">
          Manage how you sign in to your account. Keep your authentication
          methods up to date to ensure uninterrupted access.
        </p>
      </header>

      <Separator />

      <SignInMethodsPage
        email={session.user.email ?? ''}
        emailVerified={session.user.email_verified ?? false}
        passkeys={passkeys}
        lastPasswordReset={(userResponse as any).last_password_reset ?? null}
        createdAt={(userResponse as any).created_at ?? null}
      />
    </div>
  )
}
