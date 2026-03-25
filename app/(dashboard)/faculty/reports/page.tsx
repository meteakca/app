import { requireRole } from '@/lib/dal/session'
import { getFacultyStudentProgress } from '@/lib/dal/hours'
import { getStudentHoursForFaculty } from '@/lib/dal/hours'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { ExportButton } from '@/components/reports/ExportButton'
import { EmptyState } from '@/components/ui/EmptyState'

export default async function FacultyReportsPage() {
  await requireRole(['faculty_supervisor'])
  const progress = await getFacultyStudentProgress()

  // Build flat rows for CSV export: one row per hour log
  const allRows: Record<string, string | number | null>[] = []

  for (const p of progress) {
    const logs = await getStudentHoursForFaculty(p.student.id)
    for (const log of logs) {
      allRows.push({
        student_name: p.student.full_name,
        student_email: p.student.email,
        program: p.assignment.program,
        academic_year: p.assignment.academic_year,
        date: log.date,
        hours: log.hours,
        activity_description: log.activity_description,
        status: log.status,
        site_approved_at: log.site_approved_at ?? '',
        faculty_approved_at: log.faculty_approved_at ?? '',
        rejection_reason: log.rejection_reason ?? '',
      })
    }
  }

  const summaryRows = progress.map(p => ({
    student_name: p.student.full_name,
    student_email: p.student.email,
    program: p.assignment.program,
    academic_year: p.assignment.academic_year,
    required_hours: p.assignment.required_hours,
    approved_hours: p.approved_hours,
    pending_hours: p.pending_hours,
    progress_percent: p.progress_percent,
  }))

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Reports</h2>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
          Export student hour logs and progress summaries for your program.
        </p>
      </div>

      {progress.length === 0 ? (
        <EmptyState title="No students found" description="Students in your program will appear here once assigned." />
      ) : (
        <>
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">Progress Summary</h3>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-tertiary)' }}>
                    One row per student — approved vs. required hours.
                  </p>
                </div>
                <ExportButton rows={summaryRows} filename="student_progress_summary.csv" />
              </div>
            </CardHeader>
            <CardBody>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                      {['Student', 'Program', 'Year', 'Approved', 'Required', 'Progress'].map(h => (
                        <th key={h} className="pb-2 pr-6 text-left text-xs font-medium" style={{ color: 'var(--color-text-tertiary)' }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {progress.map(p => (
                      <tr key={p.student.id} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                        <td className="py-2.5 pr-6 font-medium" style={{ color: 'var(--color-text-primary)' }}>
                          {p.student.full_name}
                        </td>
                        <td className="py-2.5 pr-6" style={{ color: 'var(--color-text-secondary)' }}>{p.assignment.program}</td>
                        <td className="py-2.5 pr-6" style={{ color: 'var(--color-text-secondary)' }}>{p.assignment.academic_year}</td>
                        <td className="py-2.5 pr-6" style={{ color: 'var(--color-text-secondary)' }}>{p.approved_hours}h</td>
                        <td className="py-2.5 pr-6" style={{ color: 'var(--color-text-secondary)' }}>{p.assignment.required_hours}h</td>
                        <td className="py-2.5">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-24 h-1.5 rounded-full overflow-hidden"
                              style={{ backgroundColor: 'var(--color-border)' }}
                            >
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${p.progress_percent}%`,
                                  backgroundColor: p.progress_percent >= 100 ? 'var(--green-500)' : 'var(--color-bg-primary)',
                                }}
                              />
                            </div>
                            <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                              {p.progress_percent}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">All Hour Logs</h3>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-tertiary)' }}>
                    {allRows.length} total entries — one row per log entry.
                  </p>
                </div>
                <ExportButton rows={allRows} filename="student_hour_logs.csv" />
              </div>
            </CardHeader>
          </Card>
        </>
      )}
    </div>
  )
}
