// Helpers for problem definitions in content/dsa-problems/src/*.mjs (random tests + tree/list conversions).

/** Deterministic RNG so the generated tests never change between builds */
export function makeRng(seedText) {
  let h = 1779033703 ^ seedText.length
  for (let i = 0; i < seedText.length; i++) h = Math.imul(h ^ seedText.charCodeAt(i), 3432918353), (h = (h << 13) | (h >>> 19))
  let a = h >>> 0
  const next = () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  const r = {
    next,
    /** integer in [lo, hi] */
    int: (lo, hi) => lo + Math.floor(next() * (hi - lo + 1)),
    bool: () => next() < 0.5,
    pick: (arr) => arr[Math.floor(next() * arr.length)],
    shuffle: (arr) => {
      const a = [...arr]
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(next() * (i + 1))
        ;[a[i], a[j]] = [a[j], a[i]]
      }
      return a
    },
    array: (n, lo, hi) => Array.from({ length: n }, () => r.int(lo, hi)),
    distinct: (n, lo, hi) => {
      const s = new Set()
      while (s.size < n) s.add(r.int(lo, hi))
      return r.shuffle([...s])
    },
    str: (n, alphabet = 'abcdefghijklmnopqrstuvwxyz') => Array.from({ length: n }, () => r.pick(alphabet)).join(''),
    /** random binary tree as a LeetCode level-order array with nulls */
    tree: (n, lo, hi) => treeToArray(randomTree(r, n, () => r.int(lo, hi))),
    /** random BST with distinct values */
    bst: (n, lo, hi) => {
      let root = null
      for (const v of r.distinct(n, lo, hi)) root = bstInsert(root, v)
      return treeToArray(root)
    },
    /** connected undirected graph edges [u,v] on 0..n-1 (m >= n-1) */
    connectedEdges: (n, m) => {
      const edges = []
      const seen = new Set()
      const add = (u, v) => {
        const k = u < v ? `${u},${v}` : `${v},${u}`
        if (u === v || seen.has(k)) return false
        seen.add(k)
        edges.push([u, v])
        return true
      }
      const order = r.shuffle([...Array(n).keys()])
      for (let i = 1; i < n; i++) add(order[i], order[r.int(0, i - 1)])
      let guard = 0
      while (edges.length < m && guard++ < m * 20) add(r.int(0, n - 1), r.int(0, n - 1))
      return r.shuffle(edges)
    },
  }
  return r
}

export class TreeNode {
  constructor(val, left = null, right = null) {
    this.val = val
    this.left = left
    this.right = right
  }
}
export class ListNode {
  constructor(val, next = null) {
    this.val = val
    this.next = next
  }
}

function randomTree(r, n, val) {
  if (n <= 0) return null
  const root = new TreeNode(val())
  const nodes = [root]
  for (let i = 1; i < n; i++) {
    for (;;) {
      const p = r.pick(nodes)
      const side = r.bool() ? 'left' : 'right'
      if (!p[side]) {
        p[side] = new TreeNode(val())
        nodes.push(p[side])
        break
      }
    }
  }
  return root
}

function bstInsert(root, v) {
  if (!root) return new TreeNode(v)
  if (v < root.val) root.left = bstInsert(root.left, v)
  else root.right = bstInsert(root.right, v)
  return root
}

export function buildTree(arr) {
  if (!arr || !arr.length || arr[0] === null) return null
  const root = new TreeNode(arr[0])
  const q = [root]
  let i = 1
  while (q.length && i < arr.length) {
    const c = q.shift()
    if (i < arr.length && arr[i] !== null) q.push((c.left = new TreeNode(arr[i])))
    i++
    if (i < arr.length && arr[i] !== null) q.push((c.right = new TreeNode(arr[i])))
    i++
  }
  return root
}

export function treeToArray(root) {
  const out = []
  const q = [root]
  while (q.length) {
    const c = q.shift()
    if (c) {
      out.push(c.val)
      q.push(c.left, c.right)
    } else out.push(null)
  }
  while (out.length && out[out.length - 1] === null) out.pop()
  return out
}

export const buildList = (arr) => (arr ?? []).reduceRight((next, v) => new ListNode(v, next), null)
export function listToArray(h) {
  const out = []
  while (h) out.push(h.val), (h = h.next)
  return out
}
