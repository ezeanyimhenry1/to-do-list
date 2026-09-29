import { useEffect, useState } from 'react'

const SHORTCUTS: { keys: string; action: string }[] = [
  { keys: 'q', action: 'Focus quick-add' },
  { keys: '/', action: 'Focus search' },
  { keys: 't', action: 'Go to Today' },
  { keys: 'd', action: 'Toggle dark mode' },
  { keys: '?', action: 'Show this cheatsheet' },
  { keys: 'Esc', action: 'Close dialogs / clear input' },
]

export function ShortcutsModal() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const show = () => setOpen(true)
    window.addEventListener('docket:show-shortcuts', show)
    return () => window.removeEventListener('docket:show-shortcuts', show)
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <div className={open ? 'fixed inset-0 z-40' : 'hidden'}>
      <div className="absolute inset-0 bg-black/30" onClick={() => setOpen(false)} />
      <div
        role="dialog"
        aria-label="Keyboard shortcuts"
        className="absolute left-1/2 top-1/2 w-[320px] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-line bg-surface p-5 shadow-2xl"
      >
        <h2 className="mb-3 text-sm font-semibold">Keyboard shortcuts</h2>
        <dl className="space-y-2">
          {SHORTCUTS.map((s) => (
            <div key={s.keys} className="flex items-center justify-between text-sm">
              <dt className="text-muted">{s.action}</dt>
              <dd>
                <kbd className="rounded-md border border-line bg-surface-2 px-2 py-0.5 font-mono text-xs">
                  {s.keys}
                </kbd>
              </dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 text-[11px] text-faint">
          Shortcuts are ignored while typing in an input.
        </p>
      </div>
    </div>
  )
}
