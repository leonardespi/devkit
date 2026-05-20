import { StrictMode, useState, useCallback } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterContext, getInitialTool, type ToolId } from './core/router'
import {
  StoreContext,
  loadSidebarState, saveSidebarState,
  loadTheme, saveTheme, applyTheme,
  type Theme,
} from './core/store'
import { Layout } from './components/Layout'
import './styles/variables.css'
import './styles/global.css'

// Apply saved theme before first render to avoid flash
applyTheme(loadTheme())

function App() {
  const [activeToolId, setActiveToolId] = useState<ToolId>(getInitialTool)
  const [sidebarCollapsed, setSidebarCollapsedRaw] = useState<boolean>(loadSidebarState)
  const [theme, setThemeRaw] = useState<Theme>(loadTheme)

  const navigate = useCallback((id: ToolId) => {
    setActiveToolId(id)
    window.location.hash = id
  }, [])

  const setSidebarCollapsed = useCallback((v: boolean) => {
    setSidebarCollapsedRaw(v)
    saveSidebarState(v)
  }, [])

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed(!sidebarCollapsed)
  }, [sidebarCollapsed, setSidebarCollapsed])

  const toggleTheme = useCallback(() => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark'
    setThemeRaw(next)
    applyTheme(next)
    saveTheme(next)
  }, [theme])

  return (
    <RouterContext.Provider value={{ activeToolId, navigate }}>
      <StoreContext.Provider value={{ sidebarCollapsed, setSidebarCollapsed, toggleSidebar, theme, toggleTheme }}>
        <Layout />
      </StoreContext.Provider>
    </RouterContext.Provider>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
