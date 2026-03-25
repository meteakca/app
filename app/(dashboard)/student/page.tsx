import Link from 'next/link'
import { requireRole } from '@/lib/dal/session'
import { getStudentHours, getApprovedHoursTotal, getStudentAssignment } from '@/lib/dal/hours'
import { HoursStats } from '@/components/progress/HoursStats'
import { HourLogTable } from '@/components/hours/HourLogTable'
import { Button } from '@/components/ui/Button'

export default async function StudentDashboard() {
  const profile = await requireRole(['student'])
  const [allLogs, assignment] = await Promise.all([
    getStudentHours(),
    getStudentAssignment(profile.id),
  ])

  const approvedHours = allLogs
    .filter(l => l.status === 'faculty_approved')
    .reduce((sum, l) => sum + Number(l.hours), 0)

  const pendingHours = allLogs
    .filter(l => l.status === 'pending' || l.status === 'site_approved')
    .reduce((sum, l) => sum + Number(l.hours), 0)

  const requiredHours = assignment?.required_hours ?? 0
  const recentLogs = allLogs.slice(0, 5)

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">
            Welcome, {profile.full_name.split(' ')[0]}
          </h2>
          <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">
            {profile.program} Program · {assignment?.academic_year ?? 'No assignment yet'}
          </p>
        </div>
        <Link href="/student/hours/new">
          <Button size="sm">+ Log Hours</Button>
        </Link>
      </div>

      {assignment ? (
        <HoursStats
          approvedHours={approvedHours}
          pendingHours={pendingHours}
          requiredHours={requiredHours}
        />
      ) : (
        <div className="rounded-[var(--radius-card)] border border-[var(--amber-200)] bg-[var(--amber-50)] p-4 text-sm text-[var(--amber-600)]">
          No practicum assignment found. Contact your faculty supervisor.
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">Recent Entries</h3>
          {allLogs.length > 5 && (
            <Link href="/student/hours" className="text-xs text-[var(--color-text-link)] hover:text-[var(--color-text-link-hover)]">
              View all →
            </Link>
          )}
        </div>
        <HourLogTable logs={recentLogs} showStudentActions />
      </div>
    </div>
  )
}
