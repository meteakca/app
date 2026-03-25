'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireRole } from '@/lib/dal/session'

const CreateUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  full_name: z.string().min(1, 'Full name is required'),
  role: z.enum(['student', 'site_supervisor', 'faculty_supervisor', 'super_admin']),
  program: z.enum(['ESPY', 'COUN']).optional(),
})

export type CreateUserState = {
  errors?: Record<string, string[]>
  success?: boolean
}

export async function createUserAction(
  _prevState: CreateUserState,
  formData: FormData
): Promise<CreateUserState> {
  await requireRole(['super_admin'])

  const result = CreateUserSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    full_name: formData.get('full_name'),
    role: formData.get('role'),
    program: formData.get('program') || undefined,
  })

  if (!result.success) return { errors: result.error.flatten().fieldErrors }

  const role = result.data.role
  // super_admin has no program; all other roles require one
  if (role !== 'super_admin' && !result.data.program) {
    return { errors: { program: ['Program is required for this role.'] } }
  }

  // Use admin client with service role key — never expose this to the client
  const { createClient: createSupabaseClient } = await import('@supabase/supabase-js')
  const adminClient = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { error } = await adminClient.auth.admin.createUser({
    email: result.data.email,
    password: result.data.password,
    email_confirm: true,
    user_metadata: {
      full_name: result.data.full_name,
      role: result.data.role,
      program: result.data.program ?? null,
    },
  })

  if (error) {
    return {
      errors: {
        _form: [error.message.includes('already') ? 'A user with this email already exists.' : 'Failed to create user.'],
      },
    }
  }

  revalidatePath('/admin/users')
  return { success: true }
}

const AssignmentSchema = z.object({
  student_id: z.string().uuid('Invalid student'),
  site_supervisor_id: z.string().uuid('Invalid site supervisor'),
  faculty_supervisor_id: z.string().uuid('Invalid faculty supervisor'),
  program: z.enum(['ESPY', 'COUN']),
  academic_year: z.string().min(1, 'Academic year is required'),
  required_hours: z.coerce.number().min(1, 'Must be at least 1 hour'),
})

export type AssignmentState = { errors?: Record<string, string[]>; success?: boolean }

export async function createAssignmentAction(
  _prevState: AssignmentState,
  formData: FormData
): Promise<AssignmentState> {
  await requireRole(['super_admin'])

  const program = formData.get('program') as string
  const defaultHours = program === 'ESPY' ? 150 : 600

  const result = AssignmentSchema.safeParse({
    student_id: formData.get('student_id'),
    site_supervisor_id: formData.get('site_supervisor_id'),
    faculty_supervisor_id: formData.get('faculty_supervisor_id'),
    program,
    academic_year: formData.get('academic_year'),
    required_hours: formData.get('required_hours') || defaultHours,
  })

  if (!result.success) return { errors: result.error.flatten().fieldErrors }

  const supabase = await createClient()
  const { error } = await supabase.from('student_assignments').insert(result.data)

  if (error) {
    return {
      errors: { _form: [error.message.includes('unique') ? 'This student already has an assignment for this year.' : 'Failed to create assignment.'] },
    }
  }

  revalidatePath('/admin/assignments')
  return { success: true }
}

export async function updateUserRoleAction(
  userId: string,
  _prevState: CreateUserState,
  formData: FormData
): Promise<CreateUserState> {
  await requireRole(['super_admin'])
  const supabase = await createClient()

  const role = formData.get('role') as string
  const program = (formData.get('program') as string) || null

  const { error } = await supabase
    .from('profiles')
    .update({ role, program })
    .eq('id', userId)

  if (error) return { errors: { _form: ['Failed to update user.'] } }

  revalidatePath('/admin/users')
  revalidatePath(`/admin/users/${userId}`)
  return { success: true }
}

export async function updateRequiredHoursAction(assignmentId: string, hours: number) {
  await requireRole(['faculty_supervisor', 'super_admin'])
  const supabase = await createClient()

  await supabase
    .from('student_assignments')
    .update({ required_hours: hours })
    .eq('id', assignmentId)

  revalidatePath('/faculty/students')
  revalidatePath('/faculty')
}
