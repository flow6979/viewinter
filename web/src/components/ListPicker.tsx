import { useEffect, useRef, useState } from 'react'
import { useTr } from '../i18n'
import { useLists } from '../lists'
import { href } from '../router'

/** "+ List" on a page: add it to (or remove it from) the user's own revision lists */
export function ListPicker({ slug }: { slug: string }) {
  const tr = useTr()
  const { lists, create, toggle } = useLists()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const ref = useRef<HTMLDivElement>(null)
  const inAny = lists.filter((l) => l.slugs.includes(slug)).length

  useEffect(() => {
    if (!open) return
    // pointerdown covers taps on phones as well as mouse clicks
    const close = (e: PointerEvent) => !ref.current?.contains(e.target as Node) && setOpen(false)
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('pointerdown', close)
    document.addEventListener('keydown', esc)
    return () => {
      document.removeEventListener('pointerdown', close)
      document.removeEventListener('keydown', esc)
    }
  }, [open])

  return (
    <div className="list-picker" ref={ref}>
      <button type="button" className={`chip ${inAny ? 'on' : ''}`} aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        {inAny ? `✓ ${tr('List me', 'In list')} · ${inAny}` : `+ ${tr('List me daalo', 'Add to list')}`}
      </button>
      {open && (
        <div className="list-pop" role="dialog" aria-label={tr('Meri lists', 'My lists')}>
          {lists.length === 0 && <p className="muted small">{tr('Abhi koi list nahi. Naam do aur bana lo:', 'No lists yet. Name one to create it:')}</p>}
          {lists.map((l) => (
            <label key={l.id} className="list-pop-row">
              <input type="checkbox" checked={l.slugs.includes(slug)} onChange={() => toggle(l.id, slug)} />
              <span>{l.name}</span>
              <span className="muted small mono">{l.slugs.length}</span>
            </label>
          ))}
          <form
            className="list-pop-new"
            onSubmit={(e) => {
              e.preventDefault()
              if (!name.trim()) return
              create(name, [slug])
              setName('')
            }}
          >
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder={tr('Nayi list, jaise "Amazon round"', 'New list, e.g. "Amazon round"')} aria-label={tr('Nayi list ka naam', 'New list name')} />
            <button className="btn" disabled={!name.trim()}>
              {tr('Banao', 'Create')}
            </button>
          </form>
          <a href={href('lists')} className="small">
            {tr('Saari lists dekho →', 'See all lists →')}
          </a>
        </div>
      )}
    </div>
  )
}
