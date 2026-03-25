import Link from 'next/link'
import { requireRole } from '@/lib/dal/session'
import { getStudentHours } from '@/lib/dal/hours'
import { HourLogTable } from '@/components/hours/HourLogTable'
import { Button } from '@/components/ui/Button'

export default async function StudentHoursPage() {
  await requireRole(['student'])
  const logs = await getStudentHours()

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">My Hours</h2>
          <p className="text-sm text-[var(--color-text-secondary)]">
            {logs.length} {logs.length === 1 ? 'entry' : 'entries'} total
          </p>
        </div>
        <Link href="/student/hours/new">
          <Button size="sm">+ Log Hours</Button>
        </Link>
      </div>
      <HourLogTable logs={logs} showStudentActions />
    </div>
  )
}
