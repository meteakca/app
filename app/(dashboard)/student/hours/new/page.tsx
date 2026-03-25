import { requireRole } from '@/lib/dal/session'
import { HourLogForm } from '@/components/hours/HourLogForm'
import { logHoursAction } from '@/lib/actions/hours'

export default async function LogNewHoursPage() {
  await requireRole(['student'])

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Log Hours</h2>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">
          Record your practicum activity for the day.
        </p>
      </div>
      <HourLogForm action={logHoursAction} submitLabel="Save Entry" />
    </div>
  )
}
