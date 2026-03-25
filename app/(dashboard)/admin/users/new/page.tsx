'use client'

import { useActionState } from 'react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { createUserAction } from '@/lib/actions/admin'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export default function NewUserPage() {
  const router = useRouter()
  const [state, formAction, isPending] = useActionState(createUserAction, {})

  useEffect(() => {
    if (state.success) router.push('/admin/users')
  }, [state.success, router])

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Create User</h2>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">
          New users can log in immediately with the credentials you set.
        </p>
      </div>

      <form action={formAction} className="space-y-5">
        <Input
          label="Full Name"
          name="full_name"
          required
          placeholder="Jane Smith"
          error={state.errors?.full_name?.[0]}
        />

        <Input
          label="Email"
          name="email"
          type="email"
          required
          placeholder="jane@school.edu"
          error={state.errors?.email?.[0]}
        />

        <Input
          label="Password"
          name="password"
          type="password"
          required
          placeholder="Minimum 8 characters"
          error={state.errors?.password?.[0]}
        />

        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
            Role <span style={{ color: 'var(--color-text-danger)' }}>*</span>
          </label>
          <select
            name="role"
            required
            className="w-full px-3 py-2 rounded-[var(--radius-input)] text-sm border outline-none"
            style={{
              borderColor: state.errors?.role ? 'var(--color-border-danger)' : 'var(--color-border)',
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-text-primary)',
            }}
          >
            <option value="">Select a role…</option>
            <option value="student">Student</option>
            <option value="site_supervisor">Site Supervisor</option>
            <option value="faculty_supervisor">Faculty Supervisor</option>
            <option value="super_admin">Super Admin</option>
          </select>
          {state.errors?.role?.[0] && (
            <p className="mt-1 text-xs" style={{ color: 'var(--color-text-danger)' }}>{state.errors.role[0]}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
            Program
          </label>
          <select
            name="program"
            className="w-full px-3 py-2 rounded-[var(--radius-input)] text-sm border outline-none"
            style={{
              borderColor: state.errors?.program ? 'var(--color-border-danger)' : 'var(--color-border)',
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-text-primary)',
            }}
          >
            <option value="">None (Super Admin only)</option>
            <option value="ESPY">ESPY</option>
            <option value="COUN">COUN</option>
          </select>
          {state.errors?.program?.[0] && (
            <p className="mt-1 text-xs" style={{ color: 'var(--color-text-danger)' }}>{state.errors.program[0]}</p>
          )}
        </div>

        {state.errors?._form?.map(err => (
          <p key={err} role="alert" className="text-sm" style={{ color: 'var(--color-text-danger)' }}>{err}</p>
        ))}

        <div className="flex gap-3">
          <Button type="submit" loading={isPending}>Create User</Button>
          <Button type="button" variant="secondary" onClick={() => router.push('/admin/users')}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
