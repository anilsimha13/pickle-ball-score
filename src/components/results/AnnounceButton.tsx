'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Tooltip } from '@/components/ui/Tooltip'
import { useToast } from '@/components/ui/Toast'
import { useTournamentStore } from '@/store/useTournamentStore'
import { announceEligibility } from '@/lib/results'
import type { Tournament } from '@/types'

interface AnnounceButtonProps {
  tournament: Tournament
}

export function AnnounceButton({ tournament }: AnnounceButtonProps) {
  const [open, setOpen] = useState(false)
  const { toast } = useToast()
  const announceResults = useTournamentStore((s) => s.announceResults)

  const { eligible, reasons } = announceEligibility(tournament)

  if (tournament.status === 'Announced') {
    return (
      <Button variant="primary" aria-disabled="true" data-testid="announce-btn" className="opacity-50 cursor-not-allowed">
        Results Announced
      </Button>
    )
  }

  if (!eligible) {
    return (
      <Tooltip content={reasons.join(' · ')}>
        <Button
          variant="primary"
          aria-disabled="true"
          tabIndex={0}
          data-testid="announce-btn"
        >
          Announce Results
        </Button>
      </Tooltip>
    )
  }

  return (
    <>
      <Button
        variant="primary"
        onClick={() => setOpen(true)}
        data-testid="announce-btn"
      >
        Announce Results
      </Button>
      <ConfirmDialog
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={() => {
          try {
            announceResults(tournament.id)
            toast('Results announced!', 'success')
          } catch (e) {
            toast(e instanceof Error ? e.message : 'Failed to announce', 'error')
          }
        }}
        title="Announce Results"
        message={`Announce the results for "${tournament.name}"? The tournament will become read-only.`}
        confirmLabel="Announce"
        destructive={false}
      />
    </>
  )
}
