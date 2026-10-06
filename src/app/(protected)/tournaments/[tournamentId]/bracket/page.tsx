'use client'
import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useTournamentStore } from '@/store/useTournamentStore'
import { useTeamStore } from '@/store/useTeamStore'
import { HydrationGate } from '@/components/ui/HydrationGate'
import { NotFoundCard } from '@/components/ui/NotFoundCard'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Bracket } from '@/components/matches/Bracket'
import { Tooltip } from '@/components/ui/Tooltip'
import { useToast } from '@/components/ui/Toast'
import { canReshuffle } from '@/lib/tournament'
import type { Team } from '@/types'

function BracketPageContent({ tournamentId }: { tournamentId: string }) {
  const tournament = useTournamentStore((s) => s.tournaments.find((t) => t.id === tournamentId))
  const teams = useTeamStore((s) => s.teams)
  const generateDraw = useTournamentStore((s) => s.generateDraw)
  const reshuffleDraw = useTournamentStore((s) => s.reshuffleDraw)
  const { toast } = useToast()

  const [drawDialogOpen, setDrawDialogOpen] = useState(false)
  const [reshuffleDialogOpen, setReshuffleDialogOpen] = useState(false)

  if (!tournament) {
    return <NotFoundCard entity="tournament" />
  }

  const teamMap: Record<string, Team> = {}
  for (const t of teams) teamMap[t.id] = t

  const canDraw =
    tournament.status === 'Draft' &&
    tournament.teamIds.length >= 4 &&
    tournament.teamIds.length <= 50

  const shuffleable = canReshuffle(tournament)

  function handleGenerateDraw() {
    try {
      generateDraw(tournamentId)
      toast('Draw generated successfully!', 'success')
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Failed to generate draw', 'error')
    }
  }

  function handleReshuffle() {
    try {
      reshuffleDraw(tournamentId)
      toast('Draw reshuffled!', 'success')
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Failed to reshuffle', 'error')
    }
  }

  const headerActions = (
    <div className="flex gap-3">
      {tournament.status === 'Draft' &&
        (canDraw ? (
          <Button onClick={() => setDrawDialogOpen(true)} data-testid="generate-draw-btn">
            Generate Draw
          </Button>
        ) : (
          <Tooltip content="Add at least 4 teams to generate the draw">
            <Button aria-disabled="true" data-testid="generate-draw-btn">
              Generate Draw
            </Button>
          </Tooltip>
        ))}
      {tournament.status === 'Drawn' &&
        (shuffleable ? (
          <Button variant="secondary" onClick={() => setReshuffleDialogOpen(true)} data-testid="reshuffle-btn">
            Re-shuffle
          </Button>
        ) : (
          <Tooltip content="Re-shuffle is locked once scores are entered">
            <Button variant="secondary" aria-disabled="true" data-testid="reshuffle-btn">
              Re-shuffle
            </Button>
          </Tooltip>
        ))}
    </div>
  )

  return (
    <>
      <PageHeader title="Bracket" subtitle={tournament.name} actions={headerActions} />

      <div className="mt-6">
        <Bracket tournament={tournament} teamMap={teamMap} />
      </div>

      <ConfirmDialog
        open={drawDialogOpen}
        onClose={() => setDrawDialogOpen(false)}
        onConfirm={handleGenerateDraw}
        title="Generate Draw"
        message={`This will randomly draw the bracket for ${tournament.name}. The draw is final and cannot be reversed.`}
        confirmLabel="Generate"
        destructive={false}
      />

      <ConfirmDialog
        open={reshuffleDialogOpen}
        onClose={() => setReshuffleDialogOpen(false)}
        onConfirm={handleReshuffle}
        title="Re-shuffle Draw"
        message="This will redo the random draw."
        confirmLabel="Re-shuffle"
        destructive={false}
      />
    </>
  )
}

export default function BracketPage() {
  const { tournamentId } = useParams<{ tournamentId: string }>()
  return (
    <HydrationGate>
      <BracketPageContent tournamentId={tournamentId} />
    </HydrationGate>
  )
}
