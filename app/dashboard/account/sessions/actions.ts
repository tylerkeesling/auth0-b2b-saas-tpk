'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { appClient } from '@/lib/auth0'
import { managementClient } from '@/lib/auth0-manage'

export async function deleteSession(formData: FormData) {
  const session = await appClient.getSession()

  if (!session) {
    return redirect('/auth/login')
  }

  let sessionId = formData.get('session_id')

  if (!sessionId || typeof sessionId !== 'string') {
    return {
      error: 'Enrollment ID is required.',
    }
  }
  try {
    await managementClient.sessions.delete(sessionId)

    revalidatePath('/dashboard/account/sessions', 'layout')

    return {}
  } catch (error) {
    return {
      error: 'Failed to delete session.',
    }
  }
}
