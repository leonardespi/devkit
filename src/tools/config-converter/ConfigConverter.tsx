import { useState, useDeferredValue } from 'react'
import { Button } from '../../components/Shared/Button'
import { convert, type Format } from './converters'
import styles from './ConfigConverter.module.css'

const FORMATS: { value: Format; label: string }[] = [
  { value: 'json',  label: 'JSON'  },
  { value: 'yaml',  label: 'YAML'  },
  { value: 'toml',  label: 'TOML'  },
  { value: 'env',   label: '.env'  },
]

const PLACEHOLDERS: Record<Format, string> = {
  json: '{\n  "db_host": "localhost",\n  "db_port": 5432,\n  "debug": true\n}',
  yaml: 'db_host: localhost\ndb_port: 5432\ndebug: true',
  toml: 'db_host = "localhost"\ndb_port = 5432\ndebug = true',
  env:  'DB_HOST=localhost\nDB_PORT=5432\nDEBUG=true',
}

export default function ConfigConverter() {
  const [input, setInput]   = useState('')
  const [fromFmt, setFrom]  = useState<Format>('json')
  const [toFmt, setTo]      = useState<Format>('yaml')
  const deferredInput = useDeferredValue(input)
  const deferredFrom  = useDeferredValue(fromFmt)
  const deferredTo    = useDeferredValue(toFmt)

  let output = ''
  let convertError = ''
  if (deferredInput.trim()) {
    try {
      output = convert(deferredInput, deferredFrom, deferredTo)
      convertError = ''
    } catch (e) {
      convertError = (e as Error).message
    }
  }

  const swap = () => {
    setFrom(toFmt)
    setTo(fromFmt)
    setInput(output)
  }

  const copy = () => {
    if (output) navigator.clipboard.writeText(output)
  }

  const FormatSelect = ({
    value,
    onChange,
  }: {
    value: Format
    onChange: (f: Format) => void
  }) => (
    <select
      className={styles.select}
      value={value}
      onChange={(e) => onChange(e.target.value as Format)}
    >
      {FORMATS.map((f) => (
        <option key={f.value} value={f.value}>
          {f.label}
        </option>
      ))}
    </select>
  )

  return (
    <div className="tool-root">
      <div className="tool-header">
        <span className="tool-title">Config Converter</span>
        <span className="tool-desc">Convert between JSON · YAML · TOML · .env in real-time</span>
      </div>

      <div className={styles.controls}>
        <div className={styles.formatBar}>
          <span className="panel-label" style={{ marginBottom: 0 }}>From</span>
          <FormatSelect value={fromFmt} onChange={setFrom} />
        </div>
        <Button size="sm" onClick={swap} title="Swap formats and content">⇄ Swap</Button>
        <div className={styles.formatBar}>
          <span className="panel-label" style={{ marginBottom: 0 }}>To</span>
          <FormatSelect value={toFmt} onChange={setTo} />
        </div>
        <Button size="sm" onClick={copy} disabled={!output}>Copy output</Button>
      </div>

      <div className="panel-row">
        <div className="panel">
          <textarea
            className="code-area"
            value={input}
            onChange={(e) => { setInput(e.target.value) }}
            placeholder={PLACEHOLDERS[fromFmt]}
            spellCheck={false}
          />
        </div>

        <div className="panel">
          <textarea
            className={`code-area ${convertError ? styles.errorOutput : ''}`}
            value={convertError ? `Error: ${convertError}` : output}
            readOnly
            placeholder="Output appears here…"
            spellCheck={false}
          />
        </div>
      </div>
    </div>
  )
}
