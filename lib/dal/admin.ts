import 'server-only'
import { createClient } from '@/lib/supabase/server'
import { requireRole } from '@/lib/dal/session'
import type { Profile, StudentAssignmentWithProfiles } from '@/lib/types'

export async function getAllUsers(): Promise<Profile[]> {
  await requireRole(['super_admin'])
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []) as Profile[]
}

export async function getUserById(id: string): Promise<Profile | null> {
  await requireRole(['super_admin'])
  const supabase = await createClient()

  const { data } = await supabase.from('profiles').select('*').eq('id', id).single()
  return data as Profile | null
}

export async function getAllAssignments(): Promise<StudentAssignmentWithProfiles[]> {
  await requireRole(['super_admin'])
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('student_assignments')
    .select(`
      *,
      student:profiles!student_id(id, full_name, email),
      site_supervisor:profiles!site_supervisor_id(id, full_name, email),
      faculty_supervisor:profiles!faculty_supervisor_id(id, full_name, email)
    `)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []) as unknown as StudentAssignmentWithProfiles[]
}
