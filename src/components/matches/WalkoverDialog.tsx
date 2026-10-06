'use client'

import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'

interface WalkoverDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: (winnerId: string) => void
  teamA: { id: string; name: string }
  teamB: { id: string; name: string }
}

export function WalkoverDialog({ open, onClose, onConfirm, teamA, teamB }: WalkoverDialogProps) {
  const [selected, setSelected] = useState<string>('')

  function handleConfirm() {
    if (!selected) return
    onConfirm(selected)
    onClose()
    setSelected('')
  }

  const selectedName = selected === teamA.id ? teamA.name : selected === teamB.id ? teamB.name : ''

  return (
    <Modal open={open} onClose={onClose} title="Record Walkover" className="border-t-4 border-t-kitchen" data-testid="walkover-dialog">
      <p className="text-sm text-muted mb-4">Which team advances?</p>
      <div className="flex flex-col gap-3 mb-6">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="radio"
            name="walkover-winner"
            value={teamA.id}
            checked={selected === teamA.id}
            onChange={() => setSelected(teamA.id)}
            data-testid="walkover-teamA"
            className="accent-court"
          />
          <span className="text-net font-medium">{teamA.name}</span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="radio"
            name="walkover-winner"
            value={teamB.id}
            checked={selected === teamB.id}
            onChange={() => setSelected(teamB.id)}
            data-testid="walkover-teamB"
            className="accent-court"
          />
          <span className="text-net font-medium">{teamB.name}</span>
        </label>
      </div>
      {selectedName && (
        <p className="text-sm text-muted mb-4">
          {selectedName} advances by walkover. Any games entered for this match are removed.
        </p>
      )}
      <div className="flex justify-end gap-3">
        <Button variant="ghost" onClick={onClose} data-testid="walkover-cancel">
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleConfirm}
          disabled={!selected}
          data-testid="walkover-confirm"
        >
          Confirm Walkover
        </Button>
      </div>
    </Modal>
  )
}
