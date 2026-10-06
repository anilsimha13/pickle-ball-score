'use client'

import { useRef } from 'react'
import { Upload } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { importData } from '@/lib/backup'
import { usePlayerStore } from '@/store/usePlayerStore'
import { useTeamStore } from '@/store/useTeamStore'
import { useTournamentStore } from '@/store/useTournamentStore'
import { useContactStore } from '@/store/useContactStore'
import type { Tournament } from '@/types'

export function ImportButton() {
  const fileRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const players = usePlayerStore((s) => s.players)
  const setPlayers = usePlayerStore((s) => s.setPlayers)
  const teams = useTeamStore((s) => s.teams)
  const setTeams = useTeamStore((s) => s.setTeams)
  const tournaments = useTournamentStore((s) => s.tournaments)
  const setTournaments = useTournamentStore((s) => s.setTournaments)
  const messages = useContactStore((s) => s.messages)
  const setMessages = useContactStore((s) => s.setMessages)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    // Reset input so the same file can be re-selected
    e.target.value = ''

    try {
      const json = await file.text()
      const result = importData(json, { players, teams, tournaments, messages })
      setPlayers(result.players)
      setTeams(result.teams)
      setTournaments(result.tournaments as Tournament[])
      setMessages(result.messages)
      const total = result.added + result.updated
      toast(
        `Imported ${total} records (${result.added} added, ${result.updated} updated).`,
        'success',
      )
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Import failed.'
      toast(msg, 'error')
    }
  }

  return (
    <>
      <input
        ref={fileRef}
        type="file"
        accept=".json"
        className="hidden"
        onChange={handleFile}
        data-testid="import-file-input"
        aria-label="Import backup file"
      />
      <Button
        variant="secondary"
        onClick={() => fileRef.current?.click()}
        data-testid="import-btn"
      >
        <Upload className="h-4 w-4" aria-hidden="true" />
        Import Data
      </Button>
    </>
  )
}
