import { notFound } from 'next/navigation'
import { requireRole } from '@/lib/dal/session'
import { createClient } from '@/lib/supabase/server'
import { getStudentEvaluationsForFaculty } from '@/lib/dal/rubrics'
import { RubricScoreView } from '@/components/rubrics/RubricScoreView'
import { EmptyState } from '@/components/ui/EmptyState'
import { Card, CardBody } from '@/components/ui/Card'

interface PageProps {
  params: Promise<{ studentId: string }>
}

export default async function FacultyStudentRubricPage({ params }: PageProps) {
  await requireRole(['faculty_supervisor'])
  const { studentId } = await params
  const supabase = await createClient()

  const { data: student } = await supabase
    .from('profiles')
    .select('id, full_name')
    .eq('id', studentId)
    .single()

  if (!student) notFound()

  const evaluations = await getStudentEvaluationsForFaculty(studentId)

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
          Evaluations — {student.full_name}
        </h2>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">
          {evaluations.length} submitted {evaluations.length === 1 ? 'evaluation' : 'evaluations'}
        </p>
      </div>

      {evaluations.length === 0 ? (
        <EmptyState
          title="No submitted evaluations"
          description="Evaluations completed by the site supervisor will appear here."
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
