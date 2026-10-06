import { describe, it, expect } from 'vitest'
import { isOnOrAfter, parseLocalDate } from '../../src/lib/dates'

describe('isOnOrAfter', () => {
  it('returns true when dates are equal', () => {
    expect(isOnOrAfter('2026-06-15', '2026-06-15')).toBe(true)
  })

  it('returns true when a is after b', () => {
    expect(isOnOrAfter('2026-06-16', '2026-06-15')).toBe(true)
    expect(isOnOrAfter('2026-07-01', '2026-06-15')).toBe(true)
    expect(isOnOrAfter('2027-01-01', '2026-12-31')).toBe(true)
  })

  it('returns false when a is before b', () => {
    expect(isOnOrAfter('2026-06-14', '2026-06-15')).toBe(false)
    expect(isOnOrAfter('2026-05-31', '2026-06-01')).toBe(false)
    expect(isOnOrAfter('2025-12-31', '2026-01-01')).toBe(false)
  })
})

describe('parseLocalDate', () => {
  it('parses to a Date object', () => {
    const d = parseLocalDate('2026-06-15')
    expect(d).toBeInstanceOf(Date)
  })

  it('sets year, month and day in local time', () => {
    const d = parseLocalDate('2026-06-15')
    expect(d.getFullYear()).toBe(2026)
    expect(d.getMonth()).toBe(5) // 0-indexed
    expect(d.getDate()).toBe(15)
  })

  it('sets time to midnight (00:00:00)', () => {
    const d = parseLocalDate('2026-01-01')
    expect(d.getHours()).toBe(0)
    expect(d.getMinutes()).toBe(0)
    expect(d.getSeconds()).toBe(0)
  })
})
