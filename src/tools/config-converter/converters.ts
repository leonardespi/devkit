import yaml from 'js-yaml'
import { parse as parseTOML, stringify as stringifyTOML } from 'smol-toml'

export type Format = 'json' | 'yaml' | 'toml' | 'env'

// ---------- parsers ----------

function parseJSON(src: string): unknown {
  return JSON.parse(src)
}

function parseYAML(src: string): unknown {
  return yaml.load(src)
}

function parseTOMLSrc(src: string): unknown {
  return parseTOML(src)
}

function parseEnv(src: string): Record<string, string> {
  const result: Record<string, string> = {}
  for (const line of src.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    let val = trimmed.slice(eq + 1).trim()
    if ((val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1)
    }
    result[key] = val
  }
  return result
}

export function parse(src: string, fmt: Format): unknown {
  const s = src.trim()
  if (!s) return null
  switch (fmt) {
    case 'json': return parseJSON(s)
    case 'yaml': return parseYAML(s)
    case 'toml': return parseTOMLSrc(s)
    case 'env':  return parseEnv(s)
  }
}

// ---------- serializers ----------

function toJSON(v: unknown): string {
  return JSON.stringify(v, null, 2)
}

function toYAML(v: unknown): string {
  return yaml.dump(v, { lineWidth: 120, noRefs: true })
}

function toTOML(v: unknown): string {
  return stringifyTOML(v as Parameters<typeof stringifyTOML>[0])
}

function toEnv(v: unknown): string {
  if (typeof v !== 'object' || v === null || Array.isArray(v)) {
    throw new Error('.env format requires a flat key-value object at the root')
  }
  const obj = v as Record<string, unknown>
  return Object.entries(obj)
    .map(([k, val]) => {
      const str = String(val)
      const needsQuotes = str.includes(' ') || str.includes('=') || str.includes('#') || str === ''
      return `${k}=${needsQuotes ? `"${str}"` : str}`
    })
    .join('\n')
}

export function serialize(v: unknown, fmt: Format): string {
  switch (fmt) {
    case 'json': return toJSON(v)
    case 'yaml': return toYAML(v)
    case 'toml': return toTOML(v)
    case 'env':  return toEnv(v)
  }
}

export function convert(src: string, fromFmt: Format, toFmt: Format): string {
  const parsed = parse(src, fromFmt)
  if (parsed === null) return ''
  return serialize(parsed, toFmt)
}
