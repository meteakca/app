import { notFound } from 'next/navigation'
import { requireRole } from '@/lib/dal/session'
import { getStudentHoursForSupervisor, getApprovedHoursTotal, getStudentAssignment } from '@/lib/dal/hours'
import { createClient } from '@/lib/supabase/server'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { SiteApprovalActions } from '@/components/hours/ApprovalActions'
import { ProgressBar } from '@/components/progress/ProgressBar'
import { formatDate, formatHours } from '@/lib/utils'

interface PageProps {
  params: Promise<{ studentId: string }>
}

export default async function SupervisorStudentHoursPage({ params }: PageProps) {
  await requireRole(['site_supervisor'])
  const { studentId } = await params
  const supabase = await createClient()

  const { data: student } = await supabase
    .from('profiles')
    .select('id, full_name, email, program')
    .eq('id', studentId)
    .single()

  if (!student) notFound()

  const [logs, approvedHours, assignment] = await Promise.all([
    getStudentHoursForSupervisor(studentId),
    getApprovedHoursTotal(studentId),
    getStudentAssignment(studentId),
  ])

  const progress = assignment
    ? Math.min(100, Math.round((approvedHours / assignment.required_hours) * 100))
    : 0

  const pendingLogs = logs.filter(l => l.status === 'pending')
  const otherLogs = logs.filter(l => l.status !== 'pending')

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Student header */}
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-full bg-[var(--blue-100)] text-[var(--blue-700)] flex items-center justify-center text-lg font-semibold flex-shrink-0">
          {student.full_name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">{student.full_name}</h2>
          <p className="text-sm text-[var(--color-text-secondary)]">{student.email}</p>
          {assignment && (
            <div className="mt-2 max-w-xs">
              <ProgressBar
                value={progress}
                label={`${formatHours(approvedHours)} of ${formatHours(assignment.required_hours)}`}
              />
            </div>
          )}
        </div>
      </div>

      {/* Pending approvals */}
      {pendingLogs.length > 0 && (
        <Card>
          <CardHeader>
            <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
              Pending Approval ({pendingLogs.length})
            </h3>
          </CardHeader>
          <CardBody className="p-0">
            <ul className="divide-y divide-[var(--color-border-default)]">
              {pendingLogs.map(log => (
                <li key={log.id} className="px-6 py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-sm font-medium text-[var(--color-text-primary)]">
                          {formatDate(log.date)}
                        </span>
                        <span className="text-sm text-[var(--color-text-secondary)]">
                          {formatHours(log.hours)}
                        </span>
                      </div>
                      <p className="text-sm text-[var(--color-text-secondary)] line-clamp-3">
                        {log.activity_description}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3">
                    <SiteApprovalActions logId={log.id} />
                  </div>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
      )}

      {/* History */}
      {otherLogs.length > 0 && (
        <Card>
          <CardHeader>
            <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
              Hour History
            </h3>
          </CardHeader>
          <CardBody className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[var(--color-bg-subtle)] border-b border-[var(--color-border-default)]">
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)]">Date</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)]">Hours</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)]">Activity</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)]">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {otherLogs.map(log => (
                    <tr key={log.id} className="border-t border-[var(--color-border-default)] hover:bg-[var(--color-bg-subtle)]">
                      <td className="px-5 py-4 whitespace-nowrap">{formatDate(log.date)}</td>
                      <td className="px-5 py-4 whitespace-nowrap font-medium">{formatHours(log.hours)}</td>
                      <td className="px-5 py-4 max-w-xs">
                        <span className="line-clamp-2 text-[var(--color-text-secondary)]">{log.activity_description}</span>
                      </td>
                      <td className="px-5 py-4"><Badge variant={log.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
      )}

      {logs.length === 0 && (
        <div className="text-center py-12 text-sm text-[var(--color-text-tertiary)]">
          No hours logged yet for this student.
        </div>
      )}
    </div>
  )
}
