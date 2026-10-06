'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { TeamForm } from '@/components/teams/TeamForm'
import { useTeamStore } from '@/store/useTeamStore'
import { useToast } from '@/components/ui/Toast'
import type { CreateTeamInput } from '@/lib/schemas/team'

export default function NewTeamPage() {
  const router = useRouter()
  const { addTeam } = useTeamStore()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(data: CreateTeamInput) {
    setIsSubmitting(true)
    try {
      const team = addTeam(data)
      toast('Team created!', 'success')
      router.push(`/teams/${team.id}`)
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed to create team', 'error')
      throw err
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <PageHeader title="New Team" />
      <Card kitchenStrip className="p-6">
        <TeamForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
      </Card>
    </div>
  )
}
