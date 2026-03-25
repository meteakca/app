import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react'
import { forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  hint?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, error, id, className = '', ...props },
  ref
) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
  const hasError = Boolean(error)

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-[var(--color-text-primary)]"
        >
          {label}
          {props.required && <span className="ml-1 text-[var(--red-500)]" aria-hidden="true">*</span>}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        className={[
          'h-10 w-full px-4 rounded-[var(--radius-input)] border text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] bg-white transition-colors',
          'hover:border-[var(--color-border-strong)]',
          'focus:outline-none focus:border-[var(--color-border-focus)] focus:shadow-[var(--shadow-focus)]',
          'disabled:bg-[var(--color-bg-muted)] disabled:text-[var(--color-text-disabled)] disabled:cursor-not-allowed',
          hasError
            ? 'border-[var(--color-border-error)] shadow-[0_0_0_3px_rgb(239_68_68/0.15)]'
            : 'border-[var(--color-border-default)]',
          className,
        ].join(' ')}
        aria-invalid={hasError}
        aria-describedby={
          hasError ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
        }
        {...props}
      />
      {error && (
        <p id={`${inputId}-error`} className="text-xs text-[var(--color-text-danger)]" role="alert">
          {error}
        </p>
      )}
      {!error && hint && (
        <p id={`${inputId}-hint`} className="text-xs text-[var(--color-text-tertiary)]">
          {hint}
        </p>
      )}
    </div>
  )
})

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  hint?: string
  error?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, hint, error, id, className = '', ...props },
  ref
) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
  const hasError = Boolean(error)

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-[var(--color-text-primary)]"
        >
          {label}
          {props.required && <span className="ml-1 text-[var(--red-500)]" aria-hidden="true">*</span>}
        </label>
      )}
      <textarea
        ref={ref}
        id={inputId}
        className={[
          'w-full px-4 py-2.5 rounded-[var(--radius-input)] border text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] bg-white transition-colors resize-y min-h-24',
          'hover:border-[var(--color-border-strong)]',
          'focus:outline-none focus:border-[var(--color-border-focus)] focus:shadow-[var(--shadow-focus)]',
          'disabled:bg-[var(--color-bg-muted)] disabled:cursor-not-allowed',
          hasError
            ? 'border-[var(--color-border-error)] shadow-[0_0_0_3px_rgb(239_68_68/0.15)]'
            : 'border-[var(--color-border-default)]',
          className,
        ].join(' ')}
        aria-invalid={hasError}
        {...props}
      />
      {error && (
        <p className="text-xs text-[var(--color-text-danger)]" role="alert">{error}</p>
      )}
      {!error && hint && (
        <p className="text-xs text-[var(--color-text-tertiary)]">{hint}</p>
      )}
    </div>
  )
})
