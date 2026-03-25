'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireRole } from '@/lib/dal/session'
import { rubricHasSubmittedEvaluations } from '@/lib/dal/rubrics'

// ── Rubric template management (faculty) ─────────────────────────────────────

const RubricSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  academic_year: z.string().min(1, 'Academic year is required'),
})

export type RubricFormState = {
  errors?: Record<string, string[]>
  rubricId?: string
}

export async function createRubricAction(
  _prevState: RubricFormState,
  formData: FormData
): Promise<RubricFormState> {
  const profile = await requireRole(['faculty_supervisor', 'super_admin'])
  const supabase = await createClient()

  const result = RubricSchema.safeParse({
    name: formData.get('name'),
    description: formData.get('description') || undefined,
    academic_year: formData.get('academic_year'),
  })

  if (!result.success) return { errors: result.error.flatten().fieldErrors }

  const { data, error } = await supabase
    .from('rubrics')
    .insert({
      name: result.data.name,
      description: result.data.description ?? null,
      academic_year: result.data.academic_year,
      program: profile.program!,
      created_by: profile.id,
      is_active: true,
    })
    .select('id')
    .single()

  if (error) return { errors: { _form: ['Failed to create rubric. Please try again.'] } }

  revalidatePath('/faculty/rubrics')
  return { rubricId: data.id }
}

export async function updateRubricAction(
  rubricId: string,
  _prevState: RubricFormState,
  formData: FormData
): Promise<RubricFormState> {
  const profile = await requireRole(['faculty_supervisor', 'super_admin'])
  const supabase = await createClient()

  // If there are submitted evaluations, create a new version instead
  const hasSubmitted = await rubricHasSubmittedEvaluations(rubricId)
  if (hasSubmitted) {
    // Archive old rubric
    await supabase.from('rubrics').update({ is_active: false }).eq('id', rubricId)

    // Create new rubric
    const result = RubricSchema.safeParse({
      name: formData.get('name'),
      description: formData.get('description') || undefined,
      academic_year: formData.get('academic_year'),
    })
    if (!result.success) return { errors: result.error.flatten().fieldErrors }

    const { data, error } = await supabase
      .from('rubrics')
      .insert({
        name: result.data.name,
        description: result.data.description ?? null,
        academic_year: result.data.academic_year,
        program: profile.program!,
        created_by: profile.id,
        is_active: true,
      })
      .select('id')
      .single()

    if (error) return { errors: { _form: ['Failed to create new version.'] } }

    revalidatePath('/faculty/rubrics')
    return { rubricId: data.id }
  }

  // No submitted evaluations — update in place
  const result = RubricSchema.safeParse({
    name: formData.get('name'),
    description: formData.get('description') || undefined,
    academic_year: formData.get('academic_year'),
  })
  if (!result.success) return { errors: result.error.flatten().fieldErrors }

  const { error } = await supabase
    .from('rubrics')
    .update({
      name: result.data.name,
      description: result.data.description ?? null,
      academic_year: result.data.academic_year,
    })
    .eq('id', rubricId)

  if (error) return { errors: { _form: ['Failed to update rubric.'] } }

  revalidatePath('/faculty/rubrics')
  revalidatePath(`/faculty/rubrics/${rubricId}`)
  return { rubricId }
}

/** Upsert all criteria for a rubric in one call */
export async function saveCriteriaAction(rubricId: string, criteriaJson: string) {
  await requireRole(['faculty_supervisor', 'super_admin'])
  const supabase = await createClient()

  type CriterionInput = {
    id?: string
    name: string
    description?: string
    max_score?: number
    order_index: number
    performance_descriptors?: Record<string, string>
  }

  const criteria: CriterionInput[] = JSON.parse(criteriaJson)

  // Delete criteria not in the new list (by id)
  const keepIds = criteria.map(c => c.id).filter(Boolean) as string[]
  if (keepIds.length > 0) {
    await supabase
      .from('rubric_criteria')
      .delete()
      .eq('rubric_id', rubricId)
      .not('id', 'in', `(${keepIds.map(id => `"${id}"`).join(',')})`)
  } else {
    await supabase.from('rubric_criteria').delete().eq('rubric_id', rubricId)
  }

  // Upsert each criterion
  for (const c of criteria) {
    if (c.id) {
      await supabase.from('rubric_criteria').update({
        name: c.name,
        description: c.description ?? null,
        max_score: c.max_score ?? 4,
        order_index: c.order_index,
        performance_descriptors: c.performance_descriptors ?? null,
      }).eq('id', c.id)
    } else {
      await supabase.from('rubric_criteria').insert({
        rubric_id: rubricId,
        name: c.name,
        description: c.description ?? null,
        max_score: c.max_score ?? 4,
        order_index: c.order_index,
        performance_descriptors: c.performance_descriptors ?? null,
      })
    }
  }

  revalidatePath(`/faculty/rubrics/${rubricId}`)
}

// ── Evaluation management (site supervisor) ───────────────────────────────────

export type EvaluationDraftState = { error?: string; success?: boolean }

export async function saveEvaluationDraftAction(
  evaluationId: string,
  scores: Record<string, number>,
  comments: Record<string, string>,
  notes: string
): Promise<EvaluationDraftState> {
  await requireRole(['site_supervisor'])
  const supabase = await createClient()

  // Update notes
  await supabase
    .from('rubric_evaluations')
    .update({ notes: notes || null })
    .eq('id', evaluationId)
    .eq('status', 'draft')

  // Upsert scores
  const upsertData = Object.entries(scores).map(([criterionId, score]) => ({
    evaluation_id: evaluationId,
    criterion_id: criterionId,
    score,
    comments: comments[criterionId] ?? null,
  }))

  if (upsertData.length > 0) {
    const { error } = await supabase
      .from('evaluation_scores')
      .upsert(upsertData, { onConflict: 'evaluation_id,criterion_id' })

    if (error) return { error: 'Failed to save scores.' }
  }

  revalidatePath('/supervisor')
  return { success: true }
}

export async function submitEvaluationAction(
  evaluationId: string
): Promise<EvaluationDraftState> {
  const profile = await requireRole(['site_supervisor'])
  const supabase = await createClient()

  const { error } = await supabase
    .from('rubric_evaluations')
    .update({
      status: 'submitted',
      submitted_at: new Date().toISOString(),
    })
    .eq('id', evaluationId)
    .eq('status', 'draft')
    .eq('evaluator_id', profile.id)

  if (error) return { error: 'Failed to submit evaluation.' }

  revalidatePath('/supervisor')
  return { success: true }
}
