import Link from 'next/link'
import { requireRole } from '@/lib/dal/session'
import { getFacultyStudentProgress, getSiteApprovedHoursForFaculty } from '@/lib/dal/hours'
import { Card, CardHeader } from '@/components/ui/Card'
import { ProgressBar } from '@/components/progress/ProgressBar'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatHours } from '@/lib/utils'

export default async function FacultyDashboard() {
  const profile = await requireRole(['faculty_supervisor'])
  const [students, pendingApproval] = await Promise.all([
    getFacultyStudentProgress(),
    getSiteApprovedHoursForFaculty(),
  ])

  const totalStudents = students.length
  const avgProgress =
    totalStudents > 0
      ? Math.round(students.reduce((sum, s) => sum + s.progress_percent, 0) / totalStudents)
      : 0

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
          {profile.program} Program Overview
        </h2>
        <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">
          {totalStudents} students enrolled
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        <Card variant="stat">
          <p className="text-xs font-semibold tracking-wider uppercase text-[var(--color-text-tertiary)]">Students</p>
          <p className="text-2xl font-bold text-[var(--color-text-primary)] mt-1">{totalStudents}</p>
        </Card>
        <Card variant="stat">
          <p className="text-xs font-semibold tracking-wider uppercase text-[var(--color-text-tertiary)]">Avg Progress</p>
          <p className="text-2xl font-bold text-[var(--color-text-primary)] mt-1">{avgProgress}%</p>
        </Card>
        <Card variant="stat">
          <p className="text-xs font-semibold tracking-wider uppercase text-[var(--color-text-tertiary)]">Pending Review</p>
          <p className="text-2xl font-bold text-[var(--amber-600)] mt-1">{pendingApproval.length}</p>
        </Card>
      </div>

      {/* Pending final approval */}
      {pendingApproval.length > 0 && (
        <div className="rounded-[var(--radius-card)] border border-[var(--amber-200)] bg-[var(--amber-50)] px-5 py-4">
          <p className="text-sm font-medium text-[var(--amber-700)]">
            {pendingApproval.length} {pendingApproval.length === 1 ? 'entry' : 'entries'} awaiting your final approval
          </p>
          <p className="text-xs text-[var(--amber-600)] mt-0.5">
            Go to a student&apos;s page to approve.
          </p>
        </div>
      )}

      {/* Student list */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">Students</h3>
            <Link
              href="/faculty/students"
              className="text-xs text-[var(--color-text-link)] hover:text-[var(--color-text-link-hover)]"
            >
              View all →
            </Link>
          </div>
        </CardHeader>
        {students.length === 0 ? (
          <EmptyState title="No students yet" description="Students will appear here once assigned to your program." />
        ) : (
          <ul className="divide-y divide-[var(--color-border-default)]">
            {students.slice(0, 8).map(({ student, assignment, approved_hours, progress_percent }) => (
              <li key={student.id}>
                <Link
                  href={`/faculty/students/${student.id}`}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-[var(--color-bg-subtle)] transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-[var(--blue-100)] text-[var(--blue-700)] flex items-center justify-center text-xs font-semibold flex-shrink-0">
                    {student.full_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--color-text-primary)]">{student.full_name}</p>
                    <div className="mt-1.5 max-w-xs">
                      <ProgressBar
                        value={progress_percent}
                        label={`${formatHours(approved_hours)} / ${formatHours(assignment.required_hours)}`}
                      />
                    </div>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[var(--color-text-tertiary)] flex-shrink-0">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12l4-4-4-4" />
                  </svg>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}
