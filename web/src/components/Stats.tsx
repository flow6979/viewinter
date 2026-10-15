// Owner-only stats: who signed up, who came back, and what they use. Firestore rules let only an admin
// (a doc at admins/{uid}) read other users' documents. Traffic (logged-out visitors too) comes from traffic/{day} docs
// written by traffic.ts, with Google Analytics as the deeper view (countries, sources, realtime).
import { useEffect, useState } from 'react'
import { collection, collectionGroup, documentId, getCountFromServer, getDocs, query, where, type Timestamp } from 'firebase/firestore'
import { db } from '../firebase'
import { trafficDay } from '../traffic'
import { useStore } from '../store'
import { href } from '../router'
import { Icon } from './Icon'

export const ADMIN_UID = 'j3bknD4zabQ5XHgVnnIgmcliDxw2'
export const isAdmin = (uid?: string | null) => uid === ADMIN_UID

const PROJECT = 'viewinter-30735'
const DAY = 86_400_000

interface Row {
  id: string
  name: string
  joined: number
  seen: number
  visits: number
  ticks: number
  quiz: number
  dsa: number
}

interface Day {
  day: string
  visitors: number
  newVisitors: number
  sessions: number
  views: number
  mobile: number
  desktop: number
  pages: Record<string, number>
}

interface Data {
  traffic: Day[]
  rows: Row[]
  interviews: number
  problems: number
  questions: number
  companies: number
}

const count = (o: unknown) => (o && typeof o === 'object' ? Object.keys(o).length : 0)
const ms = (t: unknown) => (typeof t === 'number' ? t : (t as Timestamp | undefined)?.toMillis?.() ?? 0)
const ago = (t: number) => {
  if (!t) return '—'
  const d = Math.floor((Date.now() - t) / DAY)
  return d <= 0 ? 'today' : d === 1 ? 'yesterday' : `${d}d ago`
}

async function load(): Promise<Data> {
  const d = db!
  const safeCount = (q: Parameters<typeof getCountFromServer>[0]) => getCountFromServer(q).then((s) => s.data().count).catch(() => 0)
  const since = trafficDay(Date.now() - 29 * DAY)
  const [traffic, users, interviews, problems, questions, companies] = await Promise.all([
    getDocs(query(collection(d, 'traffic'), where(documentId(), '>=', since))).then((s) =>
      s.docs.map((x): Day => {
        const v = x.data()
        const n = (k: string) => Number(v[k] ?? 0)
        return { day: x.id, visitors: n('visitors'), newVisitors: n('newVisitors'), sessions: n('sessions'), views: n('views'), mobile: n('mobile'), desktop: n('desktop'), pages: v.pages ?? {} }
      }),
    ),
    getDocs(collection(d, 'users')),
    safeCount(collectionGroup(d, 'interviews')),
    safeCount(collection(d, 'dsaIndex')),
    safeCount(collection(d, 'quiz')),
    safeCount(collection(d, 'companyQuestions')),
  ])
  const rows = users.docs.map((s) => {
    const x = s.data()
    return {
      id: s.id,
      name: String(x.meta?.name || x.profile?.name || 'Anonymous'),
      joined: ms(x.meta?.joined),
      seen: ms(x.meta?.seen),
      visits: Number(x.meta?.visits ?? 0),
      ticks: count(x.progress),
      quiz: count(x.quiz?.a),
      dsa: count(x.dsa?.solved),
    }
  })
  rows.sort((a, b) => b.seen - a.seen || b.joined - a.joined)
  return { traffic, rows, interviews, problems, questions, companies }
}

/** Last 14 days as columns */
function Bars({ per, days, label }: { per: number[]; days: number[]; label: string }) {
  const max = Math.max(1, ...per)
  return (
    <div className="stats-chart" role="img" aria-label={label}>
      {per.map((n, i) => (
        <span key={days[i]} title={`${new Date(days[i]).toLocaleDateString()}: ${n}`}>
          <i style={{ height: `${(n / max) * 100}%` }} />
          <b className="mono">{n || ''}</b>
        </span>
      ))}
    </div>
  )
}

const last14 = () => {
  const today = new Date().setHours(0, 0, 0, 0)
  return Array.from({ length: 14 }, (_, i) => today - (13 - i) * DAY)
}

/** How many accounts were created each day */
function Signups({ rows }: { rows: Row[] }) {
  const days = last14()
  return <Bars days={days} per={days.map((d) => rows.filter((r) => r.joined >= d && r.joined < d + DAY).length)} label="Sign-ups in the last 14 days" />
}

