// Plays a rendered mermaid SVG like a GIF: flowchart edges light up one by one in the order they are
// written (a dot travels source → target); sequence messages appear top to bottom. Loops until stopped.
// Only touches classes and one overlay <circle>, so stopping restores the static diagram exactly.

const SVG_NS = 'http://www.w3.org/2000/svg'
const TRAVEL_MS = 750
const HOLD_MS = 250
const END_PAUSE_MS = 1600

interface Step {
  path: SVGGeometryElement
  from?: Element
  to?: Element
  extra: Element[] // edge label / message text revealed with the step
}

function flowSteps(svg: SVGSVGElement): Step[] {
  const nodes = new Map<string, Element>()
  for (const n of svg.querySelectorAll('g.node')) {
    // id = "<renderId>-flowchart-<NodeId>-<n>"
    const m = /-flowchart-(.+)-\d+$/.exec(n.id)
    if (m) nodes.set(m[1], n)
  }
  const labels = new Map<string, Element>()
  for (const l of svg.querySelectorAll('.edgeLabel .label[data-id]')) labels.set((l as HTMLElement).dataset.id!, l.closest('.edgeLabel')!)
  const steps: Step[] = []
  for (const p of svg.querySelectorAll<SVGPathElement>('path.flowchart-link')) {
    const id = p.dataset.id ?? ''
    // data-id = "L_<from>_<to>_<n>"; node ids may contain "_", so try every split against known nodes
    const body = id.replace(/^L_/, '').replace(/_\d+$/, '')
    let from: Element | undefined
    let to: Element | undefined
    const parts = body.split('_')
    for (let i = 1; i < parts.length && !from; i++) {
      const a = nodes.get(parts.slice(0, i).join('_'))
      const b = nodes.get(parts.slice(i).join('_'))
      if (a && b) [from, to] = [a, b]
    }
    const label = labels.get(id)
    steps.push({ path: p, from, to, extra: label ? [label] : [] })
  }
  return steps
}

function sequenceSteps(svg: SVGSVGElement): Step[] {
  const lines = [...svg.querySelectorAll<SVGGeometryElement>('.messageLine0, .messageLine1')]
  const texts = [...svg.querySelectorAll('.messageText')]
  return lines.map((path, i) => ({ path, extra: texts[i] ? [texts[i]] : [] }))
}

/** Every element a step can reveal; the rest of the diagram (actors, boxes) stays visible */
function stepParts(s: Step): Element[] {
  return [s.path, ...s.extra, ...(s.from ? [s.from] : []), ...(s.to ? [s.to] : [])]
}

export function canAnimate(svg: SVGSVGElement): boolean {
  const kind = svg.getAttribute('aria-roledescription') ?? ''
  if (kind.startsWith('flowchart')) return svg.querySelector('path.flowchart-link') !== null
  if (kind === 'sequence') return svg.querySelector('.messageLine0, .messageLine1') !== null
  return false
}

/** Starts the loop and returns a stop function that restores the static diagram */
export function playDiagram(svg: SVGSVGElement): () => void {
  const kind = svg.getAttribute('aria-roledescription') ?? ''
  const steps = kind === 'sequence' ? sequenceSteps(svg) : flowSteps(svg)
  if (!steps.length) return () => {}
  const all = new Set(steps.flatMap(stepParts))
  const dot = document.createElementNS(SVG_NS, 'circle')
  dot.setAttribute('r', '5')
  dot.setAttribute('class', 'dp-dot')
  svg.appendChild(dot)
  svg.classList.add('dp-playing')

  let raf = 0
  let timer = 0
  let stopped = false
  const wait = (ms: number) => new Promise<void>((r) => (timer = window.setTimeout(r, ms)))

  const reset = () => {
    for (const el of all) el.classList.remove('dp-seen', 'dp-on')
    for (const el of all) el.classList.add('dp-hide')
    dot.style.opacity = '0'
  }

  const travel = (path: SVGGeometryElement) =>
    new Promise<void>((resolve) => {
      let len = 0
      try {
        len = path.getTotalLength()
      } catch {
        /* detached or zero-size path: skip the dot */
      }
      if (!len) return resolve()
      const t0 = performance.now()
      dot.style.opacity = '1'
      const frame = (now: number) => {
        if (stopped) return resolve()
        const t = Math.min(1, (now - t0) / TRAVEL_MS)
        const eased = t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2
        const pt = path.getPointAtLength(eased * len)
        dot.setAttribute('cx', String(pt.x))
        dot.setAttribute('cy', String(pt.y))
        if (t < 1) raf = requestAnimationFrame(frame)
        else {
          dot.style.opacity = '0'
          resolve()
        }
      }
      raf = requestAnimationFrame(frame)
    })

  const show = (el: Element | undefined, on: boolean) => {
    if (!el) return
    el.classList.remove('dp-hide')
    el.classList.add('dp-seen')
    el.classList.toggle('dp-on', on)
  }

  ;(async () => {
    while (!stopped) {
      reset()
      await wait(400)
      for (const s of steps) {
        if (stopped) return
        show(s.from, true)
        show(s.path, true)
        for (const e of s.extra) show(e, true)
        await travel(s.path)
        if (stopped) return
        show(s.to, true)
        await wait(HOLD_MS)
        for (const el of stepParts(s)) el.classList.remove('dp-on')
      }
      await wait(END_PAUSE_MS)
    }
  })()

  return () => {
    stopped = true
    cancelAnimationFrame(raf)
    clearTimeout(timer)
    for (const el of all) el.classList.remove('dp-seen', 'dp-on', 'dp-hide')
    svg.classList.remove('dp-playing')
    dot.remove()
  }
}
