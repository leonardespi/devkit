import { useState, useMemo } from 'react'
import { Button } from '../../components/Shared/Button'
import { diffLines, statsOf, type DiffLine } from './diff'
import styles from './DiffChecker.module.css'

function DiffView({ lines }: { lines: DiffLine[] }) {
  if (!lines.length) return <span className={styles.empty}>Paste text in both panels to compare.</span>

  return (
    <div className={styles.diffGrid}>
      {/* Left column: A */}
      <div className={styles.diffCol}>
        {lines.map((l, i) =>
          l.type !== 'add' ? (
            <div key={i} className={`${styles.diffRow} ${l.type === 'del' ? styles.delRow : ''}`}>
              <span className={styles.lineNum}>{l.lineA}</span>
              <pre className={styles.lineText}>{l.text || ' '}</pre>
            </div>
          ) : (
            <div key={i} className={`${styles.diffRow} ${styles.emptyRow}`}>
              <span className={styles.lineNum} />
              <pre className={styles.lineText}> </pre>
            </div>
          ),
        )}
      </div>

      {/* Right column: B */}
      <div className={styles.diffCol}>
        {lines.map((l, i) =>
          l.type !== 'del' ? (
            <div key={i} className={`${styles.diffRow} ${l.type === 'add' ? styles.addRow : ''}`}>
              <span className={styles.lineNum}>{l.lineB}</span>
              <pre className={styles.lineText}>{l.text || ' '}</pre>
            </div>
          ) : (
            <div key={i} className={`${styles.diffRow} ${styles.emptyRow}`}>
              <span className={styles.lineNum} />
              <pre className={styles.lineText}> </pre>
            </div>
          ),
        )}
      </div>
    </div>
  )
}

export default function DiffChecker() {
  const [textA, setTextA] = useState('')
  const [textB, setTextB] = useState('')

  const lines = useMemo(() => diffLines(textA, textB), [textA, textB])
  const stats  = useMemo(() => statsOf(lines), [lines])

  const swap = () => {
    setTextA(textB)
    setTextB(textA)
  }

  return (
    <div className="tool-root">
      <div className="tool-header">
        <span className="tool-title">Diff Checker</span>
        <span className="tool-desc">Visual line-by-line comparison</span>
        {(textA || textB) && (
          <div className={styles.stats}>
            <span className={styles.statAdd}>+{stats.added}</span>
            <span className={styles.statDel}>−{stats.removed}</span>
            <span className={styles.statEq}>{stats.unchanged} equal</span>
          </div>
        )}
        <Button size="sm" onClick={swap} disabled={!textA && !textB}>⇄ Swap</Button>
        <Button size="sm" variant="ghost" onClick={() => { setTextA(''); setTextB('') }}>Clear</Button>
      </div>

      {/* Editors */}
      <div className={styles.editors}>
        <div className="panel">
          <div className="panel-label">Text A</div>
          <textarea
            className="code-area"
            value={textA}
            onChange={(e) => setTextA(e.target.value)}
            placeholder="Paste Text A…"
            spellCheck={false}
          />
        </div>
        <div className="panel">
          <div className="panel-label">Text B</div>
          <textarea
            className="code-area"
            value={textB}
            onChange={(e) => setTextB(e.target.value)}
            placeholder="Paste Text B…"
            spellCheck={false}
          />
        </div>
      </div>

      {/* Diff output */}
      <div className={styles.diffContainer}>
        <div className="panel-label">
          Diff
          {lines.every((l) => l.type === 'equal') && textA && (
            <span className={styles.identical}> — Files are identical</span>
          )}
        </div>
        <div className={styles.diffScroll}>
          <DiffView lines={lines} />
        </div>
      </div>
    </div>
  )
}
