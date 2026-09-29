import { useRef, useState } from 'react'
import type { ComponentType } from 'react'
import { cn, downloadText } from '../util'
import { actions, useStore } from '../store/store'
import { allTags } from '../lib/view'
import { isOverdue, todayISO } from '../lib/dates'
import type { AppData, SmartView } from '../types'
import {
  AnytimeIcon,
  CompletedIcon,
  DownloadIcon,
  InboxIcon,
  KeyboardIcon,
  MoonIcon,
  OverdueIcon,
  PlusIcon,
  StatsIcon,
  SunIcon,
  TodayIcon,
  UpcomingIcon,
  UploadIcon,
  XIcon,
} from './icons'

const VIEW_ICONS: Record<string, ComponentType<{ className?: string }>> = {
  inbox: InboxIcon,
  today: TodayIcon,
  upcoming: UpcomingIcon,
  overdue: OverdueIcon,
  all: AnytimeIcon,
  completed: CompletedIcon,
  stats: StatsIcon,
}

function NavButton(props: {
  view: SmartView
  label: string
  count?: number
  danger?: boolean
  onNavigate?: () => void
}) {
  const active = useStore((s) => {
    const v = s.view
    const t = props.view
    if (v.kind !== t.kind) return false
    if (v.kind === 'project' && t.kind === 'project') return v.projectId === t.projectId
    if (v.kind === 'tag' && t.kind === 'tag') return v.tag === t.tag
    return true
  })
  const Icon = VIEW_ICONS[props.view.kind]
  return (
    <button
      onClick={() => {
        actions.setView(props.view)
        actions.setSearch('')
        props.onNavigate?.()
      }}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'flex w-full items-center gap-2.5 rounded-lg px-3 py-1.5 text-sm transition-colors',
        active
          ? 'bg-accent-soft font-medium text-accent'
          : 'text-muted hover:bg-surface-2 hover:text-ink',
      )}
    >
      {Icon && <Icon className="h-4 w-4 shrink-0" />}
      <span className="flex-1 truncate text-left">{props.label}</span>
      {props.count !== undefined && props.count > 0 && (
        <span
          className={cn(
            'rounded-full px-1.5 py-0.5 text-[11px] tabular-nums',
            props.danger ? 'bg-danger/10 text-danger' : 'bg-surface-2 text-faint',
          )}
        >
          {props.count}
        </span>
      )}
    </button>
  )
}

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const tasks = useStore((s) => s.tasks)
  const projects = useStore((s) => s.projects)
  const theme = useStore((s) => s.settings.theme)
  const view = useStore((s) => s.view)
  const [addingProject, setAddingProject] = useState(false)
  const [newProject, setNewProject] = useState('')
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const fileInput = useRef<HTMLInputElement>(null)

  const today = todayISO()
  const open = tasks.filter((t) => !t.completed)
  const todayCount = open.filter((t) => t.dueDate !== undefined && t.dueDate <= today).length
  const overdueCount = open.filter((t) => t.dueDate !== undefined && isOverdue(t.dueDate)).length
  const inboxCount = open.filter((t) => t.projectId === 'inbox').length
  const tags = allTags(tasks)

  const exportData = () => {
    const data: AppData = {
      tasks,
      projects,
      view,
      settings: useStore.getState().settings,
    }
    downloadText(`docket-backup-${today}.json`, JSON.stringify(data, null, 2))
  }

  const importData = (file: File) => {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result)) as AppData
        if (!Array.isArray(data.tasks) || !Array.isArray(data.projects)) {
          throw new Error('bad shape')
        }
        actions.importData(data)
      } catch {
        alert('That file does not look like a Docket backup.')
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="flex h-full flex-col gap-6 overflow-y-auto p-4">
      <div className="flex items-center gap-2 px-1">
        <div className="grid h-7 w-7 place-items-center rounded-lg bg-accent text-sm font-bold text-white">
          D
        </div>
        <span className="text-lg font-semibold tracking-tight">Docket</span>
      </div>

      <nav className="space-y-0.5" aria-label="Smart views">
        <NavButton view={{ kind: 'today' }} label="Today" count={todayCount} onNavigate={onNavigate} />
        <NavButton view={{ kind: 'upcoming' }} label="Upcoming" onNavigate={onNavigate} />
        <NavButton
          view={{ kind: 'overdue' }}
          label="Overdue"
          count={overdueCount}
          danger
          onNavigate={onNavigate}
        />
        <NavButton view={{ kind: 'inbox' }} label="Inbox" count={inboxCount} onNavigate={onNavigate} />
        <NavButton view={{ kind: 'all' }} label="Anytime" onNavigate={onNavigate} />
        <NavButton view={{ kind: 'completed' }} label="Completed" onNavigate={onNavigate} />
        <NavButton view={{ kind: 'stats' }} label="Stats" onNavigate={onNavigate} />
      </nav>

      <div>
        <div className="mb-1 flex items-center justify-between px-3">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-faint">
            Projects
          </span>
          <button
            onClick={() => setAddingProject(true)}
            aria-label="Add project"
            className="rounded p-0.5 text-faint transition-colors hover:text-accent"
          >
            <PlusIcon className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="space-y-0.5">
          {projects.map((p) => (
            <div key={p.id} className="group/project relative">
              {renamingId === p.id ? (
                <input
                  autoFocus
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  onBlur={() => {
                    if (renameValue.trim() && renamingId) {
                      actions.renameProject(renamingId, renameValue.trim())
                    }
                    setRenamingId(null)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
                    if (e.key === 'Escape') setRenamingId(null)
                  }}
                  className="w-full rounded-lg bg-surface-2 px-3 py-1.5 text-sm outline-none"
                />
              ) : (
                <NavButton
                  view={{ kind: 'project', projectId: p.id }}
                  label={p.name}
                  onNavigate={onNavigate}
                />
              )}
              {renamingId !== p.id && p.id !== 'inbox' && (
                <button
                  aria-label={`Delete project ${p.name}`}
                  onClick={() => actions.deleteProject(p.id)}
                  className="absolute right-2 top-1.5 hidden rounded p-1 text-faint hover:text-danger group-hover/project:block"
                >
                  <XIcon className="h-3 w-3" />
                </button>
              )}
            </div>
          ))}
          {addingProject && (
            <input
              autoFocus
              placeholder="Project name…"
              value={newProject}
              onChange={(e) => setNewProject(e.target.value)}
              onBlur={() => {
                if (newProject.trim()) actions.addProject(newProject.trim())
                setNewProject('')
                setAddingProject(false)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
                if (e.key === 'Escape') {
                  setNewProject('')
                  setAddingProject(false)
                }
              }}
              className="w-full rounded-lg bg-surface-2 px-3 py-1.5 text-sm outline-none"
            />
          )}
        </div>
      </div>

      {tags.length > 0 && (
        <div>
          <span className="mb-1 block px-3 text-[11px] font-semibold uppercase tracking-wider text-faint">
            Tags
          </span>
          <div className="space-y-0.5">
            {tags.map((tag) => (
              <NavButton
                key={tag}
                view={{ kind: 'tag', tag }}
                label={tag}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        </div>
      )}

      <div className="mt-auto space-y-1 border-t border-line pt-3">
        <div className="flex items-center gap-1 px-1">
          <button
            onClick={actions.toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-muted transition-colors hover:bg-surface-2 hover:text-ink"
          >
            {theme === 'dark' ? <SunIcon className="h-3.5 w-3.5" /> : <MoonIcon className="h-3.5 w-3.5" />}
            {theme === 'dark' ? 'Light' : 'Dark'}
          </button>
          <button
            onClick={() => window.dispatchEvent(new Event('docket:show-shortcuts'))}
            className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-muted transition-colors hover:bg-surface-2 hover:text-ink"
          >
            <KeyboardIcon className="h-3.5 w-3.5" />
            Keys
          </button>
          <button
            onClick={exportData}
            className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-muted transition-colors hover:bg-surface-2 hover:text-ink"
          >
            <DownloadIcon className="h-3.5 w-3.5" />
            Export
          </button>
          <button
            onClick={() => fileInput.current?.click()}
            className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-muted transition-colors hover:bg-surface-2 hover:text-ink"
          >
            <UploadIcon className="h-3.5 w-3.5" />
            Import
          </button>
          <input
            ref={fileInput}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) importData(f)
              e.target.value = ''
            }}
          />
        </div>
      </div>
    </div>
  )
}
