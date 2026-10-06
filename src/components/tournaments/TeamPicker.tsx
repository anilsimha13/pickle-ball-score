'use client'

import { useState } from 'react'
import { Plus, X, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useTeamStore } from '@/store/useTeamStore'
import { useTournamentStore } from '@/store/useTournamentStore'
import { useToast } from '@/components/ui/Toast'
import type { Tournament } from '@/types'

interface TeamPickerProps {
  tournament: Tournament
  readOnly?: boolean
}

export function TeamPicker({ tournament, readOnly = false }: TeamPickerProps) {
  const allTeams = useTeamStore((s) => s.teams)
  const { addTeamToTournament, removeTeamFromTournament } = useTournamentStore()
  const { toast } = useToast()
  const [addError, setAddError] = useState<string | null>(null)
  const [selectedTeamId, setSelectedTeamId] = useState('')

  const currentTeams = allTeams.filter((t) => tournament.teamIds.includes(t.id))
  const availableTeams = allTeams.filter((t) => !tournament.teamIds.includes(t.id))

  function handleAdd() {
    if (!selectedTeamId) return
    setAddError(null)
    try {
      addTeamToTournament(tournament.id, selectedTeamId)
      setSelectedTeamId('')
      toast('Team added', 'success')
    } catch (e) {
      setAddError(e instanceof Error ? e.message : 'Failed to add team')
    }
  }

  function handleRemove(teamId: string) {
    try {
      removeTeamFromTournament(tournament.id, teamId)
      toast('Team removed', 'success')
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Failed to remove team', 'error')
    }
  }

  return (
    <div className="space-y-4" data-testid="team-picker">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-net">
          Teams ({tournament.teamIds.length}/50 — minimum 4 to draw)
        </p>
      </div>

      {!readOnly && (
        <div className="flex gap-2">
          <select
            value={selectedTeamId}
            onChange={(e) => setSelectedTeamId(e.target.value)}
            className="flex-1 rounded-lg border border-muted bg-surface px-3 py-2 text-net focus:outline-none focus:ring-2 focus:ring-court"
            aria-label="Select team to add"
            data-testid="team-picker-select"
          >
            <option value="">Select a team to add…</option>
            {availableTeams.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleAdd}
            disabled={!selectedTeamId}
            data-testid="team-picker-add"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add
          </Button>
        </div>
      )}

      {addError && (
        <p className="flex items-center gap-1 text-sm text-danger" role="alert">
          <AlertCircle className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
          {addError}
        </p>
      )}

      {currentTeams.length === 0 ? (
        <p className="text-sm text-muted py-4 text-center">
          No teams added yet. Add at least 4 to generate the draw.
        </p>
      ) : (
        <ul className="divide-y divide-muted/30 rounded-lg border border-muted overflow-hidden">
          {currentTeams.map((team) => (
            <li
              key={team.id}
              className="flex items-center justify-between px-4 py-3 bg-surface"
              data-testid={`team-entry-${team.id}`}
            >
              <span className="text-sm font-medium text-net">{team.name}</span>
              {!readOnly && (
                <button
                  type="button"
                  onClick={() => handleRemove(team.id)}
                  aria-label={`Remove ${team.name}`}
                  className="text-danger hover:text-danger/80"
                  data-testid={`team-remove-${team.id}`}
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
