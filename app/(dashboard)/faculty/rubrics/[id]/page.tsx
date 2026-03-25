import { notFound } from 'next/navigation'
import { requireRole } from '@/lib/dal/session'
import { getRubricWithCriteria, rubricHasSubmittedEvaluations } from '@/lib/dal/rubrics'
import { RubricBuilder } from '@/components/rubrics/RubricBuilder'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditRubricPage({ params }: PageProps) {
  await requireRole(['faculty_supervisor', 'super_admin'])
  const { id } = await params

  const rubric = await getRubricWithCriteria(id)
  if (!rubric) notFound()

  const hasSubmitted = await rubricHasSubmittedEvaluations(id)

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">{rubric.name}</h2>
        <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">
          {rubric.program} · {rubric.academic_year}
        </p>
        {rubric.description && (
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">{rubric.description}</p>
        )}
      </div>

      {hasSubmitted && (
        <div className="rounded-[var(--radius-card)] border border-[var(--amber-200)] bg-[var(--amber-50)] p-4 text-sm text-[var(--amber-700)]">
          <p className="font-medium">This rubric has submitted evaluations.</p>
          <p className="mt-0.5">
            Saving changes will create a new version. Existing evaluations will reference the old version.
          </p>
        </div>
      )}

      <Card>
        <CardHeader>
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">Criteria</h3>
          <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5">
            Each criterion is scored 1–4 (Unsatisfactory → Exemplary). Add performance descriptors to guide evaluators.
          </p>
        </CardHeader>
        <CardBody>
          <RubricBuilder rubricId={rubric.id} initialCriteria={rubric.criteria} />
        </CardBody>
      </Card>
    </div>
  )
}
