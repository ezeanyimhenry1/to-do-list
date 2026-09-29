import type { Project, SmartView, SortMode, Task } from '../types'
import { isOverdue, todayISO } from './dates'

export const PROJECT_COLORS = [
  '#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444',
  '#ec4899', '#8b5cf6', '#14b8a6', '#f97316', '#84cc16',
]

export function pickProjectColor(projects: Project[]): string {
  return PROJECT_COLORS[projects.length % PROJECT_COLORS.length]
}

export function viewTitle(view: SmartView, projects: Project[]): string {
  switch (view.kind) {
    case 'inbox': return 'Inbox'
    case 'today': return 'Today'
    case 'upcoming': return 'Upcoming'
    case 'overdue': return 'Overdue'
    case 'all': return 'Anytime'
    case 'completed': return 'Completed'
    case 'stats': return 'Stats'
    case 'project': return projects.find((p) => p.id === view.projectId)?.name ?? 'Project'
    case 'tag': return `#${view.tag}`
  }
}

/** Tasks that belong to the active view, before search filtering. */
export function tasksForView(tasks: Task[], view: SmartView): Task[] {
  const today = todayISO()
  switch (view.kind) {
    case 'inbox':
      return tasks.filter((t) => t.projectId === 'inbox')
    case 'today':
      return tasks.filter((t) => !t.completed && t.dueDate !== undefined && t.dueDate <= today)
    case 'upcoming':
      return tasks.filter((t) => !t.completed && t.dueDate !== undefined && t.dueDate > today)
    case 'overdue':
      return tasks.filter((t) => !t.completed && t.dueDate !== undefined && isOverdue(t.dueDate))
    case 'all':
      return tasks
    case 'completed':
      return tasks.filter((t) => t.completed)
    case 'project':
      return tasks.filter((t) => t.projectId === view.projectId)
    case 'tag':
      return tasks.filter((t) => t.tags.includes(view.tag))
    default:
      return tasks
  }
}

export function searchTasks(tasks: Task[], query: string): Task[] {
  const q = query.trim().toLowerCase()
  if (!q) return tasks
  return tasks.filter(
    (t) =>
      t.title.toLowerCase().includes(q) ||
      (t.notes?.toLowerCase().includes(q) ?? false) ||
      t.tags.some((tag) => tag.toLowerCase().includes(q)),
  )
}

const PRIORITY_ORDER: Record<number, number> = { 1: 0, 2: 1, 3: 2, 4: 3 }

export function sortTasks(tasks: Task[], mode: SortMode): Task[] {
  const out = [...tasks]
  switch (mode) {
    case 'manual':
      return out.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    case 'due':
      return out.sort((a, b) => {
        if (a.dueDate === b.dueDate) return (a.order ?? 0) - (b.order ?? 0)
        if (a.dueDate === undefined) return 1
        if (b.dueDate === undefined) return -1
        return a.dueDate < b.dueDate ? -1 : 1
      })
    case 'priority':
      return out.sort(
        (a, b) =>
          (PRIORITY_ORDER[a.priority ?? 4] ?? 3) - (PRIORITY_ORDER[b.priority ?? 4] ?? 3) ||
          (a.order ?? 0) - (b.order ?? 0),
      )
    case 'created':
      return out.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  }
}

/** Split into incomplete first, then completed (each group keeps the sort order). */
export function splitCompleted(tasks: Task[]): { active: Task[]; done: Task[] } {
  return {
    active: tasks.filter((t) => !t.completed),
    done: tasks.filter((t) => t.completed),
  }
}

export function allTags(tasks: Task[]): string[] {
  const set = new Set<string>()
  for (const t of tasks) t.tags.forEach((tag) => set.add(tag))
  return [...set].sort()
}
