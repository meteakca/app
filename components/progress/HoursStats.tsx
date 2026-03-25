import { Card } from '@/components/ui/Card'
import { ProgressBar } from '@/components/progress/ProgressBar'
import { formatHours } from '@/lib/utils'

interface HoursStatsProps {
  approvedHours: number
  pendingHours: number
  requiredHours: number
}

export function HoursStats({ approvedHours, pendingHours, requiredHours }: HoursStatsProps) {
  const progress = Math.min(100, Math.round((approvedHours / requiredHours) * 100))
  const remaining = Math.max(0, requiredHours - approvedHours)

  return (
    <div className="space-y-4">
      {/* Progress card */}
      <Card className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-xs font-semibold tracking-wider uppercase text-[var(--color-text-tertiary)]">
              Hours Progress
            </p>
            <p className="text-3xl font-bold text-[var(--color-text-primary)] mt-1">
              {formatHours(approvedHours)}
            </p>
            <p className="text-sm text-[var(--color-text-secondary)]">
              of {requiredHours} required hours
            </p>
          </div>
          <span className="text-2xl font-bold text-[var(--color-text-primary)]">{progress}%</span>
        </div>
        <ProgressBar value={progress} showPercent={false} />
        {remaining > 0 && (
          <p className="text-xs text-[var(--color-text-tertiary)] mt-2">
            {formatHours(remaining)} remaining
          </p>
        )}
      </Card>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4">
        <Card variant="stat">
          <p className="text-xs font-semibold tracking-wider uppercase text-[var(--color-text-tertiary)]">
            Approved
          </p>
          <p className="text-2xl font-bold text-[var(--green-600)] mt-1">
            {formatHours(approvedHours)}
          </p>
        </Card>
        <Card variant="stat">
          <p className="text-xs font-semibold tracking-wider uppercase text-[var(--color-text-tertiary)]">
            Pending
          </p>
          <p className="text-2xl font-bold text-[var(--amber-600)] mt-1">
            {formatHours(pendingHours)}
          </p>
        </Card>
      </div>
    </div>
  )
}
