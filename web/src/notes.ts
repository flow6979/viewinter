// Notes for an article as a list: each note has a heading and a body (Markdown), in the user's order.
// Stored in the same place as the old single text note (users/{uid}/notes/{slug} or this browser), as JSON
// with a version marker, so old plain-text notes still open (as one note) and no new storage is needed.
import { useCallback, useEffect, useRef, useState } from 'react'
import { useStore } from './store'

export interface Note {
  id: string
  title: string
  body: string
  /** made from an Ask AI answer */
  ai?: boolean
  at: number
}

const MARK = '{"v":2,'
const EVENT = 'viewinter:notes'

export const newNoteId = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`

export function parseNotes(text: string, legacyTitle: string): Note[] {
  if (text.startsWith(MARK)) {
    try {
      const notes = (JSON.parse(text) as { notes?: Note[] }).notes
      if (Array.isArray(notes)) return notes.filter((n) => n && typeof n.id === 'string')
    } catch {
      /* fall through: treat as plain text so nothing is lost */
    }
  }
  return text.trim() ? [{ id: 'old', title: legacyTitle, body: text, at: 0 }] : []
}

/** Empty list → empty text, which deletes the stored note */
export const serializeNotes = (notes: Note[]) => (notes.length ? JSON.stringify({ v: 2, notes }) : '')

type Status = 'loading' | 'saved' | 'saving' | 'dirty' | 'error'

/** The notes of one article, saved a moment after each change */
export function useNotes(slug: string, legacyTitle: string) {
  const { loadNote, saveNote } = useStore()
  const [notes, setNotes] = useState<Note[]>([])
  const [status, setStatus] = useState<Status>('loading')
  const timer = useRef<number | undefined>(undefined)
  const pending = useRef<Note[] | null>(null)

  const load = useCallback(() => {
    setStatus('loading')
    return loadNote(slug)
      .then((t) => {
        setNotes(parseNotes(t, legacyTitle))
        setStatus('saved')
      })
      .catch(() => setStatus('error'))
  }, [slug, loadNote, legacyTitle])

  useEffect(() => {
    load()
    // A note added from Ask AI while this panel is open
    const onAdded = (e: Event) => (e as CustomEvent<string>).detail === slug && !pending.current && load()
    window.addEventListener(EVENT, onAdded)
    return () => window.removeEventListener(EVENT, onAdded)
  }, [slug, load])

  const flush = useCallback(async () => {
    const next = pending.current
    if (!next) return
    pending.current = null
    setStatus('saving')
    try {
      await saveNote(slug, serializeNotes(next))
      setStatus(pending.current ? 'dirty' : 'saved')
    } catch {
      setStatus('error')
    }
  }, [slug, saveNote])

  // Save what is pending when leaving the article
  useEffect(() => () => void flush(), [flush])

  const change = useCallback(
    (next: Note[], delay = 700) => {
      setNotes(next)
      pending.current = next
      setStatus('dirty')
      window.clearTimeout(timer.current)
      timer.current = window.setTimeout(flush, delay)
    },
    [flush],
  )

  return { notes, status, change }
}

/** Adds one note to an article without the notes panel being open (used by Ask AI) */
export function useAddNote() {
  const { loadNote, saveNote } = useStore()
  return useCallback(
    async (slug: string, note: Note, legacyTitle: string) => {
      const current = parseNotes(await loadNote(slug), legacyTitle)
      await saveNote(slug, serializeNotes([...current, note]))
      window.dispatchEvent(new CustomEvent(EVENT, { detail: slug }))
    },
    [loadNote, saveNote],
  )
}
