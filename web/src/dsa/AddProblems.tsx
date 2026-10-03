import { useRef, useState } from 'react'
import { openSettings, useGemini, type Source } from '../gemini'
import { useTr } from '../i18n'
import { navigate } from '../router'
import { useStore } from '../store'
import { Icon } from '../components/Icon'
import { findTopProblems, generateProblem, leetcodeSlug, type Candidate, type Step } from './generate'
import { saveGenerated, type ProblemMeta } from './practice'

const STEPS: Step[] = ['search', 'spec', 'reference', 'crosscheck', 'save']

/** Turns a LeetCode link or a "top questions" search into a verified judge problem */
export function useProblemImporter(known: ProblemMeta[]) {
  const { user } = useStore()
  const [step, setStep] = useState<Step | null>(null)
  const [note, setNote] = useState('')
  const [error, setError] = useState('')
  const abort = useRef<AbortController | null>(null)

  async function importProblem(source: { url?: string; title?: string; lc?: number | null }) {
    // Already on the site? Just open it
    const lcFromUrl = source.url ? null : source.lc
    const existing = known.find((m) => (lcFromUrl && m.lc === lcFromUrl) || (source.title && m.title.toLowerCase() === source.title.toLowerCase()))
    if (existing) return navigate(`practice/${existing.id}`)
    abort.current?.abort()
    const ctrl = new AbortController()
    abort.current = ctrl
    setError('')
    setNote('')
    try {
      const p = await generateProblem(source, (s, n) => (setStep(s), setNote(n ?? '')), ctrl.signal)
      const dup = known.find((m) => m.id === p.id || (p.lc && m.lc === p.lc))
      if (dup) return navigate(`practice/${dup.id}`)
      await saveGenerated(p, user?.uid ?? null)
      setStep('done')
      navigate(`practice/${p.id}`)
    } catch (e) {
      if ((e as Error).name !== 'AbortError') setError((e as Error).message)
      setStep(null)
    }
  }
  const cancel = () => {
    abort.current?.abort()
    setStep(null)
  }
  return { step, note, error, importProblem, cancel }
}

export function StepList({ step, note }: { step: Step; note: string }) {
  const tr = useTr()
  const label: Record<Step, string> = {
    search: tr('Web pe problem dhoondh rahe hain', 'Looking the problem up on the web'),
    spec: tr('Statement, tests aur 2 solutions likh rahe hain', 'Writing the statement, tests and two solutions'),
    reference: tr('Compiler pe reference solution se expected answers', 'Computing expected answers with the reference solution'),
    crosscheck: tr('Brute force se cross-check', 'Cross-checking with a brute force'),
    repair: tr('Galti mili, AI se fix karwa rahe hain', 'Found a mismatch, asking the AI to fix it'),
    save: tr('Save kar rahe hain', 'Saving'),
    done: tr('Ho gaya', 'Done'),
  }
  const at = STEPS.indexOf(step === 'repair' ? 'crosscheck' : step)
  return (
    <ol className="gen-steps">
      {STEPS.map((s, i) => (
        <li key={s} className={i < at ? 'done' : i === at ? 'now' : ''}>
          <span className="gen-dot">{i < at ? '✓' : ''}</span>
          {label[s]}
          {i === at && note && <span className="muted small"> · {note}</span>}
        </li>
      ))}
      {step === 'repair' && <li className="now">{label.repair}</li>}
    </ol>
  )
}

