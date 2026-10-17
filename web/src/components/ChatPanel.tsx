import { useEffect, useRef, useState, type FormEvent } from 'react'
import { localize, type Page } from '../content'
import { useLang, useTr, type Lang } from '../i18n'
import { NO_TEX, interviewerPrompt, longJson, streamGemini, tutorPrompt, type ChatMessage } from '../gemini'
import { newNoteId, useAddNote } from '../notes'
import { Icon } from './Icon'
import { MicButton, useDictation } from './MicButton'
import { readLocal, writeLocal } from '../store'
import { Markdown } from './Markdown'

type Mode = 'ask' | 'mock'

const MOCK_SECONDS = 45 * 60

const QUICK: Record<Lang, Record<Page['kind'], string[]>> = {
  hi: {
    topic: ['Isko aur simple example se samjhao', 'Mujhe 3 interview sawal poochho, ek-ek karke', 'Main explain karta hoon, tum grade karna'],
    lld: ['Is pattern ka ek aur real-life example do', 'Ek chhota LLD problem do jisme ye pattern lage', 'Mera code review karo (main paste karta hoon)'],
    lldp: ['Is design me ek naya requirement add karo aur mujhse handle karwao', 'Mere class design ka review karo (main paste karta hoon)', 'Isme concurrency issues kahan aa sakte hain?'],
    cs: ['Isko simple example se samjhao', 'Is topic pe 3 interview sawal poochho, ek-ek karke', 'System design me ye kahan kaam aata hai?'],
    beh: ['Mere is story ko STAR me sudharo (main paste karta hoon)', 'Mujhse ek behavioral sawal poochho aur mera jawab grade karo', 'Is sawal pe interviewer kya check karta hai?'],
    db: ['Ye database kab use karein, ek real example do', 'Is topic pe 3 interview sawal poochho, ek-ek karke', 'Iska alternative DB kya hai aur kyun?'],
    java: ['Isko ek chhote code example se samjhao', 'Is topic pe 3 interview sawal poochho, ek-ek karke', 'Iska output kya hoga, aisa ek tricky sawal do'],
    dsa: ['Is pattern ka ek aur example problem do', 'Mera C++ code review karo (main paste karta hoon)', 'Kis type ke question me ye lagta hai, kaise pehchanoon?'],
    rag: ['Isko simple example se samjhao', 'Is topic pe 3 interview sawal poochho, ek-ek karke', 'Production RAG me ye kahan fail hota hai?'],
    agent: ['Is lab ko simple example se samjhao', 'Interview me agentic AI pe kya pooch sakte hain?', 'Production me ye agent kahan fail ho sakta hai?'],
    question: ['Is design ka sabse weak point kya hai?', 'Interviewer is design pe kaunse 5 follow-up poochega?', 'Step 10 ke decisions ka ek aur alternative batao'],
  },
  en: {
    topic: ['Explain this with a simpler example', 'Ask me 3 interview questions, one at a time', 'Let me explain it, then grade me'],
    lld: ['Give me another real-life example of this pattern', 'Give me a small LLD problem that needs this pattern', 'Review my code (I will paste it)'],
    lldp: ['Add a new requirement and make me handle it', 'Review my class design (I will paste it)', 'Where can concurrency issues show up here?'],
    cs: ['Explain this with a simple example', 'Ask me 3 interview questions on this, one at a time', 'Where does this matter in system design?'],
    beh: ['Improve my story in STAR format (I will paste it)', 'Ask me a behavioral question and grade my answer', 'What is the interviewer checking with this question?'],
    db: ['When should I use this database? Give a real example', 'Ask me 3 interview questions on this, one at a time', 'What is the alternative DB and why?'],
    java: ['Explain this with a small code example', 'Ask me 3 interview questions on this, one at a time', 'Give me a tricky output-prediction question'],
    dsa: ['Give me another example problem for this pattern', 'Review my C++ code (I will paste it)', 'Which questions need this, and how do I spot them?'],
    rag: ['Explain this with a simple example', 'Ask me 3 interview questions on this, one at a time', 'Where does this fail in production RAG?'],
    agent: ['Explain this lab with a simple example', 'What can interviewers ask about agentic AI here?', 'Where can this agent fail in production?'],
    question: ['What is the weakest point of this design?', 'Which 5 follow-ups will the interviewer ask on this design?', 'Give another alternative for the Step 10 decisions'],
  },
}

