import { useState } from 'react'
import { useTr } from '../i18n'
import { readLocal, writeLocal } from '../store'
import { Icon, type IconName } from './Icon'

/** "How it works": plain reference text (nothing here is clickable except the toggle) */
export function Guide() {
  const tr = useTr()
  const [open, setOpen] = useState<boolean>(() => readLocal('hld.guide.open', true))
  const toggle = () => {
    setOpen(!open)
    writeLocal('hld.guide.open', !open)
  }

  const flow = [
    tr('Profile me interview date, phir plan banao', 'Set the interview date, then make your plan'),
    tr('Roz: plan ke pages, checklist, quiz', 'Daily: plan pages, checklist, quiz'),
    tr('Weak topics ko list me daalo, ek mock do', 'Put weak topics in a list, take a mock'),
    tr('Ek din pehle: Revision + starred quiz', 'Day before: Revision + starred quiz'),
    tr('30 min pehle: list ka Quick look', '30 min before: Quick look of your list'),
  ]
  const info: [IconName, string, string][] = [
    ['book', tr('Padho', 'Study'), tr('Sidebar me saare subjects, har page interview ke liye.', 'Every subject is in the sidebar, each page written for interviews.')],
    ['bolt', tr('3 reading modes', '3 reading modes'), tr('Har page pe: Full page, Revision, Quick look.', 'On every page: Full page, Revision, Quick look.')],
    ['check', 'Checklist', tr('Page ke end me tick karo; progress isi se.', 'Tick it at the end of a page; progress runs on it.')],
    ['sparkle', 'Ask AI', tr('Right panel: notes, sawal, HLD mock interview.', 'Right panel: notes, questions, HLD mock interviews.')],
  ]
  const tips = [
    tr('Pehle 5 min sirf sawal poochho.', 'Spend the first 5 minutes asking questions.'),
    tr('Har choice ke saath bolo: kyun, aur kya nahi liya.', 'For every choice, say why and what you did not pick.'),
    tr('Pehle simple design, phir deep dive.', 'Simple design first, then go deep.'),
    tr('End me failures aur improvements khud bolo.', 'End with failures and improvements.'),
  ]

  return (
    <section className="dash-section guide">
      <button className="dash-head guide-toggle" aria-expanded={open} onClick={toggle}>
        <span className="eyebrow">{tr('Kaise use karein', 'How it works')}</span>
        <span className="muted small">{open ? tr('Chhupao −', 'Hide −') : tr('Dikhao +', 'Show +')}</span>
      </button>
      {open && (
        <div className="guide-body">
          <ol className="guide-flow">
            {flow.map((f, i) => (
              <li key={f}>
                <span className="guide-step mono">{String(i + 1).padStart(2, '0')}</span>
                <span>{f}</span>
              </li>
            ))}
          </ol>
          <div className="guide-cols">
            <ul className="guide-info">
              {info.map(([icon, title, text]) => (
                <li key={title}>
                  <Icon name={icon} size={16} />
                  <span>
                    <b>{title}.</b> {text}
                  </span>
                </li>
              ))}
            </ul>
            <div>
              <span className="guide-sub mono">{tr('Interview tips', 'Interview tips')}</span>
              <ul className="guide-tips">
                {tips.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
