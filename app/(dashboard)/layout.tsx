import { requireAuth } from '@/lib/dal/session'
import { DashboardShell } from '@/components/layout/DashboardShell'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const profile = await requireAuth()

  return <DashboardShell profile={profile}>{children}</DashboardShell>
}
