'use client'

import { useRouter } from 'next/navigation'
import { PageHeader } from '@/components/layout/PageHeader'
import { TournamentForm } from '@/components/tournaments/TournamentForm'
import { useTournamentStore } from '@/store/useTournamentStore'
import { useToast } from '@/components/ui/Toast'
import type { CreateTournamentInput } from '@/types'

export default function NewTournamentPage() {
  const router = useRouter()
  const addTournament = useTournamentStore((s) => s.addTournament)
  const { toast } = useToast()

  async function handleSubmit(data: CreateTournamentInput) {
    try {
      const t = addTournament(data)
      toast('Tournament created!', 'success')
      router.push(`/tournaments/${t.id}`)
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Failed to create tournament', 'error')
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <PageHeader title="New Tournament" />
      <TournamentForm onSubmit={handleSubmit} submitLabel="Create Tournament" />
    </div>
  )
}
