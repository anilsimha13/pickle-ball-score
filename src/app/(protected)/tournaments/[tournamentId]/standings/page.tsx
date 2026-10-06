'use client'

import { use } from 'react'
import Link from 'next/link'
import { useTournamentStore } from '@/store/useTournamentStore'
import { useTeamStore } from '@/store/useTeamStore'
import { HydrationGate } from '@/components/ui/HydrationGate'
import { NotFoundCard } from '@/components/ui/NotFoundCard'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { StandingsTable } from '@/components/matches/StandingsTable'

function StandingsContent({ tournamentId }: { tournamentId: string }) {
  const tournament = useTournamentStore((s) => s.tournaments.find((t) => t.id === tournamentId))
  const allTeams = useTeamStore((s) => s.teams)

  if (!tournament) return <NotFoundCard entity="tournament" />

  const teams = allTeams.filter((t) => tournament.teamIds.includes(t.id))

  return (
    <>
      <PageHeader
        title="Standings"
        subtitle={tournament.name}
        actions={
          <Button variant="ghost">
            <Link href={`/tournaments/${tournamentId}`}>← Tournament</Link>
          </Button>
        }
      />
      <Card className="overflow-hidden">
        <StandingsTable
          matches={tournament.matches}
          teamIds={tournament.teamIds}
          teams={teams}
        />
      </Card>
    </>
  )
}

export default function StandingsPage({ params }: { params: Promise<{ tournamentId: string }> }) {
  const { tournamentId } = use(params)
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <HydrationGate>
        <StandingsContent tournamentId={tournamentId} />
      </HydrationGate>
    </div>
  )
}
