import { describe, it, expect, vi, beforeEach } from 'vitest'
import { announceEligibility, getPodium } from '../../src/lib/results'
import type { Tournament, Match } from '../../src/types'

vi.mock('../../src/lib/dates', () => ({
  todayLocalDate: vi.fn(() => '2026-06-15'),
  isOnOrAfter: (a: string, b: string) => a >= b,
  parseLocalDate: (d: string) => new Date(d),
}))

import { todayLocalDate } from '../../src/lib/dates'

function makeMatch(overrides: Partial<Match>): Match {
  return {
    id: 'match-1',
    round: 2,
    position: 0,
    type: 'Knockout',
    isBye: false,
    isWalkover: false,
    teamAId: 'team-001',
    teamBId: 'team-002',
    games: [{ teamA: 11, teamB: 7 }],
    winnerId: 'team-001',
    status: 'Completed',
    ...overrides,
  }
}

function makeTournament(overrides: Partial<Tournament> = {}): Tournament {
  const finalMatch = makeMatch({ id: 'final', round: 2, position: 0, type: 'Knockout', status: 'Completed', winnerId: 'team-001' })
  const thirdPlace = makeMatch({ id: 'third', round: 2, position: 1, type: 'ThirdPlace', status: 'Completed', winnerId: 'team-002' })
  return {
    id: 'tournament-test',
    name: 'Test Tournament',
    venue: 'Test Venue',
    startDate: '2026-06-10',
    endDate: '2026-06-15',
    pointsPerGame: 11,
    bestOf: 3,
    prizes: { champion: 10000, runnerUp: 5000, thirdPlace: 2000 },
    sponsors: [],
    teamIds: ['team-001', 'team-002', 'team-003', 'team-004'],
    status: 'Completed',
    matches: [finalMatch, thirdPlace],
    createdAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

describe('announceEligibility', () => {
  beforeEach(() => {
    vi.mocked(todayLocalDate).mockReturnValue('2026-06-15')
  })

  it('returns eligible when today >= endDate and both finals completed', () => {
    const t = makeTournament()
    const result = announceEligibility(t)
    expect(result.eligible).toBe(true)
    expect(result.reasons).toHaveLength(0)
  })

  it('returns "Available from {date}" when today < endDate', () => {
    vi.mocked(todayLocalDate).mockReturnValue('2026-06-14')
    const t = makeTournament({ endDate: '2026-06-15' })
    const result = announceEligibility(t)
    expect(result.eligible).toBe(false)
    expect(result.reasons).toContain('Available from 2026-06-15')
  })

  it('returns "Final not completed" when final not done', () => {
    const finalMatch = makeMatch({ id: 'final', round: 2, position: 0, type: 'Knockout', status: 'Scheduled', winnerId: undefined })
    const thirdPlace = makeMatch({ id: 'third', round: 2, position: 1, type: 'ThirdPlace', status: 'Completed', winnerId: 'team-002' })
    const t = makeTournament({ matches: [finalMatch, thirdPlace] })
    const result = announceEligibility(t)
    expect(result.eligible).toBe(false)
    expect(result.reasons).toContain('Final not completed')
  })

  it('returns "3rd Place match not completed" when 3rd place not done', () => {
    const finalMatch = makeMatch({ id: 'final', round: 2, position: 0, type: 'Knockout', status: 'Completed', winnerId: 'team-001' })
    const thirdPlace = makeMatch({ id: 'third', round: 2, position: 1, type: 'ThirdPlace', status: 'Scheduled', winnerId: undefined })
    const t = makeTournament({ matches: [finalMatch, thirdPlace] })
    const result = announceEligibility(t)
    expect(result.eligible).toBe(false)
    expect(result.reasons).toContain('3rd Place match not completed')
  })

  it('returns multiple reasons when both date and matches fail', () => {
    vi.mocked(todayLocalDate).mockReturnValue('2026-06-10')
    const finalMatch = makeMatch({ id: 'final', round: 2, position: 0, type: 'Knockout', status: 'Scheduled', winnerId: undefined })
    const thirdPlace = makeMatch({ id: 'third', round: 2, position: 1, type: 'ThirdPlace', status: 'Scheduled', winnerId: undefined })
    const t = makeTournament({ endDate: '2026-06-15', matches: [finalMatch, thirdPlace] })
    const result = announceEligibility(t)
    expect(result.eligible).toBe(false)
    expect(result.reasons.length).toBeGreaterThanOrEqual(2)
    expect(result.reasons).toContain('Available from 2026-06-15')
  })

  it('is eligible on the end date itself (inclusive)', () => {
    vi.mocked(todayLocalDate).mockReturnValue('2026-06-15')
    const t = makeTournament({ endDate: '2026-06-15' })
    const result = announceEligibility(t)
    expect(result.eligible).toBe(true)
  })
})

describe('getPodium', () => {
  it('returns null when no results', () => {
    const t = makeTournament({ results: undefined })
    expect(getPodium(t)).toBeNull()
  })

  it('returns podium with correct teamIds and prizes', () => {
    const t = makeTournament({
      results: {
        championId: 'team-001',
        runnerUpId: 'team-004',
        thirdPlaceId: 'team-002',
        announcedAt: '2026-06-15T18:00:00.000Z',
      },
    })
    const podium = getPodium(t)
    expect(podium).not.toBeNull()
    expect(podium!.champion.teamId).toBe('team-001')
    expect(podium!.champion.prize).toBe(10000)
    expect(podium!.runnerUp.teamId).toBe('team-004')
    expect(podium!.thirdPlace.teamId).toBe('team-002')
  })
})
