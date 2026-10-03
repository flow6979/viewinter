import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { dsa, localize, pageBySlug, route } from '../content'
import { useLang, useTr } from '../i18n'
import { href } from '../router'
import { readLocal, writeLocal } from '../store'
import { Icon } from '../components/Icon'
import { Markdown } from '../components/Markdown'
import { shortTitle } from '../components/Sidebar'
import { sameAnswer, type Json } from './harness'
import { draftKey, loadProblem, PROBLEMS, usePractice, type Problem, type ProblemMeta } from './practice'
import { runCpp, type RunResult } from './runner'

const CodeEditor = lazy(() => import('./CodeEditor').then((m) => ({ default: m.CodeEditor })))

const DIFF = { easy: { hi: 'Easy', en: 'Easy' }, medium: { hi: 'Medium', en: 'Medium' }, hard: { hi: 'Hard', en: 'Hard' } }
const topicTitle = (slug: string, lang: 'hi' | 'en') => {
  const p = pageBySlug.get(slug)
  return p ? shortTitle(localize(p, lang).title) : slug.replace(/^\d+-/, '').replace(/-/g, ' ')
}

/* ------------------------------ list ------------------------------ */

export function PracticeList() {
  const { lang } = useLang()
  const tr = useTr()
  const { solved, points } = usePractice()
  const [topic, setTopic] = useState<string>(() => readLocal('hld.dsa.topic', ''))
  const [diff, setDiff] = useState<string>('')
  const [status, setStatus] = useState<'all' | 'todo' | 'done'>('all')
  const [q, setQ] = useState('')

  const topics = useMemo(() => [...new Set(PROBLEMS.map((p) => p.topic))].sort(), [])
  const total = PROBLEMS.reduce((n, p) => n + p.points, 0)
  const shown = PROBLEMS.filter(
    (p) =>
      (!topic || p.topic === topic) &&
      (!diff || p.difficulty === diff) &&
      (status === 'all' || (status === 'done') === !!solved[p.id]) &&
      (!q.trim() || p.title.toLowerCase().includes(q.trim().toLowerCase()) || String(p.lc ?? '') === q.trim()),
  )
  const byDiff = (d: ProblemMeta['difficulty']) => {
    const all = PROBLEMS.filter((p) => p.difficulty === d)
    return [all.filter((p) => solved[p.id]).length, all.length] as const
  }
  const chooseTopic = (t: string) => {
    setTopic(t)
    writeLocal('hld.dsa.topic', t)
  }

  return (
    <div className="practice">
      <header className="practice-head">
        <div>
          <span className="eyebrow">DSA · C++</span>
          <h1>Practice</h1>
          <p className="muted">{tr('Code likho, Run se examples check karo, Submit pe 30+ hidden tests. Pass = points.', 'Write code, Run checks the examples, Submit runs 30+ hidden tests. Pass = points.')}</p>
        </div>
        <div className="practice-score">
          <span className="big-num mono">{points}</span>
          <span className="muted small">
            / {total} {tr('points', 'points')}
          </span>
        </div>
      </header>

      <div className="practice-stats">
        {(['easy', 'medium', 'hard'] as const).map((d) => {
          const [done, all] = byDiff(d)
          return (
            <div key={d} className={`diff-stat d-${d}`}>
              <span>{DIFF[d][lang]}</span>
              <b className="mono">
                {done}
                <small>/{all}</small>
              </b>
              <i style={{ width: `${all ? (done / all) * 100 : 0}%` }} />
            </div>
          )
        })}
        <div className="diff-stat">
          <span>{tr('Solved', 'Solved')}</span>
          <b className="mono">
            {Object.keys(solved).filter((id) => PROBLEMS.some((p) => p.id === id)).length}
            <small>/{PROBLEMS.length}</small>
          </b>
        </div>
      </div>

      <div className="practice-filters">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={tr('Problem dhoondho ya LeetCode #', 'Search a problem or LeetCode #')} aria-label={tr('Problem dhoondho', 'Search problems')} />
        <div className="seg small" role="radiogroup" aria-label={tr('Difficulty', 'Difficulty')}>
          {['', 'easy', 'medium', 'hard'].map((d) => (
            <button key={d || 'all'} role="radio" aria-checked={diff === d} className={diff === d ? 'on' : ''} onClick={() => setDiff(d)}>
              {d ? DIFF[d as ProblemMeta['difficulty']][lang] : tr('Sab', 'All')}
            </button>
          ))}
        </div>
        <div className="seg small" role="radiogroup" aria-label="Status">
          {(['all', 'todo', 'done'] as const).map((s) => (
            <button key={s} role="radio" aria-checked={status === s} className={status === s ? 'on' : ''} onClick={() => setStatus(s)}>
              {{ all: tr('Sab', 'All'), todo: tr('Baaki', 'To do'), done: tr('Solved', 'Solved') }[s]}
            </button>
          ))}
        </div>
      </div>

      <div className="topic-chips">
        <button className={`list-tab ${!topic ? 'on' : ''}`} onClick={() => chooseTopic('')}>
          {tr('Saare topics', 'All topics')}
        </button>
        {topics.map((t) => {
          const all = PROBLEMS.filter((p) => p.topic === t)
          return (
            <button key={t} className={`list-tab ${topic === t ? 'on' : ''}`} onClick={() => chooseTopic(t)}>
              {topicTitle(t, lang)} <span className="mono">{all.filter((p) => solved[p.id]).length}/{all.length}</span>
            </button>
          )
        })}
      </div>

      <ol className="problem-list">
        {shown.map((p) => (
          <li key={p.id}>
            <a href={href(`practice/${p.id}`)} className={`problem-row ${solved[p.id] ? 'solved' : ''}`}>
              <span className="problem-status" aria-label={solved[p.id] ? tr('Solved', 'Solved') : ''}>
                {solved[p.id] ? '✓' : ''}
              </span>
              <span className="problem-title">
                {p.title}
                {p.lc && <span className="mono muted"> #{p.lc}</span>}
              </span>
              <span className="problem-topic">{topicTitle(p.topic, lang)}</span>
              <span className={`diff d-${p.difficulty}`}>{DIFF[p.difficulty][lang]}</span>
              <span className="mono problem-points">+{p.points}</span>
            </a>
          </li>
        ))}
        {!shown.length && <li className="muted">{tr('Is filter me koi problem nahi.', 'No problems match these filters.')}</li>}
      </ol>
    </div>
  )
}

/* ------------------------------ problem ------------------------------ */

type Verdict =
  | { kind: 'running'; what: 'run' | 'submit' }
  | { kind: 'error'; message: string }
  | { kind: 'compile'; message: string }
  | { kind: 'done'; what: 'run' | 'submit'; result: RunResult; pass: boolean[]; firstFail: number; newPoints: boolean }

const show = (v: Json | undefined) => (v === undefined ? '—' : JSON.stringify(v))

export function ProblemView({ id }: { id: string }) {
  const { lang } = useLang()
  const tr = useTr()
  const { solved, markSolved } = usePractice()
  const [problem, setProblem] = useState<Problem | null | undefined>(undefined)
  const [code, setCode] = useState('')
  const [tab, setTab] = useState<'problem' | 'hints' | 'solution'>('problem')
  const [verdict, setVerdict] = useState<Verdict | null>(null)
  const [revealed, setRevealed] = useState(false)
  const abort = useRef<AbortController | null>(null)

  useEffect(() => {
    setProblem(undefined)
    setVerdict(null)
    setTab('problem')
    setRevealed(false)
    loadProblem(id).then((p) => {
      setProblem(p)
      if (p) setCode(readLocal(draftKey(id), p.starter))
    })
    return () => abort.current?.abort()
  }, [id])

  useEffect(() => {
    if (!problem) return
    const t = window.setTimeout(() => writeLocal(draftKey(problem.id), code), 400)
    return () => window.clearTimeout(t)
  }, [code, problem])

  if (problem === undefined) return <p className="muted">{tr('Problem load ho raha hai…', 'Loading problem…')}</p>
  if (problem === null)
    return (
      <div className="empty-state">
        <h1>{tr('Problem nahi mila', 'Problem not found')}</h1>
        <a href={href('practice')}>{tr('Saare problems', 'All problems')}</a>
      </div>
    )

  const p = problem
  const isSolved = !!solved[p.id]
  const learn = pageBySlug.get(p.topic)
  const sig = p.signature
  const busy = verdict?.kind === 'running'

  async function judge(what: 'run' | 'submit') {
    if (busy) return
    const cases = what === 'run' ? p.examples : p.tests
    abort.current?.abort()
    const ctrl = new AbortController()
    abort.current = ctrl
    setVerdict({ kind: 'running', what })
    try {
      const result = await runCpp(code, sig, cases.map((c) => c.args), ctrl.signal)
      if (result.compileError) return setVerdict({ kind: 'compile', message: result.compileError })
      const pass = cases.map((c, i) => result.outputs[i] !== undefined && sameAnswer(result.outputs[i] as Json, c.expected, p.compare))
      const firstFail = pass.indexOf(false)
      const newPoints = what === 'submit' && firstFail < 0 ? markSolved(p) : false
      setVerdict({ kind: 'done', what, result, pass, firstFail, newPoints })
    } catch (e) {
      if ((e as Error).name !== 'AbortError') setVerdict({ kind: 'error', message: (e as Error).message })
    }
  }

  return (
    <div className="problem">
      <section className="problem-left">
        <a href={href('practice')} className="dash-link">
          <span style={{ transform: 'rotate(180deg)', display: 'inline-flex' }}>
            <Icon name="arrow" size={14} />
          </span>
          {tr('Saare problems', 'All problems')}
        </a>
        <h1>{p.title}</h1>
        <div className="problem-meta">
          <span className={`diff d-${p.difficulty}`}>{DIFF[p.difficulty][lang]}</span>
          <span className="mono muted">+{p.points}</span>
          {p.lc && <span className="mono muted">LeetCode #{p.lc}</span>}
          {isSolved && <span className="solved-pill">✓ {tr('Solved', 'Solved')}</span>}
        </div>

        <div className="seg-tabs problem-tabs" role="tablist">
          {(
            [
              ['problem', tr('Problem', 'Problem')],
              ['hints', tr('Hints', 'Hints')],
              ['solution', tr('Solution', 'Solution')],
            ] as const
          ).map(([t, label]) => (
            <button key={t} role="tab" aria-selected={tab === t} className={tab === t ? 'on' : ''} onClick={() => setTab(t)}>
              {label}
            </button>
          ))}
        </div>

        {tab === 'problem' && (
          <div className="problem-body">
            <Markdown text={p.statement[lang]} />
            {p.examples.map((ex, i) => (
              <div key={i} className="example">
                <b>
                  {tr('Example', 'Example')} {i + 1}
                </b>
                <pre>
                  <span className="muted">Input: </span>
                  {sig.params.map((prm, j) => `${prm.name} = ${show(ex.args[j])}`).join(', ')}
                  {'\n'}
                  <span className="muted">Output: </span>
                  {show(ex.expected)}
                </pre>
                {ex.explain && <p className="small muted">{ex.explain[lang]}</p>}
              </div>
            ))}
            {p.constraints.length > 0 && (
              <>
                <b className="small">{tr('Constraints', 'Constraints')}</b>
                <ul className="constraints">
                  {p.constraints.map((c) => (
                    <li key={c}>
                      <code>{c}</code>
                    </li>
                  ))}
                </ul>
              </>
            )}
            {learn && (
              <a className="learn-link" href={route(learn)}>
                <Icon name="book" size={15} /> {tr('Pehle padho:', 'Learn first:')} {shortTitle(localize(learn, lang).title)}
              </a>
            )}
          </div>
        )}

        {tab === 'hints' && (
          <ol className="hints">
            {p.hints[lang].map((h, i) => (
              <Hint key={i} n={i + 1} text={h} />
            ))}
            {!p.hints[lang].length && <p className="muted">{tr('Is problem ke hints nahi hain.', 'No hints for this problem.')}</p>}
          </ol>
        )}

        {tab === 'solution' &&
          (isSolved || revealed ? (
            <div className="problem-body">
              <Markdown text={p.solution.approach[lang]} />
              <Markdown text={'```cpp\n' + p.solution.cpp + '\n```'} showAllCode />
            </div>
          ) : (
            <div className="locked">
              <p>{tr('Solve karne ke baad solution khulega. Pehle hints try karo.', 'The solution unlocks after you solve it. Try the hints first.')}</p>
              <button className="btn" onClick={() => setRevealed(true)}>
                {tr('Phir bhi dekhna hai', 'Show it anyway')}
              </button>
            </div>
          ))}
      </section>

      <section className="problem-right">
        <div className="editor-bar">
          <span className="mono small muted">C++17 · g++</span>
          <button
            className="ghost-btn"
            onClick={() => {
              if (confirm(tr('Code reset karke starter code lagayein?', 'Reset to the starter code?'))) setCode(p.starter)
            }}
          >
            Reset
          </button>
        </div>
        <div className="editor-wrap">
          <Suspense fallback={<div className="code-editor muted small">{tr('Editor load ho raha hai…', 'Loading editor…')}</div>}>
            <CodeEditor value={code} onChange={setCode} onRun={() => judge('run')} />
          </Suspense>
        </div>
        <div className="run-bar">
          <span className="muted small">{tr('Ctrl/⌘ + Enter = Run', 'Ctrl/⌘ + Enter = Run')}</span>
          <button className="btn" onClick={() => judge('run')} disabled={busy}>
            {busy && verdict?.what === 'run' ? tr('Chal raha hai…', 'Running…') : 'Run'}
          </button>
          <button className="btn primary" onClick={() => judge('submit')} disabled={busy}>
            {busy && verdict?.what === 'submit' ? tr('Judge ho raha hai…', 'Judging…') : 'Submit'}
          </button>
        </div>
        {verdict && <VerdictPanel verdict={verdict} problem={p} />}
      </section>
    </div>
  )
}

function Hint({ n, text }: { n: number; text: string }) {
  const tr = useTr()
  const [open, setOpen] = useState(false)
  return (
    <li className="hint">
      {open ? (
        <Markdown text={text} />
      ) : (
        <button className="ghost-btn" onClick={() => setOpen(true)}>
          {tr(`Hint ${n} dikhao`, `Show hint ${n}`)}
        </button>
      )}
    </li>
  )
}

function VerdictPanel({ verdict, problem }: { verdict: Verdict; problem: Problem }) {
  const tr = useTr()
  if (verdict.kind === 'running')
    return <div className="verdict muted">{verdict.what === 'run' ? tr('Examples pe chala rahe hain…', 'Running the examples…') : tr(`${problem.tests.length} tests pe judge kar rahe hain…`, `Judging on ${problem.tests.length} tests…`)}</div>
  if (verdict.kind === 'error') return <div className="verdict bad">{verdict.message}</div>
  if (verdict.kind === 'compile')
    return (
      <div className="verdict bad">
        <b>Compile error</b>
        <pre>{verdict.message}</pre>
      </div>
    )
  const { result, pass, firstFail, what, newPoints } = verdict
  const cases = what === 'run' ? problem.examples : problem.tests
  const passed = pass.filter(Boolean).length
  const failCase = firstFail >= 0 ? cases[firstFail] : null
  const crashed = failCase && result.outputs[firstFail] === undefined
  const title =
    firstFail < 0
      ? what === 'submit'
        ? 'Accepted'
        : tr('Saare examples pass', 'All examples passed')
      : result.timedOut
        ? 'Time Limit Exceeded'
        : crashed
          ? 'Runtime Error'
          : 'Wrong Answer'
  return (
    <div className={`verdict ${firstFail < 0 ? 'good' : 'bad'}`}>
      <div className="verdict-head">
        <b>{title}</b>
        <span className="mono small">
          {passed}/{cases.length} {tr('tests', 'tests')}
          {result.ms ? ` · ${result.ms} ms` : ''}
        </span>
      </div>
      {firstFail < 0 && what === 'submit' && (
        <p className="small">{newPoints ? tr(`+${problem.points} points mil gaye!`, `+${problem.points} points earned!`) : tr('Ye pehle hi solved hai.', 'Already solved before.')}</p>
      )}
      {firstFail < 0 && what === 'run' && <p className="small muted">{tr('Ab Submit karo: hidden tests pe judge hoga.', 'Now Submit to be judged on the hidden tests.')}</p>}
      <div className="test-dots" aria-label={tr('Har test ka result', 'Result per test')}>
        {pass.map((ok, i) => (
          <span key={i} className={`dot ${ok ? 'ok' : 'fail'}`} title={`#${i + 1}`} />
        ))}
      </div>
      {failCase && (
        <div className="fail-case">
          <span className="muted small">
            {tr('Test', 'Test')} #{firstFail + 1}
          </span>
          <pre>
            <span className="muted">Input: </span>
            {problem.signature.params.map((prm, j) => `${prm.name} = ${show(failCase.args[j])}`).join(', ').slice(0, 1500)}
            {'\n'}
            <span className="muted">{tr('Expected', 'Expected')}: </span>
            {show(failCase.expected).slice(0, 800)}
            {'\n'}
            <span className="muted">{tr('Tumhara output', 'Your output')}: </span>
            {crashed ? (result.timedOut ? 'time limit' : `crashed (exit ${result.exitCode})`) : show(result.outputs[firstFail]).slice(0, 800)}
          </pre>
          {result.stderr && <pre className="stderr">{result.stderr.slice(0, 1500)}</pre>}
        </div>
      )}
    </div>
  )
}

/** Small "Practice" entry for DSA learn pages: problems of this topic */
export function TopicProblems({ topic }: { topic: string }) {
  const tr = useTr()
  const { solved } = usePractice()
  const list = PROBLEMS.filter((p) => p.topic === topic)
  if (!list.length) return null
  return (
    <section className="topic-problems">
      <span className="eyebrow">{tr('Practice karo', 'Practice')}</span>
      <div className="topic-problem-grid">
        {list.map((p) => (
          <a key={p.id} className="topic-problem" href={href(`practice/${p.id}`)}>
            <span className="problem-status">{solved[p.id] ? '✓' : ''}</span>
            <span>{p.title}</span>
            <span className={`diff d-${p.difficulty}`}>{p.difficulty}</span>
          </a>
        ))}
      </div>
    </section>
  )
}

export const DSA_TOPICS = dsa
