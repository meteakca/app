import Link from 'next/link'
import { requireRole } from '@/lib/dal/session'
import { getAllUsers } from '@/lib/dal/admin'
import { Card, CardBody } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatDate } from '@/lib/utils'

const roleLabel: Record<string, string> = {
  student: 'Student',
  site_supervisor: 'Site Supervisor',
  faculty_supervisor: 'Faculty Supervisor',
  super_admin: 'Super Admin',
}

export default async function AdminUsersPage() {
  await requireRole(['super_admin'])
  const users = await getAllUsers()

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Users</h2>
          <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">{users.length} total accounts</p>
        </div>
        <Link
          href="/admin/users/new"
          className="px-4 py-2 rounded-[var(--radius-button)] text-sm font-medium"
          style={{ backgroundColor: 'var(--color-bg-primary)', color: 'white' }}
        >
          + New User
        </Link>
      </div>

      {users.length === 0 ? (
        <EmptyState title="No users yet" description="Create the first user account." />
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                  {['Name', 'Email', 'Role', 'Program', 'Created', ''].map(h => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-medium"
                      style={{ color: 'var(--color-text-tertiary)' }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr
                    key={user.id}
                    style={{ borderBottom: '1px solid var(--color-border-subtle)' }}
                  >
                    <td className="px-4 py-3 font-medium" style={{ color: 'var(--color-text-primary)' }}>
                      {user.full_name}
                    </td>
                    <td className="px-4 py-3" style={{ color: 'var(--color-text-secondary)' }}>
                      {user.email}
                    </td>
                    <td className="px-4 py-3" style={{ color: 'var(--color-text-secondary)' }}>
                      {roleLabel[user.role] ?? user.role}
                    </td>
                    <td className="px-4 py-3" style={{ color: 'var(--color-text-secondary)' }}>
                      {user.program ?? '—'}
                    </td>
                    <td className="px-4 py-3" style={{ color: 'var(--color-text-tertiary)' }}>
                      {formatDate(user.created_at)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/users/${user.id}`}
                        className="text-xs font-medium"
                        style={{ color: 'var(--color-bg-primary)' }}
                      >
                        Edit
                      </Link>
                    </td>
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
