import { useState, useCallback, useDeferredValue } from 'react'
import { Button } from '../../components/Shared/Button'
import { JsonTree } from './JsonTree'
import styles from './JsonPrettifier.module.css'

type ParseResult =
  | { ok: true; value: unknown }
  | { ok: false; error: string }

function parseJson(raw: string): ParseResult {
  if (!raw.trim()) return { ok: true, value: null }
  try {
    return { ok: true, value: JSON.parse(raw) }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

export default function JsonPrettifier() {
  const [input, setInput] = useState('')
  const [search, setSearch] = useState('')
  const deferredInput = useDeferredValue(input)

  const result = parseJson(deferredInput)

  const format = useCallback(() => {
    const r = parseJson(input)
    if (r.ok && r.value !== null) setInput(JSON.stringify(r.value, null, 2))
  }, [input])

  const minify = useCallback(() => {
    const r = parseJson(input)
    if (r.ok && r.value !== null) setInput(JSON.stringify(r.value))
  }, [input])

  const paste = useCallback(async () => {
    const text = await navigator.clipboard.readText()
    setInput(text)
  }, [])

  return (
    <div className="tool-root">
      <div className="tool-header">
        <span className="tool-title">JSON Explorer</span>
        <span className="tool-desc">Format, minify, and explore JSON interactively</span>
      </div>

      <div className={styles.workspace}>
        {/* Left: input panel */}
        <div className={styles.inputPanel}>
          <div className={styles.panelHeader}>
            <span className="panel-label">Raw JSON</span>
            <div className={styles.actions}>
              <Button size="sm" onClick={paste}>Paste</Button>
              <Button size="sm" variant="primary" onClick={format}>Format</Button>
              <Button size="sm" onClick={minify}>Minify</Button>
              <Button size="sm" variant="danger" onClick={() => setInput('')}>Clear</Button>
            </div>
          </div>
          <textarea
            className={`code-area ${styles.inputArea} ${!result.ok ? styles.error : ''}`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={'Paste JSON here…\n\n{\n  "name": "devkit",\n  "version": "1.0.0"\n}'}
            spellCheck={false}
          />
          {!result.ok && (
            <div className={styles.errorBadge}>
              ✖ {result.error}
            </div>
          )}
        </div>

        {/* Right: tree viewer */}
        <div className={styles.treePanel}>
          <div className={styles.panelHeader}>
            <span className="panel-label">Explorer</span>
            <input
              className={styles.searchInput}
              placeholder="Search keys or values…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className={styles.treeScroll}>
            {result.ok && result.value !== null ? (
              <JsonTree value={result.value} search={search.toLowerCase()} />
            ) : result.ok ? (
              <span className={styles.emptyState}>Paste JSON on the left to explore it here.</span>
            ) : (
              <span className={styles.emptyState}>Fix the JSON error to see the tree.</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
