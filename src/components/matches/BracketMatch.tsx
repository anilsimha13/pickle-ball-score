'use client'
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

function matchAriaLabel(match: Match, teamMap: Record<string, Team>, roundLabel: string): string {
  if (match.isBye) {
    return `${roundLabel}: ${teamName(match.teamAId, teamMap)}, bye`
  }
  if (match.isWalkover) {
    return `${roundLabel}: ${teamName(match.winnerId ?? null, teamMap)} advances by walkover`
  }
  const a = teamName(match.teamAId, teamMap)
  const b = teamName(match.teamBId, teamMap)
  if (match.games.length > 0) {
    const scores = match.games.map((g) => `${g.teamA}–${g.teamB}`).join(', ')
    return `${roundLabel}: ${a} ${scores} ${b}, ${match.status.toLowerCase()}`
  }
  return `${roundLabel}: ${a} vs ${b}, ${match.status.toLowerCase()}`
}

export function BracketMatch({ match, teamMap, tournamentId, isAnnounced }: Props) {
  const canLink =
    !isAnnounced &&
    !match.isBye &&
    match.teamAId !== null &&
    match.teamBId !== null &&
    match.status !== 'Completed'

  const ariaLabel = matchAriaLabel(match, teamMap, `Match`)

  const inner = (
    <div
      className={[
        'rounded-lg border p-3 min-w-[160px] text-sm transition-colors',
        match.isBye
          ? 'border-dashed border-muted bg-bg text-muted'
          : match.status === 'Live'
            ? 'border-2 border-kitchen bg-surface shadow-sm'
            : 'border-muted/40 bg-surface shadow-sm',
        canLink ? 'hover:border-court cursor-pointer' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      aria-label={ariaLabel}
    >
      {match.isBye ? (
        <div className="text-center text-xs font-medium text-muted">BYE</div>
      ) : match.isWalkover ? (
        <>
          <div className="font-medium text-net truncate">{teamName(match.winnerId ?? null, teamMap)}</div>
          <div className="text-xs text-muted mt-1">W/O</div>
          <div className="text-xs text-muted/60 truncate">{teamName(match.teamAId === match.winnerId ? match.teamBId : match.teamAId, teamMap)}</div>
        </>
      ) : (
        <>
          <div className="flex justify-between items-center gap-2">
            <span className={`truncate font-medium ${match.winnerId === match.teamAId ? 'text-court-green' : 'text-net'}`}>
              {teamName(match.teamAId, teamMap)}
            </span>
            {match.games.length > 0 && (
              <span className="font-heading text-sm tabular-nums shrink-0">
                {match.games.reduce((acc, g) => acc + (g.teamA > g.teamB ? 1 : 0), 0)}
              </span>
            )}
          </div>
          <div className="text-xs text-muted/60 my-1">vs</div>
          <div className="flex justify-between items-center gap-2">
            <span className={`truncate font-medium ${match.winnerId === match.teamBId ? 'text-court-green' : 'text-net'}`}>
              {teamName(match.teamBId, teamMap)}
            </span>
            {match.games.length > 0 && (
              <span className="font-heading text-sm tabular-nums shrink-0">
                {match.games.reduce((acc, g) => acc + (g.teamB > g.teamA ? 1 : 0), 0)}
              </span>
            )}
          </div>
        </>
      )}
    </div>
  )

  return (
    <li data-testid={`bracket-match-${match.id}`}>
      {canLink ? (
        <Link href={`/tournaments/${tournamentId}/matches/${match.id}`}>{inner}</Link>
      ) : (
        inner
      )}
    </li>
  )
}
