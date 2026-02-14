'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { appClient } from '@/lib/auth0'
import { managementClient } from '@/lib/auth0-manage'

export async function revokePasskey(formData: FormData) {
  const session = await appClient.getSession()

  if (!session) {
    return redirect('/auth/login')
  }

  const authenticationMethodId = formData.get('authentication_method_id')

  if (!authenticationMethodId || typeof authenticationMethodId !== 'string') {
    return {
      error: 'Display name is required.',
    }
  }

  try {
    await managementClient.users.deleteAuthenticationMethod({
      id: session.user.sub,
      authentication_method_id: authenticationMethodId,
    })
    revalidatePath('/', 'layout')
    return {}
  } catch (error) {
    console.error('failed to delete account', error)
    return {
      error: 'Failed to delete your account.',
    }
  }
}
