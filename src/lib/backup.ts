import { z } from 'zod'
import { playerSchema, type Player } from '@/lib/schemas/player'
import { teamSchema, type Team } from '@/lib/schemas/team'
import { contactMessageSchema, type ContactMessage } from '@/lib/schemas/contact'

// Use z.any() for tournaments until the full schema is available in Phase 4
const anyTournamentSchema = z.any()

export const backupSchema = z.object({
  schemaVersion: z.literal(1),
  exportedAt: z.string(),
  players: z.array(playerSchema),
  teams: z.array(teamSchema),
  tournaments: z.array(anyTournamentSchema),
  contactMessages: z.array(contactMessageSchema),
})

export type Backup = z.infer<typeof backupSchema>

interface CurrentState {
  players: Player[]
  teams: Team[]
  tournaments: unknown[]
  messages: ContactMessage[]
}

export function exportData(state: CurrentState): string {
  const backup: Backup = {
    schemaVersion: 1,
    exportedAt: new Date().toISOString(),
    players: state.players,
    teams: state.teams,
    tournaments: state.tournaments,
    contactMessages: state.messages,
  }
  return JSON.stringify(backup, null, 2)
}

export interface ImportResult {
  players: Player[]
  teams: Team[]
  tournaments: unknown[]
  messages: ContactMessage[]
  added: number
  updated: number
}

export function importData(json: string, currentState: CurrentState): ImportResult {
  let parsed: unknown
  try {
    parsed = JSON.parse(json)
  } catch {
    throw new Error("This file isn't a valid Pickle Ball Score backup.")
  }

  const result = backupSchema.safeParse(parsed)
  if (!result.success) {
    throw new Error("This file isn't a valid Pickle Ball Score backup.")
  }

  const backup = result.data

  // Merge by id — imported record replaces existing
  let added = 0
  let updated = 0

  function mergeById<T extends { id: string }>(existing: T[], incoming: T[]): T[] {
    const map = new Map(existing.map((r) => [r.id, r]))
    for (const item of incoming) {
      if (map.has(item.id)) {
        updated++
      } else {
        added++
      }
      map.set(item.id, item)
    }
    return Array.from(map.values())
  }

  const mergedPlayers = mergeById(currentState.players, backup.players)
  const mergedTeams = mergeById(
    currentState.teams as Team[],
    backup.teams,
  )
  const mergedMessages = mergeById(currentState.messages, backup.contactMessages)
  const mergedTournaments = mergeById(
    currentState.tournaments as { id: string }[],
    backup.tournaments as { id: string }[],
  )

  // Integrity checks
  const errors: string[] = []

  // Unique team names (case-insensitive)
  const teamNames = mergedTeams.map((t) => t.name.trim().toLowerCase())
  const duplicateNames = teamNames.filter((n, i) => teamNames.indexOf(n) !== i)
  if (duplicateNames.length > 0) {
    errors.push(`Duplicate team name(s): ${[...new Set(duplicateNames)].join(', ')}`)
  }

  // No duplicate player pairs in teams
  const seenPairs = new Set<string>()
  for (const team of mergedTeams) {
    const [p1, p2] = [...team.playerIds].sort()
    const pairKey = `${p1}:${p2}`
    if (seenPairs.has(pairKey)) {
      errors.push(`Duplicate player pair in team "${team.name}"`)
    }
    seenPairs.add(pairKey)
  }

  if (errors.length > 0) {
    throw new Error(errors.join('\n'))
  }

  return {
    players: mergedPlayers,
    teams: mergedTeams,
    tournaments: mergedTournaments,
    messages: mergedMessages,
    added,
    updated,
  }
}
