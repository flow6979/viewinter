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

      <PlanCard />

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

const fmtMin = (m: number) => (m >= 60 ? `${Math.floor(m / 60)}h${m % 60 ? ` ${m % 60}m` : ''}` : `${m}m`)

/** The plan at a glance: make one, or follow it (progress, today's load, next page) */
function PlanCard() {
  const { progress, profile } = useStore()
  const { lang } = useLang()
  const tr = useTr()

  if (!profile.plan) {
    return (
      <section className="plan-card empty">
        <div className="plan-card-main">
          <span className="eyebrow">{tr('Study plan', 'Study plan')}</span>
          <h2>{tr('30 second me apna plan banao', 'Make your plan in 30 seconds')}</h2>
          <p className="muted">
            {tr(
              'Kitne din baaki aur roz kitne ghante, bas. Hum day-by-day plan bana denge, must-do topics pehle, aur roz tumhari progress se update hoga.',
              'Days left and hours a day, that is it. You get a day-by-day plan with must-do topics first, updated every day from your progress.',
            )}
          </p>
        </div>
        <div className="plan-card-actions">
          <a className="btn primary" href={href('plan')}>
            {tr('Plan banao', 'Make plan')} <Icon name="arrow" size={15} />
          </a>
        </div>
      </section>
    )
  }

  const daysLeft = daysUntil(profile.interviewDate)
  const input: PlanInput = profile.plan
  const plan = buildPlan(withListPages(input, profile.lists ?? []), (daysLeft ?? input.days ?? 14) + 1, (p) => pageStats(p, progress).complete)
  const today = plan.days[0]
  const remaining = plan.days.reduce((n, d) => n + d.items.length, 0) + plan.later.length
  const total = remaining + plan.doneCount
  const pct = total ? Math.round((plan.doneCount / total) * 100) : 0
  const next = today?.items.find((it) => !pageStats(it.page, progress).complete) ?? plan.days.find((d) => d.items.length)?.items[0]
  const todayMin = today?.items.reduce((n, it) => n + it.minutes, 0) ?? 0
  const list = input.list ? profile.lists?.find((l) => l.id === input.list) : undefined

  return (
    <section className="plan-card">
      <div className="plan-card-main">
        <div className="plan-card-top">
          <span className="eyebrow">{list ? `${tr('Plan', 'Plan')} · ${list.name}` : tr('Tumhara plan', 'Your plan')}</span>
        </div>
        <h2>
          {today?.revision
            ? tr('Aaj revision day hai', 'Today is revision day')
            : remaining === 0
              ? tr('Plan poora ho gaya', 'Plan complete')
              : tr(`Aaj: ${today?.items.length ?? 0} pages · ${fmtMin(todayMin)}`, `Today: ${today?.items.length ?? 0} pages · ${fmtMin(todayMin)}`)}
        </h2>
        <div className="plan-progress" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={tr('Plan progress', 'Plan progress')}>
          <i style={{ width: `${pct}%` }} />
        </div>
        <p className="plan-card-stats mono small">
          <span>{pct}%</span>
          <span>
            {plan.doneCount}/{total} {tr('pages', 'pages')}
          </span>
          {plan.mustDoMissing > 0 && <span>{tr(`${plan.mustDoMissing} must-do fit nahi hue`, `${plan.mustDoMissing} must-do do not fit`)}</span>}
        </p>
      </div>
      <div className="plan-card-actions">
        {next && !today?.revision && (
          <a className="btn primary" href={route(next.page)}>
            {tr('Continue', 'Continue')}: {shortTitle(localize(next.page, lang).title)} <Icon name="arrow" size={15} />
          </a>
        )}
        {today?.revision && (
          <a className="btn primary" href={href('quiz')}>
            {tr('Starred quiz', 'Starred quiz')} <Icon name="arrow" size={15} />
          </a>
        )}
        <a className="btn" href={href('plan')}>
          {tr('Plan dekho / badlo', 'View / edit plan')}
        </a>
      </div>
    </section>
  )
}
