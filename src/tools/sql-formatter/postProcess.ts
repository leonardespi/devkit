/**
 * Post-processing pipeline for sql-formatter output.
 * Fixes four classes of issues the library doesn't handle:
 *   1. Built-in function casing (coalesce → COALESCE)
 *   2. Space before function parens (DATEADD (x → DATEADD(x)
 *   3. Compact scalar subqueries in expressions
 *   4. Optional identifier normalization (aliases, CTE names → lowercase)
 */

// ─── SQL built-in function list ────────────────────────────────────────────
// Keywords the library handles; functions it often misses.

const SQL_FUNCTIONS: string[] = [
  // Conditional / null
  'COALESCE', 'NULLIF', 'IIF', 'NVL', 'NVL2', 'DECODE', 'IFNULL', 'ISNULL',
  'GREATEST', 'LEAST', 'CHOOSE',
  // Aggregate
  'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'STDDEV', 'STDDEV_POP', 'STDDEV_SAMP',
  'VARIANCE', 'VAR_POP', 'VAR_SAMP', 'MEDIAN', 'PERCENTILE_CONT', 'PERCENTILE_DISC',
  'MODE', 'CORR', 'COVAR_POP', 'COVAR_SAMP', 'REGR_SLOPE', 'REGR_INTERCEPT',
  // String
  'CONCAT', 'CONCAT_WS', 'TRIM', 'LTRIM', 'RTRIM', 'UPPER', 'LOWER',
  'LENGTH', 'LEN', 'CHAR_LENGTH', 'CHARACTER_LENGTH',
  'SUBSTR', 'SUBSTRING', 'MID', 'REPLACE', 'TRANSLATE', 'OVERLAY',
  'CHARINDEX', 'INSTR', 'LOCATE', 'POSITION', 'STRPOS',
  'PATINDEX', 'STUFF', 'INSERT', 'REVERSE', 'REPEAT', 'REPLICATE',
  'SPACE', 'ASCII', 'CHAR', 'CHR', 'UNICODE', 'NCHAR',
  'FORMAT', 'SPLIT_PART', 'SPLIT', 'INITCAP',
  'REGEXP_REPLACE', 'REGEXP_SUBSTR', 'REGEXP_INSTR', 'REGEXP_LIKE', 'REGEXP_MATCH',
  'SOUNDEX', 'DIFFERENCE', 'LEVENSHTEIN', 'METAPHONE',
  'LPAD', 'RPAD', 'LEFT', 'RIGHT',
  // Date / time
  'DATEADD', 'DATEDIFF', 'DATEPART', 'DATENAME', 'EOMONTH', 'DATEFROMPARTS',
  'GETDATE', 'GETUTCDATE', 'SYSDATETIME', 'SYSDATETIMEOFFSET', 'SYSUTCDATETIME',
  'NOW', 'TODAY', 'CURDATE', 'CURTIME', 'SYSDATE', 'SYSTIMESTAMP',
  'CURRENT_DATE', 'CURRENT_TIME', 'CURRENT_TIMESTAMP',
  'DATE_TRUNC', 'DATE_PART', 'DATE_FORMAT', 'DATE_ADD', 'DATE_DIFF', 'DATE_SUB',
  'YEAR', 'MONTH', 'DAY', 'HOUR', 'MINUTE', 'SECOND', 'QUARTER', 'WEEK', 'DOW',
  'DAYOFWEEK', 'DAYOFMONTH', 'DAYOFYEAR', 'WEEKOFYEAR', 'YEARWEEK',
  'TO_DATE', 'TO_TIMESTAMP', 'TO_CHAR', 'TO_TIME',
  'EXTRACT', 'TIMESTAMPDIFF', 'TIMESTAMPADD', 'TIMEDIFF', 'ADDDATE', 'SUBDATE',
  'CONVERT_TZ', 'FROM_UNIXTIME', 'UNIX_TIMESTAMP', 'EPOCH', 'MAKE_DATE', 'MAKE_TIME',
  'LAST_DAY', 'NEXT_DAY', 'MONTHS_BETWEEN', 'ADD_MONTHS', 'TRUNC',
  // Type conversion
  'CAST', 'CONVERT', 'TRY_CAST', 'TRY_CONVERT', 'PARSE', 'TRY_PARSE',
  'TO_NUMBER', 'TO_DECIMAL', 'TO_FLOAT', 'TO_INTEGER', 'TO_VARCHAR',
  'STR', 'ITOA', 'ATOI',
  // Math
  'ABS', 'CEIL', 'CEILING', 'FLOOR', 'ROUND', 'TRUNCATE',
  'POWER', 'POW', 'SQRT', 'CBRT', 'MOD', 'SIGN', 'EXP',
  'LOG', 'LOG2', 'LOG10', 'LN', 'LOG1P',
  'RAND', 'RANDOM', 'UNIFORM',
  'SIN', 'COS', 'TAN', 'ASIN', 'ACOS', 'ATAN', 'ATAN2', 'COT',
  'DEGREES', 'RADIANS', 'PI', 'DIV',
  // Window
  'ROW_NUMBER', 'RANK', 'DENSE_RANK', 'NTILE',
  'PERCENT_RANK', 'CUME_DIST', 'WIDTH_BUCKET',
  'LEAD', 'LAG', 'FIRST_VALUE', 'LAST_VALUE', 'NTH_VALUE',
  // JSON
  'JSON_VALUE', 'JSON_QUERY', 'JSON_MODIFY', 'JSON_VALID', 'ISJSON',
  'JSON_OBJECT', 'JSON_ARRAY', 'JSON_BUILD_OBJECT', 'JSON_BUILD_ARRAY',
  'JSON_AGG', 'JSON_OBJECT_AGG', 'JSON_ARRAYAGG', 'JSONB_AGG', 'JSONB_OBJECT_AGG',
  'JSON_EXTRACT', 'JSON_EXTRACT_PATH', 'JSON_EXTRACT_PATH_TEXT', 'JSON_UNQUOTE',
  'JSON_CONTAINS', 'JSON_LENGTH', 'JSON_TYPE', 'JSON_KEYS', 'JSON_DEPTH',
  'JSON_STRIP_NULLS', 'JSON_EACH', 'JSON_EACH_TEXT', 'JSON_POPULATE_RECORD',
  'TO_JSON', 'TO_JSONB', 'ROW_TO_JSON', 'ARRAY_TO_JSON',
  // Array / set
  'ARRAY_AGG', 'STRING_AGG', 'GROUP_CONCAT', 'LISTAGG', 'WM_CONCAT',
  'UNNEST', 'GENERATE_SERIES', 'GENERATE_SUBSCRIPTS', 'RANGE',
  'ARRAY_LENGTH', 'ARRAY_UPPER', 'ARRAY_LOWER', 'CARDINALITY',
  'ARRAY_APPEND', 'ARRAY_PREPEND', 'ARRAY_CAT', 'ARRAY_REMOVE',
  'ARRAY_REPLACE', 'ARRAY_POSITION', 'ARRAY_POSITIONS', 'ARRAY_CONTAINS',
  'FLATTEN', 'ARRAYS_OVERLAP', 'ARRAY_DISTINCT', 'ARRAY_SORT',
  // Hash / crypto
  'HASHBYTES', 'HASH', 'MD5', 'SHA', 'SHA1', 'SHA2', 'CRC32',
  'ENCRYPT', 'DECRYPT', 'AES_ENCRYPT', 'AES_DECRYPT',
  // System / meta
  'NEWID', 'UUID', 'UUID_GENERATE_V4', 'GEN_RANDOM_UUID',
  'OBJECT_ID', 'OBJECT_NAME', 'COL_NAME', 'SCHEMA_NAME',
  'DB_ID', 'DB_NAME', 'USER_NAME', 'SYSTEM_USER', 'CURRENT_USER',
  'SESSION_USER', 'CURRENT_SCHEMA', 'CURRENT_ROLE',
  'COMPRESS', 'DECOMPRESS', 'HEX', 'UNHEX', 'BIN', 'OCT',
  'IFF', 'ZEROIFNULL', 'BOOLAND_AGG', 'BOOLOR_AGG', 'BOOLXOR_AGG',
  'OBJECT_CONSTRUCT', 'OBJECT_KEYS', 'OBJECT_VALUES',
  'FLATTEN', 'GET', 'GET_PATH', 'TYPEOF', 'IS_ARRAY', 'IS_OBJECT',
]