export function AddProblems({ known, onClose }: { known: ProblemMeta[]; onClose: () => void }) {
  const tr = useTr()
  const { settings } = useGemini()
  const [mode, setMode] = useState<'link' | 'find'>('link')
  const [url, setUrl] = useState('')
  const [topic, setTopic] = useState('')
  const [company, setCompany] = useState('')
  const [finding, setFinding] = useState(false)
  const [found, setFound] = useState<{ items: Candidate[]; sources: Source[] } | null>(null)
  const [findError, setFindError] = useState('')
  const { step, note, error, importProblem, cancel } = useProblemImporter(known)
  const busy = !!step && step !== 'done'

  if (!settings.apiKey)
    return (
      <section className="add-problems">
        <p>{tr('Naye problems AI banata hai, isliye pehle AI set up karo (free key, 1 minute).', 'New problems are built by the AI, so set up AI first (free key, 1 minute).')}</p>
        <div className="row">
          <button className="btn primary" onClick={openSettings}>
            {tr('AI set up karo', 'Set up AI')}
          </button>
          <button className="btn" onClick={onClose}>
            {tr('Band karo', 'Close')}
          </button>
        </div>
      </section>
    )

  async function find() {
    setFinding(true)
    setFindError('')
    setFound(null)
    try {
      setFound(await findTopProblems({ topic: topic.trim() || undefined, company: company.trim() || undefined, count: 12 }))
    } catch (e) {
      setFindError((e as Error).message)
    } finally {
      setFinding(false)
    }
  }

  return (
    <section className="add-problems">
      <div className="add-head">
        <div className="seg small" role="radiogroup">
          <button role="radio" aria-checked={mode === 'link'} className={mode === 'link' ? 'on' : ''} onClick={() => setMode('link')} disabled={busy}>
            {tr('LeetCode link', 'LeetCode link')}
          </button>
          <button role="radio" aria-checked={mode === 'find'} className={mode === 'find' ? 'on' : ''} onClick={() => setMode('find')} disabled={busy}>
            {tr('Top questions dhoondho', 'Find top questions')}
          </button>
        </div>
        <button className="icon-btn" onClick={onClose} aria-label={tr('Band karo', 'Close')}>
          <Icon name="close" size={16} />
        </button>
      </div>

      {mode === 'link' ? (
        <form
          className="add-row"
          onSubmit={(e) => {
            e.preventDefault()
            if (leetcodeSlug(url)) importProblem({ url })
          }}
        >
          <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://leetcode.com/problems/lru-cache/" aria-label="LeetCode URL" disabled={busy} />
          <button className="btn primary" disabled={busy || !leetcodeSlug(url)}>
            {tr('Import karo', 'Import')}
          </button>
        </form>
      ) : (
        <>
          <form
            className="add-row"
            onSubmit={(e) => {
              e.preventDefault()
              find()
            }}
          >
            <input value={company} onChange={(e) => setCompany(e.target.value)} placeholder={tr('Company (optional): Amazon, Flipkart…', 'Company (optional): Amazon, Flipkart…')} aria-label="Company" disabled={busy || finding} />
            <input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder={tr('Topic (optional): sliding window, graphs…', 'Topic (optional): sliding window, graphs…')} aria-label="Topic" disabled={busy || finding} />
            <button className="btn primary" disabled={busy || finding}>
              {finding ? tr('Dhoondh rahe hain…', 'Searching…') : tr('Dhoondho', 'Search')}
            </button>
          </form>
          {findError && <p className="error small">{findError}</p>}
          {found && (
            <>
              <ul className="cand-list">
                {found.items.map((c) => {
                  const have = known.find((m) => (c.lc && m.lc === c.lc) || m.title.toLowerCase() === c.title.toLowerCase())
                  return (
                    <li key={c.title} className="cand">
                      <span className="cand-main">
                        <b>{c.title}</b>
                        {c.lc && <span className="mono muted small"> #{c.lc}</span>}
                        {c.why && <span className="muted small cand-why">{c.why}</span>}
                      </span>
                      {c.difficulty && <span className={`diff d-${c.difficulty}`}>{c.difficulty}</span>}
                      {have ? (
                        <button className="btn" onClick={() => navigate(`practice/${have.id}`)}>
                          {tr('Kholo', 'Open')}
                        </button>
                      ) : (
                        <button className="btn primary" disabled={busy} onClick={() => importProblem({ title: c.title, lc: c.lc, url: c.url && leetcodeSlug(c.url) ? c.url : undefined })}>
                          {tr('Banao', 'Add')}
                        </button>
                      )}
                    </li>
                  )
                })}
              </ul>
              {found.sources.length > 0 && (
                <details className="sources small">
                  <summary>{tr(`${found.sources.length} sources`, `${found.sources.length} sources`)}</summary>
                  <ul>
                    {found.sources.slice(0, 10).map((s) => (
                      <li key={s.uri}>
                        <a href={s.uri} target="_blank" rel="noreferrer">
                          {s.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </>
          )}
        </>
      )}

      {busy && step && (
        <div className="gen-progress">
          <StepList step={step} note={note} />
          <p className="muted small">{tr('Isme 1–2 minute lagte hain: har test compiler pe 2 solutions se check hota hai.', 'This takes 1–2 minutes: every test is checked on the compiler with two solutions.')}</p>
          <button className="ghost-btn" onClick={cancel}>
            {tr('Cancel', 'Cancel')}
          </button>
        </div>
      )}
      {error && <p className="error small">{error}</p>}
    </section>
  )
}
