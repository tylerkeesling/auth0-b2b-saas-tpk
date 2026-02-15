'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { appClient } from '@/lib/auth0'
import { managementClient } from '@/lib/auth0-manage'

export async function updateEmail(formData: FormData) {
  const session = await appClient.getSession()

  if (!session) {
    return redirect('/auth/login')
  }

  const email = formData.get('email')

  if (!email || typeof email !== 'string') {
    return { error: 'Email is required.' }
  }

  try {
    await managementClient.users.update(session.user.sub, { email })

    await appClient.updateSession({
      ...session,
      user: {
        ...session.user,
        email,
      },
    })

    revalidatePath('/', 'layout')
    return {}
  } catch (error) {
    console.error('failed to update email', error)
    return { error: 'Failed to update your email.' }
  }
}

export async function updatePassword(formData: FormData) {
  const session = await appClient.getSession()

  if (!session) {
    return redirect('/auth/login')
  }

  const newPassword = formData.get('newPassword')
  const confirmPassword = formData.get('confirmPassword')

  if (!newPassword || typeof newPassword !== 'string') {
    return { error: 'New password is required.' }
  }

  if (newPassword.length < 8) {
    return { error: 'Password must be at least 8 characters.' }
  }

  if (newPassword !== confirmPassword) {
    return { error: 'Passwords do not match.' }
  }

  try {
    await managementClient.users.update(session.user.sub, {
      password: newPassword,
    })

    revalidatePath('/', 'layout')
    return {}
  } catch (error) {
    console.error('failed to update password', error)
    return { error: 'Failed to update your password.' }
  }
}

export async function sendVerificationEmail() {
  const session = await appClient.getSession()

  if (!session) {
    return redirect('/auth/login')
  }

  try {
    await managementClient.jobs.verificationEmail.create({
      user_id: session.user.sub,
    })

    return {}
  } catch (error) {
    console.error('failed to send verification email', error)
    return { error: 'Failed to send verification email.' }
  }
}

export async function sendPasswordResetEmail() {
  const session = await appClient.getSession()

  if (!session) {
    return redirect('/auth/login')
  }

  try {
    const response = await fetch(
      `https://${process.env.AUTH0_DOMAIN}/dbconnections/change_password`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: process.env.AUTH0_CLIENT_ID,
          email: session.user.email,
          connection: 'Username-Password-Authentication',
        }),
      }
    )

    if (!response.ok) {
      throw new Error(`Password reset request failed: ${response.status}`)
    }

    return {}
  } catch (error) {
    console.error('failed to send password reset email', error)
    return { error: 'Failed to send password reset email.' }
  }
}

export async function revokePasskey(formData: FormData) {
  const session = await appClient.getSession()

  if (!session) {
    return redirect('/auth/login')
  }

  const authenticationMethodId = formData.get('authentication_method_id')

  if (!authenticationMethodId || typeof authenticationMethodId !== 'string') {
    return { error: 'Passkey ID is required.' }
  }

  try {
    await managementClient.users.authenticationMethods.delete(
      session.user.sub,
      authenticationMethodId
    )

    revalidatePath('/', 'layout')
    return {}
  } catch (error) {
    console.error('failed to revoke passkey', error)
    return { error: 'Failed to delete your passkey.' }
  }
}
