'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { appClient } from '@/lib/auth0'
import { managementClient } from '@/lib/auth0-manage'

export async function setPreferredMethod(formData: FormData) {
  const session = await appClient.getSession()

  if (!session) {
    return redirect('/auth/login')
  }

  const factorName = formData.get('factor_name')

  if (!factorName || typeof factorName !== 'string') {
    return {
      error: 'Factor name is required.',
    }
  }

  try {
    await managementClient.users.update(session.user.sub, {
      user_metadata: { preferred_mfa_method: factorName },
    })

    revalidatePath('/dashboard/account/mfa-v2', 'layout')

    return {}
  } catch (error) {
    console.error('failed to set preferred MFA method', error)
    return {
      error: 'Failed to set preferred MFA method.',
    }
  }
}

export async function clearPreferredMethod() {
  const session = await appClient.getSession()

  if (!session) {
    return redirect('/auth/login')
  }

  try {
    await managementClient.users.update(session.user.sub, {
      user_metadata: { preferred_mfa_method: null },
    })

    revalidatePath('/dashboard/account/mfa-v2', 'layout')

    return {}
  } catch (error) {
    console.error('failed to clear preferred MFA method', error)
    return {
      error: 'Failed to clear preferred MFA method.',
    }
  }
}
