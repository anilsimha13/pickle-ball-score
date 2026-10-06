'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { WalkoverDialog } from './WalkoverDialog'
import type { Match, Tournament } from '@/types'
import type { GameScore } from '@/lib/scoring'
import { validateGames } from '@/lib/scoring'

interface ScoreEntryProps {
  match: Match
  tournament: Tournament
  teamAName: string
  teamBName: string
  onSave: (games: GameScore[]) => void
  onWalkover: (winnerId: string) => void
}

export function ScoreEntry({ match, tournament, teamAName, teamBName, onSave, onWalkover }: ScoreEntryProps) {
  const [games, setGames] = useState<GameScore[]>(
    match.games.length > 0 ? [...match.games] : [{ teamA: 0, teamB: 0 }],
  )
  const [walkoverOpen, setWalkoverOpen] = useState(false)

  const { pointsPerGame, bestOf } = tournament
  const errors = validateGames(games, pointsPerGame, bestOf)

  function updateGame(index: number, field: 'teamA' | 'teamB', value: string) {
    const parsed = parseInt(value, 10)
    const score = isNaN(parsed) ? 0 : Math.max(0, Math.min(99, parsed))
    setGames((prev) => prev.map((g, i) => (i === index ? { ...g, [field]: score } : g)))
  }

  function addGame() {
    if (games.length < bestOf) setGames((prev) => [...prev, { teamA: 0, teamB: 0 }])
  }

  function removeLastGame() {
    if (games.length > 1) setGames((prev) => prev.slice(0, -1))
  }

  // Determine if the match is already decided based on current games
  let aWins = 0
  let bWins = 0
  for (const g of games) {
    if (g.teamA > g.teamB) aWins++
    else if (g.teamB > g.teamA) bWins++
  }
  const needed = bestOf === 1 ? 1 : 2
  const matchDecided = aWins >= needed || bWins >= needed
  const canAddGame = games.length < bestOf && !matchDecided

  return (
    <div className="space-y-4" data-testid="score-entry">
      <div className="flex items-center gap-4 text-sm font-medium text-muted mb-2">
        <span className="flex-1 text-right">{teamAName}</span>
        <span className="w-16 text-center">vs</span>
        <span className="flex-1">{teamBName}</span>
      </div>

      {games.map((g, i) => (
        <div key={i} className="rounded-lg bg-bg p-4 space-y-2">
          <p className="text-xs text-muted font-medium">Game {i + 1}</p>
          <div className="flex items-center gap-4">
            <input
              type="number"
              inputMode="numeric"
              min={0}
              max={99}
              value={g.teamA}
              onChange={(e) => updateGame(i, 'teamA', e.target.value)}
              className="flex-1 rounded-md border border-muted px-3 py-2 text-center font-heading text-2xl focus:outline-none focus:ring-2 focus:ring-court bg-surface"
              data-testid={`game-${i}-teamA`}
              aria-label={`Game ${i + 1} ${teamAName} score`}
            />
            <span className="text-muted font-heading text-xl">–</span>
            <input
              type="number"
              inputMode="numeric"
              min={0}
              max={99}
              value={g.teamB}
              onChange={(e) => updateGame(i, 'teamB', e.target.value)}
              className="flex-1 rounded-md border border-muted px-3 py-2 text-center font-heading text-2xl focus:outline-none focus:ring-2 focus:ring-court bg-surface"
              data-testid={`game-${i}-teamB`}
              aria-label={`Game ${i + 1} ${teamBName} score`}
            />
          </div>
        </div>
      ))}

      {errors.length > 0 && (
        <ul className="text-sm text-danger space-y-1" role="alert">
          {errors.map((err, i) => <li key={i}>{err}</li>)}
        </ul>
      )}

      <div className="flex flex-wrap gap-2">
        {canAddGame && (
          <Button variant="ghost" onClick={addGame} data-testid="add-game-btn" type="button">
            + Add Game
          </Button>
        )}
        {games.length > 1 && (
          <Button variant="ghost" onClick={removeLastGame} type="button" data-testid="remove-game-btn">
            – Remove Game
          </Button>
        )}
      </div>

      <div className="flex gap-3 pt-2">
        <Button
          variant="primary"
          onClick={() => onSave(games)}
          disabled={errors.length > 0}
          data-testid="save-scores-btn"
        >
          Save Scores
        </Button>
        {match.teamAId && match.teamBId && (
          <Button variant="secondary" onClick={() => setWalkoverOpen(true)} type="button" data-testid="walkover-btn">
            Record Walkover
          </Button>
        )}
      </div>

      {match.teamAId && match.teamBId && (
        <WalkoverDialog
          open={walkoverOpen}
          onClose={() => setWalkoverOpen(false)}
          onConfirm={onWalkover}
          teamA={{ id: match.teamAId, name: teamAName }}
          teamB={{ id: match.teamBId, name: teamBName }}
        />
      )}
    </div>
  )
}
