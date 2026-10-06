import type { Match, Tournament } from '@/types'
import { fisherYatesShuffle, getRng } from './rng'

export function bracketSize(teamCount: number): number {
  let size = 4
  while (size < teamCount) size *= 2
  return Math.min(size, 64)
}

export function roundCount(size: number): number {
  return Math.log2(size)
}

export function byeCount(size: number, teamCount: number): number {
  return size - teamCount
}

export function generateDraw(tournament: Tournament): Match[] {
  const { teamIds } = tournament
  const S = bracketSize(teamIds.length)
  const R = roundCount(S)
  const B = byeCount(S, teamIds.length)

  const rng = getRng()
  const shuffled = fisherYatesShuffle([...teamIds], rng)

  const firstRoundMatchCount = S / 2

  // Pick B different first-round match indices to be byes
  const byeIndices = new Set<number>()
  while (byeIndices.size < B) {
    byeIndices.add(Math.floor(rng() * firstRoundMatchCount))
  }

  const matches: Match[] = []
  let teamCursor = 0

  // Round 1
  for (let pos = 0; pos < firstRoundMatchCount; pos++) {
    if (byeIndices.has(pos)) {
      const teamId = shuffled[teamCursor++]
      matches.push({
        id: crypto.randomUUID(),
        round: 1,
        position: pos,
        type: 'Knockout',
        isBye: true,
        isWalkover: false,
        teamAId: teamId,
        teamBId: null,
        games: [],
        winnerId: teamId,
        status: 'Completed',
      })
    } else {
      const teamAId = shuffled[teamCursor++]
      const teamBId = shuffled[teamCursor++]
      matches.push({
        id: crypto.randomUUID(),
        round: 1,
        position: pos,
        type: 'Knockout',
        isBye: false,
        isWalkover: false,
        teamAId,
        teamBId,
        games: [],
        status: 'Scheduled',
      })
    }
  }

  // Rounds 2..R-1 (non-final knockout rounds)
  for (let round = 2; round < R; round++) {
    const matchCount = S / Math.pow(2, round)
    for (let pos = 0; pos < matchCount; pos++) {
      matches.push({
        id: crypto.randomUUID(),
        round,
        position: pos,
        type: 'Knockout',
        isBye: false,
        isWalkover: false,
        teamAId: null,
        teamBId: null,
        games: [],
        status: 'Scheduled',
      })
    }
  }

  // Final (round R, position 0)
  matches.push({
    id: crypto.randomUUID(),
    round: R,
    position: 0,
    type: 'Knockout',
    isBye: false,
    isWalkover: false,
    teamAId: null,
    teamBId: null,
    games: [],
    status: 'Scheduled',
  })

  // 3rd Place match (round R, position 1)
  matches.push({
    id: crypto.randomUUID(),
    round: R,
    position: 1,
    type: 'ThirdPlace',
    isBye: false,
    isWalkover: false,
    teamAId: null,
    teamBId: null,
    games: [],
    status: 'Scheduled',
  })

  // Auto-advance bye winners into round 2
  if (R > 1) {
    const round1Matches = matches.filter((m) => m.round === 1)
    const round2Matches = matches.filter((m) => m.round === 2)
    for (const byeMatch of round1Matches.filter((m) => m.isBye)) {
      const targetPos = Math.floor(byeMatch.position / 2)
      const target = round2Matches.find((m) => m.position === targetPos)
      if (target && byeMatch.winnerId) {
        if (byeMatch.position % 2 === 0) {
          target.teamAId = byeMatch.winnerId
        } else {
          target.teamBId = byeMatch.winnerId
        }
      }
    }
  }

  return matches
}

export function reshuffleDraw(tournament: Tournament): Match[] {
  return generateDraw(tournament)
}
