import Link from 'next/link'
import { requireRole } from '@/lib/dal/session'
import { getSupervisorStudents } from '@/lib/dal/hours'

export default async function SupervisorStudentsPage() {
  await requireRole(['site_supervisor'])
  const students = await getSupervisorStudents()

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">My Students</h2>
      {students.length === 0 ? (
        <p className="text-sm text-[var(--color-text-secondary)]">No students assigned yet.</p>
      ) : (
        <div className="space-y-2">
          {students.map(s => (
            <div key={s.student_id} className="flex items-center justify-between p-4 bg-[var(--color-bg-surface)] rounded-[var(--radius-card)] border border-[var(--color-border-default)] shadow-[var(--shadow-sm)]">
              <div>
                <p className="text-sm font-medium text-[var(--color-text-primary)]">{s.student.full_name}</p>
                <p className="text-xs text-[var(--color-text-tertiary)]">{s.student.email}</p>
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/supervisor/students/${s.student_id}/hours`}
                  className="text-xs font-medium text-[var(--color-text-link)] hover:text-[var(--color-text-link-hover)]"
                >
                  Hours
                </Link>
                <Link
                  href={`/supervisor/students/${s.student_id}/rubric`}
                  className="text-xs font-medium text-[var(--color-text-link)] hover:text-[var(--color-text-link-hover)]"
                >
                  Evaluation
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
