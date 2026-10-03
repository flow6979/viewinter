import { useEffect, useRef, useState, type FormEvent } from 'react'
import { NO_TEX, openSettings, streamGemini, useGemini, type ChatMessage } from '../gemini'
import { useLang, useTr, type Lang } from '../i18n'
import { readLocal, writeLocal } from '../store'
import { Icon } from '../components/Icon'
import { Markdown } from '../components/Markdown'
import type { Problem } from './practice'

/** What the judge said last, in plain text for the AI */
export type JudgeSummary = string

function systemPrompt(p: Problem, code: string, judge: JudgeSummary, lang: Lang): string {
  const sig = p.signature
  return `You are a patient DSA coach helping a candidate solve a LeetCode-style problem in C++17 on an Indian interview-prep site.
Reply in ${lang === 'en' ? 'simple, clear English' : 'simple Hinglish (Roman script Hindi mixed with English tech terms)'}; short, structured, with small C++ snippets only when they help.

Coaching rules:
- ${NO_TEX}
- Default mode is guidance, not answers: work from THEIR current code. Point to the exact line/idea that is wrong or missing, explain why with a tiny example input, and suggest the next step. Do not write the full solution unless they explicitly ask for it (e.g. "full solution", "pura solution", "complete code").
- If they ask for the full solution: give the complete \`class Solution\` matching the signature exactly, then the idea, a dry run on example 1, and time/space complexity.
- If the judge reported a failure, start from it: reproduce what their code does on that input.
- Mention the pattern (e.g. sliding window, BFS, DP) and how to recognise it.
- Never invent judge results.

=== Problem: ${p.title} (${p.difficulty}) ===
${p.statement.en}

Signature: ${sig.ret} ${sig.fn}(${sig.params.map((x) => `${x.type} ${x.name}`).join(', ')})
Examples:
${p.examples.map((e, i) => `${i + 1}. ${sig.params.map((x, j) => `${x.name} = ${JSON.stringify(e.args[j])}`).join(', ')} -> ${JSON.stringify(e.expected)}`).join('\n')}
Constraints: ${p.constraints.join('; ')}

Reference approach (for you; reveal only when asked for the solution or the approach): ${p.solution.approach.en}
Reference C++ (never paste unless they ask for the full solution):
${p.solution.cpp}

=== Their current code ===
${code}

=== Last judge result ===
${judge || 'They have not run the code yet.'}`
}

