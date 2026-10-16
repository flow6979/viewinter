import type { Page } from './content'

export function pct(done: number, total: number): number {
  if (!total) return 0
  const p = (done / total) * 100
  // One decimal below 10% so the first few ticks visibly move the number
  return p > 0 && p < 10 ? Math.round(p * 10) / 10 : Math.round(p)
}

export function pageStats(page: Page, progress: Record<string, boolean>) {
  const done = page.checklist.filter((i) => progress[i.id]).length
  return { done, total: page.checklist.length, complete: page.checklist.length > 0 && done === page.checklist.length }
}

export function groupStats(pages: Page[], progress: Record<string, boolean>) {
  let done = 0
  let total = 0
  let complete = 0
  for (const p of pages) {
    const s = pageStats(p, progress)
    done += s.done
    total += s.total
    if (s.complete) complete++
  }
  return { done, total, complete, pages: pages.length, percent: pct(done, total) }
}

// "Read" ticks from My lists live in the same progress map (key read:<slug> / read:q:<id>), so they sync
// with the account like checklist ticks. The site-wide % counts only checklist items, so these don't move it.
export const readKey = (slug: string) => `read:${slug}`
export const readQuestionKey = (id: string) => `read:q:${id}`

/** A page counts as read when it was ticked in a list, or every checklist item on it is done */
export function isRead(page: Page, progress: Record<string, boolean>) {
  return !!progress[readKey(page.slug)] || pageStats(page, progress).complete
}
