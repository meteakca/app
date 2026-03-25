'use client'

import { useActionState } from 'react'
import { signInAction } from '@/lib/actions/auth'

const initialState = { error: undefined }

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(signInAction, initialState)

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg-canvas)] px-4">
      <div
        className="w-full max-w-sm bg-[var(--color-bg-surface)] rounded-[var(--radius-card)] shadow-[var(--shadow-md)] p-8"
      >
        {/* Header */}
        <div className="mb-8">
          <div className="w-10 h-10 rounded-xl bg-[var(--blue-500)] flex items-center justify-center mb-4">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path
                d="M10 2L3 7v9a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1V7l-7-5z"
                fill="white"
              />
            </svg>
          </div>
          <h1
            className="text-[var(--text-2xl)] font-[var(--font-weight-bold)] text-[var(--color-text-primary)] leading-tight"
          >
            Practicum Tracker
          </h1>
          <p className="text-[var(--text-sm)] text-[var(--color-text-secondary)] mt-1">
            Sign in to your account
          </p>
        </div>

        <form action={formAction} className="space-y-4">
          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-[var(--text-sm)] font-[var(--font-weight-medium)] text-[var(--color-text-primary)] mb-[var(--space-1-5)]"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="w-full h-10 px-[var(--space-4)] rounded-[var(--radius-input)] border border-[var(--color-border-default)] bg-white text-[var(--text-sm)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] transition-colors hover:border-[var(--color-border-strong)] focus:outline-none focus:border-[var(--color-border-focus)] focus:shadow-[var(--shadow-focus)]"
              placeholder="you@university.edu"
            />
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-[var(--text-sm)] font-[var(--font-weight-medium)] text-[var(--color-text-primary)] mb-[var(--space-1-5)]"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="w-full h-10 px-[var(--space-4)] rounded-[var(--radius-input)] border border-[var(--color-border-default)] bg-white text-[var(--text-sm)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] transition-colors hover:border-[var(--color-border-strong)] focus:outline-none focus:border-[var(--color-border-focus)] focus:shadow-[var(--shadow-focus)]"
              placeholder="••••••••"
            />
          </div>

          {/* Error message */}
          {state?.error && (
            <div
              role="alert"
              className="text-[var(--text-sm)] text-[var(--color-text-danger)] bg-[var(--red-50)] border border-[var(--red-200)] rounded-[var(--radius-input)] px-[var(--space-4)] py-[var(--space-2-5)]"
            >
              {state.error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isPending}
            className="w-full h-10 rounded-[var(--radius-button)] bg-[var(--color-bg-primary)] text-[var(--color-text-inverse)] text-[var(--text-sm)] font-[var(--font-weight-medium)] transition-colors hover:bg-[var(--color-bg-primary-hover)] active:bg-[var(--color-bg-primary-active)] disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:shadow-[var(--shadow-focus)]"
          >
            {isPending ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="mt-6 text-center text-[var(--text-xs)] text-[var(--color-text-tertiary)]">
          Contact your administrator if you need an account.
        </p>
      </div>
    </div>
  )
}