export function DsaAssistant({ problem, code, judge, ask }: { problem: Problem; code: string; judge: JudgeSummary; ask?: { id: number; text: string } | null }) {
  const { lang } = useLang()
  const tr = useTr()
  const { settings } = useGemini()
  const hasKey = !!settings.apiKey
  const storeKey = `hld.dsa.chat.${problem.id}`
  const [messages, setMessages] = useState<ChatMessage[]>(() => readLocal(storeKey, []))
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const abort = useRef<AbortController | null>(null)
  const log = useRef<HTMLDivElement>(null)

  useEffect(() => () => abort.current?.abort(), [])
  // "Explain with AI" from the result panel sends its question straight away
  const lastAsk = useRef(0)
  useEffect(() => {
    if (ask && ask.id !== lastAsk.current && hasKey) {
      lastAsk.current = ask.id
      send(ask.text)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ask?.id, hasKey])
  // Keep the newest reply in view inside the chat box (without moving the page)
  useEffect(() => {
    const el = log.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, streaming])

  const quick: [string, string][] = [
    [tr('Agla step batao', 'Next step'), tr('Mere current code ko dekh ke batao agla step kya hona chahiye. Pura solution mat do.', 'Look at my current code and tell me the next step. Do not give the full solution.')],
    [tr('Fail kyu ho raha hai?', 'Why is it failing?'), tr('Mera code last run me kyu fail hua? Galti wali line batao aur chhote example se samjhao.', 'Why did my code fail in the last run? Point to the wrong line and explain with a small example.')],
    [tr('Approach samjhao', 'Explain the approach'), tr('Is problem ka approach aur pattern samjhao, code ke bina. Kaise pehchanoon ki ye pattern lagega?', 'Explain the approach and the pattern for this problem, without code. How do I recognise it?')],
    [tr('Pura solution dikhao', 'Show full solution'), tr('Pura solution dikhao: complete C++ code, idea, example 1 pe dry run aur complexity.', 'Show the full solution: complete C++ code, the idea, a dry run on example 1 and the complexity.')],
  ]

  async function send(text: string) {
    const t = text.trim()
    if (!t || busy) return
    const history: ChatMessage[] = [...messages, { role: 'user', text: t }]
    setMessages(history)
    setInput('')
    setBusy(true)
    setError('')
    const ctrl = new AbortController()
    abort.current = ctrl
    try {
      const reply = await streamGemini(systemPrompt(problem, code, judge, lang), history, setStreaming, ctrl.signal)
      const next = [...history, { role: 'model' as const, text: reply }]
      setMessages(next)
      writeLocal(storeKey, next.slice(-30))
    } catch (e) {
      if (!ctrl.signal.aborted) setError(e instanceof Error ? e.message : String(e))
    } finally {
      if (!ctrl.signal.aborted) {
        setStreaming('')
        setBusy(false)
      }
    }
  }

  if (!hasKey)
    return (
      <div className="locked">
        <p>{tr('AI help ke liye AI set up karo (free key, 1 minute).', 'Set up AI to get help here (free key, 1 minute).')}</p>
        <button className="btn" onClick={openSettings}>
          {tr('AI set up karo', 'Set up AI')}
        </button>
      </div>
    )

  return (
    <div className="dsa-ai">
      <p className="muted small">{tr('AI tumhara current code aur last result dekhta hai. Pehle hint lo, solution last me.', 'The AI sees your current code and last result. Take hints first, the solution last.')}</p>
      <div className="dsa-ai-quick">
        {quick.map(([label, prompt], i) => (
          <button key={label} type="button" className={`q-btn ${i === quick.length - 1 ? 'ghost-solution' : ''}`} onClick={() => send(prompt)} disabled={busy}>
            {i === 0 && <Icon name="arrow" size={14} />}
            {i === 1 && <Icon name="target" size={14} />}
            {i === 2 && <Icon name="bulb" size={14} />}
            {i === 3 && <Icon name="code" size={14} />}
            {label}
          </button>
        ))}
      </div>
      <div className="dsa-chat">
        <div className="dsa-ai-log" ref={log} data-empty={tr('Upar ka koi button dabao ya neeche apna sawal likho.', 'Pick a button above or type your question below.')}>
          {messages.map((m, i) => (
            <div key={i} className={`quiz-ask-msg ${m.role}`}>
              {m.role === 'user' ? m.text : <Markdown text={m.text} showAllCode />}
            </div>
          ))}
          {streaming && (
            <div className="quiz-ask-msg model">
              <Markdown text={streaming} showAllCode />
            </div>
          )}
          {busy && !streaming && <p className="muted small">{tr('Soch raha hai…', 'Thinking…')}</p>}
          {error && <p className="error small">{error}</p>}
        </div>
        <div className="dsa-chat-foot">
          <form
            className="quiz-ask-form"
            onSubmit={(e: FormEvent) => {
              e.preventDefault()
              send(input)
            }}
          >
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder={tr('Kuch bhi poochho: "mera loop galat kyu hai?"', 'Ask anything: "why is my loop wrong?"')} aria-label={tr('AI se poochho', 'Ask AI')} />
            <button className="btn primary" disabled={busy || !input.trim()}>
              {tr('Poochho', 'Ask')}
            </button>
          </form>
          {messages.length > 0 && (
            <button
              type="button"
              className="ghost-btn"
              onClick={() => {
                setMessages([])
                writeLocal(storeKey, [])
              }}
            >
              {tr('Chat saaf karo', 'Clear chat')}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
