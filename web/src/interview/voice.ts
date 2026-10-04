// Voice for the interview room, fully free and in the browser:
// listening = speech recognition (Chrome / Edge), speaking = speech synthesis (every modern browser).
import { useCallback, useEffect, useRef, useState } from 'react'

/** Markdown → plain sentences worth reading aloud (code blocks, tables and symbols skipped) */
export function speakable(md: string): string {
  return md
    .replace(/```[\s\S]*?```/g, ' (see the code in the chat) ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/^\|.*\|$/gm, '')
    .replace(/[#*_>~]/g, '')
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    .replace(/\s+/g, ' ')
    .trim()
}

// ---- speaking ----

let generation = 0
export const canSpeak = () => typeof window !== 'undefined' && 'speechSynthesis' in window

export function stopSpeaking() {
  generation++
  if (canSpeak()) window.speechSynthesis.cancel()
}

/** Voices load asynchronously in Chrome; wait (briefly) for the list */
function voicesReady(): Promise<SpeechSynthesisVoice[]> {
  const now = window.speechSynthesis.getVoices()
  if (now.length) return Promise.resolve(now)
  return new Promise((resolve) => {
    const done = () => resolve(window.speechSynthesis.getVoices())
    window.speechSynthesis.addEventListener('voiceschanged', done, { once: true })
    window.setTimeout(done, 1500)
  })
}

function pickVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | undefined {
  const en = voices.filter((v) => v.lang.toLowerCase().startsWith('en'))
  return (
    en.find((v) => /Google UK English Female|Google US English|Samantha|Microsoft (Aria|Jenny|Neerja|Ava)/i.test(v.name)) ??
    en.find((v) => v.lang === 'en-IN') ??
    en.find((v) => v.localService) ??
    en[0] ??
    voices[0]
  )
}

/** Chrome cuts off long utterances, so speak sentence-sized chunks one after another */
function chunks(text: string): string[] {
  const parts = text.match(/[^.!?]+[.!?]*\s*/g) ?? [text]
  const out: string[] = []
  let cur = ''
  for (const p of parts) {
    if ((cur + p).length > 200 && cur) {
      out.push(cur.trim())
      cur = ''
    }
    cur += p
  }
  if (cur.trim()) out.push(cur.trim())
  return out
}

let lastError = ''
export const speechError = () => lastError

function sayOne(text: string, voice: SpeechSynthesisVoice | undefined, gen: number): Promise<void> {
  return new Promise((resolve) => {
    if (gen !== generation) return resolve()
    const u = new SpeechSynthesisUtterance(text)
    if (voice) u.voice = voice
    u.lang = voice?.lang ?? 'en-US'
    u.rate = 1.02
    u.volume = 1
    // Some engines never fire onend; never wait longer than the text could take to read
    const guard = window.setTimeout(resolve, 2500 + text.length * 95)
    const done = () => {
      window.clearTimeout(guard)
      resolve()
    }
    u.onend = done
    u.onerror = (e) => {
      if ((e as SpeechSynthesisErrorEvent).error === 'not-allowed') lastError = 'blocked'
      done()
    }
    window.speechSynthesis.resume() // Chrome can be stuck in "paused"
    window.speechSynthesis.speak(u)
  })
}

/** Reads the text aloud; resolves when done (or when stopped) */
export async function speak(md: string): Promise<void> {
  if (!canSpeak()) return
  stopSpeaking()
  const gen = generation
  const text = speakable(md).slice(0, 3000)
  if (!text) return
  lastError = ''
  const voice = pickVoice(await voicesReady())
  await new Promise((r) => window.setTimeout(r, 60)) // cancel() followed at once by speak() can drop audio
  for (const c of chunks(text)) {
    if (gen !== generation) return
    await sayOne(c, voice, gen)
  }
}

/** Call from a click: browsers only allow speech after a user gesture */
export function unlockAudio() {
  if (!canSpeak()) return
  const u = new SpeechSynthesisUtterance(' ')
  u.volume = 0
  window.speechSynthesis.speak(u)
  window.speechSynthesis.resume()
}

// ---- listening ----

type Recognition = {
  continuous: boolean
  interimResults: boolean
  lang: string
  start: () => void
  stop: () => void
  abort: () => void
  onresult: ((e: { resultIndex: number; results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }> }) => void) | null
  onend: (() => void) | null
  onerror: ((e: { error: string }) => void) | null
}

const RecognitionCtor = (): (new () => Recognition) | undefined => {
  const w = window as unknown as { SpeechRecognition?: new () => Recognition; webkitSpeechRecognition?: new () => Recognition }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition
}
export const canListen = () => !!RecognitionCtor()

/**
 * Speech → text. `onFinal` gets the full utterance after ~1.6 s of silence (auto-send),
 * `interim` is what is being heard right now.
 */
export function useListener(onFinal: (text: string) => void, lang: string) {
  const [listening, setListening] = useState(false)
  const [interim, setInterim] = useState('')
  const [error, setError] = useState('')
  const rec = useRef<Recognition | null>(null)
  const want = useRef(false)
  const paused = useRef(false)
  const buffer = useRef('')
  const timer = useRef<number | undefined>(undefined)
  const finalCb = useRef(onFinal)
  finalCb.current = onFinal

  const flush = useCallback(() => {
    const text = buffer.current.trim()
    buffer.current = ''
    setInterim('')
    if (text) finalCb.current(text)
  }, [])

  const start = useCallback(() => {
    const Ctor = RecognitionCtor()
    if (!Ctor) return setError('Voice input needs Chrome or Edge. You can type instead.')
    setError('')
    want.current = true
    if (rec.current || paused.current) return setListening(true)
    const r = new Ctor()
    r.continuous = true
    r.interimResults = true
    r.lang = lang
    r.onresult = (e) => {
      let live = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const res = e.results[i]
        if (res.isFinal) buffer.current += ` ${res[0].transcript}`
        else live += res[0].transcript
      }
      setInterim(`${buffer.current} ${live}`.trim())
      window.clearTimeout(timer.current)
      timer.current = window.setTimeout(flush, 1600)
    }
    r.onerror = (e) => {
      if (e.error === 'not-allowed') {
        want.current = false
        setError('Microphone permission was blocked. Allow it in the address bar, or type instead.')
      }
    }
    // Chrome stops after a while; restart while the mic should stay on
    r.onend = () => {
      rec.current = null
      if (want.current && !paused.current) window.setTimeout(() => want.current && !paused.current && start(), 250)
      else if (!want.current) setListening(false)
    }
    rec.current = r
    try {
      r.start()
      setListening(true)
    } catch {
      /* already started */
    }
  }, [lang, flush])

  const stop = useCallback(() => {
    want.current = false
    window.clearTimeout(timer.current)
    rec.current?.stop()
    rec.current = null
    setListening(false)
    flush()
  }, [flush])

  /** Pause while the interviewer speaks so the mic does not pick up the speaker */
  const pause = useCallback(() => {
    paused.current = true
    rec.current?.abort()
    rec.current = null
  }, [])
  const resume = useCallback(() => {
    paused.current = false
    if (want.current) start()
  }, [start])

  useEffect(
    () => () => {
      want.current = false
      rec.current?.abort()
    },
    [],
  )
  return { listening, interim, error, start, stop, pause, resume }
}
