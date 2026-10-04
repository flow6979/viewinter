import { useEffect, useMemo, useState } from 'react'
import { localize, lldProblems, questions } from '../content'
import { openSettings, useGemini } from '../gemini'
import { useLang, useTr } from '../i18n'
import { href, navigate } from '../router'
import { readLocal, useStore, writeLocal } from '../store'
import { Icon, type IconName } from '../components/Icon'
import { shortTitle } from '../components/Sidebar'
import { useProblemIndex } from '../dsa/practice'
import type { Report, RoundType } from './prompts'
import { loadReport, useReports } from './reports'
import { canListen, getVoiceSettings } from './voice'

const TYPES: { id: RoundType; icon: IconName; hi: string; en: string; sub: { hi: string; en: string } }[] = [
  { id: 'hld', icon: 'hld', hi: 'System design', en: 'System design', sub: { hi: 'Whiteboard pe design, deep dives', en: 'Design on a whiteboard, deep dives' } },
  { id: 'lld', icon: 'code', hi: 'LLD / OOD', en: 'LLD / OOD', sub: { hi: 'Classes, patterns, thoda code', en: 'Classes, patterns, a little code' } },
  { id: 'dsa', icon: 'target', hi: 'Coding (DSA)', en: 'Coding (DSA)', sub: { hi: 'C++ editor, examples run karo', en: 'C++ editor, run the examples' } },
  { id: 'behavioral', icon: 'chat', hi: 'Behavioral', en: 'Behavioral', sub: { hi: 'Hiring manager round, STAR', en: 'Hiring-manager round, STAR' } },
]

const verdictTone = (v: string) => (/^(strong hire|hire)$/i.test(v) ? 'good' : /no hire/i.test(v) ? 'low' : 'mid')

