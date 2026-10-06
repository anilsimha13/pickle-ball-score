'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { HydrationGate } from '@/components/ui/HydrationGate'
import { Spinner } from '@/components/ui/Spinner'
import { NotFoundCard } from '@/components/ui/NotFoundCard'
import { TeamPicker } from '@/components/tournaments/TeamPicker'
import { useTournamentStore } from '@/store/useTournamentStore'
import { cn } from '@/lib/utils'

function TeamsInner({ tournamentId }: { tournamentId: string }) {
  const getTournament = useTournamentStore((s) => s.getTournament)
  const t = getTournament(tournamentId)

  if (!t) return <NotFoundCard entity="tournament" />

  const isDraft = t.status === 'Draft'

  return (
    <div className="space-y-4">
      <Link
        href={`/tournaments/${t.id}`}
        className={cn(
          'inline-flex items-center gap-1 text-sm text-court hover:underline',
        )}
        data-testid="back-to-tournament"
      >
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
        Back to {t.name}
      </Link>

      {!isDraft && (
        <p className="text-sm text-kitchen font-medium">
          Team list is locked — the draw has been generated.
        </p>
      )}

      <TeamPicker tournament={t} readOnly={!isDraft} />
    </div>
  )
}

export default function TournamentTeamsPage() {
  const params = useParams()
  const tournamentId = params.tournamentId as string

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <PageHeader title="Tournament Teams" />
      <HydrationGate fallback={<Spinner className="py-16" />}>
        <TeamsInner tournamentId={tournamentId} />
      </HydrationGate>
    </div>
  )
}
