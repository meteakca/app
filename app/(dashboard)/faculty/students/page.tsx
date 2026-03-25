import Link from 'next/link'
import { requireRole } from '@/lib/dal/session'
import { getFacultyStudentProgress } from '@/lib/dal/hours'
import { ProgressBar } from '@/components/progress/ProgressBar'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatHours } from '@/lib/utils'

export default async function FacultyStudentsPage() {
  await requireRole(['faculty_supervisor'])
  const students = await getFacultyStudentProgress()

  if (students.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">Students</h2>
        <EmptyState title="No students yet" description="Students will appear here once assigned to your program." />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
        Students ({students.length})
      </h2>
      <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border-default)] shadow-[var(--shadow-sm)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[var(--color-bg-subtle)]">
              <th scope="col" className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)]">Student</th>
              <th scope="col" className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)]">Year</th>
              <th scope="col" className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)]">Progress</th>
              <th scope="col" className="px-5 py-3 min-w-[60px]"><span className="sr-only">View</span></th>
            </tr>
          </thead>
          <tbody>
            {students.map(({ student, assignment, approved_hours, progress_percent }) => (
              <tr key={student.id} className="border-t border-[var(--color-border-default)] hover:bg-[var(--color-bg-subtle)]">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[var(--blue-100)] text-[var(--blue-700)] flex items-center justify-center text-xs font-semibold flex-shrink-0">
                      {student.full_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-[var(--color-text-primary)]">{student.full_name}</p>
                      <p className="text-xs text-[var(--color-text-tertiary)]">{student.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 text-[var(--color-text-secondary)] whitespace-nowrap">
                  {assignment.academic_year}
                </td>
                <td className="px-5 py-4">
                  <div className="w-40">
                    <ProgressBar
                      value={progress_percent}
                      label={`${formatHours(approved_hours)} / ${formatHours(assignment.required_hours)}`}
                    />
                  </div>
                </td>
                <td className="px-5 py-4 text-right">
                  <Link
                    href={`/faculty/students/${student.id}`}
                    className="text-xs font-medium text-[var(--color-text-link)] hover:text-[var(--color-text-link-hover)]"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
