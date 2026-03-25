export type UserRole = 'student' | 'site_supervisor' | 'faculty_supervisor' | 'super_admin'
export type Program = 'ESPY' | 'COUN'
export type HourLogStatus = 'pending' | 'site_approved' | 'faculty_approved' | 'rejected'
export type EvaluationStatus = 'draft' | 'submitted'

export interface Profile {
  id: string
  full_name: string
  email: string
  role: UserRole
  program: Program | null
  created_at: string
}

export interface StudentAssignment {
  id: string
  student_id: string
  site_supervisor_id: string
  faculty_supervisor_id: string
  program: Program
  academic_year: string
  required_hours: number
  created_at: string
}

export interface HourLog {
  id: string
  student_id: string
  date: string
  hours: number
  activity_description: string
  status: HourLogStatus
  site_approved: boolean
  site_approved_at: string | null
  site_approved_by: string | null
  faculty_approved: boolean
  faculty_approved_at: string | null
  faculty_approved_by: string | null
  rejection_reason: string | null
  created_at: string
  updated_at: string
}

export interface Rubric {
  id: string
  name: string
  program: Program
  description: string | null
  created_by: string
  academic_year: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface RubricCriterion {
  id: string
  rubric_id: string
  name: string
  description: string | null
  max_score: number
  order_index: number
  performance_descriptors: Record<string, string> | null
  created_at: string
}

export interface RubricEvaluation {
  id: string
  rubric_id: string
  student_id: string
  evaluator_id: string
  academic_year: string
  status: EvaluationStatus
  notes: string | null
  submitted_at: string | null
  created_at: string
  updated_at: string
}

export interface EvaluationScore {
  id: string
  evaluation_id: string
  criterion_id: string
  score: number
  comments: string | null
}

// Enriched types for UI
export interface HourLogWithStudent extends HourLog {
  student: Pick<Profile, 'id' | 'full_name' | 'email'>
}

export interface StudentProgress {
  student: Profile
  assignment: StudentAssignment
  approved_hours: number
  pending_hours: number
  progress_percent: number
}

export interface StudentAssignmentWithProfiles extends StudentAssignment {
  student: Pick<Profile, 'id' | 'full_name' | 'email'>
  site_supervisor: Pick<Profile, 'id' | 'full_name' | 'email'>
  faculty_supervisor: Pick<Profile, 'id' | 'full_name' | 'email'>
}

export interface RubricWithCriteria extends Rubric {
  criteria: RubricCriterion[]
}

export interface EvaluationWithScores extends RubricEvaluation {
  rubric?: Pick<Rubric, 'id' | 'name' | 'academic_year'>
  scores: (EvaluationScore & { criterion?: RubricCriterion })[]
}
