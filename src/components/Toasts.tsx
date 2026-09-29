import { useEffect, useRef, useState } from 'react'
import { actions, useStore } from '../store/store'
import type { Task } from '../types'

interface Toast {
  id: number
  message: string
  undo?: () => void
}

let nextId = 1

export function Toasts() {
  const [toasts, setToasts] = useState<Toast[]>([])
  const lastTask = useRef<{ task: Task; at: number }>({ task: null as unknown as Task, at: 0 })

  // Watch for deletions to offer undo
  const tasks = useStore((s) => s.tasks)
  const prevTasks = useRef<Task[]>(tasks)
  useEffect(() => {
    const prev = prevTasks.current
    prevTasks.current = tasks
    if (tasks.length < prev.length) {
      const gone = prev.find((t) => !tasks.some((x) => x.id === t.id))
      if (gone) {
        lastTask.current = { task: gone, at: Date.now() }
        pushToast({
          message: `Deleted “${gone.title.slice(0, 32)}”`,
          undo: () => actions.restoreTask(gone),
        })
      }
    }
  }, [tasks])

  const pushToast = (t: Omit<Toast, 'id'>) => {
    const id = nextId++
    setToasts((ts) => [...ts, { ...t, id }])
    setTimeout(() => {
      setToasts((ts) => ts.filter((x) => x.id !== id))
    }, 5000)
  }

  useEffect(() => {
    const onToast = (e: Event) => {
      pushToast({ message: (e as CustomEvent<string>).detail })
    }
    window.addEventListener('docket:toast', onToast)
    return () => window.removeEventListener('docket:toast', onToast)
  }, [])

  return (
    <div className="pointer-events-none fixed bottom-4 left-1/2 z-50 flex w-full max-w-sm -translate-x-1/2 flex-col gap-2 px-4">
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          className="pointer-events-auto flex items-center justify-between gap-3 rounded-xl border border-line bg-surface px-4 py-2.5 shadow-lg"
        >
          <span className="truncate text-sm">{t.message}</span>
          {t.undo && (
            <button
              onClick={() => {
                t.undo?.()
                setToasts((ts) => ts.filter((x) => x.id !== t.id))
              }}
              className="shrink-0 text-xs font-semibold text-accent hover:underline"
            >
              Undo
              </button>
          )}
        </div>
      ))}
    </div>
  )
}
