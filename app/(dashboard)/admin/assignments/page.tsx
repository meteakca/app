'use client'

import { useActionState, useEffect, useState } from 'react'
import { createAssignmentAction } from '@/lib/actions/admin'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { createClient } from '@/lib/supabase/client'
import { currentAcademicYear, formatDate } from '@/lib/utils'
import type { Profile, StudentAssignmentWithProfiles } from '@/lib/types'

export default function AdminAssignmentsPage() {
  const [assignments, setAssignments] = useState<StudentAssignmentWithProfiles[]>([])
  const [students, setStudents] = useState<Profile[]>([])
  const [siteSupervisors, setSiteSupervisors] = useState<Profile[]>([])
  const [facultySupervisors, setFacultySupervisors] = useState<Profile[]>([])
  const [showForm, setShowForm] = useState(false)

  const [state, formAction, isPending] = useActionState(createAssignmentAction, {})

  useEffect(() => {
    if (state.success) {
      setShowForm(false)
      loadData()
    }
  }, [state.success])

  async function loadData() {
    const supabase = createClient()
    const [{ data: a }, { data: p }] = await Promise.all([
      supabase
        .from('student_assignments')
        .select(`*, student:profiles!student_id(id,full_name,email), site_supervisor:profiles!site_supervisor_id(id,full_name,email), faculty_supervisor:profiles!faculty_supervisor_id(id,full_name,email)`)
        .order('created_at', { ascending: false }),
      supabase.from('profiles').select('*').order('full_name'),
    ])
    setAssignments((a ?? []) as unknown as StudentAssignmentWithProfiles[])
    const profiles = (p ?? []) as Profile[]
    setStudents(profiles.filter(x => x.role === 'student'))
    setSiteSupervisors(profiles.filter(x => x.role === 'site_supervisor'))
    setFacultySupervisors(profiles.filter(x => x.role === 'faculty_supervisor'))
  }

  useEffect(() => { loadData() }, [])

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Assignments</h2>
          <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
            {assignments.length} total
          </p>
        </div>
        <Button onClick={() => setShowForm(v => !v)} variant={showForm ? 'secondary' : 'primary'}>
          {showForm ? 'Cancel' : '+ New Assignment'}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">New Assignment</h3>
          </CardHeader>
          <CardBody>
            <form action={formAction} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <SelectField label="Student *" name="student_id" error={state.errors?.student_id?.[0]}>
                  <option value="">Select student…</option>
                  {students.map(u => <option key={u.id} value={u.id}>{u.full_name} ({u.program ?? '—'})</option>)}
                </SelectField>

                <SelectField label="Site Supervisor *" name="site_supervisor_id" error={state.errors?.site_supervisor_id?.[0]}>
                  <option value="">Select site supervisor…</option>
                  {siteSupervisors.map(u => <option key={u.id} value={u.id}>{u.full_name} ({u.program ?? '—'})</option>)}
                </SelectField>

                <SelectField label="Faculty Supervisor *" name="faculty_supervisor_id" error={state.errors?.faculty_supervisor_id?.[0]}>
                  <option value="">Select faculty supervisor…</option>
                  {facultySupervisors.map(u => <option key={u.id} value={u.id}>{u.full_name} ({u.program ?? '—'})</option>)}
                </SelectField>

                <SelectField label="Program *" name="program" error={state.errors?.program?.[0]}>
                  <option value="">Select program…</option>
                  <option value="ESPY">ESPY</option>
                  <option value="COUN">COUN</option>
                </SelectField>

                <Input
                  label="Academic Year *"
                  name="academic_year"
                  required
                  defaultValue={currentAcademicYear()}
                  placeholder="e.g. 2025-2026"
                  error={state.errors?.academic_year?.[0]}
                />

                <Input
                  label="Required Hours (leave blank for default)"
                  name="required_hours"
                  type="number"
                  placeholder="ESPY: 150 · COUN: 600"
                  error={state.errors?.required_hours?.[0]}
                />
              </div>

              {state.errors?._form?.map(err => (
                <p key={err} role="alert" className="text-sm" style={{ color: 'var(--color-text-danger)' }}>{err}</p>
              ))}

              <Button type="submit" loading={isPending}>Create Assignment</Button>
            </form>
          </CardBody>
        </Card>
      )}

      {assignments.length === 0 ? (
        <EmptyState title="No assignments yet" description="Create an assignment to link students with supervisors." />
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                  {['Student', 'Site Supervisor', 'Faculty Supervisor', 'Program', 'Year', 'Req. Hours', 'Created'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium" style={{ color: 'var(--color-text-tertiary)' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {assignments.map(a => (
                  <tr key={a.id} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                    <td className="px-4 py-3 font-medium" style={{ color: 'var(--color-text-primary)' }}>
                      {a.student?.full_name}
                    </td>
                    <td className="px-4 py-3" style={{ color: 'var(--color-text-secondary)' }}>
                      {a.site_supervisor?.full_name}
                    </td>
                    <td className="px-4 py-3" style={{ color: 'var(--color-text-secondary)' }}>
                      {a.faculty_supervisor?.full_name}
                    </td>
                    <td className="px-4 py-3" style={{ color: 'var(--color-text-secondary)' }}>{a.program}</td>
                    <td className="px-4 py-3" style={{ color: 'var(--color-text-secondary)' }}>{a.academic_year}</td>
                    <td className="px-4 py-3" style={{ color: 'var(--color-text-secondary)' }}>{a.required_hours}</td>
                    <td className="px-4 py-3" style={{ color: 'var(--color-text-tertiary)' }}>{formatDate(a.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}

function SelectField({
  label,
  name,
  error,
  children,
}: {
  label: string
  name: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
        {label}
      </label>
      <select
        name={name}
        className="w-full px-3 py-2 rounded-[var(--radius-input)] text-sm border outline-none"
        style={{
          borderColor: error ? 'var(--color-border-danger)' : 'var(--color-border)',
          backgroundColor: 'var(--color-surface)',
          color: 'var(--color-text-primary)',
        }}
      >
        {children}
      </select>
      {error && <p className="mt-1 text-xs" style={{ color: 'var(--color-text-danger)' }}>{error}</p>}
    </div>
  )
}
