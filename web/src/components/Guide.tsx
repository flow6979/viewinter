import { useState } from 'react'
import { useTr } from '../i18n'
import { readLocal, writeLocal } from '../store'

/** How to prepare with Viewinter, as a 5-step timeline (reference only, nothing clickable but the toggle) */
export function Guide() {
  const tr = useTr()
  const [open, setOpen] = useState<boolean>(() => readLocal('hld.guide.open', true))
  const toggle = () => {
    setOpen(!open)
    writeLocal('hld.guide.open', !open)
  }

  const steps: [string, string][] = [
    [tr('Plan banao', 'Make a plan'), tr('Interview date + ghante', 'Interview date + hours')],
    [tr('Roz padho', 'Study daily'), tr('Pages, checklist, quiz', 'Pages, checklist, quiz')],
    [tr('Weak topics', 'Weak topics'), tr('List me daalo, mock do', 'Add to a list, take a mock')],
    [tr('Ek din pehle', 'Day before'), tr('Revision + starred quiz', 'Revision + starred quiz')],
    [tr('30 min pehle', '30 min before'), tr('List ka Quick look', 'Quick look of your list')],
  ]

  return (
    <section className="dash-section guide">
      <button className="dash-head guide-toggle" aria-expanded={open} onClick={toggle}>
        <span className="eyebrow">{tr('Kaise prepare karein', 'How to prepare')}</span>
        <span className="muted small">{open ? tr('Chhupao', 'Hide') : tr('Dikhao', 'Show')}</span>
      </button>
      {open && (
        <ol className="timeline">
          {steps.map(([title, sub]) => (
            <li key={title}>
              <span className="timeline-dot" aria-hidden="true" />
              <b>{title}</b>
              <span>{sub}</span>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}
