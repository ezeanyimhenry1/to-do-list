import * as chrono from 'chrono-node'
import type { Priority, Recurrence } from '../types'
import { toISODate } from './dates'

export interface ParsedQuickAdd {
  title: string
  dueDate?: string
  priority?: Priority
  projectId?: string
  /** Set when #name refers to a project that doesn't exist yet */
  newProjectName?: string
  tags: string[]
  recurrence?: Recurrence
}

export interface ParseContext {
  /** Case-insensitive project lookup; returns canonical id if it exists */
  findProjectIdByName?: (name: string) => string | undefined
  /** Used when quick-add is issued from within a project view */
  defaultProjectId?: string
}

const PRIORITY_RE = /(?:^|\s)!(p?)([1-4])(?=\s|$)/i
const RECURRENCE_RE = /(?:^|\s)\*(daily|weekly|monthly|yearly|day|week|month|year)(?=\s|$)/i
const TAG_RE = /(?:^|\s)@([\p{L}\p{N}_-]+)/gu
const PROJECT_RE = /(?:^|\s)#([\p{L}\p{N}_-]+)/u

export function parseQuickAdd(input: string, ctx: ParseContext = {}): ParsedQuickAdd {
  let text = input.trim()
  const result: ParsedQuickAdd = { title: '', tags: [] }
  if (ctx.defaultProjectId) result.projectId = ctx.defaultProjectId

  // Priority: !1..!4 or !p1..!p4
  const pm = text.match(PRIORITY_RE)
  if (pm) {
    result.priority = Number(pm[2]) as Priority
    text = text.replace(pm[0], ' ')
  }

  // Recurrence: *daily / *weekly / *monthly / *yearly (accepts short noun forms)
  const rm = text.match(RECURRENCE_RE)
  if (rm) {
    const word = rm[1].toLowerCase()
    const freqMap: Record<string, Recurrence['freq']> = {
      daily: 'daily',
      day: 'daily',
      weekly: 'weekly',
      week: 'weekly',
      monthly: 'monthly',
      month: 'monthly',
      yearly: 'yearly',
      year: 'yearly',
    }
    result.recurrence = { freq: freqMap[word], interval: 1 }
    text = text.replace(rm[0], ' ')
  }

  // Tags: @tag (repeatable)
  const tagMatches = [...text.matchAll(TAG_RE)]
  for (const m of tagMatches) {
    const t = m[1]
    if (!result.tags.includes(t)) result.tags.push(t)
  }
  if (tagMatches.length > 0) text = text.replace(TAG_RE, ' ')

  // Project: #name — last one wins
  const prM = text.match(PROJECT_RE)
  if (prM) {
    const name = prM[1]
    const existing = ctx.findProjectIdByName?.(name)
    if (existing) result.projectId = existing
    else result.projectId = name.toLowerCase()
    result.newProjectName = name
    text = text.replace(prM[0], ' ')
  }

  // Natural-language dates via chrono, stripped from the title
  const found = chrono.parse(text, new Date(), { forwardDate: true })
  if (found.length > 0) {
    const best = found[found.length - 1]
    const start = best.start.date()
    result.dueDate = toISODate(start)
    text = (text.slice(0, best.index) + ' ' + text.slice(best.index + best.text.length)).trim()
  }

  result.title = text.replace(/\s{2,}/g, ' ').trim()
  return result
}

