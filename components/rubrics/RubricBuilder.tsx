'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import { saveCriteriaAction } from '@/lib/actions/rubrics'
import type { RubricCriterion } from '@/lib/types'

interface LocalCriterion {
  id?: string          // undefined for new, set for existing
  tempId: string      // client-side key
  name: string
  description: string
  performance_descriptors: Record<string, string>
  order_index: number
}

function newCriterion(order: number): LocalCriterion {
  return {
    tempId: Math.random().toString(36).slice(2),
    name: '',
    description: '',
    performance_descriptors: { '1': '', '2': '', '3': '', '4': '' },
    order_index: order,
  }
}

interface RubricBuilderProps {
  rubricId: string
  initialCriteria: RubricCriterion[]
}

export function RubricBuilder({ rubricId, initialCriteria }: RubricBuilderProps) {
  const router = useRouter()

  const [criteria, setCriteria] = useState<LocalCriterion[]>(
    initialCriteria.length > 0
      ? initialCriteria.map(c => ({
          id: c.id,
          tempId: c.id,
          name: c.name,
          description: c.description ?? '',
          performance_descriptors: c.performance_descriptors ?? { '1': '', '2': '', '3': '', '4': '' },
          order_index: c.order_index,
        }))
      : [newCriterion(0)]
  )

  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  function addCriterion() {
    setCriteria(prev => [...prev, newCriterion(prev.length)])
  }

  function removeCriterion(tempId: string) {
    setCriteria(prev => prev.filter(c => c.tempId !== tempId))
  }

  function moveCriterion(tempId: string, direction: 'up' | 'down') {
    setCriteria(prev => {
      const idx = prev.findIndex(c => c.tempId === tempId)
      if (direction === 'up' && idx === 0) return prev
      if (direction === 'down' && idx === prev.length - 1) return prev
      const next = [...prev]
      const swap = direction === 'up' ? idx - 1 : idx + 1
      ;[next[idx], next[swap]] = [next[swap], next[idx]]
      return next.map((c, i) => ({ ...c, order_index: i }))
    })
  }

  function updateCriterion(tempId: string, updates: Partial<LocalCriterion>) {
    setCriteria(prev =>
      prev.map(c => (c.tempId === tempId ? { ...c, ...updates } : c))
    )
  }

  function updateDescriptor(tempId: string, scoreKey: string, value: string) {
    setCriteria(prev =>
      prev.map(c =>
        c.tempId === tempId
          ? {
              ...c,
              performance_descriptors: { ...c.performance_descriptors, [scoreKey]: value },
            }
          : c
      )
    )
  }

  async function handleSave() {
    const invalid = criteria.some(c => !c.name.trim())
    if (invalid) {
      setMessage('All criteria must have a name.')
      return
    }

    setSaving(true)
    setMessage(null)

    const payload = criteria.map((c, i) => ({
      id: c.id,
      name: c.name.trim(),
      description: c.description.trim() || undefined,
      max_score: 4,
      order_index: i,
      performance_descriptors: Object.fromEntries(
        Object.entries(c.performance_descriptors).filter(([, v]) => v.trim())
      ),
    }))

    await saveCriteriaAction(rubricId, JSON.stringify(payload))
    setSaving(false)
    setMessage('Criteria saved.')
    router.refresh()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
          Criteria ({criteria.length})
        </h3>
        <Button variant="secondary" size="sm" onClick={addCriterion}>
          + Add Criterion
        </Button>
      </div>

      {criteria.map((c, idx) => (
        <div
          key={c.tempId}
          className="rounded-[var(--radius-card)] border border-[var(--color-border-default)] p-5 space-y-4"
        >
          {/* Header row */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider">
              Criterion {idx + 1}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => moveCriterion(c.tempId, 'up')}
                disabled={idx === 0}
                className="p-1 rounded text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] disabled:opacity-30"
                aria-label="Move up"
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12V4M4 8l4-4 4 4" /></svg>
              </button>
              <button
                type="button"
                onClick={() => moveCriterion(c.tempId, 'down')}
                disabled={idx === criteria.length - 1}
                className="p-1 rounded text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] disabled:opacity-30"
                aria-label="Move down"
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M8 4v8M4 8l4 4 4-4" /></svg>
              </button>
              <button
                type="button"
                onClick={() => removeCriterion(c.tempId)}
                disabled={criteria.length === 1}
                className="p-1 rounded text-[var(--color-text-tertiary)] hover:text-[var(--red-500)] disabled:opacity-30"
                aria-label="Remove criterion"
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" d="M3 8h10" /></svg>
              </button>
            </div>
          </div>

          <Input
            label="Criterion Name"
            required
            value={c.name}
            onChange={e => updateCriterion(c.tempId, { name: e.target.value })}
            placeholder="e.g. Professional Practice"
          />

          <Textarea
            label="Description (optional)"
            value={c.description}
            onChange={e => updateCriterion(c.tempId, { description: e.target.value })}
            rows={2}
            placeholder="Briefly describe what this criterion measures…"
          />

          {/* Performance descriptors */}
          <div>
            <p className="text-xs font-medium text-[var(--color-text-secondary)] mb-2">
              Performance Descriptors (optional)
            </p>
            <div className="grid grid-cols-2 gap-2">
              {['1', '2', '3', '4'].map(key => (
                <div key={key}>
                  <label className="text-xs text-[var(--color-text-tertiary)] mb-1 block">
                    {key} — {key === '1' ? 'Unsatisfactory' : key === '2' ? 'Developing' : key === '3' ? 'Proficient' : 'Exemplary'}
                  </label>
                  <input
                    type="text"
                    value={c.performance_descriptors[key] ?? ''}
                    onChange={e => updateDescriptor(c.tempId, key, e.target.value)}
                    className="w-full h-8 px-3 rounded-[var(--radius-input)] border border-[var(--color-border-default)] text-xs focus:outline-none focus:border-[var(--color-border-focus)]"
                    placeholder={`Describe score ${key}…`}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}

      {message && (
        <p className="text-sm text-[var(--color-text-secondary)]">{message}</p>
      )}

      <div className="flex gap-3">
        <Button variant="primary" loading={saving} onClick={handleSave}>
          Save Criteria
        </Button>
        <Button variant="ghost" onClick={() => router.push('/faculty/rubrics')}>
          Back to Rubrics
        </Button>
      </div>
    </div>
  )
}
