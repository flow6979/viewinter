import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { behavioral, localize, lldProblems, pageBySlug } from '../content'
import { AiReplyError, longJson, openSettings, streamGemini, useGemini, type ChatMessage } from '../gemini'
import { useLang, useTr } from '../i18n'
import { navigate } from '../router'
import { useStore } from '../store'
import { Icon } from '../components/Icon'
import { Markdown } from '../components/Markdown'
import { loadProblem, type Problem } from '../dsa/practice'
import { runCpp } from '../dsa/runner'
import { sameAnswer, type Json } from '../dsa/harness'
import { interviewerSystem, scoringPrompt, type Brief, type Report, type RoundType } from './prompts'
import { saveReport } from './reports'
import { canListen, speak, stopSpeaking, useListener } from './voice'

const Board = lazy(() => import('./Board').then((m) => ({ default: m.Board })))
const CodeEditor = lazy(() => import('../dsa/CodeEditor').then((m) => ({ default: m.CodeEditor })))

interface Msg extends ChatMessage {
  hidden?: boolean
}

const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
const isDarkTheme = () => document.documentElement.dataset.theme !== 'light'

async function buildBrief(type: RoundType, slug: string, minutes: number): Promise<{ brief: Brief; problem?: Problem } | null> {
  if (type === 'hld' || type === 'lld') {
    const page = pageBySlug.get(slug) ?? (type === 'lld' ? lldProblems[0] : undefined)
    if (!page) return null
    const en = localize(page, 'en')
    return { brief: { type, title: en.title, reference: en.body, minutes } }
  }
  if (type === 'dsa') {
    const p = await loadProblem(slug)
    if (!p) return null
    const statement = `${p.statement.en}\n\nExamples:\n${p.examples.map((e) => `${p.signature.params.map((x, j) => `${x.name} = ${JSON.stringify(e.args[j])}`).join(', ')} -> ${JSON.stringify(e.expected)}`).join('\n')}\nConstraints: ${p.constraints.join('; ')}`
    return { brief: { type, title: p.title, statement, reference: `${p.solution.approach.en}\n\n${p.solution.cpp}`, minutes }, problem: p }
  }
  const ref = behavioral.map((b) => localize(b, 'en').body).join('\n\n')
  return { brief: { type, title: 'Behavioral / hiring-manager round', reference: ref, minutes } }
}

