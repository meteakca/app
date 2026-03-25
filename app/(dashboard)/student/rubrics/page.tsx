import { requireRole } from '@/lib/dal/session'
import { getMyEvaluationsAsStudent } from '@/lib/dal/rubrics'
import { RubricScoreView } from '@/components/rubrics/RubricScoreView'
import { EmptyState } from '@/components/ui/EmptyState'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'

export default async function StudentRubricsPage() {
  await requireRole(['student'])
  const evaluations = await getMyEvaluationsAsStudent()

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
          My Evaluations
        </h2>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">
          Key assessment evaluations completed by your site supervisor.
        </p>
      </div>

      {evaluations.length === 0 ? (
        <EmptyState
          title="No evaluations yet"
          description="Your site supervisor's key assessment evaluations will appear here once submitted."
        />
      ) : (
        evaluations.map(evaluation => (
          <Card key={evaluation.id}>
            <CardBody>
              <RubricScoreView
                evaluation={evaluation}
                rubricName={evaluation.rubric?.name}
              />
            </CardBody>
          </Card>
        ))
      )}
    </div>
  )
}
