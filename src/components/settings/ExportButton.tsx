'use client'

import { useState } from 'react'
import { Download } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useToast } from '@/components/ui/Toast'
import { exportData } from '@/lib/backup'
import { usePlayerStore } from '@/store/usePlayerStore'
import { useTeamStore } from '@/store/useTeamStore'
import { useTournamentStore } from '@/store/useTournamentStore'
import { useContactStore } from '@/store/useContactStore'

export function ExportButton() {
  const [open, setOpen] = useState(false)
  const { toast } = useToast()

  const players = usePlayerStore((s) => s.players)
  const teams = useTeamStore((s) => s.teams)
  const tournaments = useTournamentStore((s) => s.tournaments)
  const messages = useContactStore((s) => s.messages)

  function handleExport() {
    try {
      const json = exportData({ players, teams, tournaments, messages })
      const blob = new Blob([json], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      const date = new Date().toISOString().split('T')[0]
      a.href = url
      a.download = `pickle-ball-score-backup-${date}.json`
      a.click()
      URL.revokeObjectURL(url)
      toast('Backup downloaded successfully.', 'success')
    } catch {
      toast('Export failed. Please try again.', 'error')
    }
  }

  return (
    <>
      <Button
        variant="secondary"
        onClick={() => setOpen(true)}
        data-testid="export-btn"
      >
        <Download className="h-4 w-4" aria-hidden="true" />
        Export Data
      </Button>
      <ConfirmDialog
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={handleExport}
        title="Export Data"
        message="This file contains personal data (ages, photos, contact details). Store it safely."
        confirmLabel="Download"
        destructive={false}
      />
    </>
  )
}
