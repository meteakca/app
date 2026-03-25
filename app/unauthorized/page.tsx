import Link from 'next/link'

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg-canvas)] px-4">
      <div className="text-center">
        <h1 className="text-[var(--text-3xl)] font-[var(--font-weight-bold)] text-[var(--color-text-primary)] mb-2">
          Access Denied
        </h1>
        <p className="text-[var(--color-text-secondary)] mb-6">
          You don&apos;t have permission to view this page.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center h-10 px-5 rounded-[var(--radius-button)] bg-[var(--color-bg-primary)] text-[var(--color-text-inverse)] text-[var(--text-sm)] font-[var(--font-weight-medium)] hover:bg-[var(--color-bg-primary-hover)]"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  )
}
