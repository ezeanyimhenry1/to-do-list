import { useEffect, useRef, useState } from 'react'
import { actions, useStore } from './store/store'
import { Sidebar } from './components/Sidebar'
import { Header } from './components/Header'
import { TaskList } from './components/TaskList'
import { StatsView } from './components/StatsView'
import { ShortcutsModal } from './components/ShortcutsModal'
import { Toasts } from './components/Toasts'

function useThemeEffect() {
  const theme = useStore((s) => s.settings.theme)
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])
}

export default function App() {
  useThemeEffect()
  const view = useStore((s) => s.view)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      const typing =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable
      if (e.metaKey || e.ctrlKey || e.altKey) return

      if (e.key === 'Escape') {
        if (searchRef.current?.value) {
          actions.setSearch('')
        }
        return
      }

      if (typing) return
      switch (e.key) {
        case 'q':
          e.preventDefault()
          document.querySelector<HTMLInputElement>('[data-quick-add]')?.focus()
          break
        case '/':
          e.preventDefault()
          searchRef.current?.focus()
          break
        case 't':
          actions.setView({ kind: 'today' })
          break
        case 'd':
          actions.toggleTheme()
          break
        case '?':
          window.dispatchEvent(new Event('docket:show-shortcuts'))
          break
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])
  return (
    <div className="flex h-full">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-line bg-surface lg:block">
        <Sidebar />
      </aside>

      {/* Mobile drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 lg:hidden" role="dialog" aria-label="Navigation">
          <div className="absolute inset-0 bg-black/30" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-72 bg-surface shadow-xl">
            <Sidebar onNavigate={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          ref={searchRef}
          onMenu={() => setSidebarOpen(true)}
        />
        {view.kind === 'stats' ? <StatsView /> : <TaskList />}
      </div>

      <ShortcutsModal />
      <Toasts />
    </div>
  )
}
