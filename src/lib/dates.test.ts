import { describe, expect, it } from 'vitest'
import {
  formatDue,
  isOverdue,
  lastNDays,
  parseISODate,
  startOfWeekMonday,
  toISODate,
} from './dates'

const NOW = new Date(2026, 8, 29, 15, 0, 0) // Tue Sep 29 2026

describe('toISODate / todayISO', () => {
  it('formats local dates without UTC shifting', () => {
    const d = new Date(2026, 0, 5, 23, 59)
    expect(toISODate(d)).toBe('2026-01-05')
  })
})

describe('parseISODate', () => {
  it('parses as local midnight', () => {
    const d = parseISODate('2026-03-09')
    expect(d.getFullYear()).toBe(2026)
    expect(d.getMonth()).toBe(2)
    expect(d.getDate()).toBe(9)
    expect(d.getHours()).toBe(0)
  })
})

describe('isOverdue', () => {
  it('is true for past dates, false for today/future', () => {
    expect(isOverdue('2026-09-28', NOW)).toBe(true)
    expect(isOverdue('2026-09-29', NOW)).toBe(false)
    expect(isOverdue('2026-09-30', NOW)).toBe(false)
  })
})

describe('formatDue', () => {
  it('uses friendly names for today/tomorrow/yesterday', () => {
    expect(formatDue('2026-09-29', NOW)).toBe('Today')
    expect(formatDue('2026-09-30', NOW)).toBe('Tomorrow')
    expect(formatDue('2026-09-28', NOW)).toBe('Yesterday')
  })

  it('shows overdue distance', () => {
    expect(formatDue('2026-09-25', NOW)).toBe('4d overdue')
  })

  it('shows weekday within the week and date beyond', () => {
    expect(formatDue('2026-10-02', NOW)).toBe('Friday')
    expect(formatDue('2026-10-29', NOW)).toBe('Oct 29')
  })
})

describe('lastNDays', () => {
  it('returns n days ending today, oldest first', () => {
    const days = lastNDays(7, NOW)
    expect(days).toHaveLength(7)
    expect(toISODate(days[0])).toBe('2026-09-23')
    expect(toISODate(days[6])).toBe('2026-09-29')
  })
})

describe('startOfWeekMonday', () => {
  it('returns the Monday of the current week', () => {
    // Tue Sep 29 2026 -> Mon Sep 28
    expect(toISODate(startOfWeekMonday(NOW))).toBe('2026-09-28')
    // Sunday Sep 27 2026 belongs to the previous week (Mon Sep 21)
    const sunday = new Date(2026, 8, 27)
    expect(toISODate(startOfWeekMonday(sunday))).toBe('2026-09-21')
  })
})
