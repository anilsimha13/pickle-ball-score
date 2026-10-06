import { describe, it, expect } from 'vitest'
import { computeStandings, teamRecord } from '../../src/lib/standings'
import type { Match } from '../../src/lib/schemas/tournament'
import type { Team } from '../../src/lib/schemas/team'
import type { Tournament } from '../../src/lib/schemas/tournament'

const makeTeam = (id: string, name: string): Team => ({
  id, name, playerIds: ['p1', 'p2'] as [string, string], createdAt: '2026-01-01T00:00:00Z',
})

const makeMatch = (overrides: Partial<Match>): Match => ({
  id: 'default',
  round: 1,
  position: 0,
  type: 'Knockout',
  isBye: false,
  isWalkover: false,
  teamAId: null,
  teamBId: null,
  games: [],
  winnerId: undefined,
  status: 'Scheduled',
  ...overrides,
})

describe('computeStandings', () => {
  const teams = [
    makeTeam('t1', 'Alpha'),
    makeTeam('t2', 'Beta'),
    makeTeam('t3', 'Gamma'),
  ]

  it('excludes bye matches', () => {
    const matches: Match[] = [
      makeMatch({ id: 'm1', isBye: true, teamAId: 't1', teamBId: null, winnerId: 't1', status: 'Completed' }),
    ]
    const s = computeStandings(matches, ['t1', 't2', 't3'], teams)
    const t1 = s.find((x) => x.teamId === 't1')!
    expect(t1.played).toBe(0)
    expect(t1.won).toBe(0)
  })

  it('counts walkover as played/won/lost but no points', () => {
    const matches: Match[] = [
      makeMatch({ id: 'm1', isWalkover: true, teamAId: 't1', teamBId: 't2', winnerId: 't1', status: 'Completed' }),
    ]
    const s = computeStandings(matches, ['t1', 't2', 't3'], teams)
    const t1 = s.find((x) => x.teamId === 't1')!
    const t2 = s.find((x) => x.teamId === 't2')!
    expect(t1.played).toBe(1)
    expect(t1.won).toBe(1)
    expect(t1.pointsFor).toBe(0)
    expect(t2.played).toBe(1)
    expect(t2.lost).toBe(1)
    expect(t2.pointsFor).toBe(0)
  })

  it('accumulates game points correctly', () => {
    const matches: Match[] = [
      makeMatch({
        id: 'm1',
        teamAId: 't1', teamBId: 't2',
        games: [{ teamA: 11, teamB: 7 }, { teamA: 9, teamB: 11 }, { teamA: 11, teamB: 8 }],
        winnerId: 't1', status: 'Completed',
      }),
    ]
    const s = computeStandings(matches, ['t1', 't2', 't3'], teams)
    const t1 = s.find((x) => x.teamId === 't1')!
    const t2 = s.find((x) => x.teamId === 't2')!
    expect(t1.pointsFor).toBe(31)  // 11+9+11
    expect(t1.pointsAgainst).toBe(26) // 7+11+8
    expect(t1.diff).toBe(5)
    expect(t2.pointsFor).toBe(26)
    expect(t2.pointsAgainst).toBe(31)
    expect(t2.diff).toBe(-5)
  })

  it('sorts by wins descending', () => {
    const matches: Match[] = [
      makeMatch({ id: 'm1', teamAId: 't1', teamBId: 't2', games: [{ teamA: 11, teamB: 7 }], winnerId: 't1', status: 'Completed' }),
      makeMatch({ id: 'm2', teamAId: 't3', teamBId: 't2', games: [{ teamA: 11, teamB: 5 }], winnerId: 't3', status: 'Completed', round: 2, position: 0 }),
    ]
    const s = computeStandings(matches, ['t1', 't2', 't3'], teams)
    // t1 and t3 each have 1 win; t2 has 0. Both t1 and t3 before t2.
    expect(s[0].teamId).not.toBe('t2')
    expect(s[1].teamId).not.toBe('t2')
    expect(s[2].teamId).toBe('t2')
  })

  it('breaks ties by team name A-Z', () => {
    // All teams have 0 wins, 0 diff — sort alphabetically
    const s = computeStandings([], ['t1', 't2', 't3'], teams)
    expect(s[0].teamId).toBe('t1') // Alpha
    expect(s[1].teamId).toBe('t2') // Beta
    expect(s[2].teamId).toBe('t3') // Gamma
  })
})

describe('teamRecord', () => {
  const makeTournament = (matches: Match[]): Tournament => ({
    id: 'T1',
    name: 'Test',
    venue: 'Test Venue',
    startDate: '2026-01-01',
    endDate: '2026-01-02',
    pointsPerGame: 11,
    bestOf: 3,
    prizes: { champion: 1000, runnerUp: 500, thirdPlace: 250 },
    sponsors: [],
    teamIds: ['t1', 't2'],
    status: 'Completed',
    matches,
    createdAt: '2026-01-01T00:00:00Z',
  })

  it('counts wins and losses across tournaments', () => {
    const t1 = makeTournament([
      makeMatch({ id: 'm1', teamAId: 'team-x', teamBId: 'team-y', winnerId: 'team-x', status: 'Completed' }),
    ])
    const t2 = makeTournament([
      makeMatch({ id: 'm2', teamAId: 'team-x', teamBId: 'team-z', winnerId: 'team-z', status: 'Completed' }),
    ])
    const r = teamRecord('team-x', [t1, t2])
    expect(r.won).toBe(1)
    expect(r.lost).toBe(1)
    expect(r.played).toBe(2)
  })

  it('ignores bye matches', () => {
    const t1 = makeTournament([
      makeMatch({ id: 'm1', isBye: true, teamAId: 'team-x', teamBId: null, winnerId: 'team-x', status: 'Completed' }),
    ])
    const r = teamRecord('team-x', [t1])
    expect(r.played).toBe(0)
  })

  it('returns zeros when no tournaments', () => {
    const r = teamRecord('team-x', [])
    expect(r).toEqual({ won: 0, lost: 0, played: 0 })
  })
})
