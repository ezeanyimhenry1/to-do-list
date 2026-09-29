import { describe, expect, it } from 'vitest'
import { bestStreak, computeStats, currentStreak } from './stats'
import type { Task } from '../types'

const NOW = new Date(2026, 8, 29, 12, 0, 0) // Tue Sep 29 2026 local

function mkTask(partial: Partial<Task>): Task {
  return {
    id: Math.random().toString(36).slice(2),
    title: 't',
    completed: false,
    createdAt: '2026-09-01T00:00:00.000Z',
    projectId: 'inbox',
    tags: [],
    ...partial,
  }
}

describe('currentStreak', () => {
  it('is zero with no completions', () => {
    expect(currentStreak([], NOW)).toBe(0)
  })

  it('counts consecutive days ending today', () => {
    const days = ['2026-09-29T10:00:00', '2026-09-28T10:00:00', '2026-09-27T10:00:00']
    expect(currentStreak(days, NOW)).toBe(3)
  })

  it('counts a streak ending yesterday when today has none yet', () => {
    const days = ['2026-09-28T10:00:00', '2026-09-27T10:00:00']
    expect(currentStreak(days, NOW)).toBe(2)
  })

  it('breaks at a gap', () => {
    const days = ['2026-09-29T10:00:00', '2026-09-27T10:00:00']
    expect(currentStreak(days, NOW)).toBe(1)
  })
})

describe('bestStreak', () => {
  it('finds the longest run across gaps', () => {
    const days = [
      '2026-01-01T10:00:00',
      '2026-01-02T10:00:00',
      '2026-01-03T10:00:00',
      '2026-01-10T10:00:00',
      '2026-01-11T10:00:00',
    ]
    expect(bestStreak(days)).toBe(3)
  })

  it('dedupes multiple completions in one day', () => {
    const days = ['2026-01-01T08:00:00', '2026-01-01T20:00:00', '2026-01-02T09:00:00']
    expect(bestStreak(days)).toBe(2)
  })
})

describe('computeStats', () => {
  it('tallies open, overdue, dueToday, week counts', () => {
    const tasks: Task[] = [
      mkTask({ title: 'overdue', dueDate: '2026-09-27' }),
      mkTask({ title: 'today', dueDate: '2026-09-29' }),
      mkTask({ title: 'future', dueDate: '2026-10-05' }),
      mkTask({ title: 'done today', completed: true, completedAt: '2026-09-29T09:00:00' }),
      mkTask({ title: 'done last week', completed: true, completedAt: '2026-09-20T09:00:00' }),
    ]
    const s = computeStats(tasks, NOW)
    expect(s.open).toBe(3)
    expect(s.overdue).toBe(1)
    expect(s.dueToday).toBe(1)
    expect(s.completedThisWeek).toBe(1)
    expect(s.total).toBe(5)
    expect(s.week).toHaveLength(7)
    expect(s.week[6].count).toBe(1) // today's completion
  })
})
