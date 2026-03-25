import { notFound } from 'next/navigation'
import { requireRole } from '@/lib/dal/session'
import { createClient } from '@/lib/supabase/server'
import { getRubricsForProgram, getRubricWithCriteria, getOrCreateDraftEvaluation } from '@/lib/dal/rubrics'
import { getStudentAssignment } from '@/lib/dal/hours'
import { RubricEvaluationForm } from '@/components/rubrics/RubricEvaluationForm'
import { RubricScoreView } from '@/components/rubrics/RubricScoreView'
import { EmptyState } from '@/components/ui/EmptyState'
import { Badge } from '@/components/ui/Badge'
import { currentAcademicYear } from '@/lib/utils'

interface PageProps {
  params: Promise<{ studentId: string }>
}

export default async function SupervisorRubricPage({ params }: PageProps) {
  const profile = await requireRole(['site_supervisor'])
  const { studentId } = await params
  const supabase = await createClient()

  const { data: student } = await supabase
    .from('profiles')
    .select('id, full_name, email, program')
    .eq('id', studentId)
    .single()

  if (!student) notFound()

  const assignment = await getStudentAssignment(studentId)
  const academicYear = assignment?.academic_year ?? currentAcademicYear()

  // Get rubrics for this student's program
  const rubrics = await getRubricsForProgram()
  const activeRubric = rubrics[0] // Use most recent active rubric

  if (!activeRubric) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
            Key Assessment — {student.full_name}
          </h2>
        </div>
        <EmptyState
          title="No rubric available"
          description="Your faculty supervisor has not created a rubric for this program yet."
        />
      </div>
    )
  }

  const rubricWithCriteria = await getRubricWithCriteria(activeRubric.id)
  if (!rubricWithCriteria) notFound()

  const evaluation = await getOrCreateDraftEvaluation(
    studentId,
    activeRubric.id,
    academicYear,
    profile.id
  )

  // Get existing scores for this evaluation
  const { data: scores } = await supabase
    .from('evaluation_scores')
    .select('*')
    .eq('evaluation_id', evaluation.id)

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
            Key Assessment — {student.full_name}
          </h2>
          <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">
            {rubricWithCriteria.name} · {academicYear}
          </p>
        </div>
        <Badge variant={evaluation.status as 'draft' | 'submitted'} />
      </div>

      {evaluation.status === 'submitted' ? (
        <div className="bg-[var(--color-bg-surface)] rounded-[var(--radius-card)] border border-[var(--color-border-default)] p-6">
          <RubricScoreView
            evaluation={{
              ...evaluation,
              scores: (scores ?? []).map(s => ({ ...s, criterion: rubricWithCriteria.criteria.find(c => c.id === s.criterion_id) })),
            }}
            rubricName={rubricWithCriteria.name}
          />
        </div>
      ) : (
        <RubricEvaluationForm
          evaluation={evaluation}
          criteria={rubricWithCriteria.criteria}
          existingScores={scores ?? []}
        />
      )}
    </div>
  )
}
