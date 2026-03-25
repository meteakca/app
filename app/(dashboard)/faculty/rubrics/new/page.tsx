'use client'

import { useActionState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createRubricAction } from '@/lib/actions/rubrics'
import { Input, Textarea } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { currentAcademicYear } from '@/lib/utils'

export default function NewRubricPage() {
  const router = useRouter()
  const [state, formAction, isPending] = useActionState(createRubricAction, {})

  useEffect(() => {
    if (state.rubricId) {
      router.push(`/faculty/rubrics/${state.rubricId}`)
    }
  }, [state.rubricId, router])

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">New Rubric</h2>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">
          Create a key assessment rubric. You&apos;ll add criteria on the next step.
        </p>
      </div>

      <form action={formAction} className="space-y-5">
        <Input
          label="Rubric Name"
          name="name"
          required
          placeholder="e.g. End-of-Year Key Assessment"
          error={state.errors?.name?.[0]}
        />

        <Input
          label="Academic Year"
          name="academic_year"
          required
          defaultValue={currentAcademicYear()}
          placeholder="e.g. 2025-2026"
          error={state.errors?.academic_year?.[0]}
        />

        <Textarea
          label="Description (optional)"
          name="description"
          rows={3}
          placeholder="Brief description of this rubric's purpose…"
        />

        {state.errors?._form?.map(err => (
          <p key={err} role="alert" className="text-sm text-[var(--color-text-danger)]">{err}</p>
        ))}

        <div className="flex gap-3">
          <Button type="submit" loading={isPending}>
            Create & Add Criteria →
          </Button>
          <Button type="button" variant="secondary" onClick={() => router.push('/faculty/rubrics')}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
