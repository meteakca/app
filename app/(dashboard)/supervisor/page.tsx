import Link from 'next/link'
import { requireRole } from '@/lib/dal/session'
import { getSupervisorStudents, getPendingHoursForSiteSupervisor } from '@/lib/dal/hours'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { ProgressBar } from '@/components/progress/ProgressBar'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatHours } from '@/lib/utils'
import { createClient } from '@/lib/supabase/server'

export default async function SupervisorDashboard() {
  await requireRole(['site_supervisor'])
  const [students, pendingLogs] = await Promise.all([
    getSupervisorStudents(),
    getPendingHoursForSiteSupervisor(),
  ])

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Pending approvals banner */}
      {pendingLogs.length > 0 && (
        <div className="rounded-[var(--radius-card)] border border-[var(--amber-200)] bg-[var(--amber-50)] p-4 flex items-center justify-between">
          <p className="text-sm font-medium text-[var(--amber-600)]">
            {pendingLogs.length} hour {pendingLogs.length === 1 ? 'entry' : 'entries'} awaiting your approval
          </p>
        </div>
      )}

      {/* Student list */}
      <Card>
        <CardHeader>
          <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">
            My Students ({students.length})
          </h2>
        </CardHeader>
        {students.length === 0 ? (
          <EmptyState
            title="No students assigned"
            description="Contact your administrator to get students assigned to you."
          />
        ) : (
          <ul className="divide-y divide-[var(--color-border-default)]">
            {students.map(s => (
              <li key={s.student_id}>
                <Link
                  href={`/supervisor/students/${s.student_id}/hours`}
                  className="flex items-center justify-between px-6 py-4 hover:bg-[var(--color-bg-subtle)] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[var(--blue-100)] text-[var(--blue-700)] flex items-center justify-center text-sm font-semibold flex-shrink-0">
                      {s.student.full_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[var(--color-text-primary)]">
                        {s.student.full_name}
                      </p>
                      <p className="text-xs text-[var(--color-text-tertiary)]">
                        {s.academic_year} · {s.program}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-32 hidden sm:block">
                      <ProgressBar value={0} showPercent={false} />
                    </div>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[var(--color-text-tertiary)] flex-shrink-0">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12l4-4-4-4" />
                    </svg>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}
