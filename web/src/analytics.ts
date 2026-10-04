// Google Analytics (via Firebase) for the live site only: page views are tracked automatically,
// plus a few product events. Loaded after the page is idle so it never slows the first paint.
import { app } from './firebase'

type Params = Record<string, string | number | boolean>
type Log = (name: string, params?: Params) => void

let log: Log | null = null
const queue: [string, Params | undefined][] = []

export function initAnalytics() {
  if (!import.meta.env.PROD || !app?.options.measurementId) return
  const start = async () => {
    const { getAnalytics, isSupported, logEvent } = await import('firebase/analytics')
    if (!(await isSupported())) return
    const a = getAnalytics(app!)
    log = (name, params) => logEvent(a, name, params)
    for (const [n, p] of queue.splice(0)) log(n, p)
  }
  const idle = (window as { requestIdleCallback?: (f: () => void) => void }).requestIdleCallback
  if (idle) idle(() => void start().catch(() => {}))
  else window.setTimeout(() => void start().catch(() => {}), 1500)
}

/** Records a product event (no personal data: ids, types and scores only) */
export function track(name: string, params?: Params) {
  if (log) log(name, params)
  else if (queue.length < 50) queue.push([name, params])
}