// Build a case-insensitive lookup
const FUNCTION_UPPER = new Set(SQL_FUNCTIONS.map((f) => f.toUpperCase()))

// Keywords that may be followed by a space then `(` — keep the space
const PAREN_SPACE_KEYWORDS = new Set([
  'IN', 'NOT', 'EXISTS', 'ANY', 'ALL', 'SOME', 'CHECK',
  'CASE', 'WHEN', 'THEN', 'ELSE', 'END',
])

// ─── string-aware processor ────────────────────────────────────────────────
// Splits SQL into code segments and literals/comments; only transforms code.

type Segment = { text: string; isCode: boolean }

function splitSegments(sql: string): Segment[] {
  const segs: Segment[] = []
  let i = 0
  let buf = ''

  const flush = (isCode: boolean, raw: string) => {
    if (buf) { segs.push({ text: buf, isCode }); buf = '' }
    if (raw)  segs.push({ text: raw, isCode: false })
  }

  while (i < sql.length) {
    const ch = sql[i]
    const ch2 = sql[i + 1]

    // Single-quoted string  'it''s ok'
    if (ch === "'") {
      flush(true, '')
      let j = i + 1
      while (j < sql.length) {
        if (sql[j] === "'" && sql[j + 1] === "'") { j += 2; continue }
        if (sql[j] === "'") { j++; break }
        j++
      }
      segs.push({ text: sql.slice(i, j), isCode: false })
      i = j; continue
    }

    // Double-quoted identifier  "my col"
    if (ch === '"') {
      flush(true, '')
      let j = i + 1
      while (j < sql.length) {
        if (sql[j] === '"' && sql[j + 1] === '"') { j += 2; continue }
        if (sql[j] === '"') { j++; break }
        j++
      }
      segs.push({ text: sql.slice(i, j), isCode: false })
      i = j; continue
    }

    // Backtick identifier  `my col`
    if (ch === '`') {
      flush(true, '')
      let j = i + 1
      while (j < sql.length && sql[j] !== '`') j++
      if (j < sql.length) j++
      segs.push({ text: sql.slice(i, j), isCode: false })
      i = j; continue
    }

    // Bracket identifier  [my col]
    if (ch === '[') {
      flush(true, '')
      let j = i + 1
      while (j < sql.length && sql[j] !== ']') j++
      if (j < sql.length) j++
      segs.push({ text: sql.slice(i, j), isCode: false })
      i = j; continue
    }

    // Line comment  --
    if (ch === '-' && ch2 === '-') {
      flush(true, '')
      let j = i
      while (j < sql.length && sql[j] !== '\n') j++
      segs.push({ text: sql.slice(i, j), isCode: false })
      i = j; continue
    }

    // Block comment  /* */
    if (ch === '/' && ch2 === '*') {
      flush(true, '')
      let j = i + 2
      while (j < sql.length - 1 && !(sql[j] === '*' && sql[j + 1] === '/')) j++
      j += 2
      segs.push({ text: sql.slice(i, j), isCode: false })
      i = j; continue
    }

    buf += ch
    i++
  }
  if (buf) segs.push({ text: buf, isCode: true })
  return segs
}

