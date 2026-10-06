import { describe, it, expect } from 'vitest'
import { validateGameScore, validateGames, determineWinner, matchStatus } from '../../src/lib/scoring'

describe('validateGameScore (pointsPerGame=11)', () => {
  it('accepts 11–9 (normal win)', () => expect(validateGameScore(11, 9, 11, 0)).toBeNull())
  it('accepts 9–11', () => expect(validateGameScore(9, 11, 11, 0)).toBeNull())
  it('accepts 13–11 (deuce win)', () => expect(validateGameScore(13, 11, 11, 0)).toBeNull())
  it('accepts 11–0', () => expect(validateGameScore(11, 0, 11, 0)).toBeNull())
  it('rejects 11–10 (not win by 2 at T)', () => expect(validateGameScore(11, 10, 11, 0)).toContain('win by 2'))
  it('rejects 14–11 (above T, not win by 2)', () => expect(validateGameScore(14, 11, 11, 0)).toContain('win by 2'))
  it('rejects 12–9 (above T but not deuce)', () => expect(validateGameScore(12, 9, 11, 0)).toContain('win by 2'))
  it('rejects 10–10 (tied)', () => expect(validateGameScore(10, 10, 11, 0)).toContain("can't be tied"))
  it('rejects 11–11 (tied)', () => expect(validateGameScore(11, 11, 11, 0)).toContain("can't be tied"))
  it('includes game number in message (1-based)', () => {
    const err = validateGameScore(11, 10, 11, 2)
    expect(err).toContain('Game 3')
  })
})

describe('validateGameScore (pointsPerGame=15)', () => {
  it('accepts 15–13', () => expect(validateGameScore(15, 13, 15, 0)).toBeNull())
  it('accepts 17–15 (deuce)', () => expect(validateGameScore(17, 15, 15, 0)).toBeNull())
  it('rejects 15–14', () => expect(validateGameScore(15, 14, 15, 0)).toContain('win by 2'))
  it('rejects 15–15 (tied)', () => expect(validateGameScore(15, 15, 15, 0)).toContain("can't be tied"))
})

describe('validateGameScore (pointsPerGame=21)', () => {
  it('accepts 21–19', () => expect(validateGameScore(21, 19, 21, 0)).toBeNull())
  it('accepts 23–21 (deuce)', () => expect(validateGameScore(23, 21, 21, 0)).toBeNull())
  it('rejects 21–20', () => expect(validateGameScore(21, 20, 21, 0)).toContain('win by 2'))
})

describe('validateGames bestOf:1', () => {
  it('accepts exactly 1 valid game', () => {
    expect(validateGames([{ teamA: 11, teamB: 7 }], 11, 1)).toEqual([])
  })
  it('rejects 2 games', () => {
    const errs = validateGames([{ teamA: 11, teamB: 7 }, { teamA: 11, teamB: 5 }], 11, 1)
    expect(errs).toContain('This match is already decided — remove the extra game.')
  })
})

describe('validateGames bestOf:3', () => {
  it('accepts 2 games with a 2-0 winner', () => {
    const errs = validateGames([{ teamA: 11, teamB: 7 }, { teamA: 11, teamB: 5 }], 11, 3)
    expect(errs).toEqual([])
  })
  it('accepts 3 games at 1-1', () => {
    const errs = validateGames(
      [{ teamA: 11, teamB: 7 }, { teamA: 5, teamB: 11 }, { teamA: 11, teamB: 8 }],
      11, 3,
    )
    expect(errs).toEqual([])
  })
  it('rejects 3rd game when already 2-0', () => {
    const errs = validateGames(
      [{ teamA: 11, teamB: 7 }, { teamA: 11, teamB: 5 }, { teamA: 11, teamB: 3 }],
      11, 3,
    )
    expect(errs).toContain('This match is already decided — remove the extra game.')
  })
  it('rejects more than 3 games', () => {
    const errs = validateGames(
      [{ teamA: 11, teamB: 7 }, { teamA: 5, teamB: 11 }, { teamA: 11, teamB: 8 }, { teamA: 11, teamB: 3 }],
      11, 3,
    )
    expect(errs).toContain('This match is already decided — remove the extra game.')
  })
  it('returns per-game errors alongside bestOf errors', () => {
    // invalid score + too many games
    const errs = validateGames(
      [{ teamA: 11, teamB: 7 }, { teamA: 11, teamB: 5 }, { teamA: 11, teamB: 10 }],
      11, 3,
    )
    expect(errs.some((e) => e.includes('Game 3'))).toBe(true)
    expect(errs.some((e) => e.includes('already decided'))).toBe(true)
  })
})

describe('determineWinner', () => {
  const A = 'team-A'
  const B = 'team-B'

  it('returns A after 2-0 in bestOf 3', () => {
    expect(determineWinner([{ teamA: 11, teamB: 7 }, { teamA: 11, teamB: 5 }], A, B, 3)).toBe(A)
  })
  it('returns B after 0-2 in bestOf 3', () => {
    expect(determineWinner([{ teamA: 7, teamB: 11 }, { teamA: 5, teamB: 11 }], A, B, 3)).toBe(B)
  })
  it('returns A after 2-1 in bestOf 3', () => {
    expect(determineWinner([{ teamA: 11, teamB: 7 }, { teamA: 5, teamB: 11 }, { teamA: 11, teamB: 8 }], A, B, 3)).toBe(A)
  })
  it('returns null at 1-1 (not decided)', () => {
    expect(determineWinner([{ teamA: 11, teamB: 7 }, { teamA: 5, teamB: 11 }], A, B, 3)).toBeNull()
  })
  it('returns A after win in bestOf 1', () => {
    expect(determineWinner([{ teamA: 11, teamB: 7 }], A, B, 1)).toBe(A)
  })
  it('returns null for empty games', () => {
    expect(determineWinner([], A, B, 3)).toBeNull()
  })
})

describe('matchStatus', () => {
  it('Scheduled when no games', () => expect(matchStatus([], 3)).toBe('Scheduled'))
  it('Live when in progress', () => {
    expect(matchStatus([{ teamA: 11, teamB: 7 }], 3)).toBe('Live')
  })
  it('Completed when 2-0', () => {
    expect(matchStatus([{ teamA: 11, teamB: 7 }, { teamA: 11, teamB: 5 }], 3)).toBe('Completed')
  })
  it('Completed for bestOf 1 with 1 game', () => {
    expect(matchStatus([{ teamA: 11, teamB: 7 }], 1)).toBe('Completed')
  })
})
