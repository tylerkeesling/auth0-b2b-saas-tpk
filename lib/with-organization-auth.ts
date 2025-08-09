import { redirect } from 'next/navigation'
import { appClient } from '@/lib/auth0'

export async function getOrganizationSession() {
  const session = await appClient.getSession()
  
  if (!session) {
    redirect('/auth/login')
  }
  
  if (!session.user.org_id) {
    redirect('/onboarding/create')
  }
  
  // Return the session with org_id guaranteed to be string
  return session as typeof session & { user: { org_id: string } }
}