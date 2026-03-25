import { redirect } from 'next/navigation'
import { requireAuth } from '@/lib/dal/session'
import { getDashboardPath } from '@/lib/utils'

// /dashboard → redirect to role-specific home
export default async function DashboardIndexPage() {
  const profile = await requireAuth()
  redirect(getDashboardPath(profile.role))
}
