import { type ReactNode } from 'react'

interface EmptyStateProps {
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
      <svg
        width="64"
        height="64"
        viewBox="0 0 64 64"
        fill="none"
        aria-hidden="true"
        className="text-muted"
      >
        <rect x="28" y="4" width="8" height="40" rx="4" fill="currentColor" opacity="0.4" />
        <ellipse cx="32" cy="52" rx="12" ry="8" fill="currentColor" opacity="0.3" />
        <circle cx="32" cy="52" r="6" fill="#D7F04A" opacity="0.8" />
        <circle cx="32" cy="52" r="3" fill="currentColor" opacity="0.5" />
      </svg>
      <div>
        <p className="font-heading text-2xl text-net">{title}</p>
        {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}