/** Diagrams in an answer, exactly as drawn (```mermaid blocks) */
const diagramsIn = (md: string) => md.match(/```mermaid\s*\n[\s\S]*?```/g) ?? []

/** Puts the diagrams right after the note's first paragraph (the gist), so the picture comes first */
function withDiagrams(body: string, diagrams: string[]) {
  const fresh = diagrams.filter((d) => !body.includes(d.trim()))
  if (!fresh.length) return body
  const cut = body.indexOf('\n\n')
  const block = fresh.join('\n\n')
  return cut < 0 ? `${body}\n\n${block}` : `${body.slice(0, cut)}\n\n${block}${body.slice(cut)}`
}

/** Turns one Ask AI exchange into a short revision note (heading + summarised body) */
function notePrompt(pageTitle: string, question: string, answer: string, lang: Lang) {
  return `A candidate studying "${pageTitle}" for interviews asked a question and got the answer below. Turn it into ONE quick-revision note.
Return only JSON: {"title": string, "body": string}
- title: 3-8 words naming the exact concept (not "Answer" or "Summary").
- body: Markdown to revise in 30 seconds and understand later:
  - first line: **Gist:** one sentence
  - 3-6 bullets with the key points (facts, numbers, trade-offs, steps)
  - when useful: **Example:** one line, and **Say it in the interview:** one sentence
  - do NOT include mermaid diagrams: the answer's diagrams are added to the note as they are
  - keep code only if it is essential, and keep it short
Write in ${lang === 'en' ? 'clear, simple English' : 'simple Hinglish (Roman Hindi + English tech terms)'}. ${NO_TEX}

Question: ${question}

Answer:
${answer}`
}

const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

