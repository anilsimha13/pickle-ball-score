'use client'

import { useParams } from 'next/navigation'
import { PageHeader } from '@/components/layout/PageHeader'
import { HydrationGate } from '@/components/ui/HydrationGate'
import { Spinner } from '@/components/ui/Spinner'
import { NotFoundCard } from '@/components/ui/NotFoundCard'
import { EmptyState } from '@/components/ui/EmptyState'
import { Card } from '@/components/ui/Card'
import { Confetti } from '@/components/results/Confetti'
import { Podium } from '@/components/results/Podium'
import { AnnounceButton } from '@/components/results/AnnounceButton'
import { PrizeTable } from '@/components/tournaments/PrizeTable'
import { SponsorStrip } from '@/components/tournaments/SponsorStrip'
import { useTournamentStore } from '@/store/useTournamentStore'
import { usePlayerStore } from '@/store/usePlayerStore'
import { useTeamStore } from '@/store/useTeamStore'
import { getPodium } from '@/lib/results'

function ResultsContent({ tournamentId }: { tournamentId: string }) {
  const getTournament = useTournamentStore((s) => s.getTournament)
  const players = usePlayerStore((s) => s.players)
  const teams = useTeamStore((s) => s.teams)

  const t = getTournament(tournamentId)
  if (!t) return <NotFoundCard entity="tournament" />

  if (t.status === 'Announced' && t.results) {
    const podium = getPodium(t)!
    return (
      <div className="space-y-8">
        <Confetti />
        <Card kitchenStrip className="p-6">
          <h2 className="font-heading text-2xl text-net mb-2">{t.name} — Results</h2>
          <Podium podium={podium} teams={teams} players={players} />
        </Card>
        <Card className="p-6">
          <h3 className="font-heading text-xl text-net mb-4">Prize Money</h3>
          <PrizeTable prizes={t.prizes} />
        </Card>
        {t.sponsors.length > 0 && (
          <Card className="p-6">
            <h3 className="font-heading text-xl text-net mb-4">Sponsors</h3>
            <SponsorStrip sponsors={t.sponsors} />
          </Card>
        )}
        <div className="flex justify-center">
          <AnnounceButton tournament={t} />
        </div>
      </div>
    )
  }

  if (t.status === 'Completed') {
    return (
      <div className="space-y-6">
        <Card kitchenStrip className="p-6">
          <h2 className="font-heading text-2xl text-net mb-2">{t.name}</h2>
          <p className="text-muted mb-4">Results will be announced here once confirmed.</p>
          <AnnounceButton tournament={t} />
        </Card>
        <Card className="p-6">
          <h3 className="font-heading text-xl text-net mb-4">Prize Money</h3>
          <PrizeTable prizes={t.prizes} />
        </Card>
      </div>
    )
  }

  return (
    <EmptyState
      title="No Results Yet"
      description="Results will appear here once they're announced."
    />
  )
}

export default function ResultsPage() {
  const params = useParams()
  const tournamentId = params.tournamentId as string

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <PageHeader title="Results" />
      <HydrationGate fallback={<Spinner className="py-16" />}>
        <ResultsContent tournamentId={tournamentId} />
      </HydrationGate>
    </div>
  )
}
