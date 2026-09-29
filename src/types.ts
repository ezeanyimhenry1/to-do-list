export type Priority = 1 | 2 | 3 | 4

export type RecurrenceFreq = 'daily' | 'weekly' | 'monthly' | 'yearly'

export interface Recurrence {
  freq: RecurrenceFreq
  interval: number
}

export interface Task {
  id: string
  title: string
  notes?: string
  completed: boolean
  /** ISO timestamp of completion */
  completedAt?: string
  /** ISO timestamp of creation */
  createdAt: string
  /** Due date as 'yyyy-MM-dd' (local) */
  dueDate?: string
  priority?: Priority
  projectId: string
  tags: string[]
  recurrence?: Recurrence
  /** Manual sort position within its view (lower first) */
  order?: number
}

export interface Project {
  id: string
  name: string
  color: string
}

export type SmartView =
  | { kind: 'inbox' }
  | { kind: 'today' }
  | { kind: 'upcoming' }
  | { kind: 'overdue' }
  | { kind: 'all' }
  | { kind: 'completed' }
  | { kind: 'stats' }
  | { kind: 'project'; projectId: string }
  | { kind: 'tag'; tag: string }

export type SortMode = 'manual' | 'due' | 'priority' | 'created'

export interface Settings {
  theme: 'light' | 'dark'
  sort: SortMode
}

export interface AppData {
  tasks: Task[]
  projects: Project[]
  view: SmartView
  settings: Settings
}
