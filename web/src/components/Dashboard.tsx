import { href } from '../router'
import { agentPages, behavioral, cs, db, java, rag, lld, lldProblems, localize, questions, route, topics, type Page } from '../content'
import { useStore } from '../store'
import { useLang, useTr } from '../i18n'
import { groupStats, pageStats } from '../progress'
import { shortTitle } from './Sidebar'
import { buildPlan, daysUntil, type PlanInput } from '../plan'
import { withListPages } from '../lists'
import { Guide } from './Guide'
import { Icon, type IconName } from './Icon'

/** Overall progress as a thin ring */
function Ring({ value }: { value: number }) {
  const r = 52
  const c = 2 * Math.PI * r
  return (
    <svg className="ring" viewBox="0 0 120 120" role="img" aria-label={`${value}%`}>
      <circle cx="60" cy="60" r={r} className="ring-track" />
      <circle cx="60" cy="60" r={r} className="ring-fill" strokeDasharray={c} strokeDashoffset={c * (1 - value / 100)} />
      <text x="60" y="60" className="ring-value">
        {value}%
      </text>
    </svg>
  )
}

export function Dashboard() {
  const { progress, profile, user } = useStore()
  const { lang } = useLang()
  const tr = useTr()
  const firstName = user?.displayName?.split(' ')[0]
  const daysLeft = daysUntil(profile.interviewDate)
  const subjects: [string, Page[]][] = [
    ['HLD', [...topics, ...questions]],
    ['LLD', [...lld, ...lldProblems]],
    ['Java', java],
    ['Databases', db],
    ['CS', cs],
    ['Behavioral', behavioral],
    ['RAG', rag],
    ['Agentic AI', agentPages],
  ]
  const everything = subjects.flatMap(([, p]) => p)
  const all = groupStats(everything, progress)
  const started = everything.filter((p) => pageStats(p, progress).done > 0).length

  // Today's slice of the personal plan (defaults until the user sets one in the Plan tab)
  const input: PlanInput = profile.plan ?? { tracks: ['hld'], hours: 2, level: 'mid', days: 14 }
  const plan = buildPlan(withListPages(input, profile.lists ?? []), (daysLeft ?? input.days ?? 14) + 1, (p) => pageStats(p, progress).complete)
  const today = plan.days[0]

  const quick: [IconName, string, string, string][] = [
    ['target', 'Quiz', tr('MCQ practice', 'MCQ practice'), href('quiz')],
    ['plan', tr('Mera plan', 'My plan'), tr('Day-by-day', 'Day by day'), href('plan')],
    ['list', tr('Meri lists', 'My lists'), tr('Revise sets', 'Revise sets'), href('lists')],
    ['file', 'Resume', tr('Sawal + score', 'Questions + score'), href('resume')],
    ['flask', tr('Agent labs', 'Agent labs'), 'ReAct · RAG', href('agents')],
  ]

  return (
    <div className="dashboard">
      <header className="greet">
        <h1>{firstName ? tr(`Namaste, ${firstName}`, `Hi, ${firstName}`) : tr('Namaste', 'Welcome')}</h1>
        {daysLeft !== null && (
          <p className="countdown">
            <span className="mono">{daysLeft}</span> {tr('din baaki', daysLeft === 1 ? 'day left' : 'days left')}
          </p>
        )}
      </header>

      <nav className="quick" aria-label={tr('Jaldi jao', 'Jump to')}>
        {quick.map(([icon, title, sub, link]) => (
          <a key={title} className="quick-card" href={link}>
            <Icon name={icon} size={18} />
            <span className="quick-text">
              <b>{title}</b>
              <span>{sub}</span>
            </span>
            <span className="quick-arrow">
              <Icon name="arrow" size={15} />
            </span>
          </a>
        ))}
      </nav>

      <section className="dash-section">
        <div className="dash-head">
          <span className="eyebrow">{tr('Aaj', 'Today')}</span>
          <a href={href('plan')} className="dash-link">
            {profile.plan ? tr('Poora plan', 'Full plan') : tr('Plan banao', 'Make your plan')} <Icon name="arrow" size={14} />
          </a>
        </div>
        {today?.revision ? (
          <p className="muted">{tr('Revision day: Quick look, starred quiz aur ek mock interview.', 'Revision day: Quick look, starred quiz and one mock interview.')}</p>
        ) : today && today.items.length ? (
          <ol className="today-list">
            {today.items.map((it, i) => {
              const s = pageStats(it.page, progress)
              return (
                <li key={it.page.slug}>
                  <a href={route(it.page)} className="today-row">
                    <span className="today-n mono">{String(i + 1).padStart(2, '0')}</span>
                    <span className="today-title">{shortTitle(localize(it.page, lang).title)}</span>
                    <span className="today-meta mono">
                      {it.track.toUpperCase()} · {s.done > 0 ? `${s.done}/${s.total}` : `${it.minutes}m`}
                    </span>
                    <Icon name="arrow" size={14} />
                  </a>
                </li>
              )
            })}
          </ol>
        ) : (
          <p className="muted">{tr('Plan ke saare pages ho gaye. Quiz se revise karo.', 'Everything in your plan is done. Revise with the quiz.')}</p>
        )}
      </section>

      <section className="dash-section" aria-label="Progress">
        <div className="dash-head">
          <span className="eyebrow">{tr('Progress', 'Progress')}</span>
          <span className="muted small">{tr('Har square ek page hai, click karke kholo', 'Each square is a page, click to open')}</span>
        </div>
        <div className="progress-map">
          <div className="progress-summary">
            <Ring value={all.percent} />
            <dl>
              <div>
                <dt>{tr('Pages poore', 'Pages done')}</dt>
                <dd className="mono">
                  {all.complete}/{everything.length}
                </dd>
              </div>
              <div>
                <dt>{tr('Shuru kiye', 'Started')}</dt>
                <dd className="mono">{started}</dd>
              </div>
              <div>
                <dt>{tr('Checklist', 'Checklist')}</dt>
                <dd className="mono">
                  {all.done}/{all.total}
                </dd>
              </div>
            </dl>
          </div>
          <div className="tiles">
            {subjects.map(([label, pages]) => {
              const st = groupStats(pages, progress)
              return (
                <div key={label} className="tile-row">
                  <span className="tile-label">{label}</span>
                  <span className="tile-grid">
                    {pages.map((p) => {
                      const s = pageStats(p, progress)
                      const state = s.complete ? 'done' : s.done > 0 ? 'half' : ''
                      return <a key={p.slug} href={route(p)} className={`tile ${state}`} title={`${shortTitle(localize(p, lang).title)}${s.total ? ` · ${s.done}/${s.total}` : ''}`} aria-label={shortTitle(localize(p, lang).title)} />
                    })}
                  </span>
                  <span className="tile-pct mono">{st.percent}%</span>
                </div>
              )
            })}
            <div className="tile-legend">
              <span>
                <i className="tile" /> {tr('baaki', 'to do')}
              </span>
              <span>
                <i className="tile half" /> {tr('shuru', 'started')}
              </span>
              <span>
                <i className="tile done" /> {tr('poora', 'done')}
              </span>
            </div>
          </div>
        </div>
      </section>

      <Guide />
    </div>
  )
}
