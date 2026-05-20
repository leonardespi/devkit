import { createContext, useContext } from 'react'

export type ToolId =
  | 'md2pdf'
  | 'readme-wizard'
  | 'resume-builder'
  | 'json-prettifier'
  | 'config-converter'
  | 'regex-lab'
  | 'diff-checker'
  | 'sql-formatter'
  | 'diagram-editor'

export interface ToolMeta {
  id: ToolId
  label: string
  icon: string
  description: string
}

export const TOOLS: ToolMeta[] = [
  { id: 'md2pdf',          label: 'MD Converter',     icon: '📄', description: 'Markdown → PDF · HTML · XML' },
  { id: 'readme-wizard',   label: 'README Wizard',   icon: '🧙', description: 'Generate GitHub README' },
  { id: 'resume-builder',  label: 'Resume Builder',  icon: '📋', description: 'ATS-friendly CV builder' },
  { id: 'json-prettifier', label: 'JSON Explorer',   icon: '🌳', description: 'Format & explore JSON' },
  { id: 'config-converter',label: 'Config Converter',icon: '⚙️', description: 'YAML · TOML · JSON · .env' },
  { id: 'regex-lab',       label: 'RegEx Lab',       icon: '🔍', description: 'Test regex with highlights' },
  { id: 'diff-checker',    label: 'Diff Checker',    icon: '⚖️', description: 'Visual text diff' },
  { id: 'sql-formatter',   label: 'SQL Formatter',   icon: '🗄️', description: 'Format & minify SQL queries' },
  { id: 'diagram-editor',  label: 'Diagram Editor',  icon: '🔷', description: 'Mermaid · PlantUML live preview' },
]

export function getInitialTool(): ToolId {
  const hash = window.location.hash.replace('#', '') as ToolId
  return TOOLS.some((t) => t.id === hash) ? (hash as ToolId) : 'json-prettifier'
}

export interface RouterContextType {
  activeToolId: ToolId
  navigate: (id: ToolId) => void
}

export const RouterContext = createContext<RouterContextType | null>(null)

export function useRouter(): RouterContextType {
  const ctx = useContext(RouterContext)
  if (!ctx) throw new Error('useRouter must be inside RouterProvider')
  return ctx
}
