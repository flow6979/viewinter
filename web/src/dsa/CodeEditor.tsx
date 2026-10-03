import { useEffect, useRef } from 'react'
import type { EditorView } from '@codemirror/view'

/** C++ editor (CodeMirror 6, loaded only on problem pages), monochrome to match the site */
export function CodeEditor({ value, onChange, onRun }: { value: string; onChange: (v: string) => void; onRun?: () => void }) {
  const host = useRef<HTMLDivElement>(null)
  const view = useRef<EditorView | null>(null)
  const latest = useRef({ onChange, onRun })
  latest.current = { onChange, onRun }

  useEffect(() => {
    let destroyed = false
    ;(async () => {
      const [{ basicSetup }, { EditorView, keymap }, { EditorState }, { cpp }, { indentWithTab }, { HighlightStyle, syntaxHighlighting, indentUnit }, { tags: t }] = await Promise.all([
        import('codemirror'),
        import('@codemirror/view'),
        import('@codemirror/state'),
        import('@codemirror/lang-cpp'),
        import('@codemirror/commands'),
        import('@codemirror/language'),
        import('@lezer/highlight'),
      ])
      if (destroyed || !host.current) return
      const mono = HighlightStyle.define([
        { tag: [t.keyword, t.controlKeyword, t.modifier, t.operatorKeyword], color: 'var(--ink)', fontWeight: '700' },
        { tag: [t.typeName, t.className, t.standard(t.typeName)], color: 'var(--ink)', fontWeight: '600' },
        { tag: [t.string, t.character], color: 'var(--code-str)' },
        { tag: [t.number, t.bool, t.null], color: 'var(--code-num)' },
        { tag: [t.comment, t.lineComment, t.blockComment], color: 'var(--muted)', fontStyle: 'italic' },
        { tag: [t.function(t.variableName), t.function(t.propertyName)], color: 'var(--ink)', textDecoration: 'none' },
        { tag: [t.processingInstruction, t.meta], color: 'var(--muted)' },
      ])
      const theme = EditorView.theme({
        '&': { height: '100%', backgroundColor: 'var(--bg)', color: 'var(--ink)', fontSize: '14px' },
        '.cm-scroller': { fontFamily: 'var(--f-mono)', lineHeight: '1.6' },
        '.cm-gutters': { backgroundColor: 'var(--bg)', color: 'color-mix(in srgb, var(--ink) 35%, var(--bg))', border: 'none' },
        '.cm-activeLine': { backgroundColor: 'color-mix(in srgb, var(--ink) 5%, transparent)' },
        '.cm-activeLineGutter': { backgroundColor: 'transparent', color: 'var(--ink)' },
        '.cm-cursor': { borderLeftColor: 'var(--ink)' },
        '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, ::selection': { backgroundColor: 'color-mix(in srgb, var(--ink) 22%, transparent) !important' },
        '.cm-matchingBracket': { backgroundColor: 'color-mix(in srgb, var(--ink) 18%, transparent)', outline: 'none' },
        '&.cm-focused': { outline: 'none' },
        '.cm-tooltip': { backgroundColor: 'var(--surface)', border: '1px solid var(--line)' },
      })
      view.current = new EditorView({
        parent: host.current,
        state: EditorState.create({
          doc: value,
          extensions: [
            basicSetup,
            cpp(),
            indentUnit.of('    '),
            keymap.of([indentWithTab, { key: 'Mod-Enter', run: () => (latest.current.onRun?.(), true) }]),
            syntaxHighlighting(mono),
            theme,
            EditorView.updateListener.of((u) => u.docChanged && latest.current.onChange(u.state.doc.toString())),
          ],
        }),
      })
    })()
    return () => {
      destroyed = true
      view.current?.destroy()
      view.current = null
    }
    // The editor owns its text after mount; outside changes come through the effect below
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Reset / switching problems replaces the whole document
  useEffect(() => {
    const v = view.current
    if (v && v.state.doc.toString() !== value) v.dispatch({ changes: { from: 0, to: v.state.doc.length, insert: value } })
  }, [value])

  return <div className="code-editor" ref={host} />
}
