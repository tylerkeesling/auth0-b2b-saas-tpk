'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { appClient } from '@/lib/auth0'
import { managementClient } from '@/lib/auth0-manage'

export async function createEnrollment(formData: FormData) {
  const session = await appClient.getSession()

  if (!session) {
    return redirect('/auth/login')
  }

  let factorName = formData.get('factor_name')

  if (!factorName || typeof factorName !== 'string') {
    return {
      error: 'Factor name is required.',
    }
  }

  try {
    const userId = session?.user.sub

    if (factorName === 'sms' || factorName === 'voice') {
      factorName = 'phone'
    }

    const enrollmentTicket =
      await managementClient.guardian.enrollments.createTicket({
        user_id: userId,
        factor: factorName as any,
        allow_multiple_enrollments: true,
      })

    revalidatePath('/dashboard/account/mfa', 'layout')

    return {
      ticketUrl: enrollmentTicket.ticket_url,
    }
  } catch (error) {
    console.error('failed to create enrollment ticket', error)
    return {
      error: 'Failed to create an enrollment ticket.',
    }
  }
}

export async function deleteEnrollment(formData: FormData) {
  const session = await appClient.getSession()

  if (!session) {
    return redirect('/auth/login')
  }

  const enrollmentId = formData.get('enrollment_id')
  const factorName = formData.get('factor_name')

  if (!enrollmentId || typeof enrollmentId !== 'string') {
    return {
      error: 'Enrollment ID is required.',
    }
  }

  try {
    const userId = session?.user.sub

    await managementClient.users.authenticationMethods.delete(
      userId,
      enrollmentId
    )

    // If the deleted enrollment was the preferred method, clear the preference
    if (factorName && typeof factorName === 'string') {
      const userResponse = await managementClient.users.get(userId, {
        fields: 'user_metadata',
      })
      const preferredMethod = (userResponse as any).user_metadata
        ?.preferred_mfa_method

      if (preferredMethod === factorName) {
        await managementClient.users.update(userId, {
          user_metadata: { preferred_mfa_method: null },
        })
      }
    }

    revalidatePath('/dashboard/account/mfa', 'layout')

    return {}
  } catch (error) {
    console.error('failed to delete enrollment', error)
    return {
      error: 'Failed to delete enrollment.',
    }
  }
}

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

    revalidatePath('/dashboard/account/mfa', 'layout')

    return {}
  } catch (error) {
    console.error('failed to set preferred MFA method', error)
    return {
      error: 'Failed to set preferred MFA method.',
    }
  }
}
