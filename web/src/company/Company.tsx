import { useEffect, useRef, useState } from 'react'
import { NO_TEX, openSettings, streamGemini, useGemini } from '../gemini'
import { useLang, useTr, type Lang } from '../i18n'
import { useLists } from '../lists'
import { readLocal, useStore, writeLocal } from '../store'
import { Icon } from '../components/Icon'
import { Markdown } from '../components/Markdown'
import { useProblemImporter, StepList } from '../dsa/AddProblems'
import { useProblemIndex, type ProblemMeta } from '../dsa/practice'
import { getReport, keyOf, SECTIONS, usePrep, type CompanyQuestion, type CompanyReport, type SectionId } from './companyPrep'

const ROLES = ['SDE1', 'SDE2', 'SDE3', 'Senior SDE', 'Staff Engineer', 'Frontend Engineer', 'Backend Engineer', 'Full Stack Engineer', 'Data Engineer', 'ML Engineer', 'Engineering Manager', 'SDET / QA']

function answerPrompt(c: CompanyQuestion, company: string, role: string, lang: Lang): string {
  const style: Record<SectionId, string> = {
    dsa: 'Give the approach first (pattern, key idea), then clean C++17 code, then time/space complexity and 2 follow-ups the interviewer may ask.',
    system_design: 'Answer like a strong candidate in a 45-min HLD round: clarifying questions, requirements (functional + non-functional with numbers), high-level design (a mermaid flowchart with all labels in double quotes), 2 deep dives, trade-offs, failure handling.',
    lld: 'Give the classes and responsibilities, key methods, design patterns used and why, a short C++ or Java skeleton, and extensibility points.',
    behavioral: 'Give a STAR-format sample answer (Situation, Task, Action with "I", Result with numbers), what the interviewer is checking, and 2 follow-ups. Use placeholders like <project> where personal details are needed.',
    resume: 'Explain how to structure the answer about one\'s own project: context, own contribution, architecture, numbers, trade-offs, what went wrong, what you would change. Give a template with placeholders.',
    cs: 'Answer crisply with the core concept, a small example, and the common follow-up.',
    misc: 'Answer crisply; for puzzles give the reasoning step by step.',
  }
  return `You are a senior ${company} interviewer coaching a candidate for the "${role}" role. Question (${c.section}${c.level ? `, reported for ${c.level}` : ''}${c.round ? `, round: ${c.round}` : ''}):
"${c.q}"
${style[c.section]}
Reply in ${lang === 'en' ? 'clear English' : 'simple Hinglish (Roman Hindi + English tech terms)'}; structured with short headings and bullets; no filler. ${NO_TEX}`
}

