// Interview reports: only the compact scorecard is kept (no transcript, video or whiteboard).
// Logged in: users/{uid}/interviews/{id}; logged out: this browser.
import { useEffect, useState } from 'react'
import { collection, doc, getDoc, onSnapshot, orderBy, query, setDoc, limit } from 'firebase/firestore'
import { db } from '../firebase'
import { readLocal, useStore, writeLocal } from '../store'
import type { Report } from './prompts'

const LOCAL = 'hld.interviews'

export async function saveReport(r: Report, uid: string | null): Promise<void> {
  if (uid && db) {
    try {
      await setDoc(doc(db, 'users', uid, 'interviews', r.id), r)
      return
    } catch {
      /* offline: keep it locally */
    }
  }
  writeLocal(LOCAL, [r, ...readLocal<Report[]>(LOCAL, []).filter((x) => x.id !== r.id)].slice(0, 50))
}

export async function loadReport(id: string, uid: string | null): Promise<Report | null> {
  const local = readLocal<Report[]>(LOCAL, []).find((r) => r.id === id)
  if (local) return local
  if (uid && db) {
    const snap = await getDoc(doc(db, 'users', uid, 'interviews', id)).catch(() => null)
    if (snap?.exists()) return snap.data() as Report
  }
  return null
}

export function useReports(): Report[] {
  const { user } = useStore()
  const [list, setList] = useState<Report[]>(() => readLocal(LOCAL, []))
  useEffect(() => {
    const local = readLocal<Report[]>(LOCAL, [])
    if (!user || !db) return setList(local)
    return onSnapshot(query(collection(db, 'users', user.uid, 'interviews'), orderBy('at', 'desc'), limit(30)), (snap) => {
      const remote = snap.docs.map((d) => d.data() as Report)
      const ids = new Set(remote.map((r) => r.id))
      setList([...remote, ...local.filter((r) => !ids.has(r.id))].sort((a, b) => b.at - a.at))
    })
  }, [user])
  return list
}
