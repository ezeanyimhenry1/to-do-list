import { forwardRef } from 'react'
import { actions, useStore } from '../store/store'
import { viewTitle } from '../lib/view'
import type { SortMode } from '../types'
import { MenuIcon, SearchIcon } from './icons'
import { cn } from '../util'

const SORTS: { value: SortMode; label: string }[] = [
  { value: 'manual', label: 'Manual' },
  { value: 'due', label: 'Due date' },
  { value: 'priority', label: 'Priority' },
  { value: 'created', label: 'Newest' },
]

export const Header = forwardRef<HTMLInputElement, { onMenu: () => void }>(function Header(
  { onMenu },
  searchRef,
) {
  const view = useStore((s) => s.view)
  const projects = useStore((s) => s.projects)
  const search = useStore((s) => s.search)
  const sort = useStore((s) => s.settings.sort)
  const statsView = view.kind === 'stats'

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-line bg-surface px-4 sm:px-6">
      <button
        onClick={onMenu}
        aria-label="Open navigation"
        className="rounded-lg p-2 text-muted hover:bg-surface-2 lg:hidden"
      >
        <MenuIcon />
      </button>
      <h1 className="min-w-0 flex-1 truncate text-lg font-semibold tracking-tight">
        {statsView ? 'Stats' : viewTitle(view, projects)}
      </h1>

      {!statsView && (
        <>
          <label className="relative hidden sm:block">
            <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
            <input
              ref={searchRef}
              data-search-input
              value={search}
              onChange={(e) => actions.setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  actions.setSearch('')
                  ;(e.target as HTMLInputElement).blur()
                }
              }}
              placeholder="Search…"
              aria-label="Search tasks"
              className={cn(
                'h-9 w-44 rounded-lg border border-line bg-surface-2 pl-8 pr-8 text-sm outline-none transition-all',
                'placeholder:text-faint focus:w-64 focus:border-accent focus:bg-surface',
              )}
            />
            {search && (
              <button
                onClick={() => actions.setSearch('')}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-faint hover:text-ink"
              >
                ×
              </button>
            )}
          </label>
          <select
            value={sort}
            onChange={(e) => actions.setSort(e.target.value as SortMode)}
            aria-label="Sort tasks"
            className="h-9 rounded-lg border border-line bg-surface-2 px-2 text-xs text-muted outline-none"
          >
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </>
      )}
    </header>
  )
})
