import type { Match, Tournament } from '@/types'
import type { Team } from '@/lib/schemas/team'

export interface TeamStanding {
  teamId: string
  played: number
  won: number
  lost: number
  pointsFor: number
  pointsAgainst: number
  diff: number
}

export function computeStandings(
  matches: Match[],
  teamIds: string[],
  teams: Team[],
): TeamStanding[] {
  const map = new Map<string, TeamStanding>()
  for (const id of teamIds) {
    map.set(id, { teamId: id, played: 0, won: 0, lost: 0, pointsFor: 0, pointsAgainst: 0, diff: 0 })
  }

  for (const m of matches) {
    if (m.isBye) continue
    if (m.status !== 'Completed' || !m.winnerId) continue
    if (!m.teamAId || !m.teamBId) continue

    const a = map.get(m.teamAId)
    const b = map.get(m.teamBId)

    if (a) {
      a.played++
      if (m.winnerId === m.teamAId) a.won++
      else a.lost++
    }
    if (b) {
      b.played++
      if (m.winnerId === m.teamBId) b.won++
      else b.lost++
    }

    // Walkovers add no points
    if (m.isWalkover) continue

    for (const g of m.games) {
      if (a) { a.pointsFor += g.teamA; a.pointsAgainst += g.teamB }
      if (b) { b.pointsFor += g.teamB; b.pointsAgainst += g.teamA }
    }
  }

  for (const s of map.values()) {
    s.diff = s.pointsFor - s.pointsAgainst
  }

  const teamNameMap = new Map(teams.map((t) => [t.id, t.name]))

  return [...map.values()].sort((a, b) => {
    if (b.won !== a.won) return b.won - a.won
    if (b.diff !== a.diff) return b.diff - a.diff
    if (b.pointsFor !== a.pointsFor) return b.pointsFor - a.pointsFor
    return (teamNameMap.get(a.teamId) ?? '').localeCompare(teamNameMap.get(b.teamId) ?? '')
  })
}

export function teamRecord(
  teamId: string,
  allTournaments: Tournament[],
): { won: number; lost: number; played: number } {
  let won = 0
  let lost = 0
  let played = 0

  for (const t of allTournaments) {
    for (const m of t.matches) {
      if (m.isBye) continue
      if (m.status !== 'Completed' || !m.winnerId) continue
      if (m.teamAId !== teamId && m.teamBId !== teamId) continue
      played++
      if (m.winnerId === teamId) won++
      else lost++
    }
  }

  return { won, lost, played }
}
