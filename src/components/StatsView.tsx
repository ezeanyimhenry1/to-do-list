import { useMemo } from 'react'
import { actions, useStore } from '../store/store'
import { computeStats } from '../lib/stats'
import { isOverdue } from '../lib/dates'
import { cn } from '../util'

function StatCard(props: { label: string; value: string | number; sub?: string; tone?: 'danger' | 'accent' }) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-4">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-faint">{props.label}</div>
      <div
        className={cn(
          'mt-1 text-3xl font-bold tracking-tight tabular-nums',
          props.tone === 'danger' && 'text-danger',
          props.tone === 'accent' && 'text-accent',
        )}
      >
        {props.value}
      </div>
      {props.sub && <div className="mt-0.5 text-xs text-muted">{props.sub}</div>}
    </div>
  )
}

export function StatsView() {
  const tasks = useStore((s) => s.tasks)
  const projects = useStore((s) => s.projects)
  const stats = useMemo(() => computeStats(tasks), [tasks])

  const maxWeek = Math.max(1, ...stats.week.map((d) => d.count))
  const openByProject = projects.map((p) => ({
    project: p,
    open: tasks.filter((t) => !t.completed && t.projectId === p.id).length,
    overdue: tasks.filter((t) => !t.completed && t.projectId === p.id && t.dueDate && isOverdue(t.dueDate)).length,
    done: tasks.filter((t) => t.completed && t.projectId === p.id).length,
  }))

  return (
    <div className="h-full overflow-y-auto px-4 pb-24 pt-4 sm:px-6">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label="Current streak" value={`${stats.currentStreak}d`} sub={`Best: ${stats.bestStreak}d`} tone="accent" />
          <StatCard label="Done this week" value={stats.completedThisWeek} />
          <StatCard label="Due today" value={stats.dueToday} tone="accent" />
          <StatCard label="Overdue" value={stats.overdue} tone={stats.overdue > 0 ? 'danger' : undefined} />
        </div>

        <div className="rounded-2xl border border-line bg-surface p-4">
          <h2 className="mb-3 text-sm font-semibold">Completed · last 7 days</h2>
          <div className="flex h-32 items-end gap-2">
            {stats.week.map((d) => (
              <div key={d.date} className="flex h-full flex-1 flex-col items-center gap-1.5">
                <div className="flex w-full flex-1 items-end">
                  <div
                    className={cn(
                      'w-full rounded-t-md transition-all',
                      d.count > 0 ? 'bg-accent' : 'bg-surface-2',
                    )}
                    style={{ height: `${Math.max(4, (d.count / maxWeek) * 100)}%` }}
                    title={`${d.count} completed on ${d.date}`}
                    aria-label={`${d.count} completed on ${d.date}`}
                  />
                </div>
                <span className="text-[10px] text-faint">{d.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-surface p-4">
          <h2 className="mb-3 text-sm font-semibold">By project</h2>
          <div className="space-y-2.5">
            {openByProject.map(({ project, open, overdue, done }) => {
              const total = open + done
              const pct = total === 0 ? 0 : Math.round((done / total) * 100)
              return (
                <div key={project.id}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 font-medium">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: project.color }} />
                      {project.name}
                    </span>
                    <span className="text-faint tabular-nums">
                      {done}/{total} done{overdue > 0 ? ` · ${overdue} overdue` : ''}
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-surface-2">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${pct}%`, backgroundColor: project.color }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-surface p-4">
          <h2 className="mb-2 text-sm font-semibold">Totals</h2>
          <p className="text-xs text-muted">
            {stats.total} tasks all-time · {stats.open} open ·{' '}
            {stats.total - stats.open} completed
            {stats.open > 0 && (
              <>
                {' · '}
                <button
                  onClick={() => {
                    const n = actions.clearCompleted()
                    if (n > 0) window.dispatchEvent(new CustomEvent('docket:toast', { detail: `Cleared ${n} completed tasks` }))
                  }}
                  className="text-danger hover:underline"
                >
                  Clear completed
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  )
}
