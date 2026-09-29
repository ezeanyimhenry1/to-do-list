import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type {
  AppData,
  Priority,
  Recurrence,
  SmartView,
  SortMode,
  Task,
} from '../types'
import { nextDueISO } from '../lib/recurrence'
import { pickProjectColor } from '../lib/view'
import { uid } from '../util'

interface Actions {
  addTask(input: {
    title: string
    dueDate?: string
    priority?: Priority
    projectId?: string
    tags?: string[]
    recurrence?: Recurrence
    notes?: string
  }): void
  toggleTask(id: string): void
  updateTask(id: string, patch: Partial<Omit<Task, 'id'>>): void
  deleteTask(id: string): void
  restoreTask(task: Task): void
  reorderTask(draggedId: string, overId: string): void
  addProject(name: string): void
  /** Create a project only if it doesn't exist (used by quick-add auto-create) */
  addProjectIfMissing(name: string, id?: string): void
  renameProject(id: string, name: string): void
  deleteProject(id: string): void
  setView(view: SmartView): void
  setSort(mode: SortMode): void
  setSearch(query: string): void
  toggleTheme(): void
  importData(data: AppData): void
  clearCompleted(): number
}

export const useStore = create<
  AppData & { search: string; actions: Actions }
>()(
  persist(
    (set, get) => ({
      tasks: [],
      projects: [{ id: 'inbox', name: 'Inbox', color: '#6366f1' }],
      view: { kind: 'today' },
      settings: { theme: 'light', sort: 'manual' },
      search: '',

      actions: {
        addTask(input) {
          const { tasks } = get()
          const task: Task = {
            id: uid(),
            title: input.title,
            notes: input.notes,
            completed: false,
            createdAt: new Date().toISOString(),
            dueDate: input.dueDate,
            priority: input.priority,
            projectId: input.projectId ?? 'inbox',
            tags: input.tags ?? [],
            recurrence: input.recurrence,
            order: -Date.now(),
          }
          set({ tasks: [task, ...tasks] })
        },

        toggleTask(id) {
          const { tasks } = get()
          const task = tasks.find((t) => t.id === id)
          if (!task) return

          if (!task.completed) {
            // Completing a recurring task spawns the next occurrence
            if (task.recurrence) {
              const nextDue = nextDueISO(task.dueDate, task.recurrence)
              const next: Task = {
                ...task,
                id: uid(),
                completed: false,
                completedAt: undefined,
                order: -Date.now(),
                dueDate: nextDue,
              }
              set({
                tasks: [
                  next,
                  ...tasks.map((t) =>
                    t.id === id
                      ? {
                          ...t,
                          completed: true,
                          completedAt: new Date().toISOString(),
                        }
                      : t,
                  ),
                ],
              })
              return
            }
            set({
              tasks: tasks.map((t) =>
                t.id === id
                  ? { ...t, completed: true, completedAt: new Date().toISOString() }
                  : t,
              ),
            })
          } else {
            set({
              tasks: tasks.map((t) =>
                t.id === id ? { ...t, completed: false, completedAt: undefined } : t,
              ),
            })
          }
        },

        updateTask(id, patch) {
          set({
            tasks: get().tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)),
          })
        },

        deleteTask(id) {
          set({ tasks: get().tasks.filter((t) => t.id !== id) })
        },

        restoreTask(task) {
          set({ tasks: [task, ...get().tasks] })
        },

        reorderTask(draggedId, overId) {
          const { tasks } = get()
          const dragged = tasks.find((t) => t.id === draggedId)
          const over = tasks.find((t) => t.id === overId)
          if (!dragged || !over) return
          const next = tasks.map((t) => {
            if (t.id === draggedId) return { ...t, order: over.order ?? 0 }
            if (t.id === overId) return { ...t, order: dragged.order ?? 0 }
            return t
          })
          set({ tasks: next })
        },

        addProject(name) {
          const { projects } = get()
          const id = name.toLowerCase().replace(/\s+/g, '-')
          if (projects.some((p) => p.id === id)) return
          set({
            projects: [...projects, { id, name, color: pickProjectColor(projects) }],
          })
        },

        addProjectIfMissing(name, id) {
          const { projects } = get()
          const pid = id ?? name.toLowerCase().replace(/\s+/g, '-')
          if (projects.some((p) => p.id === pid)) return
          set({
            projects: [...projects, { id: pid, name, color: pickProjectColor(projects) }],
          })
        },

        renameProject(id, name) {
          const { projects } = get()
          set({
            projects: projects.map((p) => (p.id === id ? { ...p, name } : p)),
          })
        },

        deleteProject(id) {
          if (id === 'inbox') return
          set({
            projects: get().projects.filter((p) => p.id !== id),
            tasks: get().tasks.map((t) =>
              t.projectId === id ? { ...t, projectId: 'inbox' } : t,
            ),
          })
          const { view } = get()
          if (view.kind === 'project' && view.projectId === id) {
            set({ view: { kind: 'today' } })
          }
        },

        setView(view) {
          set({ view })
        },

        setSort(mode) {
          set({ settings: { ...get().settings, sort: mode } })
        },

        setSearch(query) {
          set({ search: query })
        },

        toggleTheme() {
          const { settings } = get()
          set({ settings: { ...settings, theme: settings.theme === 'dark' ? 'light' : 'dark' } })
        },

        importData(data) {
          set({
            tasks: data.tasks ?? [],
            projects: data.projects ?? [{ id: 'inbox', name: 'Inbox', color: '#6366f1' }],
            settings: data.settings ?? { theme: 'light', sort: 'manual' },
          })
        },

        clearCompleted(): number {
          const { tasks } = get()
          const before = tasks.length
          set({ tasks: tasks.filter((t) => !t.completed) })
          return before - tasks.length
        },
      },
    }),
    {
      name: 'docket-store',
      storage: createJSONStorage(() => localStorage),
      version: 1,
      // Persist only data + prefs; transient UI state stays out
      partialize: (s) => ({
        tasks: s.tasks,
        projects: s.projects,
        view: s.view,
        settings: s.settings,
      }),
    },
  ),
)

