import { createContext, useContext } from 'react'

export type Theme = 'dark' | 'light'

export interface StoreContextType {
  sidebarCollapsed: boolean
  setSidebarCollapsed: (v: boolean) => void
  toggleSidebar: () => void
  theme: Theme
  toggleTheme: () => void
}

export const StoreContext = createContext<StoreContextType | null>(null)

export function useStore(): StoreContextType {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be inside StoreProvider')
  return ctx
}

const SIDEBAR_KEY = 'devkit:sidebar-collapsed'
const THEME_KEY   = 'devkit:theme'

export function loadSidebarState(): boolean {
  return localStorage.getItem(SIDEBAR_KEY) === 'true'
}

export function saveSidebarState(v: boolean): void {
  localStorage.setItem(SIDEBAR_KEY, String(v))
}

export function loadTheme(): Theme {
  return localStorage.getItem(THEME_KEY) === 'light' ? 'light' : 'dark'
}

export function saveTheme(t: Theme): void {
  localStorage.setItem(THEME_KEY, t)
}

export function applyTheme(t: Theme): void {
  document.documentElement.setAttribute('data-theme', t)
}
