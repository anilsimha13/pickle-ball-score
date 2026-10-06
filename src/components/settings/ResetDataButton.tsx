'use client'

import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useToast } from '@/components/ui/Toast'
import { usePlayerStore } from '@/store/usePlayerStore'
import { useTeamStore } from '@/store/useTeamStore'
import { useTournamentStore } from '@/store/useTournamentStore'
import { useContactStore } from '@/store/useContactStore'

export function ResetDataButton() {
  const [open, setOpen] = useState(false)
  const { toast } = useToast()

  const clearPlayers = usePlayerStore((s) => s.clearPlayers)
  const clearTeams = useTeamStore((s) => s.clearTeams)
  const clearTournaments = useTournamentStore((s) => s.clearTournaments)
  const clearMessages = useContactStore((s) => s.clearMessages)

  function handleReset() {
    clearPlayers()
    clearTeams()
    clearTournaments()
    clearMessages()
    toast('All data has been deleted.', 'success')
  }

  return (
    <>
      <Button
        variant="destructive"
        onClick={() => setOpen(true)}
        data-testid="reset-data-btn"
      >
        <Trash2 className="h-4 w-4" aria-hidden="true" />
        Reset All Data
      </Button>
      <ConfirmDialog
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={handleReset}
        title="Reset All Data"
        message="This permanently deletes all players, teams, tournaments and contact messages."
        confirmLabel="Delete Everything"
        destructive
      />
    </>
  )
}
