import { useEffect, useRef } from 'react'
import { Excalidraw, convertToExcalidrawElements } from '@excalidraw/excalidraw'
import '@excalidraw/excalidraw/index.css'

// Loose element shape: enough of Excalidraw's model to describe the drawing in words
interface El {
  id: string
  type: string
  isDeleted?: boolean
  text?: string
  containerId?: string | null
  startBinding?: { elementId: string } | null
  endBinding?: { elementId: string } | null
  boundElements?: { id: string; type: string }[] | null
}

/** The whiteboard as text the interviewer can read: components, labelled connections and notes */
export function summarizeBoard(elements: readonly El[]): string {
  const live = elements.filter((e) => !e.isDeleted)
  const textIn = (id: string) =>
    live
      .filter((t) => t.type === 'text' && t.containerId === id)
      .map((t) => (t.text ?? '').replace(/\s+/g, ' ').trim())
      .join(' ')
  const shapes = live.filter((e) => ['rectangle', 'ellipse', 'diamond', 'frame'].includes(e.type))
  const name = new Map(shapes.map((s, i) => [s.id, textIn(s.id) || `unlabelled ${s.type} ${i + 1}`]))
  const arrows = live.filter((e) => e.type === 'arrow')
  const notes = live.filter((e) => e.type === 'text' && !e.containerId).map((t) => (t.text ?? '').replace(/\s+/g, ' ').trim()).filter(Boolean)
  const lines: string[] = []
  if (shapes.length) lines.push(`Components (${shapes.length}): ${[...name.values()].join('; ')}`)
  const edges = arrows.map((a) => {
    const from = a.startBinding ? name.get(a.startBinding.elementId) : undefined
    const to = a.endBinding ? name.get(a.endBinding.elementId) : undefined
    const label = textIn(a.id)
    return `${from ?? '(loose end)'} → ${to ?? '(loose end)'}${label ? ` [${label}]` : ''}`
  })
  if (edges.length) lines.push(`Connections:\n${edges.map((e) => `- ${e}`).join('\n')}`)
  if (notes.length) lines.push(`Notes on the board: ${notes.join(' | ')}`)
  return lines.join('\n') || '(the whiteboard is empty)'
}

const HLD_PARTS = ['Client', 'Load balancer', 'API gateway', 'Service', 'Database', 'Cache', 'Queue', 'CDN', 'Blob storage', 'Worker', 'Search index', 'Notification']
const LLD_PARTS = ['Class', 'Interface', 'Enum', 'Abstract class']
const SHAPE: Record<string, 'rectangle' | 'ellipse' | 'diamond'> = { Database: 'ellipse', Cache: 'ellipse', 'Blob storage': 'ellipse', Queue: 'diamond', Interface: 'ellipse' }

interface Api {
  getSceneElements: () => readonly El[]
  updateScene: (s: { elements: unknown[] }) => void
  scrollToContent: (els?: unknown, opts?: { fitToContent?: boolean; animate?: boolean }) => void
}

/** Excalidraw whiteboard with a one-click component palette; reports a text summary on every change */
export function Board({ kind, dark, onSummary }: { kind: 'hld' | 'lld'; dark: boolean; onSummary: (text: string) => void }) {
  const api = useRef<Api | null>(null)
  const added = useRef(0)
  const last = useRef('')
  const parts = kind === 'hld' ? HLD_PARTS : LLD_PARTS

  useEffect(() => onSummary('(the whiteboard is empty)'), [onSummary])

  const add = (part: string) => {
    const a = api.current
    if (!a) return
    const i = added.current++
    const label = kind === 'lld' ? (part === 'Enum' ? 'enum Name\nVALUE_A\nVALUE_B' : `${part === 'Class' ? '' : `«${part.toLowerCase()}» `}Name\n- field: Type\n+ method(): Type`) : part
    // One call returns the shape and its bound label text
    const els = convertToExcalidrawElements([
      {
        type: SHAPE[part] ?? 'rectangle',
        x: 80 + (i % 4) * 230,
        y: 80 + Math.floor(i / 4) * 150,
        width: kind === 'lld' ? 200 : 170,
        height: kind === 'lld' ? 110 : 76,
        roundness: { type: 3 },
        strokeWidth: 2,
        label: { text: label, fontSize: kind === 'lld' ? 16 : 18 },
      } as never,
    ])
    a.updateScene({ elements: [...a.getSceneElements(), ...els] })
  }

  return (
    <div className="board">
      <div className="board-palette" role="toolbar" aria-label="Components">
        <span className="muted small">Add</span>
        {parts.map((p) => (
          <button key={p} type="button" className="board-part" onClick={() => add(p)}>
            {p}
          </button>
        ))}
        <span className="muted small board-tip">Draw arrows between boxes so the interviewer can follow the flow.</span>
      </div>
      <div className="board-canvas">
        <Excalidraw
          theme={dark ? 'dark' : 'light'}
          excalidrawAPI={(x) => {
            api.current = x as unknown as Api
          }}
          initialData={{ appState: { viewBackgroundColor: '#ffffff', currentItemFontFamily: 2 } }} // Excalidraw's dark theme inverts the canvas, so white renders as near-black
          UIOptions={{ canvasActions: { loadScene: false, saveToActiveFile: false, export: false, saveAsImage: true } }}
          onChange={(elements) => {
            const s = summarizeBoard(elements as unknown as readonly El[])
            if (s !== last.current) {
              last.current = s
              onSummary(s)
            }
          }}
        />
      </div>
    </div>
  )
}
