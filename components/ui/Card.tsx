import type { HTMLAttributes } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'stat'
}

export function Card({ variant = 'default', className = '', children, ...props }: CardProps) {
  if (variant === 'stat') {
    return (
      <div
        className={[
          'bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] rounded-[var(--radius-card)] shadow-[var(--shadow-sm)] px-6 py-5 transition-transform hover:-translate-y-px hover:shadow-[var(--shadow-md)]',
          className,
        ].join(' ')}
        {...props}
      >
        {children}
      </div>
    )
  }

  return (
    <div
      className={[
        'bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] rounded-[var(--radius-card)] shadow-[var(--shadow-sm)]',
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ className = '', children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={['px-6 py-5 border-b border-[var(--color-border-default)]', className].join(' ')}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardBody({ className = '', children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={['p-6', className].join(' ')} {...props}>
      {children}
    </div>
  )
}

export function CardFooter({ className = '', children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={[
        'px-6 py-4 bg-[var(--color-bg-subtle)] border-t border-[var(--color-border-default)] rounded-b-[var(--radius-card)]',
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </div>
  )
}
