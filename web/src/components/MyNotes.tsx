import { useEffect, useMemo, useState } from 'react'
import { localize, pageBySlug, route } from '../content'
import { useLang, useTr } from '../i18n'
import { parseNotes, type Note } from '../notes'
import { readLocal, useStore, writeLocal } from '../store'
import { KIND_LABEL } from './Lists'
import { Markdown } from './Markdown'
import { NotesPanel } from './NotesPanel'
import { Icon } from './Icon'
import { shortTitle } from './Sidebar'

/** Storage key of the notes not tied to any article (same store as article notes) */
export const GENERAL_NOTES = '_general'

type View = 'general' | 'articles'

/** "My notes": the user's own general notes, plus a switch to read every article's notes in one place */
export function MyNotes({ onLogin }: { onLogin: () => void }) {
  const tr = useTr()
  const [view, setView] = useState<View>(() => readLocal('hld.mynotes.view', 'general'))
  const choose = (v: View) => {
    setView(v)
    writeLocal('hld.mynotes.view', v)
  }

  return (
    <div className="lists my-notes">
      <h1>{tr('Mere notes', 'My notes')}</h1>
      <p className="muted">
        {tr(
          'General notes yahan likho. Har article ke notes bhi ek jagah dekhne ho to "Articles ke notes" dabao.',
          'Write general notes here. To see every article\'s notes in one place, press "Article notes".',
        )}
      </p>

      <div className="lists-bar" role="tablist">
        <button role="tab" aria-selected={view === 'general'} className={`list-tab ${view === 'general' ? 'on' : ''}`} onClick={() => choose('general')}>
          <Icon name="pen" size={14} /> {tr('General notes', 'General notes')}
        </button>
        <button role="tab" aria-selected={view === 'articles'} className={`list-tab ${view === 'articles' ? 'on' : ''}`} onClick={() => choose('articles')}>
          <Icon name="book" size={14} /> {tr('Articles ke notes', 'Article notes')}
        </button>
      </div>

      {view === 'general' ? (
        <section className="list-card my-notes-general">
          <NotesPanel slug={GENERAL_NOTES} onLogin={onLogin} general />
        </section>
      ) : (
        <ArticleNotes />
      )}
    </div>
  )
}

interface Group {
  slug: string
  title: string
  kind?: string
  href?: string
  notes: Note[]
}

