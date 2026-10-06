import { describe, it, expect } from 'vitest'
import { advanceWinner, canEditCompletedMatch, getThirdPlaceMatch, getFinalMatch } from '../../src/lib/bracket'
import { generateDraw } from '../../src/lib/draw'
import type { Match, Tournament } from '../../src/lib/schemas/tournament'

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

function completeMatch(match: Match, winnerId: string): Match {
  return { ...match, status: 'Completed', winnerId }
}

describe('advanceWinner', () => {
  it('advances winner into next round slot (teamA side)', () => {
    // Use a 4-team bracket: r1p0 → r2p0(teamA), r1p1 → r2p0(teamB)
    const t = makeTournament(4)
    const matches = generateDraw(t)
    const r1p0 = matches.find((m) => m.round === 1 && m.position === 0 && !m.isBye)!
    const winner = r1p0.teamAId!
    const completed = completeMatch(r1p0, winner)
    const updated = advanceWinner(matches.map((m) => (m.id === completed.id ? completed : m)), completed)
    const final = getFinalMatch(updated)!
    expect(final.teamAId).toBe(winner)
  })

  it('advances winner into next round slot (teamB side)', () => {
    const t = makeTournament(4)
    const matches = generateDraw(t)
    const r1p1 = matches.find((m) => m.round === 1 && m.position === 1 && !m.isBye)!
    const winner = r1p1.teamBId!
    const completed = completeMatch(r1p1, winner)
    const updated = advanceWinner(matches.map((m) => (m.id === completed.id ? completed : m)), completed)
    const final = getFinalMatch(updated)!
    expect(final.teamBId).toBe(winner)
  })

  it('fills 3rd place match after both semi-finals complete', () => {
    const t = makeTournament(4)
    let matches = generateDraw(t)

    // Complete both round-1 matches (which are the semis in a 4-team bracket)
    const r1Matches = matches.filter((m) => m.round === 1 && !m.isBye)
    expect(r1Matches.length).toBe(2)

    const [semi1, semi2] = r1Matches
    const winner1 = semi1.teamAId!
    const loser1 = semi1.teamBId!
    const winner2 = semi2.teamBId!
    const loser2 = semi2.teamAId!

    const completed1 = completeMatch(semi1, winner1)
    matches = matches.map((m) => (m.id === completed1.id ? completed1 : m))
    matches = advanceWinner(matches, completed1)

    const completed2 = completeMatch(semi2, winner2)
    matches = matches.map((m) => (m.id === completed2.id ? completed2 : m))
    matches = advanceWinner(matches, completed2)

    const tp = getThirdPlaceMatch(matches)!
    expect([tp.teamAId, tp.teamBId]).toContain(loser1)
    expect([tp.teamAId, tp.teamBId]).toContain(loser2)
  })

  it('does not modify other matches when advancing', () => {
    const t = makeTournament(8)
    const matches = generateDraw(t)
    const r1p0 = matches.find((m) => m.round === 1 && m.position === 0 && !m.isBye)!
    const completed = completeMatch(r1p0, r1p0.teamAId!)
    const updated = advanceWinner(matches.map((m) => (m.id === completed.id ? completed : m)), completed)
    // All other round 1 matches unchanged
    for (const m of updated.filter((x) => x.round === 1 && x.id !== r1p0.id)) {
      const orig = matches.find((x) => x.id === m.id)!
      expect(m.teamAId).toBe(orig.teamAId)
      expect(m.teamBId).toBe(orig.teamBId)
    }
  })
})

describe('canEditCompletedMatch', () => {
  it('allows editing a completed first-round match when next round is clear', () => {
    const t = makeTournament(4)
    let matches = generateDraw(t)
    const r1p0 = matches.find((m) => m.round === 1 && m.position === 0 && !m.isBye)!
    // Complete r1p0
    const completed = completeMatch(r1p0, r1p0.teamAId!)
    matches = matches.map((m) => (m.id === completed.id ? completed : m))
    expect(canEditCompletedMatch(matches, completed.id)).toBe(true)
  })

  it('blocks editing a completed semi-final if Final has games', () => {
    const t = makeTournament(4)
    let matches = generateDraw(t)
    const semis = matches.filter((m) => m.round === 1 && !m.isBye)
    const [semi1, semi2] = semis

    const c1 = completeMatch(semi1, semi1.teamAId!)
    const c2 = completeMatch(semi2, semi2.teamAId!)
    matches = matches.map((m) => (m.id === c1.id ? c1 : m.id === c2.id ? c2 : m))
    matches = advanceWinner(matches, c1)
    matches = advanceWinner(matches, c2)

    // Add a game to the Final
    const final = getFinalMatch(matches)!
    matches = matches.map((m) =>
      m.id === final.id ? { ...m, games: [{ teamA: 11, teamB: 7 }] } : m,
    )

    expect(canEditCompletedMatch(matches, c1.id)).toBe(false)
  })

  it('blocks editing a completed semi-final if 3rd Place has games', () => {
    const t = makeTournament(4)
    let matches = generateDraw(t)
    const [semi1, semi2] = matches.filter((m) => m.round === 1 && !m.isBye)

    const c1 = completeMatch(semi1, semi1.teamAId!)
    const c2 = completeMatch(semi2, semi2.teamAId!)
    matches = matches.map((m) => (m.id === c1.id ? c1 : m.id === c2.id ? c2 : m))
    matches = advanceWinner(matches, c1)
    matches = advanceWinner(matches, c2)

    // Add game to 3rd Place
    const tp = getThirdPlaceMatch(matches)!
    matches = matches.map((m) =>
      m.id === tp.id ? { ...m, games: [{ teamA: 11, teamB: 9 }] } : m,
    )

    expect(canEditCompletedMatch(matches, c1.id)).toBe(false)
  })

  it('allows editing a completed semi-final when both Final and 3rd Place are clear', () => {
    const t = makeTournament(4)
    let matches = generateDraw(t)
    const [semi1, semi2] = matches.filter((m) => m.round === 1 && !m.isBye)

    const c1 = completeMatch(semi1, semi1.teamAId!)
    const c2 = completeMatch(semi2, semi2.teamAId!)
    matches = matches.map((m) => (m.id === c1.id ? c1 : m.id === c2.id ? c2 : m))

    // Final and 3rd Place have no games
    expect(canEditCompletedMatch(matches, c1.id)).toBe(true)
  })

  it('returns false for non-completed match', () => {
    const t = makeTournament(4)
    const matches = generateDraw(t)
    const scheduled = matches.find((m) => m.status === 'Scheduled')!
    expect(canEditCompletedMatch(matches, scheduled.id)).toBe(false)
  })
})
