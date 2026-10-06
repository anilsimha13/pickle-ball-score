import type { Match } from '@/types'

interface ScoreboardProps {
  match: Match
  teamAName: string
  teamBName: string
}

export function Scoreboard({ match, teamAName, teamBName }: ScoreboardProps) {
  if (match.isWalkover) {
    const winnerName = match.winnerId === match.teamAId ? teamAName : teamBName
    return (
      <div className="rounded-lg bg-bg p-4 text-center">
        <p className="text-sm text-muted mb-1">Walkover</p>
        <p className="font-heading text-2xl text-net">{winnerName}</p>
        <p className="text-xs text-muted mt-1">W/O</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {match.games.map((g, i) => {
        const aWon = g.teamA > g.teamB
        return (
          <div key={i} className="flex items-center gap-4 rounded-lg bg-bg px-4 py-3">
            <span className="text-xs text-muted w-14">Game {i + 1}</span>
            <span className={`font-heading text-xl flex-1 ${aWon ? 'text-court-green' : 'text-muted'}`}>
              {teamAName}
            </span>
            <span className="font-heading text-2xl text-net tracking-wider">
              {g.teamA}–{g.teamB}
            </span>
            <span className={`font-heading text-xl flex-1 text-right ${!aWon ? 'text-court-green' : 'text-muted'}`}>
              {teamBName}
            </span>
          </div>
        )
      })}
      {match.winnerId && (
        <p className="text-sm text-center text-court-green font-medium mt-2">
          Winner: {match.winnerId === match.teamAId ? teamAName : teamBName}
        </p>
      )}
    </div>
  )
}
