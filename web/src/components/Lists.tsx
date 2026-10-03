import { useMemo, useState } from 'react'
import { allPages, localize, pageBySlug, quickLook, route, type Page } from '../content'
import { useLang, useTr } from '../i18n'
import { useLists } from '../lists'
import { groupStats, pageStats } from '../progress'
import { href, navigate } from '../router'
import { readLocal, useStore, writeLocal } from '../store'
import { Markdown } from './Markdown'
import { Icon } from './Icon'
import { shortTitle } from './Sidebar'

const KIND_LABEL: Record<Page['kind'], string> = { topic: 'HLD', question: 'HLD problem', lld: 'LLD', lldp: 'LLD problem', java: 'Java', db: 'DB', cs: 'CS', beh: 'Behavioral', rag: 'RAG', dsa: 'DSA', agent: 'Agentic AI' }

// One-click starting points; users edit them like any other list
const STARTERS: { name: { hi: string; en: string }; slugs: string[] }[] = [
  {
    name: { hi: 'HLD must-do', en: 'HLD must-do' },
    slugs: ['00-interview-framework', '01-scaling-basics', '05-caching', '04-sharding-consistent-hashing', '07-message-queues-kafka', '06-cap-consistency', 't1-01-url-shortener', 't1-03-news-feed', 't1-04-whatsapp-chat', 't1-05-bookmyshow'],
  },
  {
    name: { hi: 'Interview se ek raat pehle', en: 'Night before the interview' },
    slugs: ['00-interview-framework', '21-numbers-cheatsheet', '22-red-flags', '02-solid', '01-star-method', '02-tell-me-about-yourself'],
  },
  {
    name: { hi: 'Backend core', en: 'Backend core' },
    slugs: ['02-relational-sql', '03-transactions-acid', '04-indexes', '03-http', '06-processes-threads', '14-concurrency', '10-idempotency-retries'],
  },
]

