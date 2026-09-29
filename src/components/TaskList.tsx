import { useMemo, useState } from 'react'
import { actions, useStore } from '../store/store'
import { searchTasks, sortTasks, splitCompleted, tasksForView } from '../lib/view'
import { QuickAdd } from './QuickAdd'
import { TaskItem, type DndProps } from './TaskItem'
import { TaskDetail } from './TaskDetail'
import type { Task } from '../types'

export function TaskList() {
  const tasks = useStore((s) => s.tasks)
  const sort = useStore((s) => s.settings.sort)
  const search = useStore((s) => s.search)
  const view = useStore((s) => s.view)
  const [openId, setOpenId] = useState<string | null>(null)
  const [dragId, setDragId] = useState<string | null>(null)

  const visible = useMemo(
    () => sortTasks(searchTasks(tasksForView(tasks, view), search), sort),
    [tasks, view, search, sort],
  )
  const { active, done } = splitCompleted(visible)

  const dnd = (task: Task): DndProps => ({
    draggable: sort === 'manual',
    onDragStart: () => setDragId(task.id),
    onDragOver: (e) => {
      if (!dragId) return
      e.preventDefault()
    },
    onDrop: () => {
      if (dragId && dragId !== task.id) actions.reorderTask(dragId, task.id)
      setDragId(null)
    },
    onDragEnd: () => setDragId(null),
  })

  const openTask = tasks.find((t) => t.id === openId) ?? null

  const renderRow = (task: Task) => (
    <TaskItem
      key={task.id}
      task={task}
      onOpen={() => setOpenId(task.id)}
      dndProps={dnd(task)}
      dragging={dragId === task.id}
    />
  )

  const emptyHint = (() => {
    if (search) return `No results for “${search}”`
    switch (view.kind) {
      case 'today':
        return 'Nothing due today. Enjoy the calm.'
      case 'upcoming':
        return 'Nothing scheduled ahead. Add a task with a future due date.'
      case 'overdue':
        return 'Nothing overdue — you’re on top of things!'
      case 'inbox':
        return 'Inbox zero. Beautiful.'
      case 'all':
        return 'No tasks yet. Add your first one above.'
      case 'completed':
        return 'Nothing completed yet. Check something off!'
      case 'project':
        return 'No tasks in this project yet.'
      case 'tag':
        return 'No tasks with this tag.'
      default:
        return 'No tasks yet.'
    }
  })()

  return (
    <div className="flex h-full flex-col">
      <div className="shrink-0 px-4 pb-3 pt-4 sm:px-6">
        <QuickAdd />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-24 sm:px-6">
        {visible.length === 0 ? (
          <div className="mt-16 flex flex-col items-center gap-2 text-center">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-surface-2 text-xl">
              🎉
            </div>
            <p className="text-sm text-muted">{emptyHint}</p>
          </div>
        ) : (
          <>
            {active.length > 0 && (
              <ul className="space-y-2" aria-label="Active tasks">
                {active.map(renderRow)}
              </ul>
            )}
            {done.length > 0 && (
              <div className="mt-6">
                <div className="mb-2 flex items-center justify-between px-1">
                  <h2 className="text-[11px] font-semibold uppercase tracking-wider text-faint">
                    Completed · {done.length}
                  </h2>
                  <button
                    onClick={() => {
                      const n = actions.clearCompleted()
                      if (n > 0) window.dispatchEvent(new CustomEvent('docket:toast', { detail: `Cleared ${n} completed` }))
                    }}
                    className="text-[11px] text-faint transition-colors hover:text-danger"
                  >
                    Clear completed
                  </button>
                </div>
                <ul className="space-y-2" aria-label="Completed tasks">
                  {done.map(renderRow)}
                  {active.length === 0 && null}
                </ul>
              </div>
            )}
          </>
        )}
      </div>

      <TaskDetail
        task={openTask}
        onClose={() => setOpenId(null)}
        onDeleted={() => setOpenId(null)}
      />
    </div>
  )
}
