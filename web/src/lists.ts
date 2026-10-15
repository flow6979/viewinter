// The user's own topic lists ("Amazon round", "Weak topics"): saved in the profile, so they follow the login.
// A list can also get a share link: a copy lives in sharedLists/{id}, kept in step with every edit.
import { useCallback } from 'react'
import type { User } from 'firebase/auth'
import { deleteDoc, doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import { db } from './firebase'
import type { PlanInput } from './plan'
import { href } from './router'
import { useStore, type SavedQuestion, type TopicList } from './store'

/** What other people see: pages and question text, never the owner's answers */
export interface SharedList {
  by: string
  byName: string
  name: string
  slugs: string[]
  questions: Pick<SavedQuestion, 'id' | 'q' | 'from'>[]
  public: boolean
}

const shareFields = (l: TopicList) => JSON.stringify([l.name, l.slugs, (l.questions ?? []).map((q) => [q.id, q.q, q.from]), l.share])

function publish(list: TopicList, user: User) {
  if (!db || !list.share) return Promise.resolve()
  const data: Omit<SharedList, 'public'> & { public: boolean; at: unknown } = {
    by: user.uid,
    byName: user.displayName ?? '',
    name: list.name.slice(0, 120),
    slugs: list.slugs,
    questions: (list.questions ?? []).map(({ id, q, from }) => ({ id, q, from })),
    public: list.share.public,
    at: serverTimestamp(),
  }
  return setDoc(doc(db, 'sharedLists', list.share.id), data)
}

// 128 random bits as base64url (22 chars): links can't be guessed
const newShareId = () => btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(16)))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')

/** Full link to a shared list, e.g. https://…/viewinter/list/k3x9… */
export const shareUrl = (id: string) => `${window.location.origin}${href(`list/${id}`)}`

/** Loads a shared list; null when it is private (and not ours) or was deleted */
export async function loadSharedList(id: string): Promise<SharedList | null> {
  if (!db) return null
  try {
    const snap = await getDoc(doc(db, 'sharedLists', id))
    return snap.exists() ? (snap.data() as SharedList) : null
  } catch {
    return null
  }
}

export function useLists() {
  const { profile, saveProfile, user } = useStore()
  const lists = profile.lists ?? []

  const write = useCallback(
    (next: TopicList[]) => {
      // Shared lists: push the edit to the link copy too (only lists whose shared parts changed)
      if (user) {
        const before = new Map((profile.lists ?? []).map((l) => [l.id, shareFields(l)]))
        for (const l of next) if (l.share && before.get(l.id) !== shareFields(l)) publish(l, user).catch(() => {})
      }
      return saveProfile({ ...profile, lists: next }).catch(() => {})
    },
    [profile, saveProfile, user],
  )

  const create = (name: string, slugs: string[] = [], questions?: SavedQuestion[]): TopicList => {
    const list: TopicList = { id: Date.now().toString(36), name: name.trim() || 'My list', slugs, ...(questions?.length ? { questions } : {}) }
    write([...lists, list])
    return list
  }
  const update = (id: string, change: Partial<TopicList>) => write(lists.map((l) => (l.id === id ? { ...l, ...change } : l)))
  const remove = (id: string) => {
    const gone = lists.find((l) => l.id === id)
    // Deleting a list also kills its link
    if (gone?.share && db) deleteDoc(doc(db, 'sharedLists', gone.share.id)).catch(() => {})
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

  /** Public: anyone with the link can view it. Private: the link opens only for the owner. */
  const setSharing = (id: string, isPublic: boolean) => {
    const list = lists.find((l) => l.id === id)
    if (!list || !user) return
    update(id, { share: { id: list.share?.id ?? newShareId(), public: isPublic } })
  }

  return { lists, create, update, remove, toggle, toggleQuestion, syncAnswer, createWith, setSharing }
}

/** Fills in the pages of the chosen list so buildPlan can use them */
export function withListPages(input: PlanInput, lists: TopicList[]): PlanInput {
  const list = input.list ? lists.find((l) => l.id === input.list) : undefined
  return list ? { ...input, only: list.slugs } : { ...input, list: undefined, only: undefined }
}
