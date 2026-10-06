import type { Match, Team } from '@/types'
import { BracketMatch } from './BracketMatch'

interface Props {
  round: number
  label: string
  matches: Match[]
  teamMap: Record<string, Team>
  tournamentId: string
  isAnnounced: boolean
}

export function BracketRound({ round, label, matches, teamMap, tournamentId, isAnnounced }: Props) {
  const headingId = `round-${round}-heading`

  return (
    <section
      aria-labelledby={headingId}
      className="flex flex-col gap-3 min-w-[180px]"
      data-testid={`bracket-round-${round}`}
    >
      <h3
        id={headingId}
        className="font-heading text-lg text-court text-center border-b border-muted/30 pb-1"
      >
        {label}
      </h3>
      <ol className="flex flex-col gap-4 justify-around flex-1">
        {matches
          .filter((m) => m.type === 'Knockout')
          .sort((a, b) => a.position - b.position)
          .map((match) => (
            <BracketMatch
              key={match.id}
              match={match}
              teamMap={teamMap}
              tournamentId={tournamentId}
              isAnnounced={isAnnounced}
            />
          ))}
      </ol>
    </section>
  )
}
