'use client'

import { useState } from 'react'
import { Database } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useToast } from '@/components/ui/Toast'
import { usePlayerStore } from '@/store/usePlayerStore'
import { useTeamStore } from '@/store/useTeamStore'
import { samplePlayers, sampleTeams } from '@/lib/sampleData'
import type { Player } from '@/lib/schemas/player'
import type { Team } from '@/lib/schemas/team'

export function SampleDataButton() {
  const [open, setOpen] = useState(false)
  const { toast } = useToast()

  const players = usePlayerStore((s) => s.players)
  const setPlayers = usePlayerStore((s) => s.setPlayers)
  const teams = useTeamStore((s) => s.teams)
  const setTeams = useTeamStore((s) => s.setTeams)

  function handleLoad() {
    // Merge by id — fixed sample ids get reset to original values
    function mergeById<T extends { id: string }>(existing: T[], incoming: T[]): T[] {
      const map = new Map(existing.map((r) => [r.id, r]))
      for (const item of incoming) map.set(item.id, item)
      return Array.from(map.values())
    }

    setPlayers(mergeById(players, samplePlayers as Player[]))
    setTeams(mergeById(teams, sampleTeams as Team[]))
    toast('Sample data loaded.', 'success')
  }

  return (
    <>
      <Button
        variant="secondary"
        onClick={() => setOpen(true)}
        data-testid="sample-data-btn"
      >
        <Database className="h-4 w-4" aria-hidden="true" />
        Load Sample Data
      </Button>
      <ConfirmDialog
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={handleLoad}
        title="Load Sample Data"
        message="Sample records you've edited will be reset to their original values."
        confirmLabel="Load"
        destructive={false}
      />
    </>
  )
}
