import { describe, it, expect } from 'vitest'
import { bracketSize, byeCount, roundCount, generateDraw, reshuffleDraw } from '../../src/lib/draw'
import { roundName, matchesInRound, getThirdPlaceMatch, getFinalMatch } from '../../src/lib/bracket'
import type { Tournament } from '../../src/lib/schemas/tournament'

function makeTournament(teamCount: number): Tournament {
  const teamIds = Array.from({ length: teamCount }, (_, i) => `team-${String(i + 1).padStart(3, '0')}`)
  return {
    id: 'test-tournament',
    name: 'Test',
    venue: 'Test Venue',
    startDate: '2026-01-01',
    endDate: '2026-01-02',
    pointsPerGame: 11,
    bestOf: 1,
    prizes: { champion: 1000, runnerUp: 500, thirdPlace: 250 },
    sponsors: [],
    teamIds,
    status: 'Draft',
    matches: [],
    createdAt: new Date().toISOString(),
  }
}

describe('bracketSize', () => {
  it('returns 4 for 4 teams', () => expect(bracketSize(4)).toBe(4))
  it('returns 8 for 5 teams', () => expect(bracketSize(5)).toBe(8))
  it('returns 8 for 7 teams', () => expect(bracketSize(7)).toBe(8))
  it('returns 8 for 8 teams', () => expect(bracketSize(8)).toBe(8))
  it('returns 64 for 33 teams', () => expect(bracketSize(33)).toBe(64))
  it('returns 64 for 50 teams', () => expect(bracketSize(50)).toBe(64))
  it('returns 4 for 3 teams (edge, though min is 4 in practice)', () => expect(bracketSize(3)).toBe(4))
})

describe('byeCount', () => {
  it('returns 0 for 4 teams (bracket of 4)', () => expect(byeCount(4, 4)).toBe(0))
  it('returns 3 for 5 teams (bracket of 8)', () => expect(byeCount(8, 5)).toBe(3))
  it('returns 1 for 7 teams (bracket of 8)', () => expect(byeCount(8, 7)).toBe(1))
  it('returns 0 for 8 teams', () => expect(byeCount(8, 8)).toBe(0))
  it('returns 14 for 50 teams (bracket of 64)', () => expect(byeCount(64, 50)).toBe(14))
})

describe('roundCount', () => {
  it('returns 2 for bracket of 4', () => expect(roundCount(4)).toBe(2))
  it('returns 3 for bracket of 8', () => expect(roundCount(8)).toBe(3))
  it('returns 6 for bracket of 64', () => expect(roundCount(64)).toBe(6))
})

