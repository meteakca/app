import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'success' | 'danger'
type Size = 'xs' | 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
}

const variantClasses: Record<Variant, string> = {
  primary:   'bg-[var(--color-bg-primary)] text-[var(--color-text-inverse)] hover:bg-[var(--color-bg-primary-hover)] active:bg-[var(--color-bg-primary-active)] focus-visible:shadow-[var(--shadow-focus)]',
  secondary: 'bg-white text-[var(--color-text-primary)] border border-[var(--color-border-strong)] hover:bg-[var(--color-bg-subtle)] focus-visible:shadow-[var(--shadow-focus)]',
  ghost:     'bg-transparent text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-muted)] hover:text-[var(--color-text-primary)] focus-visible:shadow-[var(--shadow-focus)]',
  success:   'bg-[var(--green-500)] text-white hover:bg-[var(--green-600)] focus-visible:shadow-[var(--shadow-focus)]',
  danger:    'bg-[var(--red-500)] text-white hover:bg-[var(--red-600)] focus-visible:shadow-[var(--shadow-focus)]',
}

const sizeClasses: Record<Size, string> = {
  xs: 'h-6 px-2 text-[10px]',
  sm: 'h-8 px-3 text-xs',
  md: 'h-10 px-5 text-sm',
  lg: 'h-12 px-6 text-base',
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  children,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={[
        'inline-flex items-center justify-center gap-2 font-medium rounded-[var(--radius-button)] transition-colors duration-150 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed',
        variantClasses[variant],
        sizeClasses[size],
        className,
      ].join(' ')}
      {...props}
    >
      {loading ? (
        <>
          <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
          <span>Loading…</span>
        </>
      ) : children}
    </button>
  )
}
