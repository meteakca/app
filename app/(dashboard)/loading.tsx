export default function DashboardLoading() {
  return (
    <div className="max-w-3xl mx-auto space-y-4 animate-pulse">
      <div className="h-7 w-48 rounded-[var(--radius-card)]" style={{ backgroundColor: 'var(--color-surface-hover)' }} />
      <div className="h-4 w-64 rounded-[var(--radius-card)]" style={{ backgroundColor: 'var(--color-surface-hover)' }} />
      <div className="h-40 rounded-[var(--radius-card)]" style={{ backgroundColor: 'var(--color-surface-hover)' }} />
      <div className="h-24 rounded-[var(--radius-card)]" style={{ backgroundColor: 'var(--color-surface-hover)' }} />
    </div>
  )
}