/** Every article's notes, grouped by article; read here, edit on the article */
function ArticleNotes() {
  const tr = useTr()
  const { lang } = useLang()
  const { listNotes, user } = useStore()
  const [groups, setGroups] = useState<Group[] | null>(null)
  const [error, setError] = useState(false)
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState<Set<string>>(new Set())
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set())

  useEffect(() => {
    let live = true
    setGroups(null)
    setError(false)
    listNotes()
      .then((docs) => {
        if (!live) return
        const out = docs
          .filter((d) => d.slug !== GENERAL_NOTES)
          .map((d): Group => {
            const page = pageBySlug.get(d.slug)
            const title = page ? shortTitle(localize(page, lang).title) : d.slug
            return {
              slug: d.slug,
              title,
              kind: page && KIND_LABEL[page.kind],
              href: page && route(page),
              notes: parseNotes(d.text, tr('Mere notes', 'My notes')),
            }
          })
          .filter((g) => g.notes.length)
          .sort((a, b) => Math.max(...b.notes.map((n) => n.at)) - Math.max(...a.notes.map((n) => n.at)) || a.title.localeCompare(b.title))
        setGroups(out)
      })
      .catch(() => live && setError(true))
    return () => {
      live = false
    }
  }, [listNotes, lang, tr])

  const f = search.trim().toLowerCase()
  const shown = useMemo(
    () =>
      (groups ?? [])
        .map((g) =>
          !f || g.title.toLowerCase().includes(f)
            ? g
            : {
                ...g,
                notes: g.notes.filter((n) => n.title.toLowerCase().includes(f) || n.body.toLowerCase().includes(f)),
              },
        )
        .filter((g) => g.notes.length),
    [groups, f],
  )
  const total = (groups ?? []).reduce((s, g) => s + g.notes.length, 0)

  const toggleGroup = (slug: string) =>
    setOpenGroups((s) => {
      const next = new Set(s)
      if (next.has(slug)) next.delete(slug)
      else next.add(slug)
      return next
    })
  const toggle = (id: string) =>
    setOpen((s) => {
      const next = new Set(s)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  if (error) return <p className="error small">{tr('Notes load nahi hue. Internet check karo.', 'Could not load notes. Check your internet connection.')}</p>
  if (!groups) return <p className="muted small">{tr('Load ho raha hai…', 'Loading…')}</p>
  if (!groups.length)
    return (
      <div className="notes-empty">
        <Icon name="book" size={20} />
        <p>{tr('Abhi kisi article pe notes nahi hain. Article kholo aur right side "Notes" tab me likho.', 'No article has notes yet. Open an article and write in the "Notes" tab on the right.')}</p>
        {!user && <p className="muted small">{tr('Login karoge to notes har device pe dikhenge.', 'Log in to see your notes on every device.')}</p>}
      </div>
    )

  return (
    <section className="article-notes">
      <div className="notes-bar">
        <b>
          {total} {tr('notes', 'notes')} · {groups.length} {tr('articles', 'articles')}
        </b>
      </div>
      <input
        className="side-filter article-notes-search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder={tr('Notes me dhoondho…', 'Search your notes…')}
        aria-label={tr('Notes me dhoondho', 'Search notes')}
      />
      {shown.length === 0 && <p className="muted small">{tr('Kuch nahi mila.', 'Nothing found.')}</p>}
      {shown.map((g) => {
        // Collapsed until the article is clicked; a search opens every match
        const groupOpen = openGroups.has(g.slug) || !!f
        return (
          <article key={g.slug} className={`list-card article-notes-group ${groupOpen ? 'open' : ''}`}>
            <div className="article-notes-head">
              <button className="article-notes-toggle" onClick={() => toggleGroup(g.slug)} aria-expanded={groupOpen}>
                <span className="article-notes-title">{g.title}</span>
                {g.kind && <span className="plan-track">{g.kind}</span>}
                <span className="muted small mono">{g.notes.length}</span>
                <span className="caret" aria-hidden="true">
                  {groupOpen ? '▾' : '▸'}
                </span>
              </button>
              {g.href && (
                <a className="icon-btn" href={g.href} title={tr('Article kholo', 'Open the article')} aria-label={tr(`${g.title} kholo`, `Open ${g.title}`)}>
                  <Icon name="arrow" size={14} />
                </a>
              )}
            </div>
            {groupOpen && (
              <ol className="note-items">
                {g.notes.map((n) => {
                  const key = `${g.slug}/${n.id}`
                  const isOpen = open.has(key) || !!f
                  return (
                    <li key={key} className={`note ${isOpen ? 'open' : ''}`}>
                      <div className="note-head">
                        <button className="note-title" onClick={() => toggle(key)} aria-expanded={isOpen}>
                          <span className="note-title-text">{n.title || <span className="muted">{tr('Bina heading', 'Untitled')}</span>}</span>
                          {n.ai && <span className="note-ai">✦ AI</span>}
                          <span className="note-chev" aria-hidden="true">
                            ▾
                          </span>
                        </button>
                      </div>
                      {isOpen && (
                        <div className="note-body">
                          {n.body.trim() ? (
                            <div className="note-md">
                              <Markdown text={n.body} showAllCode />
                            </div>
                          ) : (
                            <p className="muted small">{tr('Abhi khaali hai.', 'Empty for now.')}</p>
                          )}
                          {g.href && (
                            <div className="note-actions">
                              <a className="ghost-btn" href={g.href}>
                                <Icon name="pen" size={13} /> {tr('Article pe edit karo', 'Edit on the article')}
                              </a>
                            </div>
                          )}
                        </div>
                      )}
                    </li>
                  )
                })}
              </ol>
            )}
          </article>
        )
      })}
    </section>
  )
}