export function ChatPanel({
  page: source,
  mode,
  hasKey,
  onOpenSettings,
  onOpenNotes,
}: {
  page: Page
  mode: Mode
  hasKey: boolean
  onOpenSettings: () => void
  /** switches the side panel to Notes */
  onOpenNotes?: () => void
}) {
  const { lang } = useLang()
  const tr = useTr()
  const page = localize(source, lang)
  const storeKey = `hld.chat.${mode}.${page.slug}`
  const [messages, setMessages] = useState<ChatMessage[]>(() => readLocal(storeKey, []))
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [startedAt, setStartedAt] = useState<number | null>(() => readLocal(`${storeKey}.start`, null))
  const [now, setNow] = useState(Date.now())
  const abortRef = useRef<AbortController | null>(null)
  const endRef = useRef<HTMLDivElement>(null)
  const addNote = useAddNote()
  // Voice: what is heard so far is shown in the box; a pause sends it (anything typed before goes in front)
  const inputRef = useRef(input)
  inputRef.current = input
  const voice = useDictation((spoken) => send(`${inputRef.current} ${spoken}`.trim()))
  // Message index → note being made / made / failed
  const [noted, setNoted] = useState<Record<number, 'adding' | 'added' | string>>({})

  async function toNote(i: number) {
    const answer = messages[i]?.text
    const question = [...messages.slice(0, i)].reverse().find((m) => m.role === 'user')?.text ?? ''
    if (!answer || noted[i] === 'adding') return
    setNoted((n) => ({ ...n, [i]: 'adding' }))
    try {
      const r = await longJson<{ title?: string; body?: string }>(notePrompt(page.title, question, answer, lang))
      if (!r?.body?.trim()) throw new Error(tr('AI ne khaali note diya', 'The AI returned an empty note'))
      // Diagrams are the best part for revision: carry them over verbatim instead of trusting the summary
      const body = withDiagrams(r.body.trim().replace(/```mermaid[\s\S]*?```/g, '').replace(/\n{3,}/g, '\n\n').trim(), diagramsIn(answer))
      await addNote(page.slug, { id: newNoteId(), title: (r.title ?? '').trim() || question.slice(0, 60), body, ai: true, at: Date.now() }, tr('Mere notes', 'My notes'))
      setNoted((n) => ({ ...n, [i]: 'added' }))
    } catch (e) {
      setNoted((n) => ({ ...n, [i]: (e as Error).message || 'error' }))
    }
  }

  useEffect(() => {
    setMessages(readLocal(storeKey, []))
    setNoted({})
    setStartedAt(readLocal(`${storeKey}.start`, null))
    setError('')
    setStreaming('')
    abortRef.current?.abort()
  }, [storeKey])

  useEffect(() => {
    if (mode !== 'mock' || !startedAt) return
    const t = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(t)
  }, [mode, startedAt])

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' })
  }, [messages, streaming])

  const system = mode === 'mock' ? interviewerPrompt(page.title, page.body, lang) : tutorPrompt(page.title, page.body, lang)

  async function send(text: string, base = messages) {
    const content = text.trim()
    if (!content || busy) return
    const history: ChatMessage[] = [...base, { role: 'user', text: content }]
    setMessages(history)
    setInput('')
    setError('')
    setBusy(true)
    setStreaming('')
    const ctrl = new AbortController()
    abortRef.current = ctrl
    try {
      const reply = await streamGemini(system, history, setStreaming, ctrl.signal)
      const next: ChatMessage[] = [...history, { role: 'model', text: reply || tr('(khaali jawab aaya)', '(empty reply)') }]
      setMessages(next)
      writeLocal(storeKey, next)
    } catch (e) {
      if ((e as Error).name !== 'AbortError') setError((e as Error).message)
      writeLocal(storeKey, history)
    } finally {
      setBusy(false)
      setStreaming('')
    }
  }

  function submit(e: FormEvent) {
    e.preventDefault()
    send(input)
  }

  function clear() {
    abortRef.current?.abort()
    setMessages([])
    setStartedAt(null)
    writeLocal(storeKey, [])
    writeLocal(`${storeKey}.start`, null)
  }

  function startMock() {
    const t = Date.now()
    setStartedAt(t)
    setNow(t)
    writeLocal(`${storeKey}.start`, t)
    send(tr('Namaste, main ready hoon. Interview shuru karte hain.', "Hi, I'm ready. Let's start the interview."), [])
  }

  if (!hasKey) {
    return (
      <div className="panel-body empty">
        <p>
          {mode === 'mock'
            ? tr(
                'Mock interview me AI interviewer banke 45 min ka round lega aur end me score dega.',
                'In a mock interview, AI plays the interviewer for a 45-min round and scores you at the end.',
              )
            : tr('Is page ke baare me AI se kuch bhi poochho. Jawab yahin screen pe aayega.', 'Ask AI anything about this page. The answer shows up right here.')}
        </p>
        <button className="btn primary" onClick={onOpenSettings}>
          {tr('AI set up karo', 'Set up AI')}
        </button>
      </div>
    )
  }

  const remaining = startedAt ? Math.max(0, MOCK_SECONDS - Math.floor((now - startedAt) / 1000)) : MOCK_SECONDS

  if (mode === 'mock' && !messages.length) {
    return (
      <div className="panel-body empty">
        <p>
          {lang === 'en' ? (
            <>
              A 45-min mock interview for <b>{page.title}</b>. The interviewer will not give requirements; you have to ask. Type <code>END</code>{' '}
              to finish and get a scorecard.
            </>
          ) : (
            <>
              <b>{page.title}</b> ka 45 min mock interview. Interviewer requirements khud nahi batayega, aapko poochne honge. Khatam karne ke liye{' '}
              <code>END</code> likho, scorecard milega.
            </>
          )}
        </p>
        <button className="btn primary" onClick={startMock} disabled={busy}>
          {tr('Mock interview shuru karo', 'Start mock interview')}
        </button>
      </div>
    )
  }

  return (
    <div className="panel-body chat">
      {mode === 'mock' && (
        <div className={`timer ${remaining < 300 ? 'late' : ''}`}>
          <span className="mono">{fmt(remaining)}</span>
          <span className="muted small">{remaining === 0 ? tr('Time khatam. END likho.', 'Time is up. Type END.') : tr('baaki', 'left')}</span>
          <button className="btn small" onClick={() => send(tr('END. Ab mujhe scorecard do.', 'END. Please give me my scorecard.'))} disabled={busy}>
            End &amp; score
          </button>
        </div>
      )}
      <div className="messages">
        {!messages.length && (
          <div className="chat-quick">
            {QUICK[lang][page.kind].map((q) => (
              <button key={q} className="chip" onClick={() => send(q)}>
                {q}
              </button>
            ))}
          </div>
        )}
        {messages.map((m, i) =>
          mode === 'mock' && i === 0 ? null : (
            <div key={i} className={`msg ${m.role}`}>
              {m.role === 'model' ? <Markdown text={m.text} showAllCode /> : m.text}
              {m.role === 'model' && mode === 'ask' && (
                <div className="msg-actions">
                  {noted[i] === 'added' ? (
                    <span className="note-added small">
                      ✓ {tr('Notes me add ho gaya', 'Added to notes')}
                      {onOpenNotes && (
                        <button className="link small" onClick={onOpenNotes}>
                          {tr('Dekho', 'View')}
                        </button>
                      )}
                    </span>
                  ) : (
                    <button className="ghost-btn small" onClick={() => toNote(i)} disabled={noted[i] === 'adding'}>
                      <Icon name="pen" size={13} /> {noted[i] === 'adding' ? tr('Note ban raha hai…', 'Making a note…') : tr('Notes me daalo', 'Add to notes')}
                    </button>
                  )}
                  {noted[i] && noted[i] !== 'added' && noted[i] !== 'adding' && <span className="error small">{noted[i]}</span>}
                </div>
              )}
            </div>
          ),
        )}
        {busy && <div className="msg model">{streaming ? <Markdown text={streaming} showAllCode /> : <span className="muted">{tr('soch raha hai…', 'thinking…')}</span>}</div>}
        {voice.error && <div className="error small">{voice.error}</div>}
        {error && (
          <div className="error small">
            {error}{' '}
            <button className="link small" onClick={onOpenSettings}>
              {tr('Settings kholo', 'Open settings')}
            </button>
          </div>
        )}
        <div ref={endRef} />
      </div>
      <form className="composer" onSubmit={submit}>
        <textarea
          id={`chat-${mode}-${page.slug}`}
          aria-label={mode === 'mock' ? tr('Interviewer ko jawab', 'Reply to the interviewer') : tr('AI se sawal', 'Question for AI')}
          rows={2}
          value={voice.listening ? `${input} ${voice.interim}`.trim() : input}
          readOnly={voice.listening}
          placeholder={
            voice.listening
              ? tr('Bolo… ruk jaoge to bhej dega', 'Speak… it sends when you pause')
              : mode === 'mock'
                ? tr('Interviewer ko jawab do… (ya mic dabake bolo)', 'Reply to the interviewer… (or tap the mic and speak)')
                : tr('Is page ke baare me poochho… (ya mic dabake bolo)', 'Ask about this page… (or tap the mic and speak)')
          }
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              send(input)
            }
          }}
        />
        <div className="row end">
          {messages.length > 0 && (
            <button type="button" className="link small" onClick={clear}>
              {mode === 'mock' ? tr('Naya interview', 'New interview') : tr('Chat saaf karo', 'Clear chat')}
            </button>
          )}
          {voice.supported && (
            <MicButton listening={voice.listening} disabled={busy} onStart={voice.start} onStop={() => voice.stopAndKeep((t) => setInput((v) => `${v} ${t}`.trim()))} />
          )}
          {busy ? (
            <button type="button" className="btn small" onClick={() => abortRef.current?.abort()}>
              {tr('Roko', 'Stop')}
            </button>
          ) : (
            <button type="submit" className="btn primary small" disabled={!input.trim()}>
              {tr('Bhejo', 'Send')}
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
