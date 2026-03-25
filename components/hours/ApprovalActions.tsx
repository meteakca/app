'use client'

import { useActionState, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { approveSiteAction, approveFacultyAction, rejectHourLogAction } from '@/lib/actions/hours'

interface SiteApprovalActionsProps {
  logId: string
}

export function SiteApprovalActions({ logId }: SiteApprovalActionsProps) {
  const [showRejectForm, setShowRejectForm] = useState(false)
  const rejectWithId = rejectHourLogAction.bind(null, logId)
  const [rejectState, rejectFormAction, isRejecting] = useActionState(rejectWithId, {})

  if (showRejectForm) {
    return (
      <form action={rejectFormAction} className="flex items-start gap-2 mt-2">
        <div className="flex-1">
          <label htmlFor={`reason-${logId}`} className="sr-only">Rejection reason</label>
          <input
            id={`reason-${logId}`}
            name="reason"
            type="text"
            required
            placeholder="Reason for rejection…"
            className="w-full h-8 px-3 rounded-[var(--radius-input)] border border-[var(--color-border-default)] text-xs focus:outline-none focus:border-[var(--color-border-focus)]"
          />
          {rejectState.error && (
            <p className="text-xs text-[var(--color-text-danger)] mt-1">{rejectState.error}</p>
          )}
        </div>
        <Button type="submit" variant="danger" size="sm" loading={isRejecting}>
          Confirm
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => setShowRejectForm(false)}>
          Cancel
        </Button>
      </form>
    )
  }

  return (
    <div className="flex gap-2">
      <form action={approveSiteAction.bind(null, logId)}>
        <Button type="submit" variant="success" size="sm">Approve</Button>
      </form>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => setShowRejectForm(true)}
        className="text-[var(--red-600)] hover:bg-[var(--red-50)]"
      >
        Reject
      </Button>
    </div>
  )
}

interface FacultyApprovalActionsProps {
  logId: string
}

export function FacultyApprovalActions({ logId }: FacultyApprovalActionsProps) {
  const [showRejectForm, setShowRejectForm] = useState(false)
  const rejectWithId = rejectHourLogAction.bind(null, logId)
  const [rejectState, rejectFormAction, isRejecting] = useActionState(rejectWithId, {})

  if (showRejectForm) {
    return (
      <form action={rejectFormAction} className="flex items-start gap-2 mt-2">
        <div className="flex-1">
          <label htmlFor={`reason-${logId}`} className="sr-only">Rejection reason</label>
          <input
            id={`reason-${logId}`}
            name="reason"
            type="text"
            required
            placeholder="Reason for rejection…"
            className="w-full h-8 px-3 rounded-[var(--radius-input)] border border-[var(--color-border-default)] text-xs focus:outline-none focus:border-[var(--color-border-focus)]"
          />
          {rejectState.error && (
            <p className="text-xs text-[var(--color-text-danger)] mt-1">{rejectState.error}</p>
          )}
        </div>
        <Button type="submit" variant="danger" size="sm" loading={isRejecting}>
          Confirm
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => setShowRejectForm(false)}>
          Cancel
        </Button>
      </form>
    )
  }

  return (
    <div className="flex gap-2">
      <form action={approveFacultyAction.bind(null, logId)}>
        <Button type="submit" variant="success" size="sm">Final Approve</Button>
      </form>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => setShowRejectForm(true)}
        className="text-[var(--red-600)] hover:bg-[var(--red-50)]"
      >
        Reject
      </Button>
    </div>
  )
}
