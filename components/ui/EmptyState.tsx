import Link from 'next/link'

interface EmptyStateProps {
  title: string
  description: string
  action?: { label: string; href: string }
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div
        className="w-12 h-12 rounded-full bg-[var(--color-bg-muted)] flex items-center justify-center mb-4"
        aria-hidden="true"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[var(--color-text-tertiary)]">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h7.5M8.25 9.75h7.5M5.25 3.75h13.5a1.5 1.5 0 011.5 1.5v13.5a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5V5.25a1.5 1.5 0 011.5-1.5z" />
        </svg>
      </div>
      <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-1">{title}</h3>
      <p className="text-sm text-[var(--color-text-secondary)] max-w-xs mb-4">{description}</p>
      {action && (
        <Link
          href={action.href}
          className="inline-flex items-center h-8 px-4 rounded-[var(--radius-button)] bg-[var(--color-bg-primary)] text-[var(--color-text-inverse)] text-sm font-medium hover:bg-[var(--color-bg-primary-hover)] transition-colors"
        >
          {action.label}
        </Link>
      )}
    </div>
  )
}
