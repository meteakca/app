import { formatDate } from '@/lib/utils'
import type { EvaluationWithScores } from '@/lib/types'

const SCORE_LABELS: Record<number, string> = {
  1: 'Unsatisfactory',
  2: 'Developing',
  3: 'Proficient',
  4: 'Exemplary',
}

const SCORE_COLORS: Record<number, string> = {
  1: 'var(--red-600)',
  2: 'var(--amber-600)',
  3: 'var(--blue-600)',
  4: 'var(--green-600)',
}

interface RubricScoreViewProps {
  evaluation: EvaluationWithScores
  rubricName?: string
}

export function RubricScoreView({ evaluation, rubricName }: RubricScoreViewProps) {
  const scores = evaluation.scores ?? []

  const totalScore = scores.reduce((sum, s) => sum + (s.score ?? 0), 0)
  const maxPossible = scores.reduce((sum, s) => sum + (s.criterion?.max_score ?? 4), 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-base font-semibold text-[var(--color-text-primary)]">
            {rubricName ?? evaluation.rubric?.name ?? 'Key Assessment Evaluation'}
          </h3>
          <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">
            Academic Year: {evaluation.academic_year}
          </p>
          {evaluation.submitted_at && (
            <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5">
              Submitted: {formatDate(evaluation.submitted_at)}
            </p>
          )}
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-[var(--color-text-primary)]">
            {totalScore}/{maxPossible}
          </p>
          <p className="text-xs text-[var(--color-text-tertiary)]">Total Score</p>
        </div>
      </div>

      {/* Criteria scores */}
      <div className="space-y-4">
        {scores.map(score => {
          const criterion = score.criterion
          const scoreValue = score.score ?? 0
          const maxScore = criterion?.max_score ?? 4
          const label = SCORE_LABELS[scoreValue]
          const color = SCORE_COLORS[scoreValue] ?? 'var(--gray-500)'
          const descriptor = criterion?.performance_descriptors?.[String(scoreValue)]

          return (
            <div
              key={score.id}
              className="rounded-[var(--radius-card)] border border-[var(--color-border-default)] p-4"
            >
              <div className="flex items-start justify-between gap-4 mb-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                    {criterion?.name ?? 'Criterion'}
                  </p>
                  {criterion?.description && (
                    <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                      {criterion.description}
                    </p>
                  )}
                </div>
                <div className="flex-shrink-0 text-right">
                  <span
                    className="text-lg font-bold"
                    style={{ color }}
                  >
                    {scoreValue}/{maxScore}
                  </span>
                  {label && (
                    <p className="text-xs font-medium" style={{ color }}>{label}</p>
                  )}
                </div>
              </div>

              {/* Score bar */}
              <div className="flex gap-1 mb-2">
                {Array.from({ length: maxScore }, (_, i) => i + 1).map(n => (
                  <div
                    key={n}
                    className="h-1.5 flex-1 rounded-full"
                    style={{
                      backgroundColor: n <= scoreValue ? color : 'var(--gray-100)',
                    }}
                  />
                ))}
              </div>

              {descriptor && (
                <p className="text-xs text-[var(--color-text-secondary)] italic">
                  {descriptor}
                </p>
              )}

              {score.comments && (
                <div className="mt-2 pt-2 border-t border-[var(--color-border-default)]">
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    <span className="font-medium">Comment:</span> {score.comments}
                  </p>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Overall notes */}
      {evaluation.notes && (
        <div className="rounded-[var(--radius-card)] bg-[var(--color-bg-subtle)] border border-[var(--color-border-default)] p-4">
          <p className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-1">
            Overall Notes
          </p>
          <p className="text-sm text-[var(--color-text-primary)]">{evaluation.notes}</p>
        </div>
      )}
    </div>
  )
}
