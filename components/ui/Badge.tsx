import type { HourLogStatus } from '@/lib/types'

type BadgeVariant = HourLogStatus | 'info' | 'neutral' | 'draft' | 'submitted'

const variantStyles: Record<BadgeVariant, { bg: string; text: string; dot: string; label: string }> = {
  pending:          { bg: 'var(--amber-50)',  text: 'var(--amber-600)',  dot: 'var(--amber-500)',  label: 'Pending' },
  site_approved:    { bg: 'var(--blue-50)',   text: 'var(--blue-700)',   dot: 'var(--blue-500)',   label: 'Site Approved' },
  faculty_approved: { bg: 'var(--green-50)',  text: 'var(--green-700)', dot: 'var(--green-500)',  label: 'Approved' },
  rejected:         { bg: 'var(--red-50)',    text: 'var(--red-600)',   dot: 'var(--red-500)',    label: 'Rejected' },
  info:             { bg: 'var(--blue-50)',   text: 'var(--blue-700)',   dot: 'var(--blue-500)',   label: 'Info' },
  neutral:          { bg: 'var(--gray-100)',  text: 'var(--gray-600)',  dot: 'var(--gray-400)',   label: '' },
  draft:            { bg: 'var(--gray-100)',  text: 'var(--gray-600)',  dot: 'var(--gray-400)',   label: 'Draft' },
  submitted:        { bg: 'var(--green-50)',  text: 'var(--green-700)', dot: 'var(--green-500)',  label: 'Submitted' },
}

interface BadgeProps {
  variant: BadgeVariant
  label?: string
}

export function Badge({ variant, label }: BadgeProps) {
  const styles = variantStyles[variant]
  const displayLabel = label ?? styles.label

  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium"
      style={{
        backgroundColor: styles.bg,
        color: styles.text,
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ backgroundColor: styles.dot }}
        aria-hidden="true"
      />
      {displayLabel}
    </span>
  )
}
