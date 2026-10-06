import { Badge } from './Badge'
import type { TournamentStatus } from '@/types'

const STATUS_LABELS: Record<TournamentStatus, string> = {
  Draft: 'Draft',
  Drawn: 'Drawn',
  InProgress: 'In Progress',
  Completed: 'Completed',
  Announced: 'Announced',
}

interface StatusBadgeProps {
  status: TournamentStatus
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return <Badge variant={status}>{STATUS_LABELS[status]}</Badge>
}
