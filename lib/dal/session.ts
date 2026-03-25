import 'server-only'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Profile, UserRole } from '@/lib/types'

/**
 * Returns the authenticated user's profile, or redirects to /login.
 * Call at the top of every protected page and server action.
 */
export async function requireAuth(): Promise<Profile> {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect('/login')
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    // Profile missing — sign out and redirect
    await supabase.auth.signOut()
    redirect('/login')
  }

  return profile as Profile
}

/**
 * Like requireAuth but also checks that the user has one of the allowed roles.
 * Redirects to /login if unauthenticated, throws a 403 if wrong role.
 */
export async function requireRole(roles: UserRole[]): Promise<Profile> {
  const profile = await requireAuth()

  if (!roles.includes(profile.role)) {
    // Super admin always passes
    if (profile.role !== 'super_admin') {
      redirect('/unauthorized')
    }
  }

  return profile
}

/**
 * Returns the session user's profile without redirecting — useful for layouts
 * that render both auth and unauth content.
 */
export async function getSession(): Promise<Profile | null> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    return profile as Profile | null
  } catch {
    return null
  }
}
