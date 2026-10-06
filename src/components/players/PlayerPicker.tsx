'use client'

import { useState, useId } from 'react'
import { User, Plus, X } from 'lucide-react'
import { usePlayerStore } from '@/store/usePlayerStore'
import { PlayerForm } from './PlayerForm'
import type { CreatePlayerInput } from '@/lib/schemas/player'
import { cn } from '@/lib/utils'

interface PendingPlayer {
  input: CreatePlayerInput
  tempId: string
}

interface PlayerPickerProps {
  value: string | null
  onChange: (playerId: string, pendingPlayer?: PendingPlayer) => void
  excludeId?: string
  label?: string
  error?: string
  'data-testid'?: string
}

export function PlayerPicker({
  value,
  onChange,
  excludeId,
  label,
  error,
  'data-testid': testId,
}: PlayerPickerProps) {
  const { players } = usePlayerStore()
  const [showInline, setShowInline] = useState(false)
  const [pendingPlayer, setPendingPlayer] = useState<PendingPlayer | null>(null)
  const selectId = useId()

  const available = players.filter((p) => p.id !== excludeId)

  function handleSelect(e: React.ChangeEvent<HTMLSelectElement>) {
    const id = e.target.value
    if (id === '__new__') {
      setShowInline(true)
    } else {
      setPendingPlayer(null)
      onChange(id)
    }
  }

  function handleInlineSubmit(input: CreatePlayerInput) {
    const tempId = `pending-${crypto.randomUUID()}`
    const pending: PendingPlayer = { input, tempId }
    setPendingPlayer(pending)
    setShowInline(false)
    onChange(tempId, pending)
  }

  function clearPending() {
    setPendingPlayer(null)
    onChange('')
  }

  const errorId = `${selectId}-error`

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={selectId} className="text-sm font-medium text-net">
          {label}
        </label>
      )}

      {pendingPlayer ? (
        <div className="flex items-center justify-between rounded-lg border border-court bg-surface px-3 py-2" data-testid={testId}>
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted" aria-hidden="true" />
            <span className="text-sm text-net">{pendingPlayer.input.name} · {pendingPlayer.input.place} · {pendingPlayer.input.level}</span>
            <span className="text-xs text-kitchen font-medium">(new — not saved yet)</span>
          </div>
          <button type="button" onClick={clearPending} aria-label="Remove player selection" className="text-muted hover:text-danger">
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      ) : (
        <select
          id={selectId}
          value={value ?? ''}
          onChange={handleSelect}
          aria-describedby={error ? errorId : undefined}
          aria-invalid={error ? true : undefined}
          className={cn(
            'w-full rounded-lg border border-muted bg-surface px-3 py-2 text-net',
            'focus:outline-none focus:ring-2 focus:ring-court focus:border-court',
            error && 'border-danger',
          )}
          data-testid={testId}
        >
          <option value="">Select a player…</option>
          {available.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} · {p.place} · {p.level}
            </option>
          ))}
          <option value="__new__">＋ Create new player</option>
        </select>
      )}

      {error && (
        <p id={errorId} className="text-xs text-danger" role="alert">
          {error}
        </p>
      )}

      {showInline && (
        <div className="mt-2 rounded-xl border border-court bg-surface p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-net flex items-center gap-1">
              <Plus className="h-4 w-4" aria-hidden="true" /> New Player
            </p>
            <button type="button" onClick={() => setShowInline(false)} aria-label="Cancel" className="text-muted hover:text-net">
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
          <PlayerForm onSubmit={handleInlineSubmit} submitLabel="Add Player" />
        </div>
      )}
    </div>
  )
}

export type { PendingPlayer }