export function InterviewSetup() {
  const { lang } = useLang()
  const tr = useTr()
  const { settings } = useGemini()
  const reports = useReports()
  const dsaIndex = useProblemIndex()
  const last = readLocal<{ type: RoundType; minutes: number; voice: boolean; cam: boolean }>('hld.interview.setup', { type: 'hld', minutes: 45, voice: true, cam: true })
  const [type, setType] = useState<RoundType>(() => {
    const q = new URLSearchParams(window.location.search).get('type') as RoundType | null
    return q ?? last.type
  })
  const [slug, setSlug] = useState<string>(() => new URLSearchParams(window.location.search).get('slug') ?? '')
  const [minutes, setMinutes] = useState(last.minutes)
  const [voice, setVoice] = useState(last.voice)
  const [cam, setCam] = useState(last.cam)

  const options = useMemo(() => {
    if (type === 'hld') return questions.map((p) => ({ slug: p.slug, title: shortTitle(localize(p, lang).title) }))
    if (type === 'lld') return lldProblems.map((p) => ({ slug: p.slug, title: shortTitle(localize(p, lang).title) }))
    if (type === 'dsa') return dsaIndex.map((p) => ({ slug: p.id, title: `${p.title} · ${p.difficulty}` }))
    return [{ slug: 'behavioral', title: tr('Behavioral / hiring manager', 'Behavioral / hiring manager') }]
  }, [type, lang, dsaIndex, tr])

  useEffect(() => {
    if (!options.some((o) => o.slug === slug)) setSlug(options[0]?.slug ?? '')
  }, [options, slug])

  const start = () => {
    writeLocal('hld.interview.setup', { type, minutes, voice, cam })
    navigate(`interview/live?type=${type}&slug=${encodeURIComponent(slug)}&m=${minutes}&v=${voice ? 1 : 0}&c=${cam ? 1 : 0}`)
  }
  const random = () => setSlug(options[Math.floor(Math.random() * options.length)]?.slug ?? '')

  return (
    <div className="interview">
      <header className="interview-hero">
        <span className="eyebrow">{tr('Mock interview room', 'Mock interview room')}</span>
        <h1>{tr('Asli interview jaisa. Bina kisi ke saamne baithe.', 'Like the real thing, before the real thing.')}</h1>
        <p className="muted">
          {tr(
            'AI interviewer bolta hai aur sunta hai, aapka camera on rehta hai, aap whiteboard pe design karte ho ya editor me code. End pe score, verdict aur feedback milta hai.',
            'The AI interviewer talks and listens, your camera is on, and you design on a whiteboard or code in an editor. At the end you get a score, a verdict and feedback.',
          )}
        </p>
      </header>

      <section className="iv-types" role="radiogroup" aria-label={tr('Round', 'Round')}>
        {TYPES.map((t) => (
          <button key={t.id} type="button" role="radio" aria-checked={type === t.id} className={`iv-type ${type === t.id ? 'on' : ''}`} onClick={() => setType(t.id)}>
            <Icon name={t.icon} size={20} />
            <b>{t[lang]}</b>
            <span>{t.sub[lang]}</span>
          </button>
        ))}
      </section>

      <section className="settings">
        {type !== 'behavioral' && (
          <div className="setting">
            <div className="setting-label">
              <b>{tr('Problem', 'Problem')}</b>
              <span>{tr('Ya random lo, jaise asli interview me', 'Or go random, like a real interview')}</span>
            </div>
            <div className="setting-control iv-problem">
              <select value={slug} onChange={(e) => setSlug(e.target.value)} aria-label={tr('Problem', 'Problem')}>
                {options.map((o) => (
                  <option key={o.slug} value={o.slug}>
                    {o.title}
                  </option>
                ))}
              </select>
              <button className="btn" onClick={random}>
                {tr('Random', 'Random')}
              </button>
            </div>
          </div>
        )}
        <div className="setting">
          <div className="setting-label">
            <b>{tr('Time', 'Length')}</b>
          </div>
          <div className="setting-control">
            <div className="seg small">
              {[30, 45, 60].map((m) => (
                <button key={m} className={minutes === m ? 'on' : ''} onClick={() => setMinutes(m)}>
                  {m} min
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="setting">
          <div className="setting-label">
            <b>{tr('Awaaz aur camera', 'Voice and camera')}</b>
            <span>
              {canListen() ? tr('Mic se bolo; interviewer bol ke jawab deta hai', 'Speak into the mic; the interviewer answers out loud') : tr('Voice input ke liye Chrome/Edge; yahan type kar sakte ho', 'Voice input needs Chrome/Edge; you can type here')}
              {' · '}
              {getVoiceSettings().elevenKey ? tr('ElevenLabs voice on', 'ElevenLabs voice on') : (
                <button className="link-btn" onClick={openSettings}>
                  {tr('Natural voice (ElevenLabs) add karo', 'Add a natural voice (ElevenLabs)')}
                </button>
              )}
            </span>
          </div>
          <div className="setting-control row">
            <button className={`room-toggle ${voice ? 'on' : ''}`} onClick={() => setVoice((v) => !v)}>
              {voice ? tr('Awaaz on', 'Voice on') : tr('Awaaz off', 'Voice off')}
            </button>
            <button className={`room-toggle ${cam ? 'on' : ''}`} onClick={() => setCam((c) => !c)}>
              {cam ? tr('Camera on', 'Camera on') : tr('Camera off', 'Camera off')}
            </button>
          </div>
        </div>
      </section>

      <div className="iv-start">
        {settings.apiKey ? (
          <button className="btn primary big" onClick={start} disabled={type !== 'behavioral' && !slug}>
            <Icon name="chat" size={17} /> {tr('Interview room me jao', 'Enter the interview room')}
          </button>
        ) : (
          <button className="btn primary big" onClick={openSettings}>
            {tr('Pehle AI set up karo (free key)', 'Set up AI first (free key)')}
          </button>
        )}
        <span className="muted small">{tr('Video aur awaaz sirf aapke browser me rehte hain. Sirf score aur feedback save hota hai.', 'Video and audio stay in your browser. Only the score and feedback are saved.')}</span>
      </div>

      <section className="iv-history">
        <span className="eyebrow">{tr('Pichle interviews', 'Past interviews')}</span>
        {reports.length === 0 ? (
          <p className="muted small">{tr('Abhi koi interview nahi diya.', 'No interviews yet.')}</p>
        ) : (
          <ol className="iv-list">
            {reports.map((r) => (
              <li key={r.id}>
                <a className="iv-row" href={href(`interview/report/${r.id}`)}>
                  <span className={`score-pill ${r.score >= 7 ? 'good' : r.score < 5 ? 'low' : 'mid'}`}>{r.score.toFixed(1)}</span>
                  <span className="iv-row-main">
                    <b>{r.title}</b>
                    <span className="muted small">
                      {r.type.toUpperCase()} · {new Date(r.at).toLocaleDateString()} · {r.minutes} min
                    </span>
                  </span>
                  <span className={`verdict-pill ${verdictTone(r.verdict)}`}>{r.verdict}</span>
                </a>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  )
}

export function InterviewReport({ id }: { id: string }) {
  const tr = useTr()
  const { user } = useStore()
  const [report, setReport] = useState<Report | null | undefined>(undefined)
  useEffect(() => {
    loadReport(id, user?.uid ?? null).then(setReport)
  }, [id, user])
  if (report === undefined) return <p className="muted">{tr('Load ho raha hai…', 'Loading…')}</p>
  if (!report)
    return (
      <div className="empty-state">
        <h1>{tr('Report nahi mili', 'Report not found')}</h1>
        <a href={href('interview')}>{tr('Mock interview', 'Mock interview')}</a>
      </div>
    )
  const r = report
  const ring = 2 * Math.PI * 52
  return (
    <div className="iv-report">
      <a href={href('interview')} className="dash-link">
        <span style={{ transform: 'rotate(180deg)', display: 'inline-flex' }}>
          <Icon name="arrow" size={14} />
        </span>
        {tr('Mock interview', 'Mock interview')}
      </a>
      <header className="iv-report-head">
        <svg className="ring" viewBox="0 0 120 120" role="img" aria-label={`${r.score}/10`}>
          <circle cx="60" cy="60" r="52" className="ring-track" />
          <circle cx="60" cy="60" r="52" className={`ring-fill ${r.score >= 7 ? 'ok' : r.score < 5 ? 'bad' : ''}`} strokeDasharray={ring} strokeDashoffset={ring * (1 - r.score / 10)} />
          <text x="60" y="60" className="ring-value">
            {r.score.toFixed(1)}
          </text>
        </svg>
        <div>
          <span className="eyebrow">
            {r.type.toUpperCase()} · {new Date(r.at).toLocaleString()} · {r.minutes} min
          </span>
          <h1>{r.title}</h1>
          <span className={`verdict-pill ${verdictTone(r.verdict)}`}>{r.verdict}</span>
        </div>
      </header>
      {r.summary && <p className="iv-summary">{r.summary}</p>}
      <section className="iv-dims">
        {r.dimensions.map((d) => (
          <div key={d.name} className="iv-dim">
            <span>{d.name}</span>
            <span className="iv-bar">
              <i className={d.score >= 7 ? 'ok' : d.score < 5 ? 'bad' : ''} style={{ width: `${d.score * 10}%` }} />
            </span>
            <b className="mono">{d.score}</b>
          </div>
        ))}
      </section>
      <section className="iv-feedback">
        <div className="feedback-block good">
          <b className="fb-title">
            <Icon name="check" size={15} /> {tr('Kya accha tha', 'What went well')}
          </b>
          <ul>
            {r.strengths.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>
        <div className="feedback-block improve">
          <b className="fb-title">
            <Icon name="up" size={15} /> {tr('Kya improve karein', 'What to improve')}
          </b>
          <ul>
            {r.improvements.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>
      </section>
      <div className="row">
        <a className="btn primary" href={href(`interview?type=${r.type}&slug=${encodeURIComponent(r.slug)}`)}>
          {tr('Dobara try karo', 'Try again')}
        </a>
        <a className="btn" href={href('interview')}>
          {tr('Naya interview', 'New interview')}
        </a>
      </div>
    </div>
  )
}