/** Visitors (logged in or not) per day, from the traffic counter */
function Traffic({ traffic }: { traffic: Day[] }) {
  const byDay = new Map(traffic.map((t) => [t.day, t]))
  const sum = (from: number, k: keyof Omit<Day, 'day' | 'pages'>) => traffic.filter((t) => t.day >= trafficDay(Date.now() - from * DAY)).reduce((s, t) => s + t[k], 0)
  const today = byDay.get(trafficDay())
  const days = last14()
  const mobile = sum(29, 'mobile')
  const desktop = sum(29, 'desktop')
  const pages = new Map<string, number>()
  for (const t of traffic) for (const [p, n] of Object.entries(t.pages)) pages.set(p, (pages.get(p) ?? 0) + Number(n))
  const top = [...pages].sort((a, b) => b[1] - a[1]).slice(0, 10)
  const tiles: [string, number | string][] = [
    ['Visitors today', today?.visitors ?? 0],
    ['Visitors 7 days', sum(6, 'visitors')],
    ['Visitors 30 days', sum(29, 'visitors')],
    ['New visitors 30 days', sum(29, 'newVisitors')],
    ['Visits 30 days', sum(29, 'sessions')],
    ['Page views 30 days', sum(29, 'views')],
    ['On phones', mobile + desktop ? `${Math.round((mobile / (mobile + desktop)) * 100)}%` : '—'],
  ]
  return (
    <>
      <section className="stats-tiles">
        {tiles.map(([label, v]) => (
          <div key={label} className="stats-tile">
            <b className="mono">{v}</b>
            <span>{label}</span>
          </div>
        ))}
      </section>
      <section className="stats-block">
        <h2>Visitors, last 14 days</h2>
        <Bars days={days} per={days.map((d) => byDay.get(trafficDay(d + DAY / 2))?.visitors ?? 0)} label="Visitors in the last 14 days" />
        <p className="muted small">Everyone who opened the site, logged in or not. A visitor is one browser per day; counting started with this update.</p>
      </section>
      {top.length > 0 && (
        <section className="stats-block">
          <h2>Top pages, 30 days</h2>
          <div className="stats-table-wrap">
            <table className="stats-table">
              <tbody>
                {top.map(([p, n]) => (
                  <tr key={p}>
                    <td>
                      <a href={href(p === 'home' ? '' : p)}>{p}</a>
                    </td>
                    <td className="mono">{n}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </>
  )
}

export function Stats() {
  const { user, authReady } = useStore()
  const [data, setData] = useState<Data | null>(null)
  const [error, setError] = useState('')
  const admin = isAdmin(user?.uid)

  useEffect(() => {
    if (!admin || !db) return
    load()
      .then(setData)
      .catch((e) => setError((e as Error).message))
  }, [admin])

  if (!authReady) return <p className="muted">Loading…</p>
  if (!admin)
    return (
      <div className="empty-state">
        <h1>Not available</h1>
        <a href={href('')}>Go to dashboard</a>
      </div>
    )

  const rows = data?.rows ?? []
  const now = Date.now()
  const active = (days: number) => rows.filter((r) => r.seen && now - r.seen < days * DAY).length
  const tiles: [string, number | string][] = data
    ? [
        ['Signed-up users', rows.length],
        ['Active today', active(1)],
        ['Active 7 days', active(7)],
        ['Active 30 days', active(30)],
        ['Mock interviews', data.interviews],
        ['Topics ticked', rows.reduce((s, r) => s + r.ticks, 0)],
        ['Quiz answers', rows.reduce((s, r) => s + r.quiz, 0)],
        ['DSA solved', rows.reduce((s, r) => s + r.dsa, 0)],
      ]
    : []

  return (
    <div className="stats-page">
      <header>
        <span className="eyebrow">Only you can see this</span>
        <h1>Stats</h1>
      </header>

      <section className="stats-links">
        <a className="quick-card" href={`https://console.firebase.google.com/project/${PROJECT}/analytics`} target="_blank" rel="noreferrer">
          <Icon name="target" size={18} />
          <span className="quick-text">
            <b>Traffic</b>
            <span>Countries, sources, devices, realtime (Google Analytics; data shows up within a day)</span>
          </span>
          <span className="quick-arrow">
            <Icon name="arrow" size={14} />
          </span>
        </a>
        <a className="quick-card" href={`https://console.firebase.google.com/project/${PROJECT}/authentication/users`} target="_blank" rel="noreferrer">
          <Icon name="key" size={18} />
          <span className="quick-text">
            <b>Accounts</b>
            <span>Every login with email and sign-in date (Firebase Auth)</span>
          </span>
          <span className="quick-arrow">
            <Icon name="arrow" size={14} />
          </span>
        </a>
      </section>

      {error && <p className="error small">{error}</p>}
      {!data && !error && <p className="muted">Loading…</p>}
      {data && (
        <>
          <h2 className="stats-h">Traffic</h2>
          <Traffic traffic={data.traffic} />

          <h2 className="stats-h">Accounts and usage</h2>
          <section className="stats-tiles">
            {tiles.map(([label, v]) => (
              <div key={label} className="stats-tile">
                <b className="mono">{v}</b>
                <span>{label}</span>
              </div>
            ))}
          </section>

          <section className="stats-block">
            <h2>Sign-ups, last 14 days</h2>
            <Signups rows={rows} />
          </section>

          <section className="stats-block">
            <h2>Content built by users</h2>
            <p className="muted small">
              {data.problems} AI-made DSA problems · {data.questions} shared quiz questions · {data.companies} company question sets
            </p>
          </section>

          <section className="stats-block">
            <h2>Users</h2>
            <div className="stats-table-wrap">
              <table className="stats-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Joined</th>
                    <th>Last seen</th>
                    <th>Visits</th>
                    <th>Ticks</th>
                    <th>Quiz</th>
                    <th>DSA</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.id}>
                      <td>{r.name}</td>
                      <td>{r.joined ? new Date(r.joined).toLocaleDateString() : '—'}</td>
                      <td>{ago(r.seen)}</td>
                      <td className="mono">{r.visits}</td>
                      <td className="mono">{r.ticks}</td>
                      <td className="mono">{r.quiz}</td>
                      <td className="mono">{r.dsa}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="muted small">Joined / last seen / visits are recorded from today on; older accounts show them after their next visit.</p>
          </section>
        </>
      )}
    </div>
  )
}
