// Practice problems: the problem index, lazy problem files, points for solved problems and code drafts.
// Solved problems live in users/{uid}.dsa.solved when logged in, in this browser otherwise (moved in on login).
import { useCallback, useEffect, useState } from 'react'
import { doc, onSnapshot, setDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { readLocal, useStore, writeLocal } from '../store'
import type { Compare, Json, Signature } from './harness'
import indexJson from '../../../content/dsa-problems/index.json'

export interface ProblemMeta {
  id: string
  title: string
  topic: string
  difficulty: 'easy' | 'medium' | 'hard'
  points: number
  lc: number | null
  tags: string[]
  order: number
}

export interface Problem extends ProblemMeta {
  statement: { hi: string; en: string }
  constraints: string[]
  hints: { hi: string[]; en: string[] }
  signature: Signature
  compare: Compare
  starter: string
  examples: { args: Json[]; expected: Json; explain?: { hi: string; en: string } }[]
  tests: { args: Json[]; expected: Json }[]
  solution: { approach: { hi: string; en: string }; cpp: string }
}

export interface Solved {
  points: number
  at: number
}

export const PROBLEMS = indexJson as ProblemMeta[]

const files = import.meta.glob(['../../../content/dsa-problems/*.json', '!../../../content/dsa-problems/index.json'], { import: 'default' }) as Record<string, () => Promise<unknown>>

export async function loadProblem(id: string): Promise<Problem | null> {
  const key = Object.keys(files).find((k) => k.endsWith(`/${id}.json`))
  return key ? ((await files[key]()) as Problem) : null
}

const LOCAL = 'hld.dsa.solved'

export function usePractice() {
  const { user } = useStore()
  const [solved, setSolved] = useState<Record<string, Solved>>(() => readLocal(LOCAL, {}))

  useEffect(() => {
    if (!user || !db) {
      setSolved(readLocal(LOCAL, {}))
      return
    }
    const ref = doc(db, 'users', user.uid)
    const local = readLocal<Record<string, Solved>>(LOCAL, {})
    if (Object.keys(local).length) {
      setDoc(ref, { dsa: { solved: local } }, { merge: true })
        .then(() => writeLocal(LOCAL, {}))
        .catch(() => {})
    }
    return onSnapshot(ref, (snap) => setSolved((snap.data()?.dsa?.solved as Record<string, Solved>) ?? {}))
  }, [user])

  const markSolved = useCallback(
    (p: ProblemMeta) => {
      if (solved[p.id]) return false
      const rec = { points: p.points, at: Date.now() }
      setSolved((s) => ({ ...s, [p.id]: rec }))
      if (user && db) setDoc(doc(db, 'users', user.uid), { dsa: { solved: { [p.id]: rec } } }, { merge: true }).catch(() => {})
      else writeLocal(LOCAL, { ...readLocal(LOCAL, {}), [p.id]: rec })
      return true
    },
    [solved, user],
  )

  const points = Object.values(solved).reduce((n, s) => n + s.points, 0)
  return { solved, points, markSolved }
}

// Drafts stay in the browser (they are just scratch code)
export const draftKey = (id: string) => `hld.dsa.code.${id}`
