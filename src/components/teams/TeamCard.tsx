import Link from 'next/link'
import { Users } from 'lucide-react'
import { usePlayerStore } from '@/store/usePlayerStore'
import type { Team } from '@/lib/schemas/team'

interface TeamCardProps {
  team: Team
}

export function TeamCard({ team }: TeamCardProps) {
  const { getPlayer } = usePlayerStore()
  const p1 = getPlayer(team.playerIds[0])
  const p2 = getPlayer(team.playerIds[1])

  return (
    <Link
      href={`/teams/${team.id}`}
      className="flex items-center gap-4 rounded-xl bg-surface p-4 shadow-sm hover:shadow-md transition-shadow"
      data-testid={`team-card-${team.id}`}
    >
      <div className="flex-shrink-0 h-12 w-12 rounded-full overflow-hidden bg-bg flex items-center justify-center">
        {team.photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={team.photo} alt={team.name} className="h-full w-full object-cover" />
        ) : (
          <Users className="h-6 w-6 text-muted" aria-hidden="true" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-net truncate">{team.name}</p>
        <p className="text-sm text-muted truncate">
          {p1?.name ?? '—'} &amp; {p2?.name ?? '—'}
        </p>
      </div>
    </Link>
  )
}
