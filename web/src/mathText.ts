// AI text sometimes contains LaTeX math ($n \times n$, $10^9$, $\le$). We do not ship a math renderer, so turn
// the common bits into readable Unicode. Code (``` blocks and `inline`) is left untouched.

const SYMBOLS: [RegExp, string][] = [
  [/\\times/g, '×'],
  [/\\cdot/g, '·'],
  [/\\(?:le|leq)\b/g, '≤'],
  [/\\(?:ge|geq)\b/g, '≥'],
  [/\\(?:ne|neq)\b/g, '≠'],
  [/\\approx/g, '≈'],
  [/\\(?:to|rightarrow)\b/g, '→'],
  [/\\leftarrow/g, '←'],
  [/\\Rightarrow/g, '⇒'],
  [/\\infty/g, '∞'],
  [/\\(?:ldots|dots|cdots)/g, '…'],
  [/\\sum/g, 'Σ'],
  [/\\prod/g, 'Π'],
  [/\\in\b/g, '∈'],
  [/\\notin/g, '∉'],
  [/\\subseteq/g, '⊆'],
  [/\\cup/g, '∪'],
  [/\\cap/g, '∩'],
  [/\\lfloor/g, '⌊'],
  [/\\rfloor/g, '⌋'],
  [/\\lceil/g, '⌈'],
  [/\\rceil/g, '⌉'],
  [/\\(log|ln|min|max|gcd|lcm|mod|bmod)\b/g, '$1'],
  [/\\pm/g, '±'],
  [/\\sqrt\{([^{}]*)\}/g, '√($1)'],
  [/\\(?:text|mathrm|mathbf|mathit|operatorname)\{([^{}]*)\}/g, '$1'],
  [/\\(?:left|right|,|;|!|quad|qquad)/g, ' '],
  [/\\([{}%_&#$])/g, '$1'],
]

const SUP: Record<string, string> = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '+': '⁺', '-': '⁻', n: 'ⁿ', i: 'ⁱ', k: 'ᵏ', x: 'ˣ' }
const SUB: Record<string, string> = { '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄', '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉', i: 'ᵢ', j: 'ⱼ', k: 'ₖ', n: 'ₙ', m: 'ₘ' }
const mapAll = (s: string, table: Record<string, string>) => ([...s].every((c) => table[c]) ? [...s].map((c) => table[c]).join('') : null)

function texToText(tex: string): string {
  let s = tex
  for (const [re, to] of SYMBOLS) s = s.replace(re, to as string)
  s = s.replace(/\^\{([^{}]*)\}|\^(\w)/g, (_, a: string | undefined, b: string | undefined) => {
    const v = a ?? b ?? ''
    return mapAll(v, SUP) ?? `^(${v})`
  })
  s = s.replace(/_\{([^{}]*)\}|_(\w)/g, (_, a: string | undefined, b: string | undefined) => {
    const v = a ?? b ?? ''
    return mapAll(v, SUB) ?? `[${v}]`
  })
  return s.replace(/[{}]/g, '').replace(/\s+/g, ' ').trim()
}

/** $…$ and $$…$$ math in prose → readable text; code spans and fences untouched */
export function deTex(markdown: string): string {
  if (!markdown.includes('$') && !/\\(times|le|ge|cdot)/.test(markdown)) return markdown
  return markdown
    .split(/(```[\s\S]*?```|`[^`\n]*`)/g)
    .map((part, i) => {
      if (i % 2) return part // code
      return part
        .replace(/\$\$([^$]+)\$\$/g, (_, m: string) => texToText(m))
        // inline math: no space right inside the dollars, so "$5 and $10" stays as money
        .replace(/\$(?=\S)([^$\n]{1,120}?)(?<=\S)\$/g, (whole, m: string) => (/^[\d.,]+$/.test(m) ? whole : texToText(m)))
    })
    .join('')
}
