import { notFound } from 'next/navigation'
import { requireRole } from '@/lib/dal/session'
import { getStudentHourLog } from '@/lib/dal/hours'
import { updateHourLogAction } from '@/lib/actions/hours'
import { HourLogForm } from '@/components/hours/HourLogForm'
import { Badge } from '@/components/ui/Badge'
import { formatDate } from '@/lib/utils'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditHourLogPage({ params }: PageProps) {
  await requireRole(['student'])
  const { id } = await params

  const log = await getStudentHourLog(id)
  if (!log) notFound()

  // Only pending logs can be edited
  if (log.status !== 'pending') {
    return (
      <div className="max-w-lg mx-auto">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Hour Entry</h2>
        </div>
        <div className="rounded-[var(--radius-card)] border border-[var(--color-border-default)] p-6 space-y-3">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-[var(--color-text-primary)]">{formatDate(log.date)}</p>
              <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">{log.hours} hours</p>
            </div>
            <Badge variant={log.status} />
          </div>
          <p className="text-sm text-[var(--color-text-secondary)]">{log.activity_description}</p>
          {log.rejection_reason && (
            <div className="rounded bg-[var(--red-50)] border border-[var(--red-200)] p-3">
              <p className="text-xs text-[var(--color-text-danger)]">
                <span className="font-semibold">Rejected:</span> {log.rejection_reason}
              </p>
            </div>
          )}
          <p className="text-xs text-[var(--color-text-tertiary)]">
            This entry can no longer be edited.
          </p>
        </div>
      </div>
    )
  }

  const updateAction = updateHourLogAction.bind(null, log.id)

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Edit Entry</h2>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">
          You can edit this entry while it&apos;s still pending approval.
        </p>
      </div>
      <HourLogForm
        action={updateAction}
        defaultValues={log}
        submitLabel="Update Entry"
      />
    </div>
  )
}
