import type { Page } from '../content'
import { useTr } from '../i18n'
import { useStore } from '../store'

export function Checklist({ page }: { page: Page }) {
  const { progress, toggle } = useStore()
  const tr = useTr()
  if (!page.checklist.length) return null
  const done = page.checklist.filter((i) => progress[i.id]).length
  const total = page.checklist.length
  const complete = done === total

  return (
    <section className={`checklist2 ${complete ? 'complete' : ''}`} aria-labelledby="checklist-title">
      <div className="checklist2-head">
        <div>
          <h2 id="checklist-title">Checklist</h2>
          <p className="muted small">{complete ? tr('Page poora. Badhiya!', 'Page done. Nice!') : tr('Jo bina dekhe bata sako, wo tick karo.', 'Tick what you can explain without looking.')}</p>
        </div>
        <span className="checklist2-count mono">
          {done}/{total}
        </span>
      </div>
      <div className="checklist2-bar" role="progressbar" aria-valuenow={done} aria-valuemin={0} aria-valuemax={total}>
        <i style={{ width: `${(done / total) * 100}%` }} />
      </div>
      <ul>
        {page.checklist.map((item) => {
          const on = !!progress[item.id]
          return (
            <li key={item.id}>
              <label className={on ? 'on' : ''}>
                <input type="checkbox" checked={on} onChange={(e) => toggle(item.id, e.target.checked)} />
                <span className="check-box" aria-hidden="true">
                  {on ? '✓' : ''}
                </span>
                <span className="check-text">{item.text}</span>
              </label>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