export function Company() {
  const { lang } = useLang()
  const tr = useTr()
  const { user } = useStore()
  const { settings } = useGemini()
  const [company, setCompany] = useState<string>(() => readLocal('hld.company.last', { company: '', role: 'SDE2' }).company)
  const [role, setRole] = useState<string>(() => readLocal('hld.company.last', { company: '', role: 'SDE2' }).role)
  const [report, setReport] = useState<CompanyReport | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [section, setSection] = useState<SectionId | 'all'>('all')
  const recent = readLocal<{ company: string; role: string }[]>('hld.company.recent', [])
  const abort = useRef<AbortController | null>(null)

  async function search(refresh = false, c = company, r = role) {
    if (!c.trim() || !r.trim()) return
    if (!settings.apiKey) return openSettings()
    abort.current?.abort()
    const ctrl = new AbortController()
    abort.current = ctrl
    setBusy(true)
    setError('')
    try {
      const rep = await getReport(c, r, user?.uid ?? null, { refresh, signal: ctrl.signal })
      setReport(rep)
      setSection('all')
      writeLocal('hld.company.last', { company: c, role: r })
      writeLocal('hld.company.recent', [{ company: c, role: r }, ...recent.filter((x) => keyOf(x.company, x.role) !== keyOf(c, r))].slice(0, 8))
    } catch (e) {
      if ((e as Error).name !== 'AbortError') setError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  // Reopen the last company instantly from cache
  useEffect(() => {
    if (company && role && settings.apiKey) search(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const key = report ? keyOf(report.company, report.role) : ''
  const prep = usePrep(key)
  const known = useProblemIndex()
  const shown = report?.questions.filter((q) => section === 'all' || q.section === section) ?? []

  return (
    <div className="company">
      <header>
        <span className="eyebrow">{tr('Company prep', 'Company prep')}</span>
        <h1>{tr('Company ke asli sawal', 'Real questions by company')}</h1>
        <p className="muted">{tr('Company aur role likho: AI web pe interview experiences dhoondh ke sawal section-wise laata hai (same track ke aas-paas ke levels bhi).', 'Enter a company and role: the AI searches interview experiences on the web and brings the questions by section (nearby levels of the same track too).')}</p>
      </header>

      <form
        className="company-form"
        onSubmit={(e) => {
          e.preventDefault()
          search(false)
        }}
      >
        <input value={company} onChange={(e) => setCompany(e.target.value)} placeholder={tr('Company: Amazon, Flipkart, Google…', 'Company: Amazon, Flipkart, Google…')} aria-label="Company" />
        <input value={role} onChange={(e) => setRole(e.target.value)} placeholder="Role: SDE2" aria-label="Role" />
        <button className="btn primary" disabled={busy || !company.trim() || !role.trim()}>
          {busy ? tr('Web pe dhoondh rahe hain…', 'Searching the web…') : tr('Sawal dhoondho', 'Find questions')}
        </button>
      </form>
      <div className="role-picks" role="radiogroup" aria-label={tr('Role chuno', 'Pick a role')}>
        {ROLES.map((r) => (
          <button key={r} type="button" role="radio" aria-checked={role === r} className={`role-pick ${role === r ? 'on' : ''}`} onClick={() => setRole(r)}>
            {r}
          </button>
        ))}
      </div>
      {!settings.apiKey && (
        <p className="plan-warn">
          {tr('Iske liye AI set up karo (free key, 1 minute).', 'This needs AI to be set up (free key, 1 minute).')}{' '}
          <button className="link-btn" onClick={openSettings}>
            {tr('Set up karo', 'Set up')}
          </button>
        </p>
      )}
      {recent.length > 0 && !report && !busy && (
        <div className="row wrap">
          {recent.map((r) => (
            <button
              key={keyOf(r.company, r.role)}
              className="chip"
              onClick={() => {
                setCompany(r.company)
                setRole(r.role)
                search(false, r.company, r.role)
              }}
            >
              {r.company} · {r.role}
            </button>
          ))}
        </div>
      )}
      {busy && <p className="muted">{tr('Interview experiences padh rahe hain… (20–40 sec)', 'Reading interview experiences… (20–40 sec)')}</p>}
      {error && <p className="error">{error}</p>}

      {report && !busy && (
        <>
          <section className="company-summary">
            <div className="company-summary-head">
              <h2>
                {report.company} · {report.role}
              </h2>
              <button className="ghost-btn" onClick={() => search(true)}>
                {tr('Refresh', 'Refresh')}
              </button>
            </div>
            {report.live === false && (
              <p className="plan-warn small">
                {tr('Live web search abhi available nahi tha (Google Search ka free quota), isliye ye list AI ki apni knowledge se hai. Baad me "Refresh" karke live search try karo.', 'Live web search was unavailable (Google Search free quota), so this list comes from the AI’s own knowledge. Try "Refresh" later for a live search.')}
                {report.note && <span className="muted"> ({report.note.slice(0, 160)})</span>}
              </p>
            )}
            {report.levels.length > 0 && <p className="muted small">{tr('Levels:', 'Levels:')} {report.levels.join(', ')}</p>}
            {report.process && <p>{report.process}</p>}
            {report.rounds.length > 0 && (
              <ol className="rounds">
                {report.rounds.map((r, i) => (
                  <li key={i}>
                    <span className="mono">{String(i + 1).padStart(2, '0')}</span> {r}
                  </li>
                ))}
              </ol>
            )}
            {report.tips.length > 0 && (
              <ul className="company-tips small">
                {report.tips.map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>
            )}
            {report.sources.length > 0 && (
              <details className="sources small">
                <summary>
                  {report.sources.length} {tr('sources', 'sources')} · {new Date(report.at).toLocaleDateString()}
                </summary>
                <ul>
                  {report.sources.map((s) => (
                    <li key={s.uri}>
                      <a href={s.uri} target="_blank" rel="noreferrer">
                        {s.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </details>
            )}
          </section>

          <div className="topic-chips">
            <button className={`list-tab ${section === 'all' ? 'on' : ''}`} onClick={() => setSection('all')}>
              {tr('Sab', 'All')} <span className="mono">{report.questions.length}</span>
            </button>
            {SECTIONS.map((s) => {
              const n = report.questions.filter((q) => q.section === s.id).length
              return n ? (
                <button key={s.id} className={`list-tab ${section === s.id ? 'on' : ''}`} onClick={() => setSection(s.id)}>
                  {s[lang]} <span className="mono">{n}</span>
                </button>
              ) : null
            })}
          </div>

          <ol className="resume-list">
            {shown.map((q) => (
              <CompanyCard key={q.id} q={q} report={report} prep={prep} known={known} />
            ))}
          </ol>
        </>
      )}
    </div>
  )
}

function CompanyCard({ q, report, prep, known }: { q: CompanyQuestion; report: CompanyReport; prep: ReturnType<typeof usePrep>; known: ProblemMeta[] }) {
  const { lang } = useLang()
  const tr = useTr()
  const { state, save } = prep
  const { lists, toggleQuestion, syncAnswer, createWith } = useLists()
  const importer = useProblemImporter(known)
  const companyListName = `${report.company} · ${report.role}`
  const companyList = lists.find((l) => l.name === companyListName)
  const [panel, setPanel] = useState<'' | 'ai' | 'mine' | 'list'>('')
  const [draft, setDraft] = useState(state.answers[q.id] ?? '')
  const [streaming, setStreaming] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const sectionLabel = SECTIONS.find((s) => s.id === q.section)?.[lang] ?? q.section
  const from = `${report.company} · ${report.role} · ${sectionLabel}`
  const saved = { id: q.id, q: q.q, from, answer: state.answers[q.id] }
  const inLists = lists.filter((l) => l.questions?.some((x) => x.id === q.id))
  const ai = state.ai[q.id]

  useEffect(() => setDraft(state.answers[q.id] ?? ''), [state.answers, q.id])

  // Save the user's answer after a pause, and keep the copy inside lists current
  useEffect(() => {
    if (draft === (state.answers[q.id] ?? '')) return
    const t = window.setTimeout(() => {
      save('answers', q.id, draft)
      syncAnswer(q.id, draft)
    }, 700)
    return () => window.clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft])

  async function aiAnswer() {
    setPanel('ai')
    if (ai || busy) return
    setBusy(true)
    setError('')
    try {
      const text = await streamGemini(answerPrompt(q, report.company, report.role, lang), [{ role: 'user', text: 'Answer this interview question.' }], setStreaming)
      save('ai', q.id, text)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setStreaming('')
      setBusy(false)
    }
  }

  return (
    <li className={`resume-q ${panel ? 'open' : ''}`}>
      <div className="resume-q-top">
        <span className="resume-q-tags">
          <span className="q-tag">{sectionLabel}</span>
          {q.level && <span className="muted small">{q.level}</span>}
          {q.round && <span className="muted small">· {q.round}</span>}
        </span>
        {q.frequency && <span className={`freq f-${q.frequency}`}>{q.frequency === 'high' ? tr('Bahut pucha jata', 'Asked often') : q.frequency === 'medium' ? tr('Kabhi kabhi', 'Sometimes') : tr('Kam', 'Rare')}</span>}
      </div>
      <p className="resume-q-text">
        {q.q}
        {q.lc ? <span className="mono muted small"> · LeetCode #{q.lc}</span> : null}
      </p>
      <div className="q-actions">
        <button className={`q-btn ai-btn ${panel === 'ai' ? 'on' : ''}`} onClick={() => (panel === 'ai' ? setPanel('') : aiAnswer())}>
          <Icon name="sparkle" size={15} /> {ai ? tr('AI answer', 'AI answer') : tr('AI answer banao', 'Get AI answer')}
        </button>
        <button className={`q-btn primary ${panel === 'mine' ? 'on' : ''}`} onClick={() => setPanel(panel === 'mine' ? '' : 'mine')}>
          <Icon name="pen" size={15} /> {state.answers[q.id] ? tr('Mera answer', 'My answer') : tr('Answer likho', 'Write answer')}
        </button>
        <button className={`q-btn ${panel === 'list' ? 'on' : ''}`} onClick={() => setPanel(panel === 'list' ? '' : 'list')}>
          <Icon name="list" size={15} /> {inLists.length ? `✓ ${tr('List me', 'In list')} · ${inLists.length}` : tr('List me daalo', 'Add to list')}
        </button>
        {q.section === 'dsa' && (
          <button className="q-btn" disabled={!!importer.step} onClick={() => importer.importProblem({ title: q.q, lc: q.lc ?? null, url: q.lc ? undefined : undefined })}>
            <Icon name="code" size={15} /> {tr('Practice karo', 'Practice it')}
          </button>
        )}
      </div>

      {importer.step && importer.step !== 'done' && (
        <div className="q-panel">
          <StepList step={importer.step} note={importer.note} />
        </div>
      )}
      {importer.error && <p className="error small">{importer.error}</p>}

      {panel === 'ai' && (
        <div className="q-panel ai-panel">
          {ai || streaming ? <Markdown text={ai || streaming} showAllCode /> : busy ? <p className="muted small">{tr('Likh raha hai…', 'Writing…')}</p> : null}
          {error && <p className="error small">{error}</p>}
          {ai && !busy && (
            <div className="row">
              <button className="ghost-btn" onClick={() => setDraft(ai)}>
                {tr('Isko apne answer me copy karo', 'Copy into my answer')}
              </button>
              <button
                className="ghost-btn"
                onClick={() => {
                  save('ai', q.id, '')
                  setTimeout(aiAnswer, 0)
                }}
              >
                {tr('Naya AI answer', 'New AI answer')}
              </button>
            </div>
          )}
        </div>
      )}

      {panel === 'mine' && (
        <div className="q-panel">
          <textarea rows={6} value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={tr('Apna answer likho (apne aap save hota hai; list me bhi dikhega)', 'Write your answer (saves automatically; shows in your lists too)')} />
          <span className="muted small">{draft && draft === state.answers[q.id] ? tr('✓ Save ho gaya', '✓ Saved') : ''}</span>
        </div>
      )}

      {panel === 'list' && (
        <div className="q-panel">
          {lists.map((l) => (
            <label key={l.id} className="list-pop-row">
              <input type="checkbox" checked={!!l.questions?.some((x) => x.id === q.id)} onChange={() => toggleQuestion(l.id, saved)} />
              <span>{l.name}</span>
              <span className="muted small mono">{(l.questions?.length ?? 0) + l.slugs.length}</span>
            </label>
          ))}
          {!companyList && (
            <button className="ghost-btn" onClick={() => createWith(companyListName, saved)}>
              <Icon name="plus" size={14} /> {tr(`Nayi list: ${companyListName}`, `New list: ${companyListName}`)}
            </button>
          )}
        </div>
      )}
    </li>
  )
}
