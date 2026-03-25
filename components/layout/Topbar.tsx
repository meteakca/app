'use client'

import { signOutAction } from '@/lib/actions/auth'
import { useState } from 'react'

interface TopbarProps {
  title: string
  onMobileMenuToggle?: () => void
}

export function Topbar({ title, onMobileMenuToggle }: TopbarProps) {
  const [signingOut, setSigningOut] = useState(false)

  async function handleSignOut() {
    setSigningOut(true)
    await signOutAction()
  }

  return (
    <header className="h-16 flex items-center justify-between px-6 bg-[var(--color-bg-surface)] border-b border-[var(--color-border-default)] flex-shrink-0">
      <div className="flex items-center gap-3">
        {/* Mobile menu toggle */}
        <button
          type="button"
          onClick={onMobileMenuToggle}
          className="md:hidden p-2 rounded-lg text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-muted)] focus:outline-none focus-visible:shadow-[var(--shadow-focus)]"
          aria-label="Open navigation menu"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <path strokeLinecap="round" d="M3 5h14M3 10h14M3 15h14" />
          </svg>
        </button>
        <h1 className="text-base font-semibold text-[var(--color-text-primary)]">{title}</h1>
      </div>

      <button
        type="button"
        onClick={handleSignOut}
        disabled={signingOut}
        className="flex items-center gap-2 h-8 px-3 rounded-lg text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-muted)] hover:text-[var(--color-text-primary)] transition-colors focus:outline-none focus-visible:shadow-[var(--shadow-focus)] disabled:opacity-50"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 10.5L13.5 8l-3-2.5" />
          <path strokeLinecap="round" d="M13.5 8H6" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 3.5H3a.5.5 0 00-.5.5v8a.5.5 0 00.5.5h4" />
        </svg>
        {signingOut ? 'Signing out…' : 'Sign out'}
      </button>
    </header>
  )
}
