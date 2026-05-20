import { marked } from 'marked'
import type { Token } from 'marked'

export type ExportFormat = 'pdf' | 'html' | 'xml'

// ─── helpers ───────────────────────────────────────────────────────────────

function esc(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function attr(name: string, val: string | undefined): string {
  return val ? ` ${name}="${esc(val)}"` : ''
}

function indent(xml: string, spaces = 2): string {
  return xml
    .split('\n')
    .map((l) => ' '.repeat(spaces) + l)
    .join('\n')
}

// ─── inline token → XML ────────────────────────────────────────────────────

function inlineToXml(tokens: Token[]): string {
  return tokens
    .map((t) => {
      switch (t.type) {
        case 'text':
          return (t as { tokens?: Token[]; text: string }).tokens?.length
            ? inlineToXml((t as { tokens: Token[] }).tokens)
            : esc(t.text)
        case 'escape':
          return esc((t as { text: string }).text)
        case 'strong':
          return `<strong>${inlineToXml((t as { tokens: Token[] }).tokens)}</strong>`
        case 'em':
          return `<em>${inlineToXml((t as { tokens: Token[] }).tokens)}</em>`
        case 'del':
          return `<del>${inlineToXml((t as { tokens: Token[] }).tokens)}</del>`
        case 'codespan':
          return `<code>${esc((t as { text: string }).text)}</code>`
        case 'link': {
          const l = t as { href: string; title: string | null; tokens: Token[] }
          return `<link${attr('href', l.href)}${attr('title', l.title ?? undefined)}>${inlineToXml(l.tokens)}</link>`
        }
        case 'image': {
          const i = t as { href: string; title: string | null; text: string }
          return `<image${attr('src', i.href)}${attr('alt', i.text)}${attr('title', i.title ?? undefined)}/>`
        }
        case 'br':
          return '<br/>'
        case 'html':
          return esc((t as { text: string }).text)
        default:
          return 'text' in t ? esc((t as { text: string }).text) : ''
      }
    })
    .join('')
}

// ─── block token → XML ─────────────────────────────────────────────────────

function blockToXml(token: Token): string {
  switch (token.type) {
    case 'space':
      return ''

    case 'heading': {
      const h = token as { depth: number; tokens: Token[] }
      return `<heading level="${h.depth}">${inlineToXml(h.tokens)}</heading>`
    }

    case 'paragraph': {
      const p = token as { tokens: Token[] }
      return `<paragraph>${inlineToXml(p.tokens)}</paragraph>`
    }

    case 'code': {
      const c = token as { text: string; lang?: string }
      return `<code_block${attr('language', c.lang)}>${esc(c.text)}</code_block>`
    }

    case 'blockquote': {
      const bq = token as { tokens: Token[] }
      const inner = bq.tokens.map(blockToXml).filter(Boolean).join('\n')
      return `<blockquote>\n${indent(inner)}\n</blockquote>`
    }

    case 'list': {
      const list = token as {
        ordered: boolean
        start: number | ''
        items: Array<{ tokens: Token[]; task: boolean; checked?: boolean }>
      }
      const ordAttr = ` ordered="${list.ordered}"`
      const startAttr = list.ordered && list.start !== 1 && list.start !== '' ? ` start="${list.start}"` : ''
      const items = list.items
        .map((item) => {
          const taskAttr = item.task ? ` checked="${item.checked}"` : ''
          // list_item tokens can contain paragraphs or inline tokens
          const inner = item.tokens.map((t) => {
            if (t.type === 'text' || t.type === 'paragraph') {
              return inlineToXml((t as { tokens?: Token[]; text: string }).tokens ?? [])
            }
            return blockToXml(t)
          }).join('')
          return `  <item${taskAttr}>${inner}</item>`
        })
        .join('\n')
      return `<list${ordAttr}${startAttr}>\n${items}\n</list>`
    }

    case 'table': {
      const tbl = token as {
        header: Array<{ tokens: Token[] }>
        rows: Array<Array<{ tokens: Token[] }>>
      }
      const header = tbl.header
        .map((cell) => `    <cell>${inlineToXml(cell.tokens)}</cell>`)
        .join('\n')
      const rows = tbl.rows
        .map((row) => {
          const cells = row.map((cell) => `    <cell>${inlineToXml(cell.tokens)}</cell>`).join('\n')
          return `  <row>\n${cells}\n  </row>`
        })
        .join('\n')
      return `<table>\n  <header>\n${header}\n  </header>\n${rows}\n</table>`
    }

    case 'hr':
      return '<divider/>'

    case 'html':
      return `<html_block>${esc((token as { text: string }).text)}</html_block>`

    default:
      return ''
  }
}

// ─── public converters ─────────────────────────────────────────────────────

export function toHtml(markdown: string): string {
  const body = marked.parse(markdown) as string
  return `<article>\n${body}</article>`
}

export function toXml(markdown: string): string {
  const tokens = marked.lexer(markdown)
  const body = tokens
    .map(blockToXml)
    .filter(Boolean)
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<document>\n${indent(body)}\n</document>`
}

// ─── PDF via print window ──────────────────────────────────────────────────

const PDF_STYLES = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 15px; line-height: 1.7; color: #111; padding: 40px; max-width: 800px; margin: 0 auto; }
  h1,h2,h3,h4,h5,h6 { margin: 1.2em 0 0.5em; font-weight: 600; line-height: 1.3; }
  h1 { font-size: 2em; border-bottom: 1px solid #e1e4e8; padding-bottom: 0.3em; }
  h2 { font-size: 1.5em; border-bottom: 1px solid #e1e4e8; padding-bottom: 0.3em; }
  h3 { font-size: 1.25em; }
  p { margin: 0.8em 0; }
  ul,ol { margin: 0.8em 0; padding-left: 2em; }
  li { margin: 0.3em 0; }
  a { color: #0366d6; }
  code { background: #f6f8fa; border-radius: 3px; font-family: monospace; font-size: 0.875em; padding: 0.2em 0.4em; color: #e3116c; }
  pre { background: #f6f8fa; border-radius: 6px; padding: 16px; overflow: auto; margin: 1em 0; }
  pre code { background: none; color: inherit; padding: 0; font-size: 0.9em; }
  blockquote { border-left: 4px solid #dfe2e5; color: #6a737d; margin: 1em 0; padding: 0 1em; }
  table { border-collapse: collapse; margin: 1em 0; width: 100%; }
  th,td { border: 1px solid #dfe2e5; padding: 8px 12px; }
  th { background: #f6f8fa; font-weight: 600; }
  hr { border: none; border-top: 1px solid #e1e4e8; margin: 1.5em 0; }
`

export function printAsPdf(htmlContent: string): void {
  const win = window.open('', '', 'width=900,height=700')
  if (!win) return
  win.document.write(
    `<!DOCTYPE html><html><head><title>Document</title><style>${PDF_STYLES}</style></head><body>${htmlContent}</body></html>`,
  )
  win.document.close()
  win.focus()
  win.print()
}

export function downloadFile(content: string, filename: string, mime: string): void {
  const blob = new Blob([content], { type: mime })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = filename
  a.click()
  URL.revokeObjectURL(a.href)
}
