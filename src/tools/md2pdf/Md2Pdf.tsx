import { useState, useRef, useCallback, useMemo } from 'react'
import { marked, Renderer } from 'marked'
import hljs from 'highlight.js'
import { Printer, Globe, CodeXml, type LucideIcon } from 'lucide-react'
import { Button } from '../../components/Shared/Button'
import { printAsPdf, toHtml, toXml, downloadFile, type ExportFormat } from './exporters'
import styles from './Md2Pdf.module.css'

// highlight.js renderer for the live preview only
const renderer = new Renderer()
renderer.code = function (code: string, lang: string | undefined) {
  const language = lang && hljs.getLanguage(lang) ? lang : undefined
  const value = language
    ? hljs.highlight(code, { language }).value
    : hljs.highlightAuto(code).value
  return `<pre class="hljs"><code>${value}</code></pre>`
}
marked.use({ renderer })

const INITIAL_MD = `# My Document

Write **Markdown** here, then export to PDF, HTML, or XML.

## Why three formats?

- **PDF** — print-ready rendered document
- **HTML** — clean semantic markup, paste as LLM context
- **XML** — structured document tree, ideal for prompt engineering

## Example code

\`\`\`typescript
function greet(name: string): string {
  return \`Hello, \${name}!\`
}
\`\`\`

## Example table

| Format | Use case |
|--------|----------|
| PDF    | Share, print, archive |
| HTML   | LLM context window |
| XML    | Structured prompt injection |

> **Tip:** XML export preserves heading levels, list nesting, and inline semantics — perfect for injecting structured content into LLM prompts.
`

const FORMAT_META: Record<ExportFormat, { label: string; Icon: LucideIcon; desc: string; ext: string; mime: string }> = {
  pdf:  { label: 'PDF',  Icon: Printer, desc: 'Rendered, printable document',          ext: 'pdf',  mime: 'application/pdf' },
  html: { label: 'HTML', Icon: Globe,   desc: 'Clean semantic markup — LLM context',   ext: 'html', mime: 'text/html' },
  xml:  { label: 'XML',  Icon: CodeXml, desc: 'Structured document tree — LLM prompts', ext: 'xml',  mime: 'application/xml' },
}

export default function MdConverter() {
  const [markdown, setMarkdown]   = useState(INITIAL_MD)
  const [format, setFormat]       = useState<ExportFormat>('pdf')
  const [copied, setCopied]       = useState(false)
  const previewRef = useRef<HTMLDivElement>(null)

  const renderedHtml = useMemo(() => marked.parse(markdown) as string, [markdown])
  const htmlOutput   = useMemo(() => toHtml(markdown),   [markdown])
  const xmlOutput    = useMemo(() => toXml(markdown),    [markdown])

  const openFile = useCallback(() => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.md,.markdown,.txt'
    input.onchange = () => {
      const file = input.files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = (e) => setMarkdown((e.target?.result as string) ?? '')
      reader.readAsText(file)
    }
    input.click()
  }, [])

  const copy = useCallback(() => {
    const text = format === 'html' ? htmlOutput : xmlOutput
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1400)
  }, [format, htmlOutput, xmlOutput])

  const download = useCallback(() => {
    const meta = FORMAT_META[format]
    if (format === 'pdf') {
      printAsPdf(previewRef.current?.innerHTML ?? '')
      return
    }
    const content = format === 'html' ? htmlOutput : xmlOutput
    downloadFile(content, `document.${meta.ext}`, meta.mime)
  }, [format, htmlOutput, xmlOutput])

  return (
    <div className="tool-root">
      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.toolbarLeft}>
          <span className="tool-title">MD Converter</span>
          <span className="tool-desc">Markdown → PDF · HTML · XML</span>
        </div>

        {/* Format tabs */}
        <div className={styles.formatTabs}>
          {(Object.keys(FORMAT_META) as ExportFormat[]).map((f) => {
            const { label, Icon, desc } = FORMAT_META[f]
            return (
              <button
                key={f}
                className={`${styles.formatTab} ${format === f ? styles.formatTabActive : ''}`}
                onClick={() => setFormat(f)}
                title={desc}
              >
                <Icon size={14} strokeWidth={1.6} />
                <span>{label}</span>
              </button>
            )
          })}
        </div>

        {/* Actions */}
        <div className={styles.toolbarActions}>
          <Button size="sm" onClick={openFile}>Open .md</Button>
          <Button size="sm" variant="ghost" onClick={() => setMarkdown('')}>Clear</Button>
          {format !== 'pdf' && (
            <Button size="sm" onClick={copy}>
              {copied ? '✓ Copied' : `Copy ${FORMAT_META[format].label}`}
            </Button>
          )}
          <Button size="sm" variant="primary" onClick={download}>
            {format === 'pdf' ? 'Print / Save PDF' : `↓ Download .${FORMAT_META[format].ext}`}
          </Button>
        </div>
      </div>

      {/* Format description badge */}
      <div className={styles.formatBadge}>
        <span className={styles.formatBadgeIcon}>
          {(() => { const { Icon } = FORMAT_META[format]; return <Icon size={13} strokeWidth={1.6} /> })()}
        </span>
        <span className={styles.formatBadgeLabel}>{FORMAT_META[format].label}</span>
        <span className={styles.formatBadgeDesc}>{FORMAT_META[format].desc}</span>
      </div>

      {/* Workspace */}
      <div className={styles.workspace}>
        {/* Editor — always visible */}
        <div className={styles.editorPane}>
          <div className="panel-label">Markdown source</div>
          <textarea
            className={`code-area ${styles.editor}`}
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            placeholder="# Your Markdown here…"
            spellCheck={false}
          />
        </div>

        {/* Output pane — changes by format */}
        <div className={styles.outputPane}>
          {format === 'pdf' && (
            <>
              <div className="panel-label">Rendered preview</div>
              <div
                ref={previewRef}
                className={styles.previewContent}
                dangerouslySetInnerHTML={{ __html: renderedHtml }}
              />
            </>
          )}

          {format === 'html' && (
            <>
              <div className={styles.outputHeader}>
                <div className="panel-label">HTML output</div>
                <span className={styles.outputHint}>
                  Paste directly into LLM prompt as context
                </span>
              </div>
              <pre className={styles.codeOutput}>{htmlOutput}</pre>
            </>
          )}

          {format === 'xml' && (
            <>
              <div className={styles.outputHeader}>
                <div className="panel-label">XML output</div>
                <span className={styles.outputHint}>
                  Structured tree — heading levels, list nesting, inline semantics preserved
                </span>
              </div>
              <pre className={styles.codeOutput}>{xmlOutput}</pre>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
