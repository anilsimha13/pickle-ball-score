'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { PlayerForm } from '@/components/players/PlayerForm'
import { usePlayerStore } from '@/store/usePlayerStore'
import { useToast } from '@/components/ui/Toast'
import type { CreatePlayerInput } from '@/lib/schemas/player'

export default function NewPlayerPage() {
  const router = useRouter()
  const { addPlayer } = usePlayerStore()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(data: CreatePlayerInput) {
    setIsSubmitting(true)
    try {
      const player = addPlayer(data)
      toast('Player created!', 'success')
      router.push(`/players/${player.id}`)
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed to create player', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <PageHeader title="New Player" />
      <Card kitchenStrip className="p-6">
        <PlayerForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
      </Card>
    </div>
  )
}
