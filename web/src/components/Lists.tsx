import { useMemo, useState } from 'react'
import { allPages, localize, pageBySlug, quickLook, route, type Page } from '../content'
import { useLang, useTr } from '../i18n'
import { shareUrl, useLists } from '../lists'
import { isRead, pageStats, pct, readKey, readQuestionKey } from '../progress'
import { href, navigate } from '../router'
import { readLocal, useStore, writeLocal } from '../store'
import { Markdown } from './Markdown'
import { Icon } from './Icon'
import { shortTitle } from './Sidebar'

export const KIND_LABEL: Record<Page['kind'], string> = { topic: 'HLD', question: 'HLD problem', lld: 'LLD', lldp: 'LLD problem', java: 'Java', db: 'DB', cs: 'CS', beh: 'Behavioral', rag: 'RAG', dsa: 'DSA', agent: 'Agentic AI' }

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
  const { progress, profile, saveProfile, user, toggle } = useStore()
  const { lists, create, update, remove } = useLists()
  const [selected, setSelected] = useState<string>(() => readLocal('hld.lists.selected', ''))
  const [name, setName] = useState('')
  const [search, setSearch] = useState('')
  const [quickAll, setQuickAll] = useState(false)
  const [sharing, setSharingOpen] = useState(false)

  const current = lists.find((l) => l.id === selected) ?? lists[0]
  const pages = (current?.slugs ?? []).map((s) => pageBySlug.get(s)).filter((p): p is Page => !!p)
  const questions = current?.questions ?? []
  const readPages = pages.filter((p) => isRead(p, progress)).length
  const readQs = questions.filter((q) => progress[readQuestionKey(q.id)]).length

  const choose = (id: string) => {
    setSelected(id)
    setQuickAll(false)
    setSharingOpen(false)
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
              {(() => {
                const ps = l.slugs.map((x) => pageBySlug.get(x)).filter((p): p is Page => !!p)
                const total = ps.length + (l.questions?.length ?? 0)
                const done = ps.filter((p) => isRead(p, progress)).length + (l.questions ?? []).filter((q) => progress[readQuestionKey(q.id)]).length
                return total && done ? <span className="mono tab-pct">{pct(done, total)}%</span> : null
              })()}
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
          </div>
          {pages.length + questions.length > 0 && <ListProgress done={readPages + readQs} total={pages.length + questions.length} />}

          <div className="row wrap">
            <button className="btn primary" disabled={!pages.length} onClick={() => setQuickAll((q) => !q)}>
              <Icon name="bolt" size={15} /> {quickAll ? tr('List view pe wapas', 'Back to the list') : tr('Quick look: sab ek saath', 'Quick look: all at once')}
            </button>
            <button className="btn" disabled={!pages.length} onClick={planFromList}>
              <Icon name="plan" size={15} /> {tr('Isi list se plan banao', 'Make a plan from this list')}
            </button>
            <button className={`btn ${sharing ? 'on' : ''}`} aria-expanded={sharing} onClick={() => setSharingOpen((o) => !o)}>
              <Icon name="link" size={15} /> {tr('Share', 'Share')}
              {current.share?.public && <span className="share-badge">{tr('Public', 'Public')}</span>}
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

          {sharing && <SharePanel listId={current.id} />}

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
                  const read = isRead(p, progress)
                  const name = shortTitle(localize(p, lang).title)
                  return (
                    <li key={p.slug} className={read ? 'read' : ''}>
                      <label className="read-tick" title={s.complete && !progress[readKey(p.slug)] ? tr('Saare checklist items ho gaye', 'All checklist items are done') : undefined}>
                        <input
                          type="checkbox"
                          checked={read}
                          disabled={s.complete && !progress[readKey(p.slug)]}
                          onChange={(e) => toggle(readKey(p.slug), e.target.checked)}
                          aria-label={read ? tr(`${name}: padh liya`, `${name}: read`) : tr(`${name} ko padh liya mark karo`, `Mark ${name} as read`)}
                        />
                        <span aria-hidden="true" />
                      </label>
                      <a href={route(p)} className="list-page-link">
                        <span className="plan-track">{KIND_LABEL[p.kind]}</span>
                        <span>{shortTitle(localize(p, lang).title)}</span>
                        <span className="muted small mono">{read ? tr('padh liya', 'read') : s.done ? `${s.done}/${s.total}` : `${p.time}m`}</span>
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

/** Purple half-ring gauge: how much of the list has been read */
function ListProgress({ done, total }: { done: number; total: number }) {
  const tr = useTr()
  const p = pct(done, total)
  const left = total - done
  return (
    <div className="list-progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(p)} aria-label={tr('List progress', 'List progress')}>
      <div className="gauge">
        <svg viewBox="0 0 120 66" aria-hidden="true">
          <path className="gauge-track" d="M10 60 A50 50 0 0 1 110 60" pathLength={100} />
          <path className="gauge-fill" d="M10 60 A50 50 0 0 1 110 60" pathLength={100} strokeDasharray={`${p} 100`} />
        </svg>
        <b className="mono">{p}%</b>
      </div>
      <div className="list-progress-text">
        <b>
          {done}/{total} {tr('padh liye', 'read')}
        </b>
        <span className="muted small">
          {done === 0
            ? tr('Page padh ke uske aage tick karo.', 'Tick a page after you read it.')
            : left === 0
              ? tr('Poori list ho gayi. Interview se pehle "Quick look" se revise karo.', 'List done. Revise with "Quick look" before the interview.')
              : tr(`${left} aur baaki.`, `${left} to go.`)}
        </span>
        <span className="list-bar" aria-hidden="true">
          <i style={{ width: `${p}%` }} />
        </span>
      </div>
    </div>
  )
}

/** Public / private switch and the link to copy */
function SharePanel({ listId }: { listId: string }) {
  const tr = useTr()
  const { user } = useStore()
  const { lists, setSharing } = useLists()
  const [copied, setCopied] = useState(false)
  const list = lists.find((l) => l.id === listId)
  if (!list) return null

  if (!user)
    return (
      <div className="share-panel">
        <p className="muted small">{tr('List share karne ke liye login karo (upar "Log in").', 'Log in to share a list (use "Log in" at the top).')}</p>
      </div>
    )

  const isPublic = !!list.share?.public
  const url = list.share ? shareUrl(list.share.id) : ''
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      window.prompt(tr('Link copy karo:', 'Copy the link:'), url)
    }
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }
  const canNativeShare = typeof navigator.share === 'function'

  return (
    <div className="share-panel">
      <div className="share-mode" role="radiogroup" aria-label={tr('Kaun dekh sakta hai', 'Who can open the link')}>
        <button type="button" role="radio" aria-checked={!isPublic} className={!isPublic ? 'on' : ''} onClick={() => (!list.share || isPublic) && setSharing(list.id, false)}>
          <b>{tr('Private', 'Private')}</b>
          <span>{tr('Sirf tum. Link kisi aur ke liye nahi khulega.', 'Only you. The link will not open for anyone else.')}</span>
        </button>
        <button type="button" role="radio" aria-checked={isPublic} className={isPublic ? 'on' : ''} onClick={() => !isPublic && setSharing(list.id, true)}>
          <b>{tr('Public', 'Public')}</b>
          <span>{tr('Link wala koi bhi dekh sakta hai aur apni copy save kar sakta hai.', 'Anyone with the link can view it and save their own copy.')}</span>
        </button>
      </div>
      {list.share && (
        <>
          <div className="share-link">
            <input readOnly value={url} aria-label={tr('Share link', 'Share link')} onFocus={(e) => e.currentTarget.select()} />
            <button type="button" className="btn primary" onClick={copy}>
              {copied ? tr('Copy ho gaya ✓', 'Copied ✓') : tr('Copy link', 'Copy link')}
            </button>
            {canNativeShare && isPublic && (
              <button type="button" className="btn" onClick={() => navigator.share({ title: list.name, url }).catch(() => {})}>
                {tr('Bhejo', 'Send')}
              </button>
            )}
          </div>
          <p className="muted small">
            {isPublic
              ? tr('List me jo badlav karoge, link pe bhi dikhenge. Tumhare answers share nahi hote, sirf topics aur sawal.', 'Edits you make show up on the link too. Your answers are never shared, only the topics and questions.')
              : tr('Abhi private hai: link sirf tumhare liye khulega. Public karte hi wahi link sab ke liye chal jayega.', 'Private for now: the link opens only for you. Make it public and the same link works for everyone.')}
          </p>
        </>
      )}
    </div>
  )
}

/** Questions saved from Company prep, with the user's answer (edit it in Company prep) */
function SavedQuestions({ listId }: { listId: string }) {
  const tr = useTr()
  const { lists, update } = useLists()
  const { progress, toggle } = useStore()
  const list = lists.find((l) => l.id === listId)
  const [open, setOpen] = useState<string | null>(null)
  if (!list?.questions?.length) return null
  return (
    <div className="saved-qs">
      <span className="eyebrow">{tr('Saved sawal', 'Saved questions')} · {list.questions.length}</span>
      <ol className="list-pages">
        {list.questions.map((q) => (
          <li key={q.id} className={`saved-q ${progress[readQuestionKey(q.id)] ? 'read' : ''}`}>
            <label className="read-tick">
              <input
                type="checkbox"
                checked={!!progress[readQuestionKey(q.id)]}
                onChange={(e) => toggle(readQuestionKey(q.id), e.target.checked)}
                aria-label={tr('Taiyar ho gaya mark karo', 'Mark as prepared')}
              />
              <span aria-hidden="true" />
            </label>
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
