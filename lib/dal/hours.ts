import 'server-only'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/dal/session'
import type { HourLog, HourLogWithStudent, StudentAssignment, StudentProgress } from '@/lib/types'

/** Get all hour logs for the current student */
export async function getStudentHours(): Promise<HourLog[]> {
  const profile = await requireAuth()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('hour_logs')
    .select('*')
    .eq('student_id', profile.id)
    .order('date', { ascending: false })

  if (error) throw error
  return (data ?? []) as HourLog[]
}

/** Get a single hour log by ID (student must own it) */
export async function getStudentHourLog(id: string): Promise<HourLog | null> {
  const profile = await requireAuth()
  const supabase = await createClient()

  const { data } = await supabase
    .from('hour_logs')
    .select('*')
    .eq('id', id)
    .eq('student_id', profile.id)
    .single()

  return data as HourLog | null
}

/** Total faculty-approved hours for a student */
export async function getApprovedHoursTotal(studentId: string): Promise<number> {
  const supabase = await createClient()

  const { data } = await supabase
    .from('hour_logs')
    .select('hours')
    .eq('student_id', studentId)
    .eq('status', 'faculty_approved')

  return (data ?? []).reduce((sum, row) => sum + Number(row.hours), 0)
}

/** Student's assignment (required hours, supervisors, etc.) */
export async function getStudentAssignment(studentId: string): Promise<StudentAssignment | null> {
  const supabase = await createClient()

  const { data } = await supabase
    .from('student_assignments')
    .select('*')
    .eq('student_id', studentId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  return data as StudentAssignment | null
}

/** Pending logs for site supervisor approval (RLS scopes to assigned students) */
export async function getPendingHoursForSiteSupervisor(): Promise<HourLogWithStudent[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('hour_logs')
    .select('*, student:profiles!student_id(id, full_name, email)')
    .eq('status', 'pending')
    .order('created_at', { ascending: true })

  if (error) throw error
  return (data ?? []) as unknown as HourLogWithStudent[]
}

/** All logs for a specific student (for supervisor review page) */
export async function getStudentHoursForSupervisor(studentId: string): Promise<HourLog[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('hour_logs')
    .select('*')
    .eq('student_id', studentId)
    .order('date', { ascending: false })

  if (error) throw error
  return (data ?? []) as HourLog[]
}

/** Site-approved logs waiting for faculty approval (RLS scopes to program) */
export async function getSiteApprovedHoursForFaculty(): Promise<HourLogWithStudent[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('hour_logs')
    .select('*, student:profiles!student_id(id, full_name, email)')
    .eq('status', 'site_approved')
    .order('created_at', { ascending: true })

  if (error) throw error
  return (data ?? []) as unknown as HourLogWithStudent[]
}

/** All students in the faculty's program with their progress */
export async function getFacultyStudentProgress(): Promise<StudentProgress[]> {
  const supabase = await createClient()

  // RLS scopes student_assignments to faculty's program
  const { data: assignments, error } = await supabase
    .from('student_assignments')
    .select('*, student:profiles!student_id(id, full_name, email, role, program, created_at)')
    .order('created_at', { ascending: false })

  if (error) throw error

  const results: StudentProgress[] = []

  for (const assignment of assignments ?? []) {
    const { data: logs } = await supabase
      .from('hour_logs')
      .select('hours, status')
      .eq('student_id', assignment.student_id)

    const approvedHours = (logs ?? [])
      .filter(l => l.status === 'faculty_approved')
      .reduce((sum, l) => sum + Number(l.hours), 0)

    const pendingHours = (logs ?? [])
      .filter(l => l.status === 'pending' || l.status === 'site_approved')
      .reduce((sum, l) => sum + Number(l.hours), 0)

    results.push({
      student: assignment.student as StudentProgress['student'],
      assignment: assignment as StudentAssignment,
      approved_hours: approvedHours,
      pending_hours: pendingHours,
      progress_percent: Math.min(100, Math.round((approvedHours / assignment.required_hours) * 100)),
    })
  }

  return results
}

/** All hour logs for a student (faculty view) */
export async function getStudentHoursForFaculty(studentId: string): Promise<HourLog[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('hour_logs')
    .select('*')
    .eq('student_id', studentId)
    .order('date', { ascending: false })

  if (error) throw error
  return (data ?? []) as HourLog[]
}

/** Students assigned to the current site supervisor */
export async function getSupervisorStudents() {
  await requireAuth()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('student_assignments')
    .select('*, student:profiles!student_id(id, full_name, email, role, program, created_at)')
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []) as unknown as Array<{
    id: string
    student_id: string
    required_hours: number
    academic_year: string
    program: string
    student: { id: string; full_name: string; email: string }
  }>
}
