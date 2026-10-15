// /list/{id}: someone's shared list. Public lists open for anyone; private ones only for their owner.
import { useEffect, useState } from 'react'
import { localize, pageBySlug, quickLook, route, type Page } from '../content'
import { useLang, useTr } from '../i18n'
import { loadSharedList, useLists, type SharedList } from '../lists'
import { pageStats } from '../progress'
import { href, navigate } from '../router'
import { useStore, writeLocal } from '../store'
import { Markdown } from './Markdown'
import { Icon } from './Icon'
import { shortTitle } from './Sidebar'
import { KIND_LABEL } from './Lists'

export function SharedListView({ id }: { id: string }) {
  const { lang } = useLang()
  const tr = useTr()
  const { user, authReady, progress } = useStore()
  const { lists, create } = useLists()
  // undefined = loading, null = private or gone
  const [list, setList] = useState<SharedList | null | undefined>(undefined)
  const [quickAll, setQuickAll] = useState(false)

  // Reload once auth is known: a private list opens only after the owner's login is restored
  useEffect(() => {
    if (!authReady) return
    let live = true
    setList(undefined)
    loadSharedList(id).then((l) => live && setList(l))
    return () => {
      live = false
    }
  }, [id, authReady, user?.uid])

  useEffect(() => {
    if (list) document.title = `${list.name} · Viewinter`
  }, [list])

  if (list === undefined) return <p className="muted">{tr('List khul rahi hai…', 'Opening the list…')}</p>
  if (list === null)
    return (
      <div className="empty-state">
        <h1>{tr('Ye list private hai', 'This list is private')}</h1>
        <p className="muted">{tr('Ya to iske owner ne ise private kar diya hai, ya ye delete ho chuki hai.', 'Its owner has made it private, or it was deleted.')}</p>
        <a href={href('lists')}>{tr('Apni lists dekho', 'See your own lists')}</a>
      </div>
    )

  const mine = user?.uid === list.by
  const pages = list.slugs.map((s) => pageBySlug.get(s)).filter((p): p is Page => !!p)

  const saveCopy = () => {
    const copy = create(list.name, pages.map((p) => p.slug), list.questions.map((q) => ({ ...q })))
    writeLocal('hld.lists.selected', copy.id)
    navigate('lists')
  }

  return (
    <div className="lists">
      <header className="shared-head">
        <span className="eyebrow">
          {mine ? (list.public ? tr('Tumhari public list', 'Your public list') : tr('Tumhari private list · sirf tum dekh sakte ho', 'Your private list · only you can see it')) : list.byName ? tr(`${list.byName} ki shared list`, `Shared by ${list.byName}`) : tr('Shared list', 'Shared list')}
        </span>
        <h1>{list.name}</h1>
        <p className="muted small">
          {pages.length} {tr('pages', 'pages')}
          {list.questions.length ? ` · ${list.questions.length} ${tr('sawal', 'questions')}` : ''}
        </p>
      </header>

      <div className="row wrap">
        {mine ? (
          <button className="btn primary" onClick={() => navigate('lists')}>
            <Icon name="pen" size={15} /> {tr('Edit / share settings', 'Edit / share settings')}
          </button>
        ) : (
          <button className="btn primary" onClick={saveCopy} disabled={lists.some((l) => l.name === list.name && l.slugs.join() === list.slugs.join())}>
            <Icon name="plus" size={15} /> {tr('Meri lists me save karo', 'Save to my lists')}
          </button>
        )}
        <button className="btn" disabled={!pages.length} onClick={() => setQuickAll((q) => !q)}>
          <Icon name="bolt" size={15} /> {quickAll ? tr('List view pe wapas', 'Back to the list') : tr('Quick look: sab ek saath', 'Quick look: all at once')}
        </button>
      </div>

      <section className="list-card">
        {quickAll ? (
          <div className="quick-stack">
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
            {list.questions.length > 0 && (
              <div className="saved-qs">
                <span className="eyebrow">
                  {tr('Sawal', 'Questions')} · {list.questions.length}
                </span>
                <ol className="list-pages">
                  {list.questions.map((q) => (
                    <li key={q.id} className="saved-q">
                      <span className="saved-q-main">
                        <span className="saved-q-text">{q.q}</span>
                        <span className="muted small">{q.from}</span>
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            )}
            {pages.length === 0 && !list.questions.length && <p className="muted">{tr('List khaali hai.', 'The list is empty.')}</p>}
            <ol className="list-pages">
              {pages.map((p) => {
                const s = pageStats(p, progress)
                return (
                  <li key={p.slug} className={s.complete ? 'done' : ''}>
                    <a href={route(p)} className="list-page-link">
                      <span className="plan-track">{KIND_LABEL[p.kind]}</span>
                      <span>{shortTitle(localize(p, lang).title)}</span>
                      <span className="muted small mono">{s.complete ? '✓' : s.done ? `${s.done}/${s.total}` : `${p.time}m`}</span>
                    </a>
                  </li>
                )
              })}
            </ol>
          </>
        )}
      </section>
    </div>
  )
}