describe('generateDraw', () => {
  it('generates correct number of matches for 4 teams', () => {
    const t = makeTournament(4)
    const matches = generateDraw(t)
    // 4 teams → bracket of 4 → 2 rounds → 2 first-round + 1 final + 1 third-place = 4
    expect(matches.length).toBe(4)
  })

  it('generates correct number of matches for 5 teams', () => {
    const t = makeTournament(5)
    const matches = generateDraw(t)
    // bracket of 8 → 3 rounds → 4 + 2 + 1 + 1(3rd) = 8
    expect(matches.length).toBe(8)
  })

  it('generates correct number of matches for 8 teams', () => {
    const t = makeTournament(8)
    const matches = generateDraw(t)
    expect(matches.length).toBe(8)
  })

  it('generates correct number of matches for 50 teams', () => {
    const t = makeTournament(50)
    const matches = generateDraw(t)
    // bracket of 64 → 6 rounds → 32+16+8+4+2+1 = 63 + 1(3rd) = 64
    expect(matches.length).toBe(64)
  })

  it('never puts more than one bye in a first-round match', () => {
    for (const count of [5, 6, 7, 33, 50]) {
      const t = makeTournament(count)
      const matches = generateDraw(t)
      const round1 = matchesInRound(matches, 1)
      for (const m of round1) {
        // A match is a bye only when isBye=true; it has exactly one team
        if (m.isBye) {
          expect(m.teamBId).toBeNull()
        }
        // No match should have both isBye AND two teams
        expect(m.isBye && m.teamBId !== null).toBe(false)
      }
    }
  })

  it('first-round bye count matches expected bye count', () => {
    for (const count of [5, 7, 33, 50]) {
      const t = makeTournament(count)
      const S = bracketSize(count)
      const expectedByes = byeCount(S, count)
      const matches = generateDraw(t)
      const byeMatches = matchesInRound(matches, 1).filter((m) => m.isBye)
      expect(byeMatches.length).toBe(expectedByes)
    }
  })

  it('every first-round non-bye match has two real teams', () => {
    for (const count of [4, 5, 7, 8, 33, 50]) {
      const t = makeTournament(count)
      const matches = generateDraw(t)
      const round1NonBye = matchesInRound(matches, 1).filter((m) => !m.isBye)
      for (const m of round1NonBye) {
        expect(m.teamAId).not.toBeNull()
        expect(m.teamBId).not.toBeNull()
      }
    }
  })

  it('includes exactly one ThirdPlace match', () => {
    for (const count of [4, 8, 50]) {
      const t = makeTournament(count)
      const matches = generateDraw(t)
      const thirdPlaceMatches = matches.filter((m) => m.type === 'ThirdPlace')
      expect(thirdPlaceMatches.length).toBe(1)
    }
  })

  it('ThirdPlace match is at final round position 1', () => {
    const t = makeTournament(8)
    const matches = generateDraw(t)
    const S = bracketSize(8)
    const R = roundCount(S)
    const tp = getThirdPlaceMatch(matches)
    expect(tp).toBeDefined()
    expect(tp!.round).toBe(R)
    expect(tp!.position).toBe(1)
  })

  it('Final is at position 0 of the last round', () => {
    const t = makeTournament(8)
    const matches = generateDraw(t)
    const finalMatch = getFinalMatch(matches)
    expect(finalMatch).toBeDefined()
    expect(finalMatch!.position).toBe(0)
  })

  it('all team IDs appear exactly once in first-round matches', () => {
    const count = 8
    const t = makeTournament(count)
    const matches = generateDraw(t)
    const round1 = matchesInRound(matches, 1)
    const seenTeams: string[] = []
    for (const m of round1) {
      if (m.teamAId) seenTeams.push(m.teamAId)
      if (m.teamBId) seenTeams.push(m.teamBId)
    }
    expect(seenTeams.length).toBe(count)
    expect(new Set(seenTeams).size).toBe(count)
  })

  it('reshuffleDraw produces a valid bracket', () => {
    const t = makeTournament(8)
    const matches = reshuffleDraw(t)
    expect(matches.length).toBe(8)
    const tp = getThirdPlaceMatch(matches)
    expect(tp).toBeDefined()
  })
})

describe('roundName', () => {
  it('names Final correctly (round === totalRounds)', () => {
    expect(roundName(3, 3)).toBe('Final')
    expect(roundName(6, 6)).toBe('Final')
  })

  it('names Semifinal correctly', () => {
    expect(roundName(2, 3)).toBe('Semifinal')
    expect(roundName(5, 6)).toBe('Semifinal')
  })

  it('names Quarterfinal correctly', () => {
    expect(roundName(1, 3)).toBe('Quarterfinal') // 3-round bracket: round 1 = QF
    expect(roundName(4, 6)).toBe('Quarterfinal')
  })

  it('names Round of 16 correctly', () => {
    // In a 4-round bracket (16 teams): round 1 → Round of 16
    // totalRounds = 4, round = 1: remaining = 2^(4-1+1) = 2^4 = 16
    expect(roundName(1, 4)).toBe('Round of 16')
  })

  it('names Round of 32 correctly', () => {
    expect(roundName(1, 5)).toBe('Round of 32')
  })

  it('names Round of 64 correctly (6-round bracket)', () => {
    expect(roundName(1, 6)).toBe('Round of 64')
  })
})
