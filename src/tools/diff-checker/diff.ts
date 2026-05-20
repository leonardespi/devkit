export type DiffLineType = 'equal' | 'add' | 'del'

export interface DiffLine {
  type: DiffLineType
  lineA: number | null
  lineB: number | null
  text: string
}

function lcs(a: string[], b: string[]): number[][] {
  const m = a.length
  const n = b.length
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0))
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1])
    }
  }
  return dp
}

export function diffLines(textA: string, textB: string): DiffLine[] {
  const a = textA.split('\n')
  const b = textB.split('\n')
  const dp = lcs(a, b)

  const result: DiffLine[] = []
  let i = a.length
  let j = b.length
  const ops: { type: DiffLineType; ai: number | null; bi: number | null; text: string }[] = []

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && a[i - 1] === b[j - 1]) {
      ops.push({ type: 'equal', ai: i, bi: j, text: a[i - 1] })
      i--
      j--
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      ops.push({ type: 'add', ai: null, bi: j, text: b[j - 1] })
      j--
    } else {
      ops.push({ type: 'del', ai: i, bi: null, text: a[i - 1] })
      i--
    }
  }

  ops.reverse()
  let na = 0
  let nb = 0
  for (const op of ops) {
    if (op.type === 'equal') { na++; nb++ }
    else if (op.type === 'del') { na++ }
    else { nb++ }
    result.push({ type: op.type, lineA: op.type !== 'add' ? na : null, lineB: op.type !== 'del' ? nb : null, text: op.text })
  }

  return result
}

export interface DiffStats {
  added: number
  removed: number
  unchanged: number
}

export function statsOf(lines: DiffLine[]): DiffStats {
  return {
    added:     lines.filter((l) => l.type === 'add').length,
    removed:   lines.filter((l) => l.type === 'del').length,
    unchanged: lines.filter((l) => l.type === 'equal').length,
  }
}
