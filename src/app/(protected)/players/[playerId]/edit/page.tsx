'use client'

import { use, useState } from 'react'
import { useRouter } from 'next/navigation'
import { usePlayerStore } from '@/store/usePlayerStore'
import { HydrationGate } from '@/components/ui/HydrationGate'
import { NotFoundCard } from '@/components/ui/NotFoundCard'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { PlayerForm } from '@/components/players/PlayerForm'
import { useToast } from '@/components/ui/Toast'
import type { CreatePlayerInput } from '@/lib/schemas/player'

function EditPlayerInner({ playerId }: { playerId: string }) {
  const router = useRouter()
  const { getPlayer, updatePlayer } = usePlayerStore()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const player = getPlayer(playerId)
  if (!player) return <NotFoundCard entity="player" />

  async function handleSubmit(data: CreatePlayerInput) {
    setIsSubmitting(true)
    try {
      updatePlayer(playerId, data)
      toast('Player updated!', 'success')
      router.push(`/players/${playerId}`)
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed to update player', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <PageHeader title={`Edit ${player.name}`} />
      <Card kitchenStrip className="p-6">
        <PlayerForm
          defaultValues={{ name: player.name, age: player.age, place: player.place, level: player.level, photo: player.photo }}
          onSubmit={handleSubmit}
          submitLabel="Save Changes"
          isSubmitting={isSubmitting}
        />
      </Card>
    </>
  )
}

export default function EditPlayerPage({ params }: { params: Promise<{ playerId: string }> }) {
  const { playerId } = use(params)
  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <HydrationGate>
        <EditPlayerInner playerId={playerId} />
      </HydrationGate>
    </div>
  )
}
