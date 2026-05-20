import { useState, useDeferredValue, useEffect } from 'react'
import {
  renderMermaid,
  encodePlantUML,
  plantUmlSvgUrl,
  MERMAID_TEMPLATES,
  MERMAID_TEMPLATE_META,
  PLANTUML_TEMPLATE,
  type MermaidTemplate,
} from './engines'
import { Button } from '../../components/Shared/Button'
import styles from './DiagramEditor.module.css'

type Engine = 'mermaid' | 'plantuml'

export default function DiagramEditorTool() {
  const [engine, setEngine]       = useState<Engine>('mermaid')
  const [tmpl, setTmpl]           = useState<MermaidTemplate>('sequence')
  const [mermaidCode, setMCode]   = useState(MERMAID_TEMPLATES.sequence)
  const [plantCode, setPlantCode] = useState(PLANTUML_TEMPLATE)
  const [svg, setSvg]             = useState('')
  const [plantUrl, setPlantUrl]   = useState('')
  const [error, setError]         = useState('')
  const [rendering, setRendering] = useState(false)
  const [copied, setCopied]       = useState(false)

  const code    = engine === 'mermaid' ? mermaidCode : plantCode
  const setCode = engine === 'mermaid' ? setMCode : setPlantCode

  const deferredCode   = useDeferredValue(code)
  const deferredEngine = useDeferredValue(engine)

  useEffect(() => {
    let cancelled = false
    setError('')

    if (!deferredCode.trim()) {
      setSvg('')
      setPlantUrl('')
      setRendering(false)
      return
    }

    setRendering(true)

    if (deferredEngine === 'mermaid') {
      renderMermaid(deferredCode)
        .then((s) => {
          if (!cancelled) { setSvg(s); setRendering(false) }
        })
        .catch((e: unknown) => {
          if (!cancelled) {
            const raw = e instanceof Error ? e.message : String(e)
            const clean = raw.replace(/<[^>]*>/g, '').split('\n')[0].trim()
            setError(clean || 'Diagram syntax error')
            setSvg('')
            setRendering(false)
          }
        })
    } else {
      encodePlantUML(deferredCode)
        .then((encoded) => {
          if (!cancelled) {
            setPlantUrl(encoded ? plantUmlSvgUrl(encoded) : '')
            setRendering(false)
          }
        })
        .catch(() => { if (!cancelled) setRendering(false) })
    }

    return () => { cancelled = true }
  }, [deferredCode, deferredEngine])

  const pickTemplate = (t: MermaidTemplate) => {
    setTmpl(t)
    setMCode(MERMAID_TEMPLATES[t])
  }

  const paste = async () => {
    const text = await navigator.clipboard.readText()
    setCode(text)
  }

  const downloadSvg = () => {
    if (!svg) return
    const blob = new Blob([svg], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'diagram.svg'; a.click()
    URL.revokeObjectURL(url)
  }

  const copySvg = () => {
    if (!svg) return
    navigator.clipboard.writeText(svg)
    setCopied(true)
    setTimeout(() => setCopied(false), 1400)
  }

  const copyUrl = () => {
    if (!plantUrl) return
    navigator.clipboard.writeText(plantUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 1400)
  }

  const handleTab = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key !== 'Tab') return
    e.preventDefault()
    const el = e.currentTarget
    const s = el.selectionStart
    const newVal = code.slice(0, s) + '    ' + code.slice(el.selectionEnd)
    setCode(newVal)
    requestAnimationFrame(() => {
      el.selectionStart = el.selectionEnd = s + 4
    })
  }

  return (
    <div className="tool-root">
      {/* Header */}
      <div className={styles.header}>
        <span className="tool-title">Diagram Editor</span>
        <span className="tool-desc">
          Mermaid · PlantUML live preview — architecture docs in seconds
        </span>

        <div className={styles.modeToggle}>
          <button
            className={`${styles.modeBtn} ${engine === 'mermaid' ? styles.modeBtnActive : ''}`}
            onClick={() => setEngine('mermaid')}
          >
            ◈ Mermaid
          </button>
          <button
            className={`${styles.modeBtn} ${styles.modeBtnDisabled}`}
            disabled
            title="PlantUML coming soon"
          >
            ❋ PlantUML
          </button>
        </div>
      </div>

      {/* Template bar — Mermaid only */}
      {engine === 'mermaid' && (
        <div className={styles.optionsBar}>
          <span className={styles.optionLabel}>Template</span>
          <div className={styles.typeRow}>
            {MERMAID_TEMPLATE_META.map((t) => (
              <button
                key={t.id}
                className={`${styles.typeBtn} ${tmpl === t.id ? styles.typeBtnActive : ''}`}
                onClick={() => pickTemplate(t.id)}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Workspace */}
      <div className="panel-row">
        {/* Editor */}
        <div className="panel">
          <div className={styles.panelHead}>
            <span className="panel-label">
              {engine === 'mermaid' ? 'Mermaid DSL' : 'PlantUML'}
            </span>
            <div className={styles.panelActions}>
              <Button size="sm" onClick={paste}>Paste</Button>
              <Button size="sm" variant="danger" onClick={() => setCode('')}>Clear</Button>
            </div>
          </div>
          <textarea
            className="code-area"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={handleTab}
            placeholder={
              engine === 'mermaid'
                ? 'Enter Mermaid diagram…'
                : 'Enter PlantUML diagram…'
            }
            spellCheck={false}
          />
        </div>

        {/* Preview */}
        <div className="panel">
          <div className={styles.panelHead}>
            <span className="panel-label">
              Preview
              {rendering && <span className={styles.badge}> rendering…</span>}
            </span>
            <div className={styles.panelActions}>
              {engine === 'mermaid' ? (
                <>
                  <Button size="sm" onClick={copySvg} disabled={!svg || !!error}>
                    {copied ? '✓ Copied' : 'Copy SVG'}
                  </Button>
                  <Button size="sm" onClick={downloadSvg} disabled={!svg || !!error}>
                    ↓ SVG
                  </Button>
                </>
              ) : (
                <>
                  <Button size="sm" onClick={copyUrl} disabled={!plantUrl}>
                    {copied ? '✓ Copied' : 'Copy URL'}
                  </Button>
                  {plantUrl && (
                    <Button size="sm" onClick={() => window.open(plantUrl, '_blank')}>
                      ↗ Open
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>

          <div className={styles.previewPane}>
            {!rendering && error && (
              <div className={styles.errorBox}>
                <span className={styles.errorIcon}>✖</span>
                <span>{error}</span>
              </div>
            )}

            {!error && engine === 'mermaid' && svg && (
              <div
                className={styles.svgContainer}
                dangerouslySetInnerHTML={{ __html: svg }}
              />
            )}

            {!error && engine === 'plantuml' && plantUrl && (
              <div className={styles.plantWrap}>
                <img
                  key={plantUrl}
                  src={plantUrl}
                  alt="PlantUML diagram"
                  className={styles.plantImg}
                  onError={() => setError('Cannot reach PlantUML server — check connection')}
                />
              </div>
            )}

            {!error && !svg && !plantUrl && !rendering && (
              <div className={styles.emptyState}>Type a diagram to see preview</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
