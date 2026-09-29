import { addDays, addMonths, addYears, getDate, getDaysInMonth, setDate } from 'date-fns'
import type { Recurrence } from '../types'
import { parseISODate, toISODate } from './dates'

/**
 * Next occurrence after a completion. Uses the task's due date when present
 * (so schedules stay anchored), otherwise advances from `from` (today).
 */
export function nextDueISO(
  currentDue: string | undefined,
  rec: Recurrence,
  from: Date = new Date(),
): string {
  const base = currentDue ? parseISODate(currentDue) : from
  const n = Math.max(1, rec.interval)

  switch (rec.freq) {
    case 'daily':
      return toISODate(addDays(base, n))
    case 'weekly':
      return toISODate(addDays(base, 7 * n))
    case 'yearly':
      return toISODate(addYears(base, n))
    case 'monthly': {
      // Clamp to end of month: Jan 31 + 1mo -> Feb 28/29
      const target = addMonths(base, n)
      const clamped = setDate(target, Math.min(getDate(base), getDaysInMonth(target)))
      return toISODate(clamped)
    }
  }
}

export const RECURRENCE_LABEL: Record<Recurrence['freq'], string> = {
  daily: 'day',
  weekly: 'week',
  monthly: 'month',
  yearly: 'year',
}

export function describeRecurrence(rec: Recurrence): string {
  if (rec.interval === 1) return `Every ${RECURRENCE_LABEL[rec.freq]}`
  return `Every ${rec.interval} ${RECURRENCE_LABEL[rec.freq]}s`
}
