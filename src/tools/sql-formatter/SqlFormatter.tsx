import { useState, useDeferredValue, useMemo } from 'react'
import { format as sqlFormat } from 'sql-formatter'
import { applyPostProcess } from './postProcess'
import { Button } from '../../components/Shared/Button'
import styles from './SqlFormatter.module.css'

// ─── types ────────────────────────────────────────────────────────────────

type Mode = 'format' | 'minify'
type KeywordCase = 'upper' | 'lower' | 'preserve'
type Dialect =
  | 'sql' | 'mysql' | 'postgresql' | 'mariadb' | 'sqlite'
  | 'transactsql' | 'plsql' | 'bigquery' | 'snowflake'
  | 'redshift' | 'spark' | 'hive' | 'trino' | 'duckdb'

// ─── minifier ─────────────────────────────────────────────────────────────

function minify(sql: string): string {
  return sql
    .replace(/--[^\n]*/g, '')          // strip line comments
    .replace(/\/\*[\s\S]*?\*\//g, '')  // strip block comments
    .replace(/\s+/g, ' ')              // collapse whitespace
    .replace(/\s*([(),;=<>!+\-*/%])\s*/g, '$1') // strip space around operators
    .trim()
}

// ─── constants ────────────────────────────────────────────────────────────

const DIALECTS: { value: Dialect; label: string }[] = [
  { value: 'sql',         label: 'Generic SQL' },
  { value: 'mysql',       label: 'MySQL'        },
  { value: 'postgresql',  label: 'PostgreSQL'   },
  { value: 'mariadb',     label: 'MariaDB'      },
  { value: 'sqlite',      label: 'SQLite'       },
  { value: 'transactsql', label: 'T-SQL (MSSQL)'},
  { value: 'plsql',       label: 'PL/SQL (Oracle)'},
  { value: 'bigquery',    label: 'BigQuery'     },
  { value: 'snowflake',   label: 'Snowflake'    },
  { value: 'redshift',    label: 'Redshift'     },
  { value: 'spark',       label: 'Spark SQL'    },
  { value: 'hive',        label: 'Hive'         },
  { value: 'trino',       label: 'Trino'        },
  { value: 'duckdb',      label: 'DuckDB'       },
]

const SAMPLE_SQL = `SELECT
  u.id,
  u.full_name,
  u.email,
  COUNT(o.id) AS total_orders,
  SUM(o.amount) AS total_spent,
  MAX(o.created_at) AS last_order_date
FROM users u
LEFT JOIN orders o ON o.user_id = u.id
  AND o.status NOT IN ('cancelled', 'refunded')
WHERE u.created_at >= '2024-01-01'
  AND u.is_active = true
GROUP BY u.id, u.full_name, u.email
HAVING COUNT(o.id) > 0
ORDER BY total_spent DESC
LIMIT 100;`

// ─── component ────────────────────────────────────────────────────────────

export default function SqlFormatterTool() {
  const [input, setInput]           = useState(SAMPLE_SQL)
  const [mode, setMode]             = useState<Mode>('format')
  const [dialect, setDialect]       = useState<Dialect>('sql')
  const [keywordCase, setKwCase]    = useState<KeywordCase>('upper')
  const [indentSize, setIndent]     = useState(2)
  const [compactSubq, setCompact]   = useState(false)
  const [normalizeId, setNormalize] = useState(false)
  const [copied, setCopied]         = useState(false)

  const deferredInput   = useDeferredValue(input)
  const deferredDialect = useDeferredValue(dialect)
  const deferredKwCase  = useDeferredValue(keywordCase)
  const deferredIndent  = useDeferredValue(indentSize)
  const deferredMode    = useDeferredValue(mode)
  const deferredCompact = useDeferredValue(compactSubq)
  const deferredNormalize = useDeferredValue(normalizeId)

  const { output, error } = useMemo(() => {
    if (!deferredInput.trim()) return { output: '', error: '' }
    try {
      if (deferredMode === 'minify') {
        return { output: minify(deferredInput), error: '' }
      }
      const formatted = sqlFormat(deferredInput, {
        language: deferredDialect,
        keywordCase: deferredKwCase,
        indentStyle: 'standard',
        tabWidth: deferredIndent,
        linesBetweenQueries: 1,
      })
      const result = applyPostProcess(formatted, {
        keywordCase: deferredKwCase,
        stripFunctionParenSpace: true,
        compactSubqueries: deferredCompact,
        normalizeIdents: deferredNormalize,
      })
      return { output: result, error: '' }
    } catch (e) {
      return { output: '', error: (e as Error).message }
    }
  }, [deferredInput, deferredMode, deferredDialect, deferredKwCase, deferredIndent, deferredCompact, deferredNormalize])

  const copy = () => {
    if (!output) return
    navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 1400)
  }

  const paste = async () => {
    const text = await navigator.clipboard.readText()
    setInput(text)
  }

  const stats = useMemo(() => {
    if (!output) return null
    const lines = output.split('\n').length
    const chars = output.length
    const inputChars = input.length
    const ratio = inputChars > 0 ? ((chars / inputChars) * 100).toFixed(0) : '0'
    return { lines, chars, ratio }
  }, [output, input])

  return (
    <div className="tool-root">
      {/* Header */}
      <div className={styles.header}>
        <span className="tool-title">SQL Formatter</span>
        <span className="tool-desc">Format for readability · Minify for code strings</span>

        {/* Mode toggle */}
        <div className={styles.modeToggle}>
          <button
            className={`${styles.modeBtn} ${mode === 'format' ? styles.modeBtnActive : ''}`}
            onClick={() => setMode('format')}
          >
            ✦ Format
          </button>
          <button
            className={`${styles.modeBtn} ${mode === 'minify' ? styles.modeBtnActive : ''}`}
            onClick={() => setMode('minify')}
          >
            ⟨⟩ Minify
          </button>
        </div>
      </div>

      {/* Options bar — only in format mode */}
      {mode === 'format' && (
        <div className={styles.optionsBar}>
          <div className={styles.optionGroup}>
            <label className={styles.optionLabel}>Dialect</label>
            <select
              className={styles.select}
              value={dialect}
              onChange={(e) => setDialect(e.target.value as Dialect)}
            >
              {DIALECTS.map((d) => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </select>
          </div>

          <div className={styles.optionGroup}>
            <label className={styles.optionLabel}>Keywords</label>
            <div className={styles.segmented}>
              {(['upper', 'lower', 'preserve'] as KeywordCase[]).map((k) => (
                <button
                  key={k}
                  className={`${styles.segBtn} ${keywordCase === k ? styles.segBtnActive : ''}`}
                  onClick={() => setKwCase(k)}
                >
                  {k === 'upper' ? 'UPPER' : k === 'lower' ? 'lower' : 'Preserve'}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.optionGroup}>
            <label className={styles.optionLabel}>Indent</label>
            <div className={styles.segmented}>
              {[2, 4].map((n) => (
                <button
                  key={n}
                  className={`${styles.segBtn} ${indentSize === n ? styles.segBtnActive : ''}`}
                  onClick={() => setIndent(n)}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.divider} />

          <label className={styles.checkLabel}>
            <input
              type="checkbox"
              checked={compactSubq}
              onChange={(e) => setCompact(e.target.checked)}
            />
            Compact subqueries
          </label>

          <label className={styles.checkLabel}>
            <input
              type="checkbox"
              checked={normalizeId}
              onChange={(e) => setNormalize(e.target.checked)}
            />
            Normalize identifiers
          </label>
        </div>
      )}

      {/* Workspace */}
      <div className="panel-row">
        {/* Input */}
        <div className="panel">
          <div className={styles.panelHead}>
            <span className="panel-label">Input SQL</span>
            <div className={styles.panelActions}>
              <Button size="sm" onClick={paste}>Paste</Button>
              <Button size="sm" variant="danger" onClick={() => setInput('')}>Clear</Button>
            </div>
          </div>
          <textarea
            className="code-area"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste your SQL query here…"
            spellCheck={false}
          />
        </div>

        {/* Output */}
        <div className="panel">
          <div className={styles.panelHead}>
            <span className="panel-label">
              {mode === 'format' ? 'Formatted' : 'Minified'}
            </span>
            <div className={styles.panelActions}>
              {stats && !error && (
                <span className={styles.stats}>
                  {mode === 'minify'
                    ? `${stats.chars} chars · ${stats.ratio}% of input`
                    : `${stats.lines} lines · ${stats.chars} chars`}
                </span>
              )}
              <Button size="sm" onClick={copy} disabled={!output || !!error}>
                {copied ? '✓ Copied' : 'Copy'}
              </Button>
            </div>
          </div>

          {error
            ? <div className={styles.errorBox}>
                <span className={styles.errorIcon}>✖</span>
                <span>{error}</span>
              </div>
            : <textarea
                className={`code-area ${styles.outputArea}`}
                value={output}
                readOnly
                placeholder={mode === 'format' ? 'Formatted SQL appears here…' : 'Minified SQL appears here…'}
                spellCheck={false}
              />
          }
        </div>
      </div>
    </div>
  )
}
