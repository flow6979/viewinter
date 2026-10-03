// Shared collections (quiz bank, AI problem index) only ever grow. Instead of re-reading every document on
// every visit (1 Firestore read per document), keep a copy in the browser and fetch only documents newer
// than the last one seen. A full refresh once a week picks up anything missed.
import { collection, getDocs, query, Timestamp, where, type DocumentData } from 'firebase/firestore'
import { db } from './firebase'
import { readLocal, writeLocal } from './store'

const WEEK = 7 * 86400000

interface Cache {
  docs: Record<string, DocumentData>
  last: number
  full: number
}

const millis = (v: unknown): number => (v instanceof Timestamp ? v.toMillis() : typeof v === 'number' ? v : 0)

/** All docs of a collection whose `at` field is a number (ms) or a Firestore Timestamp */
export async function syncCollection(name: string, atKind: 'number' | 'timestamp'): Promise<{ id: string; data: DocumentData }[]> {
  const key = `hld.fs.${name}`
  const cache = readLocal<Cache>(key, { docs: {}, last: 0, full: 0 })
  if (!db) return Object.entries(cache.docs).map(([id, data]) => ({ id, data }))
  const fresh = Date.now() - cache.full < WEEK && cache.last > 0
  const col = collection(db, name)
  const snap = fresh ? await getDocs(query(col, where('at', '>', atKind === 'timestamp' ? Timestamp.fromMillis(cache.last) : cache.last))) : await getDocs(col)
  const docs = fresh ? { ...cache.docs } : {}
  let last = fresh ? cache.last : 0
  for (const d of snap.docs) {
    const data = d.data()
    const at = millis(data.at)
    // Timestamps cannot go into localStorage as objects; keep the millis
    docs[d.id] = { ...data, at }
    if (at > last) last = at
  }
  try {
    writeLocal(key, { docs, last, full: fresh ? cache.full : Date.now() })
  } catch {
    /* storage full: still return the data */
  }
  return Object.entries(docs).map(([id, data]) => ({ id, data }))
}
