import Link from 'next/link'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatDate, formatHours } from '@/lib/utils'
import type { HourLog } from '@/lib/types'

interface HourLogTableProps {
  logs: HourLog[]
  showStudentActions?: boolean
}

export function HourLogTable({ logs, showStudentActions = false }: HourLogTableProps) {
  if (logs.length === 0) {
    return (
      <EmptyState
        title="No hours logged yet"
        description="Start logging your practicum hours to track your progress."
        action={showStudentActions ? { label: '+ Log Hours', href: '/student/hours/new' } : undefined}
      />
    )
  }

  return (
    <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border-default)] shadow-[var(--shadow-sm)]">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-[var(--color-bg-subtle)]">
            <th scope="col" className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)]">
              Date
            </th>
            <th scope="col" className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)]">
              Hours
            </th>
            <th scope="col" className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)]">
              Activity
            </th>
            <th scope="col" className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)]">
              Status
            </th>
            {showStudentActions && (
              <th scope="col" className="px-5 py-3 min-w-[60px]">
                <span className="sr-only">Actions</span>
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {logs.map((log, index) => (
            <tr
              key={log.id}
              className={[
                'border-t border-[var(--color-border-default)] hover:bg-[var(--color-bg-subtle)] transition-colors',
                index === logs.length - 1 ? 'border-b-0' : '',
              ].join(' ')}
            >
              <td className="px-5 py-4 text-[var(--color-text-primary)] whitespace-nowrap">
                {formatDate(log.date)}
              </td>
              <td className="px-5 py-4 text-[var(--color-text-primary)] whitespace-nowrap font-medium">
                {formatHours(log.hours)}
              </td>
              <td className="px-5 py-4 text-[var(--color-text-secondary)] max-w-xs">
                <span className="line-clamp-2">{log.activity_description}</span>
                {log.rejection_reason && (
                  <p className="text-xs text-[var(--color-text-danger)] mt-1">
                    Reason: {log.rejection_reason}
                  </p>
                )}
              </td>
              <td className="px-5 py-4">
                <Badge variant={log.status} />
              </td>
              {showStudentActions && (
                <td className="px-5 py-4 text-right">
                  {log.status === 'pending' && (
                    <Link
                      href={`/student/hours/${log.id}`}
                      className="text-xs font-medium text-[var(--color-text-link)] hover:text-[var(--color-text-link-hover)]"
                    >
                      Edit
                    </Link>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
