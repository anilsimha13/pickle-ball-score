'use client'

import { use, useState } from 'react'
import Link from 'next/link'
import { useTournamentStore } from '@/store/useTournamentStore'
import { useTeamStore } from '@/store/useTeamStore'
import { HydrationGate } from '@/components/ui/HydrationGate'
import { NotFoundCard } from '@/components/ui/NotFoundCard'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ScoreEntry } from '@/components/matches/ScoreEntry'
import { Scoreboard } from '@/components/matches/Scoreboard'
import { useToast } from '@/components/ui/Toast'
import { roundName } from '@/lib/bracket'
import type { GameScore } from '@/lib/scoring'

function MatchPage({ tournamentId, matchId }: { tournamentId: string; matchId: string }) {
  const tournament = useTournamentStore((s) => s.tournaments.find((t) => t.id === tournamentId))
  const { saveGameScores, recordWalkover } = useTournamentStore()
  const teams = useTeamStore((s) => s.teams)
  const { toast } = useToast()
  const [editMode, setEditMode] = useState(false)

  if (!tournament) return <NotFoundCard entity="tournament" />

  const match = tournament.matches.find((m) => m.id === matchId)
  if (!match) return <NotFoundCard entity="match" />

  const totalRounds = Math.max(...tournament.matches.map((m) => m.round))
  const rName = roundName(match.round, totalRounds)
  const label = match.type === 'ThirdPlace' ? '3rd Place' : rName

  const teamA = teams.find((t) => t.id === match.teamAId)
  const teamB = teams.find((t) => t.id === match.teamBId)

  const teamAName = teamA?.name ?? 'TBD'
  const teamBName = teamB?.name ?? 'TBD'

  const isAnnounced = tournament.status === 'Announced'
  const hasBothTeams = !!match.teamAId && !!match.teamBId
  const isCompleted = match.status === 'Completed'

  function handleSave(games: GameScore[]) {
    try {
      saveGameScores(tournamentId, matchId, games)
      toast('Scores saved!', 'success')
      setEditMode(false)
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Could not save scores', 'error')
    }
  }

  function handleWalkover(winnerId: string) {
    try {
      recordWalkover(tournamentId, matchId, winnerId)
      toast('Walkover recorded.', 'success')
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Could not record walkover', 'error')
    }
  }

  return (
    <>
      <PageHeader
        title={label}
        subtitle={`${teamAName} vs ${teamBName}`}
        actions={
          <Button variant="ghost" data-testid="back-to-bracket-btn">
            <Link href={`/tournaments/${tournamentId}/bracket`}>← Bracket</Link>
          </Button>
        }
      />

      <div className="max-w-2xl mx-auto">
        <Card kitchenStrip className="p-6">
          {!hasBothTeams ? (
            <div className="text-center py-8">
              <p className="text-muted" data-testid="waiting-message">
                Waiting for {rName} winner
              </p>
            </div>
          ) : match.isBye ? (
            <div className="text-center py-8">
              <p className="text-muted">BYE — {teamAName} advances automatically</p>
            </div>
          ) : isCompleted && !editMode ? (
            <div>
              <Scoreboard match={match} teamAName={teamAName} teamBName={teamBName} />
              {!isAnnounced && (
                <Button
                  variant="ghost"
                  onClick={() => setEditMode(true)}
                  className="mt-4"
                  data-testid="edit-scores-btn"
                >
                  Edit Scores
                </Button>
              )}
            </div>
          ) : (
            <ScoreEntry
              match={match}
              tournament={tournament}
              teamAName={teamAName}
              teamBName={teamBName}
              onSave={handleSave}
              onWalkover={handleWalkover}
            />
          )}
        </Card>
      </div>
    </>
  )
}

export default function MatchScoringPage({
  params,
}: {
  params: Promise<{ tournamentId: string; matchId: string }>
}) {
  const { tournamentId, matchId } = use(params)
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <HydrationGate>
        <MatchPage tournamentId={tournamentId} matchId={matchId} />
      </HydrationGate>
    </div>
  )
}
