import { useState, type DragEvent } from 'react'
import { useStore } from '../store'
import { firebaseEnabled } from '../firebase'
import { useTr } from '../i18n'
import { newNoteId, useNotes, type Note } from '../notes'
import { Markdown } from './Markdown'
import { Icon } from './Icon'

/** Notes for one article: a list of headings; open one to read or edit its body; drag or use ↑ ↓ to reorder.
 *  `general` is the "My notes" page's own notes, not tied to any article. */
export function NotesPanel({ slug, onLogin, general }: { slug: string; onLogin: () => void; general?: boolean }) {
  const { user } = useStore()
  const tr = useTr()
  const { notes, status, change } = useNotes(slug, tr('Mere notes', 'My notes'))
  const [open, setOpen] = useState<Set<string>>(new Set())
  const [editing, setEditing] = useState<string | null>(null)
  const [dragId, setDragId] = useState<string | null>(null)
  const [overId, setOverId] = useState<string | null>(null)

  const toggle = (id: string) =>
    setOpen((s) => {
      const next = new Set(s)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  const update = (id: string, patch: Partial<Note>) => change(notes.map((n) => (n.id === id ? { ...n, ...patch } : n)))
  const move = (from: number, to: number) => {
    if (to < 0 || to >= notes.length || from === to) return
    const next = [...notes]
    const [n] = next.splice(from, 1)
    next.splice(to, 0, n)
    change(next, 300)
  }
  const add = () => {
    const n: Note = { id: newNoteId(), title: '', body: '', at: Date.now() }
    change([...notes, n], 300)
    setOpen((s) => new Set(s).add(n.id))
    setEditing(n.id)
  }
  const remove = (n: Note) => {
    if (!confirm(tr(`"${n.title || 'Ye note'}" delete karein?`, `Delete "${n.title || 'this note'}"?`))) return
    change(
      notes.filter((x) => x.id !== n.id),
      300,
    )
    if (editing === n.id) setEditing(null)
  }
  const allOpen = notes.length > 0 && notes.every((n) => open.has(n.id))

  const onDrop = (e: DragEvent, to: number) => {
    e.preventDefault()
    const from = notes.findIndex((n) => n.id === dragId)
    if (from >= 0) move(from, to)
    setDragId(null)
    setOverId(null)
  }

  const label = {
    loading: tr('Load ho raha hai…', 'Loading…'),
    dirty: tr('Badlav…', 'Editing…'),
    saving: tr('Save ho raha hai…', 'Saving…'),
    saved: user ? tr('Account me saved', 'Saved to your account') : tr('Is browser me saved', 'Saved in this browser'),
    error: tr('Save nahi hua. Internet check karo.', 'Could not save. Check your internet connection.'),
  }[status]

  return (
    <div className="panel-body notes notes-list">
      <div className="notes-bar">
        <b>
          {notes.length} {notes.length === 1 ? tr('note', 'note') : tr('notes', 'notes')}
        </b>
        {notes.length > 1 && (
          <button className="link small" onClick={() => setOpen(allOpen ? new Set() : new Set(notes.map((n) => n.id)))}>
            {allOpen ? tr('Sab band karo', 'Collapse all') : tr('Sab kholo', 'Expand all')}
          </button>
        )}
        <button className="btn primary small notes-new" onClick={add} disabled={status === 'loading'}>
          <Icon name="plus" size={14} /> {tr('Naya note', 'New note')}
        </button>
      </div>

      {status === 'loading' ? (
        <p className="muted small">{label}</p>
      ) : notes.length === 0 ? (
        <div className="notes-empty">
          <Icon name="pen" size={20} />
          {general ? (
            <p>{tr('Jo kisi ek article ka nahi, wo yahan likho: interview experiences, doubts, formulas, kuch bhi.', 'Write anything that is not about one article here: interview experiences, doubts, formulas, anything.')}</p>
          ) : (
            <>
              <p>{tr('Is article ke notes yahan banenge: har note ki heading, kholo to poori baat.', 'Your notes for this article live here: a heading per note, open it for the details.')}</p>
              <p className="muted small">{tr('Tip: Ask AI ke kisi bhi jawab pe "Notes me daalo" dabao, AI usse revision note bana dega.', 'Tip: press "Add to notes" on any Ask AI answer and it becomes a revision note.')}</p>
            </>
          )}
        </div>
      ) : (
        <ol className="note-items">
          {notes.map((n, i) => {
            const isOpen = open.has(n.id)
            const isEditing = editing === n.id
            return (
              <li
                key={n.id}
                className={`note ${isOpen ? 'open' : ''} ${dragId === n.id ? 'dragging' : ''} ${overId === n.id && dragId !== n.id ? 'over' : ''}`}
                onDragOver={(e) => {
                  if (!dragId) return
                  e.preventDefault()
                  setOverId(n.id)
                }}
                onDrop={(e) => onDrop(e, i)}
              >
                <div
                  className="note-head"
                  draggable={!isEditing}
                  onDragStart={(e) => {
                    setDragId(n.id)
                    e.dataTransfer.effectAllowed = 'move'
                  }}
                  onDragEnd={() => {
                    setDragId(null)
                    setOverId(null)
                  }}
                >
                  <span className="note-grip" aria-hidden="true" title={tr('Kheench ke order badlo', 'Drag to reorder')}>
                    ⋮⋮
                  </span>
                  <button className="note-title" onClick={() => toggle(n.id)} aria-expanded={isOpen}>
                    <span className="note-num mono">{i + 1}</span>
                    <span className="note-title-text">{n.title || <span className="muted">{tr('Bina heading', 'Untitled')}</span>}</span>
                    {n.ai && <span className="note-ai">✦ AI</span>}
                    <span className="note-chev" aria-hidden="true">
                      ▾
                    </span>
                  </button>
                </div>

                {isOpen && (
                  <div className="note-body">
                    {isEditing ? (
                      <div className="note-edit">
                        <input
                          autoFocus={!n.title}
                          value={n.title}
                          onChange={(e) => update(n.id, { title: e.target.value })}
                          placeholder={tr('Heading, jaise "Write-through vs write-back"', 'Heading, e.g. "Write-through vs write-back"')}
                          aria-label={tr('Note ki heading', 'Note heading')}
                        />
                        <textarea
                          value={n.body}
                          rows={Math.min(18, Math.max(5, n.body.split('\n').length + 1))}
                          onChange={(e) => update(n.id, { body: e.target.value })}
                          placeholder={tr('Body (Markdown chalega: - bullets, **bold**, `code`)', 'Body (Markdown works: - bullets, **bold**, `code`)')}
                          aria-label={tr('Note ki body', 'Note body')}
                        />
                        <div className="note-actions">
                          <button
                            className="btn primary small"
                            onClick={() => {
                              setEditing(null)
                              // A note left completely empty is dropped
                              if (!n.title.trim() && !n.body.trim()) change(notes.filter((x) => x.id !== n.id), 300)
                            }}
                          >
                            {tr('Ho gaya', 'Done')}
                          </button>
                          <button className="link small danger" onClick={() => remove(n)}>
                            {tr('Delete', 'Delete')}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {n.body.trim() ? (
                          <div className="note-md">
                            <Markdown text={n.body} showAllCode />
                          </div>
                        ) : (
                          <p className="muted small">{tr('Abhi khaali hai.', 'Empty for now.')}</p>
                        )}
                        <div className="note-actions">
                          <button className="ghost-btn" onClick={() => setEditing(n.id)}>
                            <Icon name="pen" size={13} /> {tr('Edit', 'Edit')}
                          </button>
                          <button className="icon-btn" onClick={() => move(i, i - 1)} disabled={i === 0} aria-label={tr('Upar', 'Move up')}>
                            ↑
                          </button>
                          <button className="icon-btn" onClick={() => move(i, i + 1)} disabled={i === notes.length - 1} aria-label={tr('Neeche', 'Move down')}>
                            ↓
                          </button>
                          <button className="icon-btn note-del" onClick={() => remove(n)} aria-label={tr('Delete', 'Delete')}>
                            <Icon name="trash" size={14} />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </li>
            )
          })}
        </ol>
      )}

      <div className="notes-foot">
        <span className={status === 'error' ? 'error small' : 'muted small'}>{label}</span>
        {!user && firebaseEnabled && (
          <button className="link small" onClick={onLogin}>
            {tr('Login karke sync karo', 'Log in to sync')}
          </button>
        )}
      </div>
    </div>
  )
}
