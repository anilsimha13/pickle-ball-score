import Link from 'next/link'
import { User } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import type { Player } from '@/lib/schemas/player'

interface PlayerCardProps {
  player: Player
}

export function PlayerCard({ player }: PlayerCardProps) {
  return (
    <Link
      href={`/players/${player.id}`}
      className="flex items-center gap-4 rounded-xl bg-surface p-4 shadow-sm hover:shadow-md transition-shadow"
      data-testid={`player-card-${player.id}`}
    >
      <div className="flex-shrink-0 h-12 w-12 rounded-full overflow-hidden bg-bg flex items-center justify-center">
        {player.photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={player.photo} alt={player.name} className="h-full w-full object-cover" />
        ) : (
          <User className="h-6 w-6 text-muted" aria-hidden="true" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-net truncate">{player.name}</p>
        <p className="text-sm text-muted truncate">{player.place}</p>
      </div>
      <Badge variant={player.level.toLowerCase()}>{player.level}</Badge>
    </Link>
  )
}
