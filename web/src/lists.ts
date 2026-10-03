// The user's own topic lists ("Amazon round", "Weak topics"): saved in the profile, so they follow the login
import { useCallback } from 'react'
import type { PlanInput } from './plan'
import { useStore, type SavedQuestion, type TopicList } from './store'

export function useLists() {
  const { profile, saveProfile } = useStore()
  const lists = profile.lists ?? []

  const write = useCallback((next: TopicList[]) => saveProfile({ ...profile, lists: next }).catch(() => {}), [profile, saveProfile])

  const create = (name: string, slugs: string[] = []): TopicList => {
    const list = { id: Date.now().toString(36), name: name.trim() || 'My list', slugs }
    write([...lists, list])
    return list
  }
  const update = (id: string, change: Partial<TopicList>) => write(lists.map((l) => (l.id === id ? { ...l, ...change } : l)))
  const remove = (id: string) => {
    const next = lists.filter((l) => l.id !== id)
    // A plan built from a deleted list falls back to the subject tracks
    const plan = profile.plan?.list === id ? { ...profile.plan, list: undefined } : profile.plan
    saveProfile({ ...profile, lists: next, plan }).catch(() => {})
  }
  const toggle = (id: string, slug: string) => {
    const list = lists.find((l) => l.id === id)
    if (!list) return
    update(id, { slugs: list.slugs.includes(slug) ? list.slugs.filter((s) => s !== slug) : [...list.slugs, slug] })
  }

  const toggleQuestion = (id: string, item: SavedQuestion) => {
    const list = lists.find((l) => l.id === id)
    if (!list) return
    const qs = list.questions ?? []
    update(id, { questions: qs.some((x) => x.id === item.id) ? qs.filter((x) => x.id !== item.id) : [...qs, item] })
  }
  /** Keep the copy of an answer inside every list that holds this question in sync */
  const syncAnswer = (qid: string, answer: string) => {
    if (!lists.some((l) => l.questions?.some((x) => x.id === qid && x.answer !== answer))) return
    write(lists.map((l) => (l.questions?.some((x) => x.id === qid) ? { ...l, questions: l.questions.map((x) => (x.id === qid ? { ...x, answer } : x)) } : l)))
  }
  const createWith = (name: string, item: SavedQuestion): TopicList => {
    const list = { id: Date.now().toString(36), name: name.trim() || 'My list', slugs: [], questions: [item] }
    write([...lists, list])
    return list
  }

  return { lists, create, update, remove, toggle, toggleQuestion, syncAnswer, createWith }
}

/** Fills in the pages of the chosen list so buildPlan can use them */
export function withListPages(input: PlanInput, lists: TopicList[]): PlanInput {
  const list = input.list ? lists.find((l) => l.id === input.list) : undefined
  return list ? { ...input, only: list.slugs } : { ...input, list: undefined, only: undefined }
}
