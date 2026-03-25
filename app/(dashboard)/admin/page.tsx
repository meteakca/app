import Link from 'next/link'
import { requireRole } from '@/lib/dal/session'
import { getAllUsers, getAllAssignments } from '@/lib/dal/admin'
import { Card, CardBody } from '@/components/ui/Card'

export default async function AdminDashboardPage() {
  await requireRole(['super_admin'])
  const [users, assignments] = await Promise.all([getAllUsers(), getAllAssignments()])

  const studentCount = users.filter(u => u.role === 'student').length
  const siteSupervisorCount = users.filter(u => u.role === 'site_supervisor').length
  const facultySupervisorCount = users.filter(u => u.role === 'faculty_supervisor').length
  const espyCount = users.filter(u => u.program === 'ESPY').length
  const counCount = users.filter(u => u.program === 'COUN').length

  const stats = [
    { label: 'Total Users', value: users.length },
    { label: 'Students', value: studentCount },
    { label: 'Site Supervisors', value: siteSupervisorCount },
    { label: 'Faculty Supervisors', value: facultySupervisorCount },
    { label: 'Active Assignments', value: assignments.length },
    { label: 'ESPY / COUN', value: `${espyCount} / ${counCount}` },
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Admin Dashboard</h2>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">System overview and quick actions.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {stats.map(s => (
          <Card key={s.label}>
            <CardBody>
              <p className="text-2xl font-semibold text-[var(--color-text-primary)]">{s.value}</p>
              <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">{s.label}</p>
            </CardBody>
          </Card>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Card>
          <CardBody>
            <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-3">User Management</h3>
            <div className="space-y-2">
              <Link
                href="/admin/users/new"
                className="block w-full text-center px-4 py-2 rounded-[var(--radius-button)] text-sm font-medium"
                style={{ backgroundColor: 'var(--color-bg-primary)', color: 'white' }}
              >
                Create New User
              </Link>
              <Link
                href="/admin/users"
                className="block w-full text-center px-4 py-2 rounded-[var(--radius-button)] text-sm font-medium border"
                style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
              >
                View All Users
              </Link>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-3">Assignments</h3>
            <div className="space-y-2">
              <Link
                href="/admin/assignments"
                className="block w-full text-center px-4 py-2 rounded-[var(--radius-button)] text-sm font-medium border"
                style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
              >
                View All Assignments
              </Link>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
