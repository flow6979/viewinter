// Anonymous visit counter for the owner's Stats page: one small Firestore doc per day (traffic/{yyyy-mm-dd}).
// Works for logged-out visitors and is not blocked by ad blockers like Google Analytics often is.
// No personal data: a random id in this browser decides "new" vs "returning", and it never leaves the browser.
import { doc, increment, setDoc } from 'firebase/firestore'
import { db } from './firebase'
import { currentPath } from './router'
import { readLocal, writeLocal } from './store'

/** Day in India time, so "today" on the Stats page matches the owner's clock */
export const trafficDay = (t = Date.now()) => new Date(t).toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' })

const LAST_DAY = 'vi.visit.day'
const SESSION = 'vi.visit.session'
const PAGES = 'vi.visit.pages'
/** Pages counted per browser session at most, so one long session can't flood the counter */
const MAX_PAGES = 40

// "topic/caching" → "topic/caching"; ids are trimmed so the map stays small
const pageKey = (p: string) => (p || 'home').split('?')[0].slice(0, 80)

function bump(fields: Record<string, unknown>) {
  if (!db) return
  setDoc(doc(db, 'traffic', trafficDay()), fields, { merge: true }).catch(() => {})
}

function countPage() {
  try {
    const seen: string[] = JSON.parse(sessionStorage.getItem(PAGES) ?? '[]')
    const key = pageKey(currentPath())
    if (seen.includes(key) || seen.length >= MAX_PAGES) return
    sessionStorage.setItem(PAGES, JSON.stringify([...seen, key]))
    bump({ views: increment(1), pages: { [key]: increment(1) } })
  } catch {
    /* storage blocked: skip */
  }
}

/** Once at startup: count the visit, then each distinct page opened in this session */
export function initTraffic() {
  if (!import.meta.env.PROD || !db || /bot|crawl|spider|lighthouse|headless/i.test(navigator.userAgent)) return
  try {
    if (!sessionStorage.getItem(SESSION)) {
      sessionStorage.setItem(SESSION, '1')
      const today = trafficDay()
      const last = readLocal<string>(LAST_DAY, '')
      writeLocal(LAST_DAY, today)
      const mobile = matchMedia('(max-width: 760px)').matches
      bump({
        sessions: increment(1),
        // first session of the day in this browser = one visitor for the day
        ...(last !== today ? { visitors: increment(1) } : {}),
        ...(!last ? { newVisitors: increment(1) } : {}),
        [mobile ? 'mobile' : 'desktop']: increment(1),
      })
    }
  } catch {
    /* storage blocked: skip */
  }
  countPage()
  window.addEventListener('viewinter:navigate', countPage)
  window.addEventListener('popstate', countPage)
}
