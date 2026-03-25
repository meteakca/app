'use client'

import { useActionState } from 'react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Input, Textarea } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import type { HourLogFormState } from '@/lib/actions/hours'
import type { HourLog } from '@/lib/types'

type ActionFn = (prevState: HourLogFormState, formData: FormData) => Promise<HourLogFormState>

interface HourLogFormProps {
  action: ActionFn
  defaultValues?: Partial<HourLog>
  submitLabel?: string
  cancelHref?: string
}

export function HourLogForm({
  action,
  defaultValues,
  submitLabel = 'Save Entry',
  cancelHref = '/student/hours',
}: HourLogFormProps) {
  const router = useRouter()
  const [state, formAction, isPending] = useActionState(action, {})

  useEffect(() => {
    if (state.success) {
      router.push('/student/hours')
    }
  }, [state.success, router])

  return (
    <form action={formAction} className="space-y-5 max-w-lg">
      <Input
        label="Date"
        name="date"
        type="date"
        required
        defaultValue={defaultValues?.date ?? new Date().toISOString().split('T')[0]}
        error={state.errors?.date?.[0]}
      />

      <Input
        label="Hours"
        name="hours"
        type="number"
        step="0.25"
        min="0.25"
        max="24"
        required
        defaultValue={defaultValues?.hours?.toString() ?? ''}
        placeholder="e.g. 3.5"
        hint="Enter hours in 0.25 increments"
        error={state.errors?.hours?.[0]}
      />

      <Textarea
        label="Activity Description"
        name="activity_description"
        required
        rows={5}
        defaultValue={defaultValues?.activity_description ?? ''}
        placeholder="Describe the activities you completed during this practicum session…"
        hint="Minimum 10 characters"
        error={state.errors?.activity_description?.[0]}
      />

      {state.errors?._form?.map(err => (
        <p key={err} role="alert" className="text-sm text-[var(--color-text-danger)] bg-[var(--red-50)] border border-[var(--red-200)] rounded-[var(--radius-input)] px-4 py-2.5">
          {err}
        </p>
      ))}

      <div className="flex gap-3 pt-2">
        <Button type="submit" loading={isPending}>
          {submitLabel}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.push(cancelHref)}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
