// Signed in: the Gemini key follows the account to every device. It lives in users/{uid}/private/gemini,
// which only the user can read (the owner's Stats page reads users/{uid}, never this subcollection).
// The browser copy (localStorage) stays the one the app reads; this only keeps the two in step.
import { useEffect } from 'react'
import type { User } from 'firebase/auth'
import { doc, onSnapshot, setDoc } from 'firebase/firestore'
import { db } from './firebase'
import { DEFAULT_MODEL, GEMINI_EVENT, getGeminiSettings, saveGeminiSettings, type GeminiSettings } from './gemini'

const same = (a: GeminiSettings, b: GeminiSettings) => a.apiKey === b.apiKey && a.model === b.model

export function useGeminiSync(user: User | null) {
  useEffect(() => {
    if (!user || !db) return
    const ref = doc(db, 'users', user.uid, 'private', 'gemini')
    // Last value seen in Firestore; null until the first snapshot arrives
    let remote: GeminiSettings | null = null

    const upload = (s: GeminiSettings) => {
      remote = s
      setDoc(ref, { apiKey: s.apiKey, model: s.model }).catch(() => {})
    }

    const stop = onSnapshot(
      ref,
      (snap) => {
        const local = getGeminiSettings()
        if (!snap.exists()) {
          // First device to sign in with a key brings it into the account
          remote = { apiKey: '', model: DEFAULT_MODEL }
          if (local.apiKey) upload(local)
          return
        }
        const d = snap.data()
        remote = { apiKey: String(d.apiKey ?? ''), model: String(d.model || DEFAULT_MODEL) }
        // The account wins, including a key removed on another device
        if (!same(remote, local)) saveGeminiSettings(remote)
      },
      () => {},
    )

    // Key saved or removed in Settings on this device → push it to the account
    const onChange = () => {
      const local = getGeminiSettings()
      if (remote && !same(remote, local)) upload(local)
    }
    window.addEventListener(GEMINI_EVENT, onChange)
    return () => {
      stop()
      window.removeEventListener(GEMINI_EVENT, onChange)
    }
  }, [user])
}
