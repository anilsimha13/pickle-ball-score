'use client'
import type { Match, Team, Tournament } from '@/types'
import { roundName, matchesInRound, getFinalMatch, getThirdPlaceMatch } from '@/lib/bracket'
import { roundCount, bracketSize } from '@/lib/draw'
import { BracketRound } from './BracketRound'
import { ThirdPlaceMatch } from './ThirdPlaceMatch'
import { EmptyState } from '@/components/ui/EmptyState'

interface Props {
  tournament: Tournament
  teamMap: Record<string, Team>
}

export function Bracket({ tournament, teamMap }: Props) {
  const { matches, status } = tournament

  if (matches.length === 0) {
    return (
      <div data-testid="bracket-empty">
        <EmptyState
          title="No bracket yet"
          description="Generate the draw to see the bracket"
        />
      </div>
    )
  }

  const finalMatch = getFinalMatch(matches)
  const thirdPlace = getThirdPlaceMatch(matches)
  const S = bracketSize(tournament.teamIds.length)
  const R = roundCount(S)
  const isAnnounced = status === 'Announced'

  // Collect all rounds (1..R)
  const rounds: number[] = []
  for (let r = 1; r <= R; r++) rounds.push(r)

  return (
    <div
      className="overflow-x-auto pb-4"
      data-testid="bracket-container"
      role="region"
      aria-label="Tournament bracket"
    >
      <div className="flex gap-6 min-w-max">
        {rounds.map((round) => {
          const roundMatches = matchesInRound(matches, round).filter((m) => m.type === 'Knockout')
          return (
            <div key={round} className="flex flex-col">
              <BracketRound
                round={round}
                label={roundName(round, R)}
                matches={roundMatches}
                teamMap={teamMap}
                tournamentId={tournament.id}
                isAnnounced={isAnnounced}
              />
              {round === R && thirdPlace && (
                <ThirdPlaceMatch
                  match={thirdPlace}
                  teamMap={teamMap}
                  tournamentId={tournament.id}
                  isAnnounced={isAnnounced}
                />
              )}
            </div>
          )
        })}
      </div>
      {finalMatch && (
        <p className="sr-only">
          Final match: {finalMatch.teamAId ? teamMap[finalMatch.teamAId]?.name : 'TBD'} vs{' '}
          {finalMatch.teamBId ? teamMap[finalMatch.teamBId]?.name : 'TBD'}
        </p>
      )}
    </div>
  )
}
