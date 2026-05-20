import { useState, useMemo, useCallback } from 'react'
import { Button } from '../../components/Shared/Button'
import styles from './RegexLab.module.css'

const LS_KEY = 'devkit:regex-collection'

interface SavedRegex {
  id: string
  name: string
  pattern: string
  flags: string
}

function loadCollection(): SavedRegex[] {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) ?? '[]')
  } catch {
    return []
  }
}

function saveCollection(col: SavedRegex[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(col))
}

const ALL_FLAGS = ['g', 'i', 'm', 's', 'u']

interface Match {
  index: number
  length: number
  value: string
  groups: string[]
}

function runRegex(pattern: string, flags: string, input: string): { matches: Match[]; error: string } {
  if (!pattern) return { matches: [], error: '' }
  try {
    const re = new RegExp(pattern, flags)
    const matches: Match[] = []
    if (flags.includes('g')) {
      let m: RegExpExecArray | null
      while ((m = re.exec(input)) !== null) {
        matches.push({
          index: m.index,
          length: m[0].length,
          value: m[0],
          groups: m.slice(1).map((g) => g ?? ''),
        })
        if (m[0].length === 0) re.lastIndex++
      }
    } else {
      const m = re.exec(input)
      if (m) {
        matches.push({
          index: m.index,
          length: m[0].length,
          value: m[0],
          groups: m.slice(1).map((g) => g ?? ''),
        })
      }
    }
    return { matches, error: '' }
  } catch (e) {
    return { matches: [], error: (e as Error).message }
  }
}

function HighlightedText({ input, matches }: { input: string; matches: Match[] }) {
  if (!matches.length) return <span>{input}</span>

  const sorted = [...matches].sort((a, b) => a.index - b.index)
  const parts: React.ReactNode[] = []
  let cursor = 0

  for (const m of sorted) {
    if (m.index > cursor) parts.push(<span key={`t${cursor}`}>{input.slice(cursor, m.index)}</span>)
    parts.push(
      <mark key={`m${m.index}`} className={styles.matchHighlight} title={`Match: "${m.value}"`}>
        {input.slice(m.index, m.index + m.length)}
      </mark>,
    )
    cursor = m.index + m.length
  }
  if (cursor < input.length) parts.push(<span key="tail">{input.slice(cursor)}</span>)
  return <>{parts}</>
}

export default function RegexLab() {
  const [pattern, setPattern]   = useState('')
  const [flags, setFlags]       = useState<Set<string>>(new Set(['g']))
  const [testInput, setInput]   = useState('')
  const [collection, setCol]    = useState<SavedRegex[]>(loadCollection)
  const [saveName, setSaveName] = useState('')
  const [showSave, setShowSave] = useState(false)

  const flagStr = [...flags].join('')
  const { matches, error } = useMemo(() => runRegex(pattern, flagStr, testInput), [pattern, flagStr, testInput])

  const toggleFlag = useCallback((f: string) => {
    setFlags((prev) => {
      const next = new Set(prev)
      next.has(f) ? next.delete(f) : next.add(f)
      return next
    })
  }, [])

  const saveRegex = useCallback(() => {
    if (!saveName.trim() || !pattern) return
    const entry: SavedRegex = {
      id: String(Date.now()),
      name: saveName.trim(),
      pattern,
      flags: flagStr,
    }
    const next = [entry, ...collection]
    setCol(next)
    saveCollection(next)
    setSaveName('')
    setShowSave(false)
  }, [saveName, pattern, flagStr, collection])

  const loadRegex = useCallback((item: SavedRegex) => {
    setPattern(item.pattern)
    setFlags(new Set(item.flags.split('')))
  }, [])

  const deleteRegex = useCallback((id: string) => {
    const next = collection.filter((x) => x.id !== id)
    setCol(next)
    saveCollection(next)
  }, [collection])

  return (
    <div className="tool-root">
      <div className="tool-header">
        <span className="tool-title">RegEx Lab</span>
        <span className="tool-desc">Live regex testing with personal collection</span>
      </div>

      <div className={styles.layout}>
        {/* Main pane */}
        <div className={styles.mainPane}>
          {/* Pattern input */}
          <div className={styles.patternRow}>
            <span className={styles.slash}>/</span>
            <input
              className={`${styles.patternInput} ${error ? styles.patternError : ''}`}
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              placeholder="pattern"
              spellCheck={false}
            />
            <span className={styles.slash}>/</span>
            <div className={styles.flagsRow}>
              {ALL_FLAGS.map((f) => (
                <button
                  key={f}
                  className={`${styles.flagBtn} ${flags.has(f) ? styles.flagActive : ''}`}
                  onClick={() => toggleFlag(f)}
                  title={`Flag: ${f}`}
                >
                  {f}
                </button>
              ))}
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowSave((s) => !s)}
              disabled={!pattern}
              title="Save to collection"
            >
              ☆ Save
            </Button>
          </div>

          {error && <div className={styles.errorMsg}>✖ {error}</div>}

          {showSave && (
            <div className={styles.saveRow}>
              <input
                className={styles.saveInput}
                placeholder="Name this regex…"
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && saveRegex()}
              />
              <Button size="sm" variant="primary" onClick={saveRegex} disabled={!saveName.trim()}>Save</Button>
              <Button size="sm" variant="ghost" onClick={() => setShowSave(false)}>Cancel</Button>
            </div>
          )}

          {/* Test input */}
          <div className={styles.sectionLabel}>Test string</div>
          <textarea
            className={`code-area ${styles.testArea}`}
            value={testInput}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter test string here…"
            spellCheck={false}
          />

          {/* Highlighted output */}
          {testInput && (
            <>
              <div className={styles.sectionLabel}>
                Result
                <span className={styles.matchCount}>
                  {matches.length} match{matches.length !== 1 ? 'es' : ''}
                </span>
              </div>
              <div className={styles.highlightBox}>
                <pre className={styles.highlightPre}>
                  <HighlightedText input={testInput} matches={matches} />
                </pre>
              </div>
            </>
          )}

          {/* Match table */}
          {matches.length > 0 && (
            <div className={styles.matchTable}>
              {matches.map((m, i) => (
                <div key={i} className={styles.matchRow}>
                  <span className={styles.matchIdx}>#{i + 1}</span>
                  <span className={styles.matchVal}>"{m.value}"</span>
                  <span className={styles.matchMeta}>at {m.index}</span>
                  {m.groups.length > 0 && (
                    <span className={styles.matchGroups}>
                      groups: [{m.groups.map((g) => `"${g}"`).join(', ')}]
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Collection sidebar */}
        <div className={styles.collectionPane}>
          <div className={styles.collectionHeader}>
            <span className="panel-label" style={{ marginBottom: 0 }}>Saved</span>
            <span className={styles.collectionCount}>{collection.length}</span>
          </div>
          {collection.length === 0 ? (
            <span className={styles.emptyCollection}>Save a regex to build your collection.</span>
          ) : (
            collection.map((item) => (
              <div key={item.id} className={styles.collectionItem}>
                <div className={styles.collectionName}>{item.name}</div>
                <div className={styles.collectionPattern}>
                  /{item.pattern}/{item.flags}
                </div>
                <div className={styles.collectionActions}>
                  <Button size="sm" variant="ghost" onClick={() => loadRegex(item)}>Load</Button>
                  <Button size="sm" variant="danger" onClick={() => deleteRegex(item.id)}>✕</Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
