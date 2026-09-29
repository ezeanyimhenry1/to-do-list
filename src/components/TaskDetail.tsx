import { useEffect, useState } from 'react'
import { cn } from '../util'
import { actions, useStore } from '../store/store'
import type { Priority, Recurrence, RecurrenceFreq, Task } from '../types'
import { addDays } from 'date-fns'
import { toISODate, todayISO } from '../lib/dates'
import { describeRecurrence } from '../lib/recurrence'
import { XIcon } from './icons'

const PRIORITIES: { value: Priority; label: string }[] = [
  { value: 1, label: 'P1 · Urgent' },
  { value: 2, label: 'P2 · High' },
  { value: 3, label: 'P3 · Medium' },
  { value: 4, label: 'P4 · Low' },
]

const FREQS: { value: RecurrenceFreq; label: string }[] = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
]

function shiftISO(iso: string, days: number): string {
  return toISODate(addDays(new Date(iso + 'T00:00:00'), days))
}

export function TaskDetail({
  task,
  onClose,
  onDeleted,
}: {
  task: Task | null
  onClose: () => void
  onDeleted: () => void
}) {
  const projects = useStore((s) => s.projects)
  const [title, setTitle] = useState('')
  const [notes, setNotes] = useState('')
  const [tagText, setTagText] = useState('')
  const [dueDate, setDueDate] = useState<string | undefined>(undefined)
  const [priority, setPriority] = useState<Priority | undefined>(undefined)
  const [projectId, setProjectId] = useState('inbox')
  const [recurrence, setRecurrence] = useState<Recurrence | undefined>(undefined)

  useEffect(() => {
    if (task) {
      setTitle(task.title)
      setNotes(task.notes ?? '')
      setTagText(task.tags.join(' '))
      setDueDate(task.dueDate)
      setPriority(task.priority)
      setProjectId(task.projectId)
      setRecurrence(task.recurrence)
    }
  }, [task?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  // Save on close: push local state into the store
  const save = () => {
    if (!task) return
    const trimmedTitle = title.trim()
    actions.updateTask(task.id, {
      title: trimmedTitle || task.title,
      notes: notes.trim() || undefined,
      tags: tagText
        .split(/[\s,]+/)
        .map((t) => t.replace(/^@/, '').trim())
        .filter(Boolean),
      dueDate,
      priority,
      projectId,
      recurrence,
    })
  }

  const close = () => {
    save()
    onClose()
  }

  useEffect(() => {
    if (!task) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        close()
      }
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task?.id, title, notes, tagText, dueDate, priority, projectId, recurrence])

  if (!task) return null

  const overlayClose = () => close()

  return (
    <div className="fixed inset-0 z-30" role="dialog" aria-label="Task details">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]" onClick={overlayClose} />
      <aside
        className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l border-line bg-surface shadow-2xl"
        aria-label={`Edit ${task.title}`}
      >
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-faint">
            Task details
          </span>
          <button
            onClick={close}
            aria-label="Close task details"
            className="rounded-lg p-1.5 text-muted hover:bg-surface-2 hover:text-ink"
          >
            <XIcon />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto p-4">
          {/* Title */}
          <div>
            <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-faint">
              Title
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-line bg-surface-2 px-3 py-2 text-sm font-medium outline-none focus:border-accent"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-faint">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              placeholder="Add details…"
              className="w-full resize-y rounded-lg border border-line bg-surface-2 px-3 py-2 text-sm outline-none placeholder:text-faint focus:border-accent"
            />
          </div>

          {/* Due date + shortcuts */}
          <div>
            <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-faint">
              Due date
            </label>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={dueDate ?? ''}
                onChange={(e) => setDueDate(e.target.value || undefined)}
                className="h-9 flex-1 rounded-lg border border-line bg-surface-2 px-3 text-sm outline-none focus:border-accent"
              />
            </div>
            <div className="mt-1.5 flex gap-1.5">
              {[
                { label: 'Today', days: 0 },
                { label: 'Tomorrow', days: 1 },
                { label: '+1 week', days: 7 },
                { label: 'Clear', days: -1, clear: true },
              ].map((b) => (
                <button
                  key={b.label}
                  onClick={() =>
                    setDueDate(b.clear ? undefined : shiftISO(dueDate ?? todayISO(), b.days))
                  }
                  className="rounded-lg bg-surface-2 px-2.5 py-1 text-xs text-muted transition-colors hover:bg-accent-soft hover:text-accent"
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-faint">
              Priority
            </label>
            <div className="flex gap-1.5">
              {PRIORITIES.map((p) => (
                <button
                  key={p.value}
                  onClick={() => setPriority(priority === p.value ? undefined : p.value)}
                  aria-pressed={priority === p.value}
                  className={cn(
                    'flex-1 rounded-lg border px-2 py-1.5 text-xs font-medium transition-colors',
                    priority === p.value
                      ? 'border-accent bg-accent-soft text-accent'
                      : 'border-line text-muted hover:border-accent/40',
                  )}
                >
                  {p.value}
                </button>
              ))}
            </div>
          </div>

          {/* Project */}
          <div>
            <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-faint">
              Project
            </label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="h-9 w-full rounded-lg border border-line bg-surface-2 px-2 text-sm outline-none focus:border-accent"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div>
            <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-faint">
              Tags (space or comma separated)
            </label>
            <input
              value={tagText}
              onChange={(e) => setTagText(e.target.value)}
              placeholder="@errands @finance"
              className="w-full rounded-lg border border-line bg-surface-2 px-3 py-2 text-sm outline-none placeholder:text-faint focus:border-accent"
            />
          </div>

          {/* Recurrence */}
          <div>
            <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-faint">
              Recurrence
            </label>
            <div className="flex items-center gap-2">
              <select
                value={recurrence?.freq ?? ''}
                onChange={(e) => {
                  const v = e.target.value as RecurrenceFreq | ''
                  setRecurrence(v ? { freq: v, interval: recurrence?.interval ?? 1 } : undefined)
                }}
                className="h-9 flex-1 rounded-lg border border-line bg-surface-2 px-2 text-sm outline-none focus:border-accent"
              >
                <option value="">Never repeats</option>
                {FREQS.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
              {recurrence && (
                <select
                  value={recurrence.interval}
                  onChange={(e) =>
                    setRecurrence({ ...recurrence, interval: Math.max(1, Number(e.target.value)) })
                  }
                  className="h-9 w-20 rounded-lg border border-line bg-surface-2 px-2 text-sm outline-none focus:border-accent"
                  aria-label="Recurrence interval"
                >
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <option key={n} value={n}>
                      ×{n}
                    </option>
                  ))}
                </select>
              )}
            </div>
            {recurrence && (
              <p className="mt-1 text-[11px] text-faint">
                {describeRecurrence(recurrence)} — completing it schedules the next occurrence.
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-line px-4 py-3">
          <button
            onClick={() => {
              actions.deleteTask(task.id)
              onDeleted()
            }}
            className="rounded-lg px-3 py-1.5 text-xs font-medium text-danger transition-colors hover:bg-danger/10"
          >
            Delete task
          </button>
          <button
            onClick={close}
            className="rounded-lg bg-accent px-4 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
          >
            Done
          </button>
        </div>
      </aside>
    </div>
  )
}
