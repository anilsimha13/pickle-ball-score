import type { Player } from '@/lib/schemas/player'
import type { Team } from '@/lib/schemas/team'

export interface Tournament {
  id: string
  teamIds: string[]
  status: 'Draft' | 'Drawn' | 'InProgress' | 'Completed' | 'Announced'
}

export function isPlayerOnAnyTeam(playerId: string, teams: Team[]): boolean {
  return teams.some((t) => t.playerIds.includes(playerId))
}

export function isTeamInAnyTournament(teamId: string, tournaments: Tournament[]): boolean {
  return tournaments.some((t) => t.teamIds.includes(teamId))
}

export function hasDuplicatePair(
  p1: string,
  p2: string,
  teams: Team[],
  excludeId?: string,
): Team | null {
  return (
    teams.find((t) => {
      if (excludeId && t.id === excludeId) return false
      return (
        (t.playerIds[0] === p1 && t.playerIds[1] === p2) ||
        (t.playerIds[0] === p2 && t.playerIds[1] === p1)
      )
    }) ?? null
  )
}

export function hasSharedPlayer(
  teamIds: string[],
  teams: Team[],
  players: Player[],
): { teamA: Team; teamB: Team; player: Player } | null {
  const relevant = teams.filter((t) => teamIds.includes(t.id))
  for (let i = 0; i < relevant.length; i++) {
    for (let j = i + 1; j < relevant.length; j++) {
      const a = relevant[i]
      const b = relevant[j]
      const shared = a.playerIds.find((pid) => b.playerIds.includes(pid))
      if (shared) {
        const player = players.find((p) => p.id === shared)
        if (player) return { teamA: a, teamB: b, player }
      }
    }
  }
  return null
}
