import { describe, expect, it } from 'vitest'
import { parseQuickAdd } from './parse'

const ctx = {
  findProjectIdByName: (name: string) =>
    name.toLowerCase() === 'work' ? 'work' : undefined,
}

describe('parseQuickAdd', () => {
  it('parses a plain title untouched', () => {
    const r = parseQuickAdd('Buy milk')
    expect(r.title).toBe('Buy milk')
    expect(r.dueDate).toBeUndefined()
    expect(r.tags).toEqual([])
  })

  it('extracts priority !1-!4 and !p1-!p4', () => {
    expect(parseQuickAdd('Fix bug !1').priority).toBe(1)
    expect(parseQuickAdd('Fix bug !p3').priority).toBe(3)
    expect(parseQuickAdd('Fix bug !4').title).toBe('Fix bug')
  })

  it('extracts @tags, deduplicated', () => {
    const r = parseQuickAdd('Call mom @family @phone @family')
    expect(r.tags).toEqual(['family', 'phone'])
    expect(r.title).toBe('Call mom')
  })

  it('maps existing #project by name', () => {
    const r = parseQuickAdd('Ship release #Work', ctx)
    expect(r.projectId).toBe('work')
    expect(r.title).toBe('Ship release')
  })

  it('creates a new project id for unknown #project', () => {
    const r = parseQuickAdd('Tidy garage #Home', ctx)
    expect(r.projectId).toBe('home')
    expect(r.newProjectName).toBe('Home')
    expect(r.title).toBe('Tidy garage')
  })

  it('extracts *recurrence keywords', () => {
    expect(parseQuickAdd('Water plants *weekly').recurrence).toEqual({ freq: 'weekly', interval: 1 })
    expect(parseQuickAdd('Water plants *month').recurrence).toEqual({ freq: 'monthly', interval: 1 })
    expect(parseQuickAdd('Water plants *weekly').title).toBe('Water plants')
  })

  it('parses "tomorrow" into a due date and strips it from the title', () => {
    const r = parseQuickAdd('Buy milk tomorrow')
    expect(r.dueDate).toBeDefined()
    expect(r.title).toBe('Buy milk')
  })

  it('parses weekday names', () => {
    const r = parseQuickAdd('Report friday')
    expect(r.dueDate).toBeDefined()
    expect(r.title).toBe('Report')
  })

  it('parses "in 3 days"', () => {
    const r = parseQuickAdd('Gym in 3 days')
    expect(r.dueDate).toBeDefined()
    expect(r.title).toBe('Gym')
  })

  it('handles a kitchen-sink input', () => {
    const r = parseQuickAdd('Pay rent friday #home @finance @bills !p1 *monthly', ctx)
    expect(r.title).toBe('Pay rent')
    expect(r.priority).toBe(1)
    expect(r.projectId).toBe('home')
    expect(r.tags).toEqual(['finance', 'bills'])
    expect(r.recurrence).toEqual({ freq: 'monthly', interval: 1 })
    expect(r.dueDate).toBeDefined()
  })

  it('uses the default project when none specified', () => {
    const r = parseQuickAdd('Something', { defaultProjectId: 'side' })
    expect(r.projectId).toBe('side')
  })

  it('does not treat bare numbers or lone symbols as metadata', () => {
    const r = parseQuickAdd('Call 911 !')
    expect(r.title).toBe('Call 911 !')
    expect(r.priority).toBeUndefined()
  })
})
