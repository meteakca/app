'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { saveEvaluationDraftAction, submitEvaluationAction } from '@/lib/actions/rubrics'
import type { RubricCriterion, RubricEvaluation, EvaluationScore } from '@/lib/types'

const SCORE_LABELS: Record<number, string> = {
  1: 'Unsatisfactory',
  2: 'Developing',
  3: 'Proficient',
  4: 'Exemplary',
}

interface RubricEvaluationFormProps {
  evaluation: RubricEvaluation
  criteria: RubricCriterion[]
  existingScores: EvaluationScore[]
}

export function RubricEvaluationForm({
  evaluation,
  criteria,
  existingScores,
}: RubricEvaluationFormProps) {
  const isSubmitted = evaluation.status === 'submitted'

  // Build initial state from existing scores
  const initialScores: Record<string, number> = {}
  const initialComments: Record<string, string> = {}
  for (const s of existingScores) {
    initialScores[s.criterion_id] = s.score
    initialComments[s.criterion_id] = s.comments ?? ''
  }

  const [scores, setScores] = useState<Record<string, number>>(initialScores)
  const [comments, setComments] = useState<Record<string, string>>(initialComments)
  const [notes, setNotes] = useState(evaluation.notes ?? '')
  const [saving, setSaving] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [showConfirm, setShowConfirm] = useState(false)

  const allScored = criteria.every(c => scores[c.id] !== undefined)

  async function handleSaveDraft() {
    setSaving(true)
    setMessage(null)
    const result = await saveEvaluationDraftAction(evaluation.id, scores, comments, notes)
    setSaving(false)
    setMessage(result.error ?? 'Draft saved.')
  }

  async function handleSubmit() {
    setSubmitting(true)
    setMessage(null)
    // Save scores first
    await saveEvaluationDraftAction(evaluation.id, scores, comments, notes)
    const result = await submitEvaluationAction(evaluation.id)
    setSubmitting(false)
    if (result.error) {
      setMessage(result.error)
    } else {
      setShowConfirm(false)
      setMessage('Evaluation submitted successfully.')
    }
  }

  if (isSubmitted) {
    return (
      <div className="rounded-[var(--radius-card)] border border-[var(--green-200)] bg-[var(--green-50)] p-4 text-sm text-[var(--green-700)]">
        This evaluation has been submitted and is now read-only.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Criteria scoring */}
      {criteria.map(criterion => {
        const score = scores[criterion.id]
        const maxScore = criterion.max_score

        return (
          <div
            key={criterion.id}
            className="rounded-[var(--radius-card)] border border-[var(--color-border-default)] p-5"
          >
            <div className="mb-3">
              <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                {criterion.name}
              </p>
              {criterion.description && (
                <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                  {criterion.description}
                </p>
              )}
            </div>

            {/* Score buttons */}
            <div className="flex gap-2 flex-wrap mb-3">
              {Array.from({ length: maxScore }, (_, i) => i + 1).map(n => {
                const isSelected = score === n
                const descriptor = criterion.performance_descriptors?.[String(n)]
                return (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setScores(prev => ({ ...prev, [criterion.id]: n }))}
                    className={[
                      'flex flex-col items-center px-4 py-2 rounded-lg border text-sm font-medium transition-colors min-w-20',
                      isSelected
                        ? 'bg-[var(--color-bg-primary)] text-white border-[var(--blue-600)]'
                        : 'bg-white text-[var(--color-text-secondary)] border-[var(--color-border-default)] hover:border-[var(--color-border-strong)] hover:bg-[var(--color-bg-subtle)]',
                    ].join(' ')}
                    title={descriptor}
                  >
                    <span className="text-lg leading-none font-bold">{n}</span>
                    <span className="text-2xs mt-0.5 hidden sm:block">{SCORE_LABELS[n] ?? ''}</span>
                  </button>
                )
              })}
            </div>

            {/* Performance descriptor for selected score */}
            {score !== undefined && criterion.performance_descriptors?.[String(score)] && (
              <p className="text-xs text-[var(--color-text-secondary)] italic mb-2">
                {criterion.performance_descriptors[String(score)]}
              </p>
            )}

            {/* Comment */}
            <div>
              <label
                htmlFor={`comment-${criterion.id}`}
                className="text-xs font-medium text-[var(--color-text-secondary)] mb-1 block"
              >
                Comment (optional)
              </label>
              <textarea
                id={`comment-${criterion.id}`}
                rows={2}
                value={comments[criterion.id] ?? ''}
                onChange={e =>
                  setComments(prev => ({ ...prev, [criterion.id]: e.target.value }))
                }
                placeholder="Add a comment for this criterion…"
                className="w-full px-3 py-2 rounded-[var(--radius-input)] border border-[var(--color-border-default)] text-xs text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:border-[var(--color-border-focus)] resize-none"
              />
            </div>
          </div>
        )
      })}

      {/* Overall notes */}
      <div>
        <label htmlFor="eval-notes" className="text-sm font-medium text-[var(--color-text-primary)] mb-1.5 block">
          Overall Notes (optional)
        </label>
        <textarea
          id="eval-notes"
          rows={4}
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Any overall observations or comments about the student's performance…"
          className="w-full px-4 py-2.5 rounded-[var(--radius-input)] border border-[var(--color-border-default)] text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:border-[var(--color-border-focus)] resize-y"
        />
      </div>

      {message && (
        <p className="text-sm text-[var(--color-text-secondary)]">{message}</p>
      )}

      {/* Actions */}
      {showConfirm ? (
        <div className="rounded-[var(--radius-card)] border border-[var(--amber-200)] bg-[var(--amber-50)] p-4">
          <p className="text-sm font-medium text-[var(--amber-700)] mb-3">
            Submit this evaluation? Once submitted it cannot be edited.
          </p>
          <div className="flex gap-2">
            <Button variant="primary" loading={submitting} onClick={handleSubmit}>
              Confirm & Submit
            </Button>
            <Button variant="ghost" onClick={() => setShowConfirm(false)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex gap-3">
          <Button variant="secondary" loading={saving} onClick={handleSaveDraft}>
            Save Draft
          </Button>
          <Button
            variant="primary"
            onClick={() => setShowConfirm(true)}
            disabled={!allScored}
            title={!allScored ? 'Score all criteria before submitting' : undefined}
          >
            Submit Evaluation
          </Button>
        </div>
      )}

      {!allScored && (
        <p className="text-xs text-[var(--color-text-tertiary)]">
          Score all {criteria.length} criteria to submit.
        </p>
      )}
    </div>
  )
}
