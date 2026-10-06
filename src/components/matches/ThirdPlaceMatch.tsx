import Link from 'next/link'
import type { Match, Team } from '@/types'

interface Props {
  match: Match
  teamMap: Record<string, Team>
  tournamentId: string
  isAnnounced: boolean
}

function teamName(id: string | null, teamMap: Record<string, Team>): string {
  if (!id) return 'TBD'
  return teamMap[id]?.name ?? 'Unknown'
}

export function ThirdPlaceMatch({ match, teamMap, tournamentId, isAnnounced }: Props) {
  const canLink =
    !isAnnounced &&
    match.teamAId !== null &&
    match.teamBId !== null &&
    match.status !== 'Completed'

  const inner = (
    <div
      className="rounded-lg border-2 border-bronze/60 bg-surface p-3 min-w-[160px] text-sm shadow-sm"
      aria-label={`3rd Place: ${teamName(match.teamAId, teamMap)} vs ${teamName(match.teamBId, teamMap)}`}
    >
      <div className="text-xs font-heading text-bronze mb-2 uppercase tracking-wide">3rd Place</div>
      {match.isWalkover ? (
        <>
          <div className="font-medium text-net truncate">{teamName(match.winnerId ?? null, teamMap)}</div>
          <div className="text-xs text-muted">W/O</div>
        </>
      ) : (
        <>
          <div className={`font-medium truncate ${match.winnerId === match.teamAId ? 'text-court-green' : 'text-net'}`}>
            {teamName(match.teamAId, teamMap)}
          </div>
          <div className="text-xs text-muted/60 my-1">vs</div>
          <div className={`font-medium truncate ${match.winnerId === match.teamBId ? 'text-court-green' : 'text-net'}`}>
            {teamName(match.teamBId, teamMap)}
          </div>
        </>
      )}
    </div>
  )

  return (
    <div data-testid={`bracket-match-${match.id}`} className="mt-4">
      {canLink ? (
        <Link href={`/tournaments/${tournamentId}/matches/${match.id}`}>{inner}</Link>
      ) : (
        inner
      )}
    </div>
  )
}