// ---------- Selectors / hooks ----------

export function projectSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-')
}

export function useActiveView(): SmartView {
  return useStore((s) => s.view)
}

export function useTheme() {
  return useStore((s) => s.settings.theme)
}

export const actions = {
  addTask: (input: Parameters<Actions['addTask']>[0]) => useStore.getState().actions.addTask(input),
  toggleTask: (id: string) => useStore.getState().actions.toggleTask(id),
  updateTask: (id: string, patch: Parameters<Actions['updateTask']>[1]) =>
    useStore.getState().actions.updateTask(id, patch),
  deleteTask: (id: string) => useStore.getState().actions.deleteTask(id),
  restoreTask: (task: Task) => useStore.getState().actions.restoreTask(task),
  reorderTask: (a: string, b: string) => useStore.getState().actions.reorderTask(a, b),
  addProject: (name: string) => useStore.getState().actions.addProject(name),
  renameProject: (id: string, name: string) => useStore.getState().actions.renameProject(id, name),
  deleteProject: (id: string) => useStore.getState().actions.deleteProject(id),
  setView: (view: SmartView) => useStore.getState().actions.setView(view),
  setSort: (mode: SortMode) => useStore.getState().actions.setSort(mode),
  setSearch: (query: string) => useStore.getState().actions.setSearch(query),
  addProjectIfMissing: (name: string, id?: string) =>
    useStore.getState().actions.addProjectIfMissing(name, id),
  toggleTheme: () => useStore.getState().actions.toggleTheme(),
  importData: (data: AppData) => useStore.getState().actions.importData(data),
  clearCompleted: () => useStore.getState().actions.clearCompleted(),
}
