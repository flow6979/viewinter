import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { readLocal, writeLocal } from './store'

export type Lang = 'hi' | 'en'
export const LANGS: { id: Lang; label: string }[] = [
  { id: 'en', label: 'English' },
  { id: 'hi', label: 'Hinglish' },
]

const Ctx = createContext<{ lang: Lang; setLang: (l: Lang) => void }>({ lang: 'en', setLang: () => {} })

// ---- Keep the reader's place across a language switch ----------------------------------------
// Hinglish and English text differ in length, so the same pixel offset lands somewhere else.
// Instead we remember the section heading at the top of the screen and put it back in the same spot.
const MARKS = '.main h1, .main h2, .main h3, .main h4'

/** Desktop scrolls inside .main; phones scroll the page itself */
function scroller(): HTMLElement {
  const main = document.querySelector<HTMLElement>('.main')
  return main && main.scrollHeight > main.clientHeight + 1 ? main : (document.scrollingElement as HTMLElement)
}

function placeMark() {
  const box = scroller()
  if (box.scrollTop < 4) return null
  const top = box === document.scrollingElement ? 0 : box.getBoundingClientRect().top
  const marks = [...document.querySelectorAll<HTMLElement>(MARKS)]
  let i = -1
  marks.forEach((el, k) => {
    if (el.getBoundingClientRect().top - top <= 120) i = k
  })
  return { i, count: marks.length, offset: i >= 0 ? marks[i].getBoundingClientRect().top - top : 0, ratio: box.scrollTop / Math.max(1, box.scrollHeight - box.clientHeight) }
}

function restoreMark(m: NonNullable<ReturnType<typeof placeMark>>) {
  const box = scroller()
  const top = box === document.scrollingElement ? 0 : box.getBoundingClientRect().top
  const marks = document.querySelectorAll<HTMLElement>(MARKS)
  // Same page structure in both languages: line the heading up again; otherwise keep the same relative depth
  if (m.i >= 0 && marks.length === m.count) box.scrollTop += marks[m.i].getBoundingClientRect().top - top - m.offset
  else box.scrollTop = m.ratio * (box.scrollHeight - box.clientHeight)
  return box.scrollTop
}

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => readLocal('hld.lang', 'en'))
  const setLang = useCallback((l: Lang) => {
    const mark = placeMark()
    setLangState(l)
    writeLocal('hld.lang', l)
    document.documentElement.lang = l === 'en' ? 'en' : 'hi-Latn'
    if (!mark) return
    // After React paints the new text; then once more when diagrams and code blocks have settled,
    // unless the reader has scrolled in the meantime
    requestAnimationFrame(() => {
      const at = restoreMark(mark)
      window.setTimeout(() => {
        if (Math.abs(scroller().scrollTop - at) < 2) restoreMark(mark)
      }, 350)
    })
  }, [])
  const value = useMemo(() => ({ lang, setLang }), [lang, setLang])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export const useLang = () => useContext(Ctx)

/** Inline bilingual strings: tr('Hinglish text', 'English text') */
export function useTr() {
  const { lang } = useContext(Ctx)
  return useCallback((hi: string, en: string) => (lang === 'en' ? en : hi), [lang])
}

export function LangSwitch() {
  const { lang, setLang } = useLang()
  return (
    <div className="seg small lang-switch" role="radiogroup" aria-label="Language">
      {LANGS.map((l) => (
        <button key={l.id} role="radio" aria-checked={lang === l.id} className={lang === l.id ? 'on' : ''} onClick={() => setLang(l.id)}>
          <span className="hide-sm">{l.label}</span>
          <span className="show-sm">{l.id === 'en' ? 'EN' : 'HI'}</span>
        </button>
      ))}
    </div>
  )
}
