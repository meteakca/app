interface ProgressBarProps {
  value: number        // 0–100
  label?: string
  showPercent?: boolean
}

export function ProgressBar({ value, label, showPercent = true }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value))

  let fillColor = 'var(--color-brand-primary)'
  if (clamped > 85) fillColor = 'var(--green-500)'
  else if (clamped > 60) fillColor = 'var(--amber-500)'

  return (
    <div>
      {(label || showPercent) && (
        <div className="flex justify-between items-center mb-1.5">
          {label && (
            <span className="text-xs font-medium text-[var(--color-text-secondary)]">{label}</span>
          )}
          {showPercent && (
            <span className="text-xs font-semibold text-[var(--color-text-primary)]">{clamped}%</span>
          )}
        </div>
      )}
      <div
        className="h-1.5 w-full rounded-full bg-[var(--gray-100)] overflow-hidden"
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full rounded-full transition-all duration-300 ease-out"
          style={{ width: `${clamped}%`, backgroundColor: fillColor }}
        />
      </div>
    </div>
  )
}
