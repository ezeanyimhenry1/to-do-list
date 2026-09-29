import { describe, expect, it } from 'vitest'
import { describeRecurrence, nextDueISO } from './recurrence'

describe('nextDueISO', () => {
  it('advances daily by interval', () => {
    expect(nextDueISO('2026-01-01', { freq: 'daily', interval: 1 })).toBe('2026-01-02')
    expect(nextDueISO('2026-01-01', { freq: 'daily', interval: 3 })).toBe('2026-01-04')
  })

  it('advances weekly by 7*n days', () => {
    expect(nextDueISO('2026-01-01', { freq: 'weekly', interval: 1 })).toBe('2026-01-08')
    expect(nextDueISO('2026-01-01', { freq: 'weekly', interval: 2 })).toBe('2026-01-15')
  })

  it('advances yearly', () => {
    expect(nextDueISO('2026-01-01', { freq: 'yearly', interval: 1 })).toBe('2027-01-01')
  })

  it('clamps monthly end-of-month: Jan 31 -> Feb 28 (2026, non-leap)', () => {
    expect(nextDueISO('2026-01-31', { freq: 'monthly', interval: 1 })).toBe('2026-02-28')
  })

  it('clamps monthly end-of-month: Jan 31 -> Feb 29 (2028, leap)', () => {
    expect(nextDueISO('2028-01-31', { freq: 'monthly', interval: 1 })).toBe('2028-02-29')
  })

  it('keeps day-of-month when it fits: Jan 15 -> Feb 15', () => {
    expect(nextDueISO('2026-01-15', { freq: 'monthly', interval: 1 })).toBe('2026-02-15')
  })

  it('falls back to today when no due date', () => {
    const from = new Date(2026, 5, 10) // Jun 10 2026 local
    expect(nextDueISO(undefined, { freq: 'daily', interval: 1 }, from)).toBe('2026-06-11')
  })
})

describe('describeRecurrence', () => {
  it('renders singular and plural forms', () => {
    expect(describeRecurrence({ freq: 'daily', interval: 1 })).toBe('Every day')
    expect(describeRecurrence({ freq: 'weekly', interval: 2 })).toBe('Every 2 weeks')
    expect(describeRecurrence({ freq: 'monthly', interval: 3 })).toBe('Every 3 months')
    expect(describeRecurrence({ freq: 'yearly', interval: 2 })).toBe('Every 2 years')
  })
})
