import { useMemo, useState } from 'react'
import { actions, projectSlug, useStore } from '../store/store'
import { parseQuickAdd } from '../lib/parse'
import { describeRecurrence } from '../lib/recurrence'
import { formatDue, todayISO } from '../lib/dates'
import { cn } from '../util'
import { PlusIcon } from './icons'

function findProjectId(name: string, projects: { id: string; name: string }[]): string | undefined {
  const bySlug = projects.find((p) => p.id === projectSlug(name))
  if (bySlug) return bySlug.id
  return projects.find((p) => p.name.toLowerCase() === name.toLowerCase())?.id
}

function addDaysISO(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() + n)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const DATE_WORDS_RE =
  /(?:^|\s)(today|tmr|tmrw|tomorrow|next week|next month|mon|monday|tue|tues|tuesday|wed|wednesday|thu|thurs|thursday|fri|friday|sat|saturday|sun|sunday)(?=\s|$)/gi

export function QuickAdd() {
  const projects = useStore((s) => s.projects)
  const view = useStore((s) => s.view)
  const [value, setValue] = useState('')
  const [focused, setFocused] = useState(false)
  const [showPicker, setShowPicker] = useState(false)

  const parse = useMemo(() => {
    return parseQuickAdd(value, {
      findProjectIdByName: (name) => findProjectId(name, projects),
      defaultProjectId: view.kind === 'project' ? view.projectId : undefined,
    })
  }, [value, projects, view])

  const submit = () => {
    if (!parse.title) return
    actions.addTask({
      title: parse.title,
      dueDate: parse.dueDate,
      priority: parse.priority,
      projectId: parse.projectId,
      tags: parse.tags,
      recurrence: parse.recurrence,
    })
    if (parse.newProjectName && parse.projectId) {
      actions.addProjectIfMissing(parse.newProjectName, parse.projectId)
    }
    setValue('')
    setShowPicker(false)
  }

  const setDue = (iso: string | undefined) => {
    const stripped = value.replace(DATE_WORDS_RE, '').replace(/\s{2,}/g, ' ').trim()
    if (!iso) {
      setValue(stripped)
    } else if (iso === todayISO()) {
      setValue(`${stripped} today`.trim())
    } else if (iso === addDaysISO(1)) {
      setValue(`${stripped} tomorrow`.trim())
    } else if (iso === addDaysISO(7)) {
      setValue(`${stripped} next week`.trim())
    } else {
      setValue(`${stripped} ${iso}`.trim())
    }
    setShowPicker(false)
  }

  const today = todayISO()
  const chips: string[] = []
  if (parse.dueDate) chips.push(formatDue(parse.dueDate))
  if (parse.priority) chips.push(`P${parse.priority}`)
  if (parse.projectId) {
    const name = projects.find((p) => p.id === parse.projectId)?.name ?? parse.newProjectName
    if (name) chips.push(`#${name}`)
  }
  parse.tags.forEach((t) => chips.push(`@${t}`))
  if (parse.recurrence) chips.push(describeRecurrence(parse.recurrence))

  return (
    <div className="relative">
      <div
        className={cn(
          'flex items-center gap-2 rounded-xl border bg-surface px-3 py-2.5 shadow-sm transition-all',
          focused ? 'border-accent ring-4 ring-accent-soft' : 'border-line',
        )}
      >
        <PlusIcon className="h-4 w-4 shrink-0 text-faint" />
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              submit()
            }
            if (e.key === 'Escape') {
              setValue('')
              ;(e.target as HTMLInputElement).blur()
            }
          }}
          placeholder="Add a task… try “Pay rent friday #home !p1 *monthly”"
          aria-label="Quick add task"
          data-quick-add
          className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-faint"
        />
        <button
          onClick={() => setShowPicker((v) => !v)}
          aria-label="Pick a due date"
          aria-expanded={showPicker}
          className={cn(
            'shrink-0 rounded-lg px-2 py-1 text-xs font-medium transition-colors',
            showPicker || parse.dueDate
              ? 'bg-accent-soft text-accent'
              : 'text-faint hover:bg-surface-2 hover:text-ink',
          )}
        >
          {parse.dueDate ? formatDue(parse.dueDate) : 'Someday'}
        </button>
      </div>

      {showPicker && (
        <div className="absolute right-0 top-full z-20 mt-2 w-44 rounded-xl border border-line bg-surface p-1 shadow-lg">
          {[
            { label: 'Today', iso: today },
            { label: 'Tomorrow', iso: addDaysISO(1) },
            { label: 'Next week', iso: addDaysISO(7) },
            { label: 'No date', iso: undefined },
          ].map((opt) => (
            <button
              key={opt.label}
              onClick={() => setDue(opt.iso)}
              className="block w-full rounded-lg px-3 py-1.5 text-left text-sm text-muted hover:bg-surface-2 hover:text-ink"
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}

      {chips.length > 0 && (
        <div className="mt-2 flex flex-wrap items-center gap-1.5 px-1" aria-label="Parsed attributes">
          <span className="text-[11px] text-faint">Adding:</span>
          {chips.map((c, i) => (
            <span
              key={i}
              className="rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-medium text-accent"
            >
              {c}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