function onCode(sql: string, fn: (code: string) => string): string {
  return splitSegments(sql)
    .map((s) => (s.isCode ? fn(s.text) : s.text))
    .join('')
}

// ─── fix 1: consistent function casing ────────────────────────────────────

export function fixFunctionCasing(sql: string, targetCase: 'upper' | 'lower' | 'preserve'): string {
  if (targetCase === 'preserve') return sql
  return onCode(sql, (code) =>
    code.replace(/\b([A-Za-z_][A-Za-z0-9_]*)\b/g, (word) => {
      if (!FUNCTION_UPPER.has(word.toUpperCase())) return word
      return targetCase === 'upper' ? word.toUpperCase() : word.toLowerCase()
    }),
  )
}

// ─── fix 2: remove space before function parens ────────────────────────────
// DATEADD (DAY...  →  DATEADD(DAY...
// Keeps space for IN (…), NOT (…), EXISTS (…), etc.

export function fixFunctionParenSpace(sql: string): string {
  return onCode(sql, (code) =>
    code.replace(
      /\b([A-Za-z_][A-Za-z0-9_]*)\s+\(/g,
      (match, word: string) => {
        if (PAREN_SPACE_KEYWORDS.has(word.toUpperCase())) return match
        return `${word}(`
      },
    ),
  )
}

// ─── fix 3: compact scalar subqueries ─────────────────────────────────────
// Collapses single-table scalar subqueries in expressions onto fewer lines.
// Only collapses if the flattened form fits within `maxLen` chars.

export function compactScalarSubqueries(sql: string, maxLen = 120): string {
  // Match: (  \n  <content without nested SELECT>  \n  )
  // where content has exactly one SELECT and no JOIN (simple scalar)
  const pattern = /\(\s*\n([\s\S]*?)\n\s*\)/g
  return sql.replace(pattern, (match, inner: string) => {
    const upper = inner.toUpperCase()
    // Skip if nested SELECT inside (subquery within subquery)
    const selectCount = (upper.match(/\bSELECT\b/g) ?? []).length
    if (selectCount !== 1) return match
    // Skip if it has JOINs — not a simple scalar subquery
    if (/\bJOIN\b/i.test(inner)) return match
    const collapsed = inner.replace(/\s+/g, ' ').trim()
    if (collapsed.length <= maxLen) return `(${collapsed})`
    return match
  })
}

// ─── fix 4: normalize unquoted identifiers ────────────────────────────────
// Lowercases snake_case / UPPER_SNAKE identifiers that are NOT SQL keywords
// or function names. Best-effort — operates only on code segments.

// All keywords + functions we want to leave alone
const LEAVE_CASED = new Set([
  ...FUNCTION_UPPER,
  // high-frequency SQL keywords
  'SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'NOT', 'IN', 'ON', 'AS',
  'JOIN', 'LEFT', 'RIGHT', 'INNER', 'OUTER', 'FULL', 'CROSS', 'NATURAL',
  'GROUP', 'ORDER', 'BY', 'HAVING', 'LIMIT', 'OFFSET', 'FETCH', 'ROWS', 'ONLY',
  'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE', 'MERGE', 'USING', 'MATCHED',
  'CREATE', 'ALTER', 'DROP', 'TABLE', 'VIEW', 'INDEX', 'SCHEMA', 'DATABASE',
  'UNION', 'INTERSECT', 'EXCEPT', 'ALL', 'DISTINCT', 'UNIQUE',
  'CASE', 'WHEN', 'THEN', 'ELSE', 'END', 'IF', 'BEGIN', 'DECLARE',
  'EXISTS', 'BETWEEN', 'LIKE', 'ILIKE', 'SIMILAR', 'IS', 'NULL', 'TRUE', 'FALSE',
  'PRIMARY', 'FOREIGN', 'KEY', 'REFERENCES', 'CONSTRAINT', 'DEFAULT', 'CHECK',
  'WITH', 'RECURSIVE', 'MATERIALIZED', 'OVER', 'PARTITION', 'WINDOW',
  'RETURNING', 'OUTPUT', 'QUALIFY', 'SAMPLE', 'TABLESAMPLE',
  'ASC', 'DESC', 'NULLS', 'FIRST', 'LAST',
  'INT', 'INTEGER', 'BIGINT', 'SMALLINT', 'TINYINT', 'FLOAT', 'REAL',
  'DECIMAL', 'NUMERIC', 'VARCHAR', 'NVARCHAR', 'CHAR', 'NCHAR', 'TEXT',
  'DATE', 'TIME', 'DATETIME', 'TIMESTAMP', 'BOOLEAN', 'BOOL', 'BINARY', 'VARBINARY',
  'INTERVAL', 'ARRAY', 'JSON', 'JSONB', 'UUID', 'XML', 'CURSOR', 'ROWID',
])

export function normalizeIdentifiers(sql: string): string {
  return onCode(sql, (code) =>
    code.replace(/\b([A-Za-z_][A-Za-z0-9_]*)\b/g, (word) => {
      if (LEAVE_CASED.has(word.toUpperCase())) return word
      // Lowercase: snake_case, UPPER_SNAKE, or camelCase identifiers
      return word.toLowerCase()
    }),
  )
}

// ─── pipeline ──────────────────────────────────────────────────────────────

export interface PostProcessOptions {
  keywordCase: 'upper' | 'lower' | 'preserve'
  stripFunctionParenSpace: boolean
  compactSubqueries: boolean
  normalizeIdents: boolean
}

export function applyPostProcess(sql: string, opts: PostProcessOptions): string {
  let out = sql
  out = fixFunctionCasing(out, opts.keywordCase)
  if (opts.stripFunctionParenSpace) out = fixFunctionParenSpace(out)
  if (opts.compactSubqueries)       out = compactScalarSubqueries(out)
  if (opts.normalizeIdents)         out = normalizeIdentifiers(out)
  return out
}
