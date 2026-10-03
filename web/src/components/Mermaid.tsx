import { useEffect, useRef, useState } from 'react'

let counter = 0
let mermaidPromise: Promise<typeof import('mermaid').default> | null = null

function loadMermaid() {
  mermaidPromise ??= import('mermaid').then((m) => m.default)
  return mermaidPromise
}

// A tab opened before a deploy still points at the old lazy chunks (mermaid loads one per diagram type);
// they 404 after the deploy, so load the new build once instead of showing raw code
const STALE = /dynamically imported module|Importing a module script failed|error loading dynamically|MIME type|Failed to fetch/i
export function reloadForNewBuild(): boolean {
  try {
    const last = Number(sessionStorage.getItem('viewinter.reloadedAt') ?? 0)
    if (Date.now() - last < 60_000) return false
    sessionStorage.setItem('viewinter.reloadedAt', String(Date.now()))
  } catch {
    return false
  }
  window.location.reload()
  return true
}

// Content highlights nodes with `classDef hot` / `classDef dim`; restyle them so they read in both themes
function themed(code: string): string {
  const dark = isDark()
  return code
    .replace(/^(\s*)classDef hot .*$/m, `$1classDef hot fill:${dark ? '#fafafa' : '#0b0b0c'},stroke:${dark ? '#fafafa' : '#0b0b0c'},color:${dark ? '#09090b' : '#ffffff'},font-weight:bold`)
    .replace(/^(\s*)classDef dim .*$/m, `$1classDef dim fill:none,stroke:${dark ? '#52525b' : '#a1a1aa'},stroke-dasharray:4 3,color:${dark ? '#71717a' : '#a1a1aa'}`)
}

const isDark = () => document.documentElement.dataset.theme === 'dark'

export function Mermaid({ code }: { code: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [themeTick, setThemeTick] = useState(0)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const obs = new MutationObserver(() => setThemeTick((t) => t + 1))
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    let cancelled = false
    loadMermaid().then(async (mermaid) => {
      if (cancelled) return
      mermaid.initialize({
        startOnLoad: false,
        theme: 'base',
        themeVariables: isDark()
          ? { darkMode: true, background: '#09090b', primaryColor: '#18181b', primaryBorderColor: '#52525b', primaryTextColor: '#ececef', secondaryColor: '#111114', secondaryBorderColor: '#3f3f46', secondaryTextColor: '#ececef', tertiaryColor: '#111114', tertiaryBorderColor: '#3f3f46', tertiaryTextColor: '#ececef', lineColor: '#a1a1aa', textColor: '#ececef', clusterBkg: '#111114', clusterBorder: '#3f3f46', edgeLabelBackground: '#18181b', noteBkgColor: '#18181b', noteTextColor: '#ececef', noteBorderColor: '#52525b', actorBkg: '#18181b', actorBorder: '#52525b', actorTextColor: '#ececef', signalColor: '#d4d4d8', signalTextColor: '#ececef', labelBoxBkgColor: '#18181b', fontFamily: 'Geist, system-ui, sans-serif' }
          : { background: '#ffffff', primaryColor: '#ffffff', primaryBorderColor: '#a1a1aa', primaryTextColor: '#0b0b0c', secondaryColor: '#f5f5f2', secondaryBorderColor: '#d4d4d8', secondaryTextColor: '#0b0b0c', tertiaryColor: '#f5f5f2', tertiaryBorderColor: '#d4d4d8', tertiaryTextColor: '#0b0b0c', lineColor: '#52525b', textColor: '#0b0b0c', clusterBkg: '#f5f5f2', clusterBorder: '#d4d4d8', edgeLabelBackground: '#ffffff', noteBkgColor: '#f5f5f2', noteTextColor: '#0b0b0c', noteBorderColor: '#a1a1aa', actorBkg: '#ffffff', actorBorder: '#a1a1aa', actorTextColor: '#0b0b0c', signalColor: '#3f3f46', signalTextColor: '#0b0b0c', labelBoxBkgColor: '#ffffff', fontFamily: 'Geist, system-ui, sans-serif' },
        securityLevel: 'strict',
        fontFamily: 'Geist, system-ui, sans-serif',
      })
      try {
        const { svg } = await mermaid.render(`mmd-${++counter}`, themed(code))
        if (!cancelled && ref.current) {
          ref.current.innerHTML = svg
          setError(null)
        }
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e)
        if (STALE.test(message) && reloadForNewBuild()) return
        if (!cancelled) setError(message)
      }
    }, (e) => {
      mermaidPromise = null
      const message = e instanceof Error ? e.message : String(e)
      if (STALE.test(message) && reloadForNewBuild()) return
      if (!cancelled) setError(message)
    })
    return () => {
      cancelled = true
    }
  }, [code, themeTick, attempt])

  if (error) {
    return (
      <div className="mermaid-error">
        <p>
          Diagram render nahi hua.{' '}
          <button type="button" className="link-btn" onClick={() => (setError(null), setAttempt((a) => a + 1))}>
            Dobara try karo
          </button>
        </p>
        <p className="muted small">{error.split('\n')[0].slice(0, 160)}</p>
        <pre>{code}</pre>
      </div>
    )
  }
  return <div className="mermaid-box" ref={ref} />
}
