import {
  addDays,
  differenceInCalendarDays,
  format,
  isValid,
  parseISO,
  startOfDay,
} from 'date-fns'

/** Local date -> 'yyyy-MM-dd' (no UTC shifting like toISOString) */
export function toISODate(d: Date): string {
  return format(d, 'yyyy-MM-dd')
}

export function todayISO(): string {
  return toISODate(new Date())
}

/** Parse 'yyyy-MM-dd' as a LOCAL date (parseISO does this correctly) */
export function parseISODate(s: string): Date {
  const d = parseISO(s)
  return isValid(d) ? d : startOfDay(new Date())
}

export function isOverdue(dueISO: string, now: Date = new Date()): boolean {
  return differenceInCalendarDays(startOfDay(now), parseISODate(dueISO)) > 0
}

export function isToday(iso: string, now: Date = new Date()): boolean {
  return differenceInCalendarDays(parseISODate(iso), startOfDay(now)) === 0
}

export function isTomorrow(iso: string, now: Date = new Date()): boolean {
  return differenceInCalendarDays(parseISODate(iso), startOfDay(now)) === 1
}

export function isYesterday(iso: string, now: Date = new Date()): boolean {
  return differenceInCalendarDays(parseISODate(iso), startOfDay(now)) === -1
}

export function formatDue(iso: string, now: Date = new Date()): string {
  const diff = differenceInCalendarDays(parseISODate(iso), startOfDay(now))
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Tomorrow'
  if (diff === -1) return 'Yesterday'
  if (diff < -1) return `${Math.abs(diff)}d overdue`
  if (diff < 7) return format(parseISODate(iso), 'EEEE') // weekday name
  return format(parseISODate(iso), 'MMM d')
}

/** Full weekday names starting Monday, index 0 = Monday */
export function lastNDays(n: number, now: Date = new Date()): Date[] {
  const out: Date[] = []
  for (let i = n - 1; i >= 0; i--) out.push(addDays(startOfDay(now), -i))
  return out
}

export function dayInitial(d: Date): string {
  return format(d, 'EEEEEE') // Mo, Tu, ...
}

/** Monday-based start of week as local ISO */
export function weekStartISO(now: Date = new Date()): string {
  return toISODate(startOfWeekMonday(now))
}

export function startOfWeekMonday(now: Date = new Date()): Date {
  const d = startOfDay(now)
  const dow = (d.getDay() + 6) % 7 // Mon=0
  return addDays(d, -dow)
}
