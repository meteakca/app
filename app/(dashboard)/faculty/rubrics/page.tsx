import Link from 'next/link'
import { requireRole } from '@/lib/dal/session'
import { getRubricsForProgram } from '@/lib/dal/rubrics'
import { Card, CardHeader } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { Button } from '@/components/ui/Button'
import { formatDate } from '@/lib/utils'

export default async function FacultyRubricsPage() {
  const profile = await requireRole(['faculty_supervisor'])
  const rubrics = await getRubricsForProgram()

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
            Rubric Templates
          </h2>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            {profile.program} program · {rubrics.length} active {rubrics.length === 1 ? 'rubric' : 'rubrics'}
          </p>
        </div>
        <Link href="/faculty/rubrics/new">
          <Button size="sm">+ New Rubric</Button>
        </Link>
      </div>

      {rubrics.length === 0 ? (
        <EmptyState
          title="No rubrics yet"
          description="Create a rubric template for site supervisors to complete when evaluating students."
          action={{ label: '+ New Rubric', href: '/faculty/rubrics/new' }}
        />
      ) : (
        <Card>
          <ul className="divide-y divide-[var(--color-border-default)]">
            {rubrics.map(rubric => (
              <li key={rubric.id}>
                <Link
                  href={`/faculty/rubrics/${rubric.id}`}
                  className="flex items-center justify-between px-6 py-4 hover:bg-[var(--color-bg-subtle)] transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium text-[var(--color-text-primary)]">{rubric.name}</p>
                    <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5">
                      {rubric.academic_year} · Created {formatDate(rubric.created_at)}
                    </p>
                    {rubric.description && (
                      <p className="text-xs text-[var(--color-text-secondary)] mt-1 line-clamp-1">
                        {rubric.description}
                      </p>
                    )}
                  </div>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[var(--color-text-tertiary)] flex-shrink-0">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12l4-4-4-4" />
                  </svg>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  )
}
