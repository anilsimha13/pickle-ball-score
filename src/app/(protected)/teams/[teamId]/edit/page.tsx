'use client'

import { use, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTeamStore } from '@/store/useTeamStore'
import { useTournamentStore } from '@/store/useTournamentStore'
import { HydrationGate } from '@/components/ui/HydrationGate'
import { NotFoundCard } from '@/components/ui/NotFoundCard'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { TeamForm } from '@/components/teams/TeamForm'
import { useToast } from '@/components/ui/Toast'
import type { CreateTeamInput } from '@/lib/schemas/team'

function EditTeamInner({ teamId }: { teamId: string }) {
  const router = useRouter()
  const { getTeam, updateTeam } = useTeamStore()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const team = getTeam(teamId)
  if (!team) return <NotFoundCard entity="team" />

  const tournaments = useTournamentStore.getState().tournaments
  const lockPlayers = tournaments.some(
    (t) => t.teamIds.includes(teamId) && t.status !== 'Draft',
  )

  async function handleSubmit(data: CreateTeamInput) {
    setIsSubmitting(true)
    try {
      updateTeam(teamId, data)
      toast('Team updated!', 'success')
      router.push(`/teams/${teamId}`)
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed to update team', 'error')
      throw err
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <PageHeader title={`Edit ${team.name}`} />
      <Card kitchenStrip className="p-6">
        <TeamForm
          defaultValues={{ name: team.name, photo: team.photo, playerIds: team.playerIds }}
          onSubmit={handleSubmit}
          submitLabel="Save Changes"
          isSubmitting={isSubmitting}
          lockPlayers={lockPlayers}
        />
      </Card>
    </>
  )
}

export default function EditTeamPage({ params }: { params: Promise<{ teamId: string }> }) {
  const { teamId } = use(params)
  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <HydrationGate>
        <EditTeamInner teamId={teamId} />
      </HydrationGate>
    </div>
  )
}
