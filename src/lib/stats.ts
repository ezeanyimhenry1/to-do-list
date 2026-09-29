import { differenceInCalendarDays, startOfDay } from 'date-fns'
import type { Task } from '../types'
import { dayInitial, isOverdue, lastNDays, parseISODate, toISODate, todayISO } from './dates'

export interface StatsSummary {
  open: number
  overdue: number
  dueToday: number
  completedThisWeek: number
  total: number
  currentStreak: number
  bestStreak: number
  /** completed count per day for the last 7 days, oldest first */
  week: { date: string; label: string; count: number }[]
}

/**
 * Current streak: consecutive days ending today (or yesterday, if nothing
 * completed yet today) with at least one completion.
 */
export function currentStreak(completedAts: string[], now: Date = new Date()): number {
  if (completedAts.length === 0) return 0
  const days = new Set(completedAts.map((iso) => toISODate(new Date(iso))))
  const today = startOfDay(now)
  let cursor = days.has(toISODate(today)) ? today : startOfDay(new Date(now.getTime() - 86400000))
  if (!days.has(toISODate(cursor))) return 0
  let streak = 0
  while (days.has(toISODate(cursor))) {
    streak++
    cursor = startOfDay(new Date(cursor.getTime() - 86400000))
  }
  return streak
}

export function bestStreak(completedAts: string[]): number {
  if (completedAts.length === 0) return 0
  const sorted = [...completedAts].map((iso) => toISODate(new Date(iso))).sort()
  const unique = [...new Set(sorted)]
  let best = 1
  let run = 1
  for (let i = 1; i < unique.length; i++) {
    const prev = parseISODate(unique[i - 1])
    const curr = parseISODate(unique[i])
    if (differenceInCalendarDays(curr, prev) === 1) {
      run++
      best = Math.max(best, run)
    } else {
      run = 1
    }
  }
  return best
}

export function computeStats(tasks: Task[], now: Date = new Date()): StatsSummary {
  const today = todayISO()
  const openTasks = tasks.filter((t) => !t.completed)
  const completed = tasks.filter((t) => t.completed && t.completedAt)
  const completedAts = completed.map((t) => t.completedAt as string)

  const days = lastNDays(7, now)
  const week = days.map((d) => {
    const iso = toISODate(d)
    return {
      date: iso,
      label: dayInitial(d),
      count: completedAts.filter((c) => toISODate(new Date(c)) === iso).length,
    }
  })

  const monday = days[0]
  const completedThisWeek = completedAts.filter((c) => {
    const d = new Date(c)
    return d >= monday && d <= now
  }).length

  return {
    open: openTasks.length,
    overdue: openTasks.filter((t) => t.dueDate && isOverdue(t.dueDate, now)).length,
    dueToday: openTasks.filter((t) => t.dueDate === today).length,
    completedThisWeek,
    total: tasks.length,
    currentStreak: currentStreak(completedAts, now),
    bestStreak: bestStreak(completedAts),
    week,
  }
}
