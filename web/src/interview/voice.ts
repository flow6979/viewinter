// Voice for the interview room.
// Listening: the browser's speech recognition (Chrome / Edge), free, no key.
// Speaking: ElevenLabs when the user added a key (natural voice), otherwise the browser's speech synthesis.
import { useCallback, useEffect, useRef, useState } from 'react'
import { readLocal, writeLocal } from '../store'

export interface VoiceSettings {
  elevenKey: string
  /** ElevenLabs voice id; default is a calm, neutral voice */
  voiceId: string
}
const KEY = 'hld.voice'
export const DEFAULT_VOICE_ID = 'JBFqnCBsd6RMkjVDRZzb'
export const getVoiceSettings = (): VoiceSettings => ({ elevenKey: '', voiceId: DEFAULT_VOICE_ID, ...readLocal<Partial<VoiceSettings>>(KEY, {}) })
export const saveVoiceSettings = (v: VoiceSettings) => writeLocal(KEY, v)

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

let audio: HTMLAudioElement | null = null

export function stopSpeaking() {
  window.speechSynthesis?.cancel()
  if (audio) {
    audio.pause()
    audio = null
  }
}

function browserVoice(): SpeechSynthesisVoice | undefined {
  const voices = window.speechSynthesis?.getVoices() ?? []
  const en = voices.filter((v) => v.lang.startsWith('en'))
  return en.find((v) => /Google UK English Female|Samantha|Microsoft (Aria|Jenny|Neerja)/.test(v.name)) ?? en.find((v) => v.lang === 'en-IN') ?? en[0]
}

function speakBrowser(text: string): Promise<void> {
  return new Promise((resolve) => {
    if (!window.speechSynthesis) return resolve()
    const u = new SpeechSynthesisUtterance(text)
    const v = browserVoice()
    if (v) u.voice = v
    u.rate = 1.03
    // Some engines never fire onend; never wait longer than the text could take to read
    const guard = window.setTimeout(resolve, 3000 + text.length * 90)
    const done = () => {
      window.clearTimeout(guard)
      resolve()
    }
    u.onend = done
    u.onerror = done
    window.speechSynthesis.speak(u)
  })
}

async function speakEleven(text: string, s: VoiceSettings): Promise<void> {
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(s.voiceId || DEFAULT_VOICE_ID)}?output_format=mp3_44100_128`, {
    method: 'POST',
    headers: { 'xi-api-key': s.elevenKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, model_id: 'eleven_flash_v2_5' }),
  })
  if (!res.ok) throw new Error(`ElevenLabs ${res.status}`)
  const url = URL.createObjectURL(await res.blob())
  await new Promise<void>((resolve) => {
    audio = new Audio(url)
    audio.onended = () => resolve()
    audio.onerror = () => resolve()
    audio.play().catch(() => resolve())
  })
  URL.revokeObjectURL(url)
}

/** Reads the text aloud; resolves when done. ElevenLabs failures fall back to the browser voice. */
export async function speak(md: string): Promise<'eleven' | 'browser'> {
  stopSpeaking()
  const text = speakable(md).slice(0, 2500)
  if (!text) return 'browser'
  const s = getVoiceSettings()
  if (s.elevenKey) {
    try {
      await speakEleven(text, s)
      return 'eleven'
    } catch {
      /* quota / key issue: use the free voice */
    }
  }
  await speakBrowser(text)
  return 'browser'
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
