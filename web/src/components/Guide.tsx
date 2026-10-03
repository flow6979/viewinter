import { useState } from 'react'
import { useTr } from '../i18n'
import { href } from '../router'
import { readLocal, writeLocal } from '../store'
import { Icon, type IconName } from './Icon'

/** "How to use Viewinter": what each feature is for, and a suggested flow */
export function Guide() {
  const tr = useTr()
  const [open, setOpen] = useState<boolean>(() => readLocal('hld.guide.open', true))
  const toggle = () => {
    setOpen(!open)
    writeLocal('hld.guide.open', !open)
  }

  // Things to know (plain text) vs places to go (links): they must not look alike
  const info: [IconName, string, string][] = [
    ['book', tr('Padho', 'Study'), tr('Sidebar me saare subjects, har page interview ke liye.', 'Every subject is in the sidebar, each page written for interviews.')],
    ['bolt', tr('3 reading modes', '3 reading modes'), tr('Har page pe: Full page, Revision, Quick look.', 'On every page: Full page, Revision, Quick look.')],
    ['check', 'Checklist', tr('Page ke end me tick karo; progress isi se.', 'Tick it at the end of a page; progress runs on it.')],
    ['sparkle', 'Ask AI', tr('Right panel: notes, sawal, HLD mock interview.', 'Right panel: notes, questions, HLD mock interviews.')],
  ]
  const links: [IconName, string, string, string][] = [
    ['target', 'Quiz', tr('Endless MCQs, star aur retry', 'Endless MCQs, star and retry'), href('quiz')],
    ['plan', tr('Mera plan', 'My plan'), tr('Day-by-day plan, must-do pehle', 'Day-by-day plan, must-do first'), href('plan')],
    ['list', tr('Meri lists', 'My lists'), tr('Apni revise-lists', 'Your own revise lists'), href('lists')],
    ['file', tr('Resume prep', 'Resume prep'), tr('Resume pe sawal + score', 'Resume questions + score'), href('resume')],
    ['flask', tr('Agent labs', 'Agent labs'), tr('ReAct, RAG, multi-agent', 'ReAct, RAG, multi-agent'), href('agents')],
  ]

  const flow = [
    tr('Profile me interview date, phir plan banao', 'Set the interview date, then make your plan'),
    tr('Roz: plan ke pages, checklist, quiz', 'Daily: plan pages, checklist, quiz'),
    tr('Weak topics ko list me daalo, ek mock do', 'Put weak topics in a list, take a mock'),
    tr('Ek din pehle: Revision + starred quiz', 'Day before: Revision + starred quiz'),
    tr('30 min pehle: list ka Quick look', '30 min before: Quick look of your list'),
  ]

  return (
    <section className="guide">
      <button className="guide-head" aria-expanded={open} onClick={toggle}>
        <span className="eyebrow">{tr('Shuru kaise karein', 'Getting started')}</span>
        <span className="muted small">{open ? tr('Chhupao', 'Hide') : tr('Dikhao', 'Show')}</span>
      </button>
      {open && (
        <>
          <ol className="guide-flow">
            {flow.map((f, i) => (
              <li key={f}>
                <span className="guide-step mono">{String(i + 1).padStart(2, '0')}</span>
                <span>{f}</span>
              </li>
            ))}
          </ol>
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
          <div className="guide-links">
            {links.map(([icon, title, text, link]) => (
              <a key={title} className="guide-link" href={link}>
                <Icon name={icon} size={18} />
                <span className="guide-link-text">
                  <b>{title}</b>
                  <span>{text}</span>
                </span>
                <span className="guide-arrow">
                  <Icon name="arrow" size={16} />
                </span>
              </a>
            ))}
          </div>
        </>
      )}
    </section>
  )
}
