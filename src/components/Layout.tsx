import { lazy, Suspense } from 'react'
import { Sidebar } from './Sidebar'
import { useRouter } from '../core/router'
import { useStore } from '../core/store'
import styles from './Layout.module.css'

const Md2Pdf          = lazy(() => import('../tools/md2pdf/Md2Pdf'))
const ReadmeWizard    = lazy(() => import('../tools/readme-wizard/ReadmeWizard'))
const ResumeBuilder   = lazy(() => import('../tools/resume-builder/ResumeBuilder'))
const JsonPrettifier  = lazy(() => import('../tools/json-prettifier/JsonPrettifier'))
const ConfigConverter = lazy(() => import('../tools/config-converter/ConfigConverter'))
const RegexLab        = lazy(() => import('../tools/regex-lab/RegexLab'))
const DiffChecker     = lazy(() => import('../tools/diff-checker/DiffChecker'))
const SqlFormatter    = lazy(() => import('../tools/sql-formatter/SqlFormatter'))
const DiagramEditor   = lazy(() => import('../tools/diagram-editor/DiagramEditor'))

function ActiveTool() {
  const { activeToolId } = useRouter()
  switch (activeToolId) {
    case 'md2pdf':           return <Md2Pdf />
    case 'readme-wizard':    return <ReadmeWizard />
    case 'resume-builder':   return <ResumeBuilder />
    case 'json-prettifier':  return <JsonPrettifier />
    case 'config-converter': return <ConfigConverter />
    case 'regex-lab':        return <RegexLab />
    case 'diff-checker':     return <DiffChecker />
    case 'sql-formatter':    return <SqlFormatter />
    case 'diagram-editor':   return <DiagramEditor />
  }
}

export function Layout() {
  const { sidebarCollapsed } = useStore()
  return (
    <div className={[styles.root, sidebarCollapsed ? styles.collapsed : ''].join(' ')}>
      <Sidebar />
      <main className={styles.main}>
        <Suspense fallback={<span className={styles.loading}>Loading…</span>}>
          <ActiveTool />
        </Suspense>
      </main>
    </div>
  )
}
