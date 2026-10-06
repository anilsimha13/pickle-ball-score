'use client'

import { useParams, useRouter } from 'next/navigation'
import { PageHeader } from '@/components/layout/PageHeader'
import { HydrationGate } from '@/components/ui/HydrationGate'
import { Spinner } from '@/components/ui/Spinner'
import { NotFoundCard } from '@/components/ui/NotFoundCard'
import { TournamentForm } from '@/components/tournaments/TournamentForm'
import { useTournamentStore } from '@/store/useTournamentStore'
import { useToast } from '@/components/ui/Toast'
import { isFullyReadOnly } from '@/lib/tournament'
import type { CreateTournamentInput } from '@/types'

function EditTournamentInner({ tournamentId }: { tournamentId: string }) {
  const router = useRouter()
  const { toast } = useToast()
  const getTournament = useTournamentStore((s) => s.getTournament)
  const updateTournament = useTournamentStore((s) => s.updateTournament)

  const t = getTournament(tournamentId)
  if (!t) return <NotFoundCard entity="tournament" />
  if (isFullyReadOnly(t)) {
    router.replace(`/tournaments/${t.id}`)
    return null
  }

  async function handleSubmit(data: CreateTournamentInput) {
    try {
      updateTournament(tournamentId, data)
      toast('Tournament updated!', 'success')
      router.push(`/tournaments/${tournamentId}`)
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Failed to update', 'error')
    }
  }

  const defaultValues: Partial<CreateTournamentInput> = {
    name: t.name,
    venue: t.venue,
    startDate: t.startDate,
    endDate: t.endDate,
    bannerImage: t.bannerImage,
    pointsPerGame: t.pointsPerGame,
    bestOf: t.bestOf,
    prizes: t.prizes,
    sponsors: t.sponsors,
  }

  return (
    <TournamentForm
      defaultValues={defaultValues}
      tournament={t}
      onSubmit={handleSubmit}
      submitLabel="Save Changes"
    />
  )
}

export default function EditTournamentPage() {
  const params = useParams()
  const tournamentId = params.tournamentId as string

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <PageHeader title="Edit Tournament" />
      <HydrationGate fallback={<Spinner className="py-16" />}>
        <EditTournamentInner tournamentId={tournamentId} />
      </HydrationGate>
    </div>
  )
}
