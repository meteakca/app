'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireAuth, requireRole } from '@/lib/dal/session'

const HourLogSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  hours: z.coerce
    .number()
    .min(0.25, 'Minimum 0.25 hours')
    .max(24, 'Maximum 24 hours per entry'),
  activity_description: z.string().min(10, 'Please describe the activity (at least 10 characters)'),
})

export type HourLogFormState = {
  errors?: {
    date?: string[]
    hours?: string[]
    activity_description?: string[]
    _form?: string[]
  }
  success?: boolean
}

export async function logHoursAction(
  _prevState: HourLogFormState,
  formData: FormData
): Promise<HourLogFormState> {
  const profile = await requireRole(['student'])
  const supabase = await createClient()

  const result = HourLogSchema.safeParse({
    date: formData.get('date'),
    hours: formData.get('hours'),
    activity_description: formData.get('activity_description'),
  })

  if (!result.success) {
    return { errors: result.error.flatten().fieldErrors }
  }

  const { error } = await supabase.from('hour_logs').insert({
    student_id: profile.id,
    date: result.data.date,
    hours: result.data.hours,
    activity_description: result.data.activity_description,
    status: 'pending',
  })

  if (error) return { errors: { _form: ['Failed to save. Please try again.'] } }

  revalidatePath('/student/hours')
  revalidatePath('/student')
  return { success: true }
}

export async function updateHourLogAction(
  logId: string,
  _prevState: HourLogFormState,
  formData: FormData
): Promise<HourLogFormState> {
  const profile = await requireRole(['student'])
  const supabase = await createClient()

  const result = HourLogSchema.safeParse({
    date: formData.get('date'),
    hours: formData.get('hours'),
    activity_description: formData.get('activity_description'),
  })

  if (!result.success) {
    return { errors: result.error.flatten().fieldErrors }
  }

  const { error } = await supabase
    .from('hour_logs')
    .update({
      date: result.data.date,
      hours: result.data.hours,
      activity_description: result.data.activity_description,
    })
    .eq('id', logId)
    .eq('student_id', profile.id)
    .eq('status', 'pending') // only editable while pending

  if (error) return { errors: { _form: ['Failed to update. Please try again.'] } }

  revalidatePath('/student/hours')
  revalidatePath(`/student/hours/${logId}`)
  return { success: true }
}

export type ApproveState = { error?: string; success?: boolean }

export async function approveSiteAction(logId: string): Promise<ApproveState> {
  const profile = await requireRole(['site_supervisor'])
  const supabase = await createClient()

  const { error } = await supabase
    .from('hour_logs')
    .update({
      status: 'site_approved',
      site_approved: true,
      site_approved_at: new Date().toISOString(),
      site_approved_by: profile.id,
    })
    .eq('id', logId)
    .eq('status', 'pending')

  if (error) return { error: 'Failed to approve. Please try again.' }

  revalidatePath('/supervisor')
  revalidatePath('/supervisor/students')
  return { success: true }
}

export async function approveFacultyAction(logId: string): Promise<ApproveState> {
  const profile = await requireRole(['faculty_supervisor'])
  const supabase = await createClient()

  const { error } = await supabase
    .from('hour_logs')
    .update({
      status: 'faculty_approved',
      faculty_approved: true,
      faculty_approved_at: new Date().toISOString(),
      faculty_approved_by: profile.id,
    })
    .eq('id', logId)
    .eq('status', 'site_approved')

  if (error) return { error: 'Failed to approve. Please try again.' }

  revalidatePath('/faculty')
  revalidatePath('/faculty/students')
  return { success: true }
}

export type RejectState = { error?: string; success?: boolean }

export async function rejectHourLogAction(
  logId: string,
  _prevState: RejectState,
  formData: FormData
): Promise<RejectState> {
  await requireRole(['site_supervisor', 'faculty_supervisor'])
  const supabase = await createClient()

  const reason = formData.get('reason') as string
  if (!reason?.trim()) return { error: 'Please provide a rejection reason.' }

  const { error } = await supabase
    .from('hour_logs')
    .update({ status: 'rejected', rejection_reason: reason.trim() })
    .eq('id', logId)
    .in('status', ['pending', 'site_approved'])

  if (error) return { error: 'Failed to reject. Please try again.' }

  revalidatePath('/supervisor')
  revalidatePath('/faculty')
  return { success: true }
}
