import { useEffect, useRef, useState } from 'react'
import { cn } from '../util'
import { actions, useStore } from '../store/store'
import { formatDue, isOverdue, todayISO } from '../lib/dates'
import { describeRecurrence } from '../lib/recurrence'
import type { Task } from '../types'
import { CheckIcon, FlagIcon, RepeatIcon, TrashIcon } from './icons'

export interface DndProps {
  draggable?: boolean
  onDragStart?: (e: React.DragEvent) => void
  onDragOver?: (e: React.DragEvent) => void
  onDrop?: (e: React.DragEvent) => void
  onDragEnd?: (e: React.DragEvent) => void
}

const PRIORITY_FLAG: Record<number, string> = {
  1: 'text-danger',
  2: 'text-orange-500',
  3: 'text-yellow-500',
  4: 'text-faint',
}

export function TaskItem({
  task,
  onOpen,
  dndProps,
  dragging,
}: {
  task: Task
  onOpen: () => void
  dndProps?: DndProps
  dragging?: boolean
}) {
  const projects = useStore((s) => s.projects)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(task.title)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [editing])

  const commit = () => {
    const trimmed = draft.trim()
    if (trimmed && trimmed !== task.title) actions.updateTask(task.id, { title: trimmed })
    else setDraft(task.title)
    setEditing(false)
  }

  const overdue = !task.completed && task.dueDate !== undefined && isOverdue(task.dueDate)
  const dueToday = !task.completed && task.dueDate === todayISO()
  const project = projects.find((p) => p.id === task.projectId)
  const showProject = task.projectId !== 'inbox' && project

  return (
    <div
      {...dndProps}
      className={cn(
        'group relative flex items-start gap-3 rounded-xl border border-line bg-surface px-3 py-2.5 transition-all',
        'hover:border-accent/40 hover:shadow-sm',
        dragging && 'opacity-40',
        overdue && 'border-danger/30',
      )}
    >
      {/* Checkbox */}
      <button
        onClick={() => actions.toggleTask(task.id)}
        role="checkbox"
        aria-checked={task.completed}
        aria-label={task.completed ? `Mark ${task.title} incomplete` : `Complete ${task.title}`}
        className={cn(
          'mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border transition-all',
          task.completed
            ? 'border-accent bg-accent text-white'
            : 'border-faint/60 hover:border-accent hover:shadow-[0_0_0_4px_var(--accent-soft)]',
        )}
      >
        {task.completed && <CheckIcon className="h-3 w-3" />}
      </button>

      {/* Body */}
      <div className="min-w-0 flex-1">
        {editing ? (
          <input
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commit()
              if (e.key === 'Escape') {
                setDraft(task.title)
                setEditing(false)
              }
            }}
            className="w-full rounded-md bg-surface-2 px-2 py-0.5 text-sm outline-none ring-2 ring-accent-soft"
          />
        ) : (
          <button
            onClick={onOpen}
            className={cn(
              'block max-w-full truncate text-left text-sm leading-5',
              task.completed ? 'text-faint line-through' : 'text-ink',
            )}
          >
            {task.title}
          </button>
        )}

        {(task.dueDate || task.tags.length > 0 || task.recurrence || showProject) && (
          <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px]">
            {task.dueDate && (
              <span
                className={cn(
                  'inline-flex items-center gap-0.5 font-medium',
                  overdue ? 'text-danger' : dueToday ? 'text-accent' : 'text-muted',
                )}
              >
                {formatDue(task.dueDate)}
              </span>
            )}
            {task.recurrence && (
              <span className="inline-flex items-center gap-0.5 text-muted">
                <RepeatIcon className="h-3 w-3" />
                {describeRecurrence(task.recurrence)}
              </span>
            )}
            {showProject && (
              <span className="inline-flex items-center gap-1 text-muted">
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: project?.color }}
                />
                {project?.name}
              </span>
            )}
            {task.tags.map((tag) => (
              <button
                key={tag}
                onClick={() => actions.setView({ kind: 'tag', tag })}
                className="rounded-full bg-surface-2 px-1.5 py-0.5 text-faint transition-colors hover:text-accent"
              >
                @{tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Priority flag */}
      {task.priority && !task.completed && (
        <span
          className="mt-0.5 shrink-0"
          title={`Priority ${task.priority}`}
          aria-label={`Priority ${task.priority}`}
        >
          <FlagIcon className={cn('h-3.5 w-3.5', PRIORITY_FLAG[task.priority])} />
        </span>
      )}

      {/* Delete */}
      <button
        onClick={() => actions.deleteTask(task.id)}
        aria-label={`Delete ${task.title}`}
        className="mt-0.5 shrink-0 rounded p-1 text-faint opacity-0 transition-all hover:bg-danger/10 hover:text-danger focus-visible:opacity-100 group-hover:opacity-100"
      >
        <TrashIcon className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}
