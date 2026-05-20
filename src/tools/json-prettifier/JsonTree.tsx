import { useState } from 'react'
import styles from './JsonPrettifier.module.css'

interface NodeProps {
  value: unknown
  keyName?: string
  depth?: number
  search: string
  defaultExpanded?: boolean
}

function highlight(text: string, search: string): React.ReactNode {
  if (!search || !text.toLowerCase().includes(search)) return text
  const idx = text.toLowerCase().indexOf(search)
  return (
    <>
      {text.slice(0, idx)}
      <mark className={styles.highlight}>{text.slice(idx, idx + search.length)}</mark>
      {text.slice(idx + search.length)}
    </>
  )
}

function matchesSearch(value: unknown, search: string): boolean {
  if (!search) return true
  const str = JSON.stringify(value).toLowerCase()
  return str.includes(search)
}

function JsonNode({ value, keyName, depth = 0, search, defaultExpanded = true }: NodeProps) {
  const [expanded, setExpanded] = useState(defaultExpanded || depth < 2)

  const indent = depth * 16

  if (value === null) {
    return (
      <div className={styles.node} style={{ paddingLeft: indent }}>
        {keyName !== undefined && (
          <span className={styles.key}>{highlight(keyName, search)}: </span>
        )}
        <span className={styles.null}>null</span>
      </div>
    )
  }

  if (typeof value === 'boolean') {
    return (
      <div className={styles.node} style={{ paddingLeft: indent }}>
        {keyName !== undefined && (
          <span className={styles.key}>{highlight(keyName, search)}: </span>
        )}
        <span className={styles.bool}>{String(value)}</span>
      </div>
    )
  }

  if (typeof value === 'number') {
    return (
      <div className={styles.node} style={{ paddingLeft: indent }}>
        {keyName !== undefined && (
          <span className={styles.key}>{highlight(keyName, search)}: </span>
        )}
        <span className={styles.number}>{highlight(String(value), search)}</span>
      </div>
    )
  }

  if (typeof value === 'string') {
    return (
      <div className={styles.node} style={{ paddingLeft: indent }}>
        {keyName !== undefined && (
          <span className={styles.key}>{highlight(keyName, search)}: </span>
        )}
        <span className={styles.string}>"{highlight(value, search)}"</span>
      </div>
    )
  }

  if (Array.isArray(value)) {
    const isMatch = matchesSearch(value, search)
    if (search && !isMatch) return null
    const label = `[${value.length}]`
    return (
      <div style={{ paddingLeft: indent }}>
        <div className={styles.collapsible} onClick={() => setExpanded((e) => !e)}>
          <span className={styles.chevron}>{expanded ? '▾' : '▸'}</span>
          {keyName !== undefined && (
            <span className={styles.key}>{highlight(keyName, search)}: </span>
          )}
          <span className={styles.bracket}>Array {label}</span>
          {!expanded && <span className={styles.preview}> …</span>}
        </div>
        {expanded &&
          value.map((item, i) => (
            <JsonNode
              key={i}
              value={item}
              keyName={String(i)}
              depth={depth + 1}
              search={search}
              defaultExpanded={depth < 1}
            />
          ))}
      </div>
    )
  }

  if (typeof value === 'object') {
    const obj = value as Record<string, unknown>
    const keys = Object.keys(obj)
    const isMatch = matchesSearch(value, search)
    if (search && !isMatch) return null
    return (
      <div style={{ paddingLeft: indent }}>
        <div className={styles.collapsible} onClick={() => setExpanded((e) => !e)}>
          <span className={styles.chevron}>{expanded ? '▾' : '▸'}</span>
          {keyName !== undefined && (
            <span className={styles.key}>{highlight(keyName, search)}: </span>
          )}
          <span className={styles.bracket}>Object {`{${keys.length}}`}</span>
          {!expanded && <span className={styles.preview}> …</span>}
        </div>
        {expanded &&
          keys.map((k) => (
            <JsonNode
              key={k}
              value={obj[k]}
              keyName={k}
              depth={depth + 1}
              search={search}
              defaultExpanded={depth < 1}
            />
          ))}
      </div>
    )
  }

  return null
}

interface JsonTreeProps {
  value: unknown
  search: string
}

export function JsonTree({ value, search }: JsonTreeProps) {
  return (
    <div className={styles.tree}>
      <JsonNode value={value} depth={0} search={search} defaultExpanded />
    </div>
  )
}