export function Lists() {
  const { lang } = useLang()
  const tr = useTr()
  const { progress, profile, saveProfile, user } = useStore()
  const { lists, create, update, remove } = useLists()
  const [selected, setSelected] = useState<string>(() => readLocal('hld.lists.selected', ''))
  const [name, setName] = useState('')
  const [search, setSearch] = useState('')
  const [quickAll, setQuickAll] = useState(false)

  const current = lists.find((l) => l.id === selected) ?? lists[0]
  const pages = (current?.slugs ?? []).map((s) => pageBySlug.get(s)).filter((p): p is Page => !!p)
  const st = groupStats(pages, progress)

  const choose = (id: string) => {
    setSelected(id)
    setQuickAll(false)
    writeLocal('hld.lists.selected', id)
  }

  const f = search.trim().toLowerCase()
  const matches = useMemo(
    () =>
      f && current
        ? allPages.filter((p) => !current.slugs.includes(p.slug) && (p.title.toLowerCase().includes(f) || localize(p, lang).title.toLowerCase().includes(f) || KIND_LABEL[p.kind].toLowerCase().includes(f))).slice(0, 8)
        : [],
    [f, current, lang],
  )

  const move = (i: number, d: -1 | 1) => {
    if (!current) return
    const s = [...current.slugs]
    const j = i + d
    if (j < 0 || j >= s.length) return
    ;[s[i], s[j]] = [s[j], s[i]]
    update(current.id, { slugs: s })
  }

  const planFromList = () => {
    if (!current) return
    const base = profile.plan ?? { tracks: ['hld' as const], hours: 2, level: 'mid' as const, days: 14 }
    saveProfile({ ...profile, plan: { ...base, list: current.id } })
      .catch(() => {})
      .finally(() => navigate('plan'))
  }

  return (
    <div className="lists">
      <h1>{tr('Meri lists', 'My lists')}</h1>
      <p className="muted">{tr('Jo topics baar baar revise karne hain, unki list. Kisi bhi page pe "List me daalo" se bhi add hota hai.', 'Topics you want to revise again and again. You can also add from any page with "Add to list".')}</p>

      {lists.length > 0 && (
        <div className="lists-bar">
          {lists.map((l) => (
            <button key={l.id} className={`list-tab ${current?.id === l.id ? 'on' : ''}`} onClick={() => choose(l.id)}>
              {l.name} <span className="mono">{l.slugs.length + (l.questions?.length ?? 0)}</span>
            </button>
          ))}
        </div>
      )}

      <form
        className={`lists-new ${lists.length === 0 ? 'hero' : ''}`}
        onSubmit={(e) => {
          e.preventDefault()
          if (!name.trim()) return
          choose(create(name).id)
          setName('')
        }}
      >
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder={tr('Nayi list ka naam, jaise "Amazon round"', 'New list name, e.g. "Amazon round"')} aria-label={tr('Nayi list ka naam', 'New list name')} />
        <button className="btn primary" disabled={!name.trim()}>
          <Icon name="plus" size={15} /> {tr('List banao', 'Create list')}
        </button>
      </form>

      {lists.length === 0 && (
        <section className="starters">
          <span className="eyebrow">{tr('Ya ready list se shuru karo', 'Or start from a ready list')}</span>
          <div className="starter-grid">
            {STARTERS.map((st) => {
              const slugs = st.slugs.filter((x) => pageBySlug.has(x))
              return (
                <button key={st.name.en} type="button" className="starter-card" onClick={() => choose(create(st.name[lang], slugs).id)}>
                  <span className="starter-top">
                    <b>{st.name[lang]}</b>
                    <span className="mono">{slugs.length}</span>
                  </span>
                  <span className="starter-preview">
                    {slugs.slice(0, 3).map((x) => shortTitle(localize(pageBySlug.get(x)!, lang).title)).join(' · ')}
                    {slugs.length > 3 ? ` +${slugs.length - 3}` : ''}
                  </span>
                  <span className="starter-add">
                    <Icon name="plus" size={14} /> {tr('Add karo', 'Add')}
                  </span>
                </button>
              )
            })}
          </div>
        </section>
      )}

      {current && (
        <section className="list-card">
          <div className="list-head">
            <input className="list-name" value={current.name} onChange={(e) => update(current.id, { name: e.target.value })} aria-label={tr('List ka naam', 'List name')} />
            <span className="muted small mono">
              {st.complete}/{pages.length} {tr('pages pure', 'pages done')}
            </span>
          </div>

          <div className="row wrap">
            <button className="btn primary" disabled={!pages.length} onClick={() => setQuickAll((q) => !q)}>
              <Icon name="bolt" size={15} /> {quickAll ? tr('List view pe wapas', 'Back to the list') : tr('Quick look: sab ek saath', 'Quick look: all at once')}
            </button>
            <button className="btn" disabled={!pages.length} onClick={planFromList}>
              <Icon name="plan" size={15} /> {tr('Isi list se plan banao', 'Make a plan from this list')}
            </button>
            <button
              className="btn"
              onClick={() => {
                if (confirm(tr(`"${current.name}" list delete karein?`, `Delete the list "${current.name}"?`))) remove(current.id)
              }}
            >
              {tr('Delete', 'Delete')}
            </button>
          </div>

          {quickAll ? (
            <div className="quick-stack">
              <p className="muted small">{tr('Interview se pehle ek baar upar se neeche padh lo.', 'Read top to bottom once before the interview.')}</p>
              {pages.map((p, i) => {
                const q = quickLook(p.slug, lang)
                return (
                  <article key={p.slug} className="quicklook">
                    <h3>
                      <span className="muted mono small">{i + 1}.</span> <a href={route(p)}>{shortTitle(localize(p, lang).title)}</a>
                    </h3>
                    {q ? <Markdown text={q} showAllCode /> : <p className="muted small">{tr('Is page ka quick look nahi hai; page kholo.', 'No quick look for this page; open the page.')}</p>}
                  </article>
                )
              })}
            </div>
          ) : (
            <>
              {(current.questions?.length ?? 0) > 0 && <SavedQuestions listId={current.id} />}
              {pages.length === 0 && !current.questions?.length && <p className="muted">{tr('List khaali hai. Neeche se topics dhoondh ke daalo.', 'The list is empty. Search below to add topics.')}</p>}
              <ol className="list-pages">
                {pages.map((p, i) => {
                  const s = pageStats(p, progress)
                  return (
                    <li key={p.slug} className={s.complete ? 'done' : ''}>
                      <a href={route(p)} className="list-page-link">
                        <span className="plan-track">{KIND_LABEL[p.kind]}</span>
                        <span>{shortTitle(localize(p, lang).title)}</span>
                        <span className="muted small mono">{s.complete ? '✓' : s.done ? `${s.done}/${s.total}` : `${p.time}m`}</span>
                      </a>
                      <span className="list-page-actions">
                        <button className="icon-btn" onClick={() => move(i, -1)} disabled={i === 0} aria-label={tr('Upar', 'Move up')}>
                          ↑
                        </button>
                        <button className="icon-btn" onClick={() => move(i, 1)} disabled={i === pages.length - 1} aria-label={tr('Neeche', 'Move down')}>
                          ↓
                        </button>
                        <button className="icon-btn" onClick={() => update(current.id, { slugs: current.slugs.filter((x) => x !== p.slug) })} aria-label={tr('Hatao', 'Remove')}>
                          ✕
                        </button>
                      </span>
                    </li>
                  )
                })}
              </ol>
              <div className="list-add">
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={tr('Topic add karo: Kafka, Uber, SOLID, HashMap…', 'Add a topic: Kafka, Uber, SOLID, HashMap…')} aria-label={tr('Topic dhoondho', 'Search topics')} />
                {matches.length > 0 && (
                  <ul className="list-add-results">
                    {matches.map((p) => (
                      <li key={p.slug}>
                        <button
                          type="button"
                          onClick={() => {
                            update(current.id, { slugs: [...current.slugs, p.slug] })
                            setSearch('')
                          }}
                        >
                          <span className="plan-track">{KIND_LABEL[p.kind]}</span> {shortTitle(localize(p, lang).title)} <span className="muted">+</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          )}
        </section>
      )}
      {!user && <p className="muted small">{tr('Login karoge to lists har device pe saath rahengi.', 'Log in to keep your lists on every device.')}</p>}
    </div>
  )
}

/** Questions saved from Company prep, with the user's answer (edit it in Company prep) */
function SavedQuestions({ listId }: { listId: string }) {
  const tr = useTr()
  const { lists, update } = useLists()
  const list = lists.find((l) => l.id === listId)
  const [open, setOpen] = useState<string | null>(null)
  if (!list?.questions?.length) return null
  return (
    <div className="saved-qs">
      <span className="eyebrow">{tr('Saved sawal', 'Saved questions')} · {list.questions.length}</span>
      <ol className="list-pages">
        {list.questions.map((q) => (
          <li key={q.id} className="saved-q">
            <button type="button" className="saved-q-main" onClick={() => setOpen(open === q.id ? null : q.id)} aria-expanded={open === q.id}>
              <span className="saved-q-text">{q.q}</span>
              <span className="muted small">{q.from}</span>
              {q.answer ? <span className="ok-text small">✓ {tr('answer', 'answered')}</span> : <span className="muted small">{tr('answer baaki', 'no answer yet')}</span>}
            </button>
            <button className="icon-btn" onClick={() => update(list.id, { questions: list.questions!.filter((x) => x.id !== q.id) })} aria-label={tr('Hatao', 'Remove')}>
              ✕
            </button>
            {open === q.id && (
              <div className="saved-q-answer">
                {q.answer ? <Markdown text={q.answer} /> : <p className="muted small">{tr('Abhi answer nahi likha. Company prep me "Answer likho" se likho.', 'No answer yet. Write one with "Write answer" in Company prep.')}</p>}
                <a className="small" href={href('company')}>
                  {tr('Company prep kholo →', 'Open Company prep →')}
                </a>
              </div>
            )}
          </li>
        ))}
      </ol>
    </div>
  )
}
