import 'server-only'
import { createClient } from '@/lib/supabase/server'
import type { Rubric, RubricCriterion, RubricEvaluation, EvaluationScore, RubricWithCriteria, EvaluationWithScores } from '@/lib/types'

/** Get all active rubrics for the current user's program (RLS-filtered) */
export async function getRubricsForProgram(): Promise<Rubric[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('rubrics')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []) as Rubric[]
}

/** Get a rubric with all its criteria */
export async function getRubricWithCriteria(rubricId: string): Promise<RubricWithCriteria | null> {
  const supabase = await createClient()

  const [{ data: rubric }, { data: criteria }] = await Promise.all([
    supabase.from('rubrics').select('*').eq('id', rubricId).single(),
    supabase
      .from('rubric_criteria')
      .select('*')
      .eq('rubric_id', rubricId)
      .order('order_index'),
  ])

  if (!rubric) return null
  return { ...(rubric as Rubric), criteria: (criteria ?? []) as RubricCriterion[] }
}

/** Get an evaluation for a specific student+rubric combination */
export async function getEvaluationForStudent(
  studentId: string,
  rubricId: string
): Promise<EvaluationWithScores | null> {
  const supabase = await createClient()

  const { data } = await supabase
    .from('rubric_evaluations')
    .select('*, scores:evaluation_scores(*, criterion:rubric_criteria(*))')
    .eq('student_id', studentId)
    .eq('rubric_id', rubricId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  return data as EvaluationWithScores | null
}

/** Get all submitted evaluations for the current student (RLS ensures only submitted) */
export async function getMyEvaluationsAsStudent(): Promise<EvaluationWithScores[]> {
  const supabase = await createClient()

  const { data } = await supabase
    .from('rubric_evaluations')
    .select('*, rubric:rubrics(id, name, academic_year), scores:evaluation_scores(*, criterion:rubric_criteria(*))')
    .eq('status', 'submitted')
    .order('submitted_at', { ascending: false })

  return (data ?? []) as unknown as EvaluationWithScores[]
}

/** Get all evaluations for a student (faculty view — program-scoped via RLS) */
export async function getStudentEvaluationsForFaculty(studentId: string): Promise<EvaluationWithScores[]> {
  const supabase = await createClient()

  const { data } = await supabase
    .from('rubric_evaluations')
    .select('*, rubric:rubrics(id, name, academic_year), scores:evaluation_scores(*, criterion:rubric_criteria(*))')
    .eq('student_id', studentId)
    .eq('status', 'submitted')
    .order('submitted_at', { ascending: false })

  return (data ?? []) as unknown as EvaluationWithScores[]
}

/** Get or create a draft evaluation for the current site supervisor */
export async function getOrCreateDraftEvaluation(
  studentId: string,
  rubricId: string,
  academicYear: string,
  evaluatorId: string
): Promise<RubricEvaluation> {
  const supabase = await createClient()

  // Try to get existing evaluation (draft or submitted)
  const { data: existing } = await supabase
    .from('rubric_evaluations')
    .select('*')
    .eq('student_id', studentId)
    .eq('rubric_id', rubricId)
    .eq('evaluator_id', evaluatorId)
    .eq('academic_year', academicYear)
    .single()

  if (existing) return existing as RubricEvaluation

  // Create new draft
  const { data, error } = await supabase
    .from('rubric_evaluations')
    .insert({
      student_id: studentId,
      rubric_id: rubricId,
      evaluator_id: evaluatorId,
      academic_year: academicYear,
      status: 'draft',
    })
    .select()
    .single()

  if (error) throw error
  return data as RubricEvaluation
}

/** Check if a rubric has any submitted evaluations (used before allowing edits) */
export async function rubricHasSubmittedEvaluations(rubricId: string): Promise<boolean> {
  const supabase = await createClient()

  const { count } = await supabase
    .from('rubric_evaluations')
    .select('id', { count: 'exact', head: true })
    .eq('rubric_id', rubricId)
    .eq('status', 'submitted')

  return (count ?? 0) > 0
}
