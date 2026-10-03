// Company prep: interview questions for a company + role, found on the live web through Gemini + Google Search.
// Results are cached for everyone in companyQuestions/{key} (30 days); each user's answers live in
// users/{uid}/companyPrep/{key} (or this browser when logged out).
import { useCallback, useEffect, useState } from 'react'
import { doc, getDoc, onSnapshot, setDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { groundedJson, type Source } from '../gemini'
import { readLocal, useStore, writeLocal } from '../store'

export type SectionId = 'dsa' | 'system_design' | 'lld' | 'behavioral' | 'resume' | 'cs' | 'misc'
export const SECTIONS: { id: SectionId; hi: string; en: string }[] = [
  { id: 'dsa', hi: 'Coding (DSA)', en: 'Coding (DSA)' },
  { id: 'system_design', hi: 'System design', en: 'System design' },
  { id: 'lld', hi: 'LLD / OOD', en: 'LLD / OOD' },
  { id: 'behavioral', hi: 'Managerial / behavioral', en: 'Managerial / behavioral' },
  { id: 'resume', hi: 'Resume / projects', en: 'Resume / projects' },
  { id: 'cs', hi: 'CS fundamentals', en: 'CS fundamentals' },
  { id: 'misc', hi: 'Miscellaneous', en: 'Miscellaneous' },
]

export interface CompanyQuestion {
  id: string
  q: string
  section: SectionId
  level?: string
  round?: string
  frequency?: 'high' | 'medium' | 'low'
  difficulty?: string
  lc?: number | null
}

export interface CompanyReport {
  company: string
  role: string
  levels: string[]
  process: string
  rounds: string[]
  tips: string[]
  questions: CompanyQuestion[]
  sources: Source[]
  at: number
}

const CACHE_DAYS = 30
export const keyOf = (company: string, role: string) =>
  `${company}__${role}`
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120)

/** Small stable id for a question text */
export function qid(text: string): string {
  let h = 5381
  for (let i = 0; i < text.length; i++) h = ((h << 5) + h + text.charCodeAt(i)) | 0
  return (h >>> 0).toString(36)
}

interface RawReport {
  levels?: string[]
  process?: string
  rounds?: string[]
  tips?: string[]
  sections?: Partial<Record<SectionId, { q: string; level?: string; round?: string; frequency?: string; difficulty?: string; lc?: number | null }[]>>
}

async function searchWeb(company: string, role: string, signal?: AbortSignal): Promise<CompanyReport> {
  const prompt = `Search the web for real interview experiences and question lists for the role "${role}" at "${company}" (sources such as LeetCode Discuss interview experiences and company tags, GeeksforGeeks interview experiences, Glassdoor, AmbitionBox, Blind, Medium/Substack write-ups, YouTube descriptions) from the last 2–3 years.
Also include the adjacent levels of the same track (for example SDE2 → also SDE1 and SDE3; Senior Frontend → also Frontend II and Staff Frontend) and mark the level each question was reported for.
Return ONLY JSON:
{"levels": ["levels covered"], "process": "2-4 sentences: rounds, format, what is evaluated, bar for this level", "rounds": ["e.g. Online assessment", "DSA 1", "LLD", "HLD", "Hiring manager"], "tips": ["3-6 concrete tips from the experiences"],
 "sections": {
  "dsa": [{"q": "question as asked (use the LeetCode title when it maps to one)", "lc": <LeetCode number or null>, "difficulty": "easy|medium|hard", "level": "SDE2", "round": "DSA 1", "frequency": "high|medium|low"}],
  "system_design": [...], "lld": [...], "behavioral": [...], "resume": [...], "cs": [...], "misc": [...]
 }}
Put 8–20 real questions in each section that has evidence (fewer is fine; empty arrays if none). Prefer questions reported multiple times; frequency = how often it appears across sources. No invented questions: if evidence is thin, say so in "process".`
  const { data, sources } = await groundedJson<RawReport>(prompt, signal)
  const questions: CompanyQuestion[] = []
  for (const s of SECTIONS) {
    for (const item of data.sections?.[s.id] ?? []) {
      if (!item?.q) continue
      const freq = ['high', 'medium', 'low'].includes(item.frequency ?? '') ? (item.frequency as CompanyQuestion['frequency']) : undefined
      questions.push({ id: qid(`${s.id}:${item.q}`), q: item.q, section: s.id, level: item.level, round: item.round, frequency: freq, difficulty: item.difficulty, lc: item.lc ?? null })
    }
  }
  return {
    company,
    role,
    levels: data.levels ?? [],
    process: data.process ?? '',
    rounds: data.rounds ?? [],
    tips: data.tips ?? [],
    questions,
    sources: sources.slice(0, 20),
    at: Date.now(),
  }
}

/** Cached report if fresh, otherwise a new web search (and refresh the shared cache) */
export async function getReport(company: string, role: string, uid: string | null, opts: { refresh?: boolean; signal?: AbortSignal } = {}): Promise<CompanyReport> {
  const key = keyOf(company, role)
  if (!opts.refresh && db) {
    try {
      const snap = await getDoc(doc(db, 'companyQuestions', key))
      if (snap.exists()) {
        const r = JSON.parse(snap.data().data as string) as CompanyReport
        if (Date.now() - r.at < CACHE_DAYS * 86400000) return r
      }
    } catch {
      /* fall through to search */
    }
  }
  const local = readLocal<Record<string, CompanyReport>>('hld.company.reports', {})
  if (!opts.refresh && local[key] && Date.now() - local[key].at < CACHE_DAYS * 86400000) return local[key]
  const report = await searchWeb(company.trim(), role.trim(), opts.signal)
  writeLocal('hld.company.reports', { ...local, [key]: report })
  if (uid && db) setDoc(doc(db, 'companyQuestions', key), { company: report.company, role: report.role, data: JSON.stringify(report), by: uid, at: report.at }).catch(() => {})
  return report
}

export interface PrepState {
  answers: Record<string, string>
  ai: Record<string, string>
}

/** The user's own answers + AI answers for one company/role */
export function usePrep(key: string) {
  const { user } = useStore()
  const localKey = `hld.company.prep.${key}`
  const [state, setState] = useState<PrepState>(() => readLocal(localKey, { answers: {}, ai: {} }))

  useEffect(() => {
    if (!key) return
    if (!user || !db) {
      setState(readLocal(localKey, { answers: {}, ai: {} }))
      return
    }
    const ref = doc(db, 'users', user.uid, 'companyPrep', key)
    return onSnapshot(ref, (snap) => {
      const d = snap.data() as PrepState | undefined
      setState({ answers: d?.answers ?? {}, ai: d?.ai ?? {} })
    })
  }, [key, user, localKey])

  const save = useCallback(
    (field: 'answers' | 'ai', id: string, text: string) => {
      setState((s) => {
        const next = { ...s, [field]: { ...s[field], [id]: text } }
        if (user && db) setDoc(doc(db, 'users', user.uid, 'companyPrep', key), { [field]: { [id]: text } }, { merge: true }).catch(() => {})
        else writeLocal(localKey, next)
        return next
      })
    },
    [user, key, localKey],
  )
  return { state, save }
}