export function InterviewRoom({ type, slug, minutes, voiceOn: voiceStart, camOn: camStart }: { type: RoundType; slug: string; minutes: number; voiceOn: boolean; camOn: boolean }) {
  const { lang } = useLang()
  const tr = useTr()
  const { user } = useStore()
  const { settings } = useGemini()
  const [brief, setBrief] = useState<Brief | null>(null)
  const [problem, setProblem] = useState<Problem | undefined>(undefined)
  const [loadError, setLoadError] = useState('')
  const [messages, setMessages] = useState<Msg[]>([])
  const [streaming, setStreaming] = useState('')
  const [busy, setBusy] = useState(false)
  const [speaking, setSpeaking] = useState(false)
  const [error, setError] = useState('')
  const [input, setInput] = useState('')
  const [voiceOn, setVoiceOn] = useState(voiceStart)
  const [camOn, setCamOn] = useState(camStart)
  const [startedAt] = useState(() => Date.now())
  const [now, setNow] = useState(Date.now())
  const [ending, setEnding] = useState(false)
  const [board, setBoard] = useState('')
  const [code, setCode] = useState('')
  const [runNote, setRunNote] = useState('')
  const [lldTab, setLldTab] = useState<'board' | 'code'>('board')
  const video = useRef<HTMLVideoElement>(null)
  const stream = useRef<MediaStream | null>(null)
  const log = useRef<HTMLDivElement>(null)
  const abort = useRef<AbortController | null>(null)
  const msgsRef = useRef<Msg[]>([])
  msgsRef.current = messages
  const workspaceRef = useRef('')

  const workspace = useMemo(() => {
    const parts: string[] = []
    if (type === 'hld' || type === 'lld') parts.push(`Whiteboard:\n${board || '(empty)'}`)
    if (type === 'dsa' || type === 'lld') parts.push(`Code editor:\n\`\`\`cpp\n${code.slice(0, 6000)}\n\`\`\``)
    if (runNote) parts.push(`Last run: ${runNote}`)
    return parts.join('\n\n')
  }, [type, board, code, runNote])
  workspaceRef.current = workspace

  // Problem + reference
  useEffect(() => {
    buildBrief(type, slug, minutes).then((r) => {
      if (!r) return setLoadError(tr('Ye problem nahi mila.', 'Problem not found.'))
      setBrief(r.brief)
      setProblem(r.problem)
      if (r.problem) setCode(r.problem.starter)
      else if (type === 'lld') setCode('// Sketch your classes here (C++ or Java)\n')
    })
  }, [type, slug, minutes, tr])

  // Timer
  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(t)
  }, [])
  const left = Math.max(0, minutes * 60 - Math.floor((now - startedAt) / 1000))

  // Camera stays in the browser: never recorded or uploaded
  useEffect(() => {
    if (!camOn) {
      stream.current?.getTracks().forEach((t) => t.stop())
      stream.current = null
      return
    }
    let cancelled = false
    navigator.mediaDevices
      ?.getUserMedia({ video: { width: 640, height: 360 }, audio: false })
      .then((s) => {
        if (cancelled) return s.getTracks().forEach((t) => t.stop())
        stream.current = s
        if (video.current) video.current.srcObject = s
      })
      .catch(() => {
        setCamOn(false)
        setError(tr('Camera nahi khul paya (permission?). Bina camera ke bhi interview chalega.', 'Could not open the camera (permission?). The interview works without it.'))
      })
    return () => {
      cancelled = true
    }
  }, [camOn, tr])
  useEffect(
    () => () => {
      stream.current?.getTracks().forEach((t) => t.stop())
      stopSpeaking()
      abort.current?.abort()
    },
    [],
  )

  useEffect(() => {
    const el = log.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, streaming])

  const listener = useListener((text) => send(text), lang === 'en' ? 'en-IN' : 'en-IN')

  const ask = useCallback(
    async (history: Msg[]) => {
      if (!brief) return
      setBusy(true)
      setError('')
      const ctrl = new AbortController()
      abort.current = ctrl
      try {
        const reply = await streamGemini(
          interviewerSystem(brief, lang, workspaceRef.current),
          history.map(({ role, text }) => ({ role, text })),
          setStreaming,
          ctrl.signal,
        )
        setMessages([...history, { role: 'model', text: reply }])
        setStreaming('')
        if (voiceOn) {
          listener.pause()
          setSpeaking(true)
          await speak(reply)
          setSpeaking(false)
          listener.resume()
        }
      } catch (e) {
        if (!ctrl.signal.aborted) setError((e as Error).message)
      } finally {
        setStreaming('')
        setBusy(false)
      }
    },
    // listener functions are stable
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [brief, lang, voiceOn],
  )

  // The interviewer opens the round
  const opened = useRef(false)
  useEffect(() => {
    if (!brief || opened.current || !settings.apiKey) return
    opened.current = true
    ask([{ role: 'user', text: '(The candidate has joined the call. Greet them in one line and start the interview.)', hidden: true }])
  }, [brief, ask, settings.apiKey])

  function send(text: string) {
    const t = text.trim()
    if (!t || busy || ending) return
    stopSpeaking()
    setSpeaking(false)
    const history = [...msgsRef.current, { role: 'user' as const, text: t }]
    setMessages(history)
    setInput('')
    ask(history)
  }

  async function runExamples() {
    if (!problem) return
    setRunNote(tr('Chal raha hai…', 'Running…'))
    try {
      const res = await runCpp(code, problem.signature, problem.examples.map((e) => e.args), problem.compare)
      if (res.compileError) return setRunNote(`Compile error: ${res.compileError.split('\n').slice(0, 4).join(' ')}`)
      const pass = problem.examples.map((e, i) => res.outputs[i] !== undefined && sameAnswer(res.outputs[i] as Json, e.expected, problem.compare))
      setRunNote(`${pass.filter(Boolean).length}/${pass.length} examples passed${pass.includes(false) ? ` (first failing: example ${pass.indexOf(false) + 1})` : ''}`)
    } catch (e) {
      setRunNote((e as Error).message)
    }
  }

  async function end() {
    if (!brief || ending) return
    if (!confirm(tr('Interview khatam karke scorecard banayein?', 'End the interview and get your scorecard?'))) return
    setEnding(true)
    listener.stop()
    stopSpeaking()
    abort.current?.abort()
    stream.current?.getTracks().forEach((t) => t.stop())
    const transcript = msgsRef.current
      .filter((m) => !m.hidden)
      .map((m) => `${m.role === 'user' ? 'Candidate' : 'Interviewer'}: ${m.text}`)
      .join('\n')
    try {
      const prompt = scoringPrompt(brief, transcript, workspaceRef.current, lang)
      // Strict JSON mode; one retry if the reply was empty or cut off
      const raw = await longJson<Partial<Report>>(prompt).catch((e) => {
        if (e instanceof AiReplyError) return longJson<Partial<Report>>(`${prompt}\n\nIMPORTANT: reply with one compact valid JSON object only.`)
        throw e
      })
      const clamp = (n: unknown) => Math.max(0, Math.min(10, Math.round(Number(n) * 10) / 10 || 0))
      const report: Report = {
        id: Date.now().toString(36),
        type,
        title: brief.title,
        slug,
        at: Date.now(),
        minutes: Math.max(1, Math.round((Date.now() - startedAt) / 60000)),
        score: clamp(raw.score),
        verdict: String(raw.verdict ?? 'No hire'),
        dimensions: (raw.dimensions ?? []).slice(0, 6).map((d) => ({ name: String(d.name), score: clamp(d.score) })),
        strengths: (raw.strengths ?? []).slice(0, 4).map(String),
        improvements: (raw.improvements ?? []).slice(0, 4).map(String),
        summary: String(raw.summary ?? '').slice(0, 800),
      }
      await saveReport(report, user?.uid ?? null)
      navigate(`interview/report/${report.id}`)
    } catch (e) {
      setError((e as Error).message)
      setEnding(false)
    }
  }

  const visible = messages.filter((m) => !m.hidden)
  const workspaceKind = type === 'hld' ? 'board' : type === 'dsa' ? 'code' : type === 'lld' ? lldTab : 'none'

  if (loadError)
    return (
      <div className="room room-center">
        <p>{loadError}</p>
        <button className="btn" onClick={() => navigate('interview')}>
          {tr('Wapas', 'Back')}
        </button>
      </div>
    )

  return (
    <div className={`room ${workspaceKind === 'none' ? 'no-workspace' : ''}`}>
      <header className="room-bar">
        <button className="ghost-btn" onClick={() => (confirm(tr('Interview chhod dein? Score save nahi hoga.', 'Leave the interview? No score will be saved.')) ? navigate('interview') : null)}>
          <Icon name="close" size={15} /> {tr('Chhodo', 'Leave')}
        </button>
        <div className="room-title">
          <span className="eyebrow">{type.toUpperCase()} · {tr('Mock interview', 'Mock interview')}</span>
          <b>{brief?.title ?? '…'}</b>
        </div>
        <span className={`room-timer mono ${left < 300 ? 'low' : ''}`}>{fmt(left)}</span>
        <button className="btn primary" onClick={end} disabled={ending || !brief}>
          {tr('Interview khatam karo', 'End interview')}
        </button>
      </header>

      <section className="room-side">
        <div className="room-tiles">
          <div className={`tile-ai ${speaking || streaming ? 'talking' : ''}`}>
            <span className="ai-orb">
              <Icon name="sparkle" size={22} />
            </span>
            <span className="tile-name">{tr('AI interviewer', 'AI interviewer')}</span>
            <span className="tile-state">{speaking ? tr('bol raha hai…', 'speaking…') : busy ? tr('soch raha hai…', 'thinking…') : listener.listening ? tr('sun raha hai', 'listening') : ''}</span>
          </div>
          <div className="tile-me">
            {camOn ? <video ref={video} autoPlay playsInline muted /> : <span className="tile-off">{tr('Camera band', 'Camera off')}</span>}
            <span className="tile-name">{tr('Aap', 'You')}</span>
            {listener.listening && <span className="mic-live" aria-label="mic on" />}
          </div>
        </div>

        {!settings.apiKey && (
          <p className="plan-warn small">
            {tr('Interview ke liye AI set up karo.', 'Set up AI to start the interview.')}{' '}
            <button className="link-btn" onClick={openSettings}>
              {tr('Set up karo', 'Set up')}
            </button>
          </p>
        )}

        <div className="room-log" ref={log}>
          {visible.map((m, i) => (
            <div key={i} className={`room-msg ${m.role}`}>
              <span className="room-who">{m.role === 'user' ? tr('Aap', 'You') : tr('Interviewer', 'Interviewer')}</span>
              {m.role === 'user' ? <p>{m.text}</p> : <Markdown text={m.text} showAllCode />}
            </div>
          ))}
          {streaming && (
            <div className="room-msg model">
              <span className="room-who">{tr('Interviewer', 'Interviewer')}</span>
              <Markdown text={streaming} showAllCode />
            </div>
          )}
          {listener.interim && (
            <div className="room-msg user interim">
              <span className="room-who">{tr('Aap (bol rahe hain)', 'You (speaking)')}</span>
              <p>{listener.interim}</p>
            </div>
          )}
          {error && <p className="error small">{error}</p>}
          {listener.error && <p className="error small">{listener.error}</p>}
        </div>

        <div className="room-controls">
          <button
            type="button"
            className={`mic-btn ${listener.listening ? 'on' : ''}`}
            onClick={() => (listener.listening ? listener.stop() : listener.start())}
            disabled={!canListen()}
            title={canListen() ? '' : tr('Voice ke liye Chrome ya Edge chahiye', 'Voice needs Chrome or Edge')}
          >
            <span className="mic-dot" /> {listener.listening ? tr('Mic on: bolo, ruko to bhej dega', 'Mic on: speak, a pause sends it') : tr('Mic on karo', 'Turn mic on')}
          </button>
          <div className="row">
            <button type="button" className={`room-toggle ${voiceOn ? 'on' : ''}`} onClick={() => (voiceOn ? (stopSpeaking(), setSpeaking(false), setVoiceOn(false)) : setVoiceOn(true))}>
              {voiceOn ? tr('Awaaz on', 'Voice on') : tr('Awaaz off', 'Voice off')}
            </button>
            <button type="button" className={`room-toggle ${camOn ? 'on' : ''}`} onClick={() => setCamOn((c) => !c)}>
              {camOn ? tr('Camera on', 'Camera on') : tr('Camera off', 'Camera off')}
            </button>
          </div>
          <form
            className="room-input"
            onSubmit={(e: FormEvent) => {
              e.preventDefault()
              send(input)
            }}
          >
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder={tr('Ya yahan likho…', 'Or type here…')} aria-label={tr('Jawab', 'Answer')} />
            <button className="btn" disabled={busy || !input.trim()}>
              {tr('Bhejo', 'Send')}
            </button>
          </form>
        </div>
      </section>

      {workspaceKind !== 'none' && (
        <section className="room-work">
          {type === 'lld' && (
            <div className="seg small room-ws-tabs">
              <button className={lldTab === 'board' ? 'on' : ''} onClick={() => setLldTab('board')}>
                {tr('Whiteboard', 'Whiteboard')}
              </button>
              <button className={lldTab === 'code' ? 'on' : ''} onClick={() => setLldTab('code')}>
                {tr('Code', 'Code')}
              </button>
            </div>
          )}
          <Suspense fallback={<p className="muted small">{tr('Workspace load ho raha hai…', 'Loading the workspace…')}</p>}>
            {(type === 'hld' || type === 'lld') && (
              <div className="ws-pane" hidden={workspaceKind !== 'board'}>
                <Board kind={type === 'hld' ? 'hld' : 'lld'} dark={isDarkTheme()} onSummary={setBoard} />
              </div>
            )}
            {(type === 'dsa' || type === 'lld') && (
              <div className="ws-pane ws-code" hidden={workspaceKind !== 'code'}>
                {problem && (
                  <details className="ws-statement" open>
                    <summary>{tr('Problem', 'Problem')}</summary>
                    <Markdown text={problem.statement[lang]} />
                  </details>
                )}
                <div className="ws-editor">
                  <CodeEditor value={code} onChange={setCode} onRun={type === 'dsa' ? runExamples : undefined} />
                </div>
                {type === 'dsa' && (
                  <div className="ws-run">
                    <span className="muted small">{runNote}</span>
                    <button className="btn" onClick={runExamples}>
                      {tr('Examples chalao', 'Run examples')}
                    </button>
                  </div>
                )}
              </div>
            )}
          </Suspense>
        </section>
      )}

      {ending && (
        <div className="room-scoring">
          <span className="gen-dot spin" />
          <p>{tr('Interviewer scorecard likh raha hai…', 'The interviewer is writing your scorecard…')}</p>
        </div>
      )}
    </div>
  )
}
