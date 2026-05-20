import {
  FileCode2, Wand2, ScrollText, Braces, SlidersHorizontal,
  SearchCode, GitCompare, Database, Network,
  Sun, Moon, PanelLeftClose, PanelLeftOpen,
  type LucideIcon,
} from 'lucide-react'
import { TOOLS, useRouter, type ToolId } from '../core/router'
import { useStore } from '../core/store'
import styles from './Sidebar.module.css'

const TOOL_ICONS: Record<ToolId, LucideIcon> = {
  'md2pdf':          FileCode2,
  'readme-wizard':   Wand2,
  'resume-builder':  ScrollText,
  'json-prettifier': Braces,
  'config-converter': SlidersHorizontal,
  'regex-lab':       SearchCode,
  'diff-checker':    GitCompare,
  'sql-formatter':   Database,
  'diagram-editor':  Network,
}

const ICON_SIZE = 17
const ICON_STROKE = 1.6

export function Sidebar() {
  const { activeToolId, navigate } = useRouter()
  const { sidebarCollapsed, toggleSidebar, theme, toggleTheme } = useStore()

  const CollapseIcon = sidebarCollapsed ? PanelLeftOpen : PanelLeftClose
  const ThemeIcon    = theme === 'dark'  ? Sun          : Moon

  return (
    <aside
      className={[styles.sidebar, sidebarCollapsed ? styles.collapsed : ''].join(' ')}
      aria-label="Navigation"
    >
      <div className={styles.header}>
        {!sidebarCollapsed && <span className={styles.brand}>DevKit</span>}
        <button
          className={styles.toggleBtn}
          onClick={toggleSidebar}
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={sidebarCollapsed ? 'Expand' : 'Collapse'}
        >
          <CollapseIcon size={15} strokeWidth={ICON_STROKE} />
        </button>
      </div>

      <nav className={styles.nav}>
        {TOOLS.map((tool) => {
          const Icon = TOOL_ICONS[tool.id]
          return (
            <button
              key={tool.id}
              className={[styles.item, activeToolId === tool.id ? styles.active : ''].join(' ')}
              onClick={() => navigate(tool.id)}
              title={tool.label}
            >
              <span className={styles.iconWrap} aria-hidden="true">
                <Icon size={ICON_SIZE} strokeWidth={ICON_STROKE} />
              </span>
              {!sidebarCollapsed && <span className={styles.label}>{tool.label}</span>}
            </button>
          )
        })}
      </nav>

      <div className={styles.footer}>
        <button
          className={styles.themeBtn}
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          <span className={styles.iconWrap} aria-hidden="true">
            <ThemeIcon size={ICON_SIZE} strokeWidth={ICON_STROKE} />
          </span>
          {!sidebarCollapsed && (
            <span className={styles.label}>
              {theme === 'dark' ? 'Light mode' : 'Dark mode'}
            </span>
          )}
        </button>
      </div>
    </aside>
  )
}
