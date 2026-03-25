'use client'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="max-w-md mx-auto text-center py-16 space-y-3">
      <p className="text-lg font-medium text-[var(--color-text-primary)]">Something went wrong</p>
      <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
        {error.message || 'An unexpected error occurred.'}
      </p>
      <button
        onClick={reset}
        className="mt-2 px-4 py-2 rounded-[var(--radius-button)] text-sm font-medium border"
        style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
      >
        Try again
      </button>
    </div>
  )
}
