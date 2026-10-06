import { cn } from '@/lib/utils'
import type { TournamentStatus } from '@/types'

type BadgeVariant = TournamentStatus | string

const STATUS_CLASSES: Record<string, string> = {
  draft: 'bg-muted text-line',
  drawn: 'bg-court text-line',
  inprogress: 'bg-kitchen text-net',
  completed: 'bg-court-green text-line',
  announced: 'bg-ball text-net',
}

interface BadgeProps {
  variant?: BadgeVariant
  children: React.ReactNode
  className?: string
}

export function Badge({ variant, children, className }: BadgeProps) {
  const key = variant?.toLowerCase().replace(/\s/g, '') ?? ''
  const colorClass = STATUS_CLASSES[key] ?? 'bg-muted text-line'
  return (
    <span
      className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', colorClass, className)}
    >
      {children}
    </span>
  )
}
