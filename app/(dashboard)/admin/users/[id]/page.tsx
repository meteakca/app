'use client'

import { useActionState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { updateUserRoleAction } from '@/lib/actions/admin'
import { Button } from '@/components/ui/Button'
import { use } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'
import type { Profile } from '@/lib/types'

interface PageProps {
  params: Promise<{ id: string }>
}

export default function EditUserPage({ params }: PageProps) {
  const { id } = use(params)
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null | undefined>(undefined)

  useEffect(() => {
    const supabase = createClient()
    supabase.from('profiles').select('*').eq('id', id).single().then(({ data }) => {
      setProfile(data as Profile | null)
    })
  }, [id])

  const boundAction = updateUserRoleAction.bind(null, id)
  const [state, formAction, isPending] = useActionState(boundAction, {})

  useEffect(() => {
    if (state.success) router.push('/admin/users')
  }, [state.success, router])

  if (profile === undefined) {
    return <div className="max-w-lg mx-auto animate-pulse h-48 rounded-[var(--radius-card)]" style={{ backgroundColor: 'var(--color-surface-hover)' }} />
  }

  if (profile === null) {
    return <div className="max-w-lg mx-auto text-sm" style={{ color: 'var(--color-text-secondary)' }}>User not found.</div>
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Edit User</h2>
        <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
          {profile.email}
        </p>
      </div>

      <form action={formAction} className="space-y-5">
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
            Role
          </label>
          <select
            name="role"
            defaultValue={profile.role}
            className="w-full px-3 py-2 rounded-[var(--radius-input)] text-sm border outline-none"
            style={{
              borderColor: 'var(--color-border)',
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-text-primary)',
            }}
          >
            <option value="student">Student</option>
            <option value="site_supervisor">Site Supervisor</option>
            <option value="faculty_supervisor">Faculty Supervisor</option>
            <option value="super_admin">Super Admin</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
            Program
          </label>
          <select
            name="program"
            defaultValue={profile.program ?? ''}
            className="w-full px-3 py-2 rounded-[var(--radius-input)] text-sm border outline-none"
            style={{
              borderColor: 'var(--color-border)',
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-text-primary)',
            }}
          >
            <option value="">None</option>
            <option value="ESPY">ESPY</option>
            <option value="COUN">COUN</option>
          </select>
        </div>

        {state.errors?._form?.map(err => (
          <p key={err} role="alert" className="text-sm" style={{ color: 'var(--color-text-danger)' }}>{err}</p>
        ))}

        <div className="flex gap-3">
          <Button type="submit" loading={isPending}>Save Changes</Button>
          <Button type="button" variant="secondary" onClick={() => router.push('/admin/users')}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
