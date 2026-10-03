// AI problem generator for the practice judge.
// 1. Gemini (with Google Search) finds the problem — from a LeetCode link or "top questions for X".
// 2. Gemini writes a spec: statement, signature, examples, ~35 test inputs, a fast reference and a brute force.
// 3. We never trust AI-written outputs: both solutions run on the real compiler, expected answers come from the
//    reference, and a test is kept only when the brute force agrees. One repair round if they disagree.
import { groundedJson, longJson, NO_TEX, type Source } from '../gemini'
import { fitsType, isSupportedType, sameAnswer, starterCode, type Compare, type Json, type Signature } from './harness'
import { runFull } from './runner'
import type { Problem } from './practice'

export const TOPICS = [
  '01-cpp-basics',
  '05-arrays-hashing-prefix',
  '06-two-pointers-sliding-window',
  '07-binary-search',
  '08-greedy-intervals',
  '09-stack-queue-monotonic',
  '10-recursion-backtracking',
  '11-trees',
  '12-heaps-priority-queue',
  '13-graphs',
  '14-dsu',
  '15-dp',
  '16-dp-on-trees-graphs',
]
const POINTS = { easy: 10, medium: 20, hard: 40 } as const

export interface Candidate {
  title: string
  lc: number | null
  url?: string
  difficulty?: string
  topic?: string
  why?: string
}

export type Step = 'search' | 'spec' | 'reference' | 'crosscheck' | 'repair' | 'save' | 'done'

/** "Top N questions for <topic> / <company>" from the live web */
export async function findTopProblems(opts: { topic?: string; company?: string; count: number }, signal?: AbortSignal): Promise<{ items: Candidate[]; sources: Source[] }> {
  const what = [opts.company && `asked at ${opts.company}`, opts.topic && `on the topic "${opts.topic}"`].filter(Boolean).join(' ')
  const prompt = `Search the web (LeetCode company tags and discuss, interview experiences on LeetCode/GeeksforGeeks/Glassdoor/AmbitionBox, NeetCode/Striver lists) for the ${opts.count} most frequently asked coding interview problems ${what || 'in software engineering interviews'} in the last 2 years.
Skip interactive problems, concurrency problems and SQL/shell; design-class and custom-node problems are fine.
Return ONLY a JSON array, most frequent first: [{"title": "LeetCode title", "lc": <LeetCode number or null>, "url": "https://leetcode.com/problems/<slug>/", "difficulty": "easy|medium|hard", "topic": one of ${JSON.stringify(TOPICS)}, "why": "one short line: where it was reported / why it matters"}]`
  const { data, sources } = await groundedJson<Candidate[]>(prompt, signal)
  const items = (Array.isArray(data) ? data : []).filter((c) => c && typeof c.title === 'string').slice(0, opts.count)
  return { items, sources }
}

/** Parses "https://leetcode.com/problems/two-sum/description/" → "two-sum" */
export function leetcodeSlug(url: string): string | null {
  const m = url.trim().match(/leetcode\.(?:com|cn)\/problems\/([a-z0-9-]+)/i)
  return m ? m[1].toLowerCase() : null
}

interface Facts {
  title: string
  lc: number | null
  difficulty: 'easy' | 'medium' | 'hard'
  statement: string
  constraints: string[]
  examples: string[]
  unsupported?: string
}

interface Spec {
  unsupported?: string
  title: string
  lc: number | null
  difficulty: 'easy' | 'medium' | 'hard'
  topic: string
  tags: string[]
  statement: { en: string; hi: string }
  constraints: string[]
  hints: { en: string[]; hi: string[] }
  signature: Signature
  compare: Compare
  examples: { args: Json[]; explain?: { en: string; hi: string } }[]
  tests: Json[][]
  reference_cpp: string
  brute_cpp: string
  approach: { en: string; hi: string }
}

const SPEC_RULES = `${NO_TEX} Statements, hints and constraints are Markdown: wrap code identifiers in backticks.
Our judge wraps a LeetCode-style \`class Solution\` in a main() that reads test arguments and prints the return value.
Supported C++ types (params and return): int, long long, double, bool, char, string, vector<int>, vector<long long>, vector<double>, vector<bool>, vector<char>, vector<string>, vector<vector<int>>, vector<vector<char>>, vector<vector<string>>, TreeNode* (LeetCode TreeNode, given as level-order array with null), ListNode* (given as array), and void (only as return, then set "mutates" to the index of the argument whose final value is the answer).
If the original uses other types you MUST ADAPT it (never refuse for this reason) and explain the format in the statement:
- Custom node structures (Quad-Tree Node, N-ary Node, Node with random pointer, graph Node, vector<ListNode*>): use LeetCode's own serialized form for input and output. Examples: Construct Quad Tree → \`vector<vector<int>> construct(vector<vector<int>>& grid)\` returning the level-order list of [isLeaf, val] pairs with [-1, -1] where LeetCode prints null; Clone Graph → \`vector<vector<int>> cloneGraph(vector<vector<int>>& adjList)\`; Copy List with Random Pointer → \`vector<vector<int>> copyRandomList(vector<vector<int>>& nodes)\` with [val, randomIndex or -1]; Merge k Sorted Lists → \`vector<int> mergeKLists(vector<vector<int>>& lists)\`. The candidate may define their own struct inside \`class Solution\` and convert; the reference solution must do exactly that.
- Design problems (LRU Cache, Min Stack, Trie, LFU…): \`vector<string> simulate(vector<string>& ops, vector<vector<int>>& args)\` (or vector<vector<string>> args when arguments are strings) that replays LeetCode's operation list and returns every operation's output as a string, "null" for void operations — exactly like LeetCode's example output. The reference solution defines the real class inside \`class Solution\` (as a nested class) and drives it.
- Graphs as int n + vector<vector<int>> edges.
Only return {"unsupported": "reason"} for interactive problems (guess API, ArrayReader…), concurrency/threads problems, or SQL/shell.
The answer must be unique for every test input; if the original allows "any order" use compare "unordered" (list of items in any order) or "unordered-nested" (also inner order free); if it allows any valid answer, change the statement so it is unique (e.g. "return the lexicographically smallest"). Use "float" for double answers.
Tests: exactly 35 test inputs as argument arrays, varied: edge cases (min sizes, duplicates, negatives, all equal, sorted, empty where allowed) and random-looking medium cases. Keep every test small enough to type: arrays ≤ 300 elements, strings ≤ 300 chars, grids ≤ 20×20, trees ≤ 100 nodes, graphs ≤ 100 nodes. Values must fit their C++ types. Do NOT include expected outputs (we compute them).
reference_cpp: a correct, efficient, complete \`class Solution { public: ... };\` with exactly the signature (C++17, <bits/stdc++.h> and using namespace std are already included; TreeNode/ListNode are defined).
brute_cpp: a different, obviously-correct brute-force \`class Solution\` with the same signature (may be slow; it is only used to cross-check small tests).`

const SPEC_SHAPE = `Return ONLY JSON:
{"title": "...", "lc": <number or null>, "difficulty": "easy|medium|hard", "topic": one of ${JSON.stringify(TOPICS)}, "tags": ["..."],
"statement": {"en": "markdown, the task only (no examples or constraints inside)", "hi": "same in Hinglish (Roman Hindi + English tech terms)"},
"constraints": ["..."], "hints": {"en": ["2-3 progressive hints"], "hi": ["same in Hinglish"]},
"signature": {"fn": "functionName", "params": [{"name": "nums", "type": "vector<int>"}], "ret": "int"},
"compare": "exact|unordered|unordered-nested|float",
"examples": [{"args": [...], "explain": {"en": "...", "hi": "..."}}],
"tests": [[...args], ...35 items],
"reference_cpp": "class Solution {...};", "brute_cpp": "class Solution {...};",
"approach": {"en": "3-6 lines: idea, why it works, time/space", "hi": "same in Hinglish"}}`

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
}

function checkSpec(spec: Spec): string | null {
  if (spec.unsupported) return spec.unsupported
  const sig = spec.signature
  if (!sig?.fn || !Array.isArray(sig.params) || !sig.params.length) return 'missing signature'
  for (const p of sig.params) if (!isSupportedType(p.type) || p.type === 'void') return `unsupported parameter type ${p.type}`
  if (!isSupportedType(sig.ret)) return `unsupported return type ${sig.ret}`
  if (sig.ret === 'void' && (sig.mutates === undefined || !sig.params[sig.mutates])) return 'void function without "mutates"'
  if (!['exact', 'unordered', 'unordered-nested', 'float'].includes(spec.compare)) spec.compare = 'exact'
  if (!['easy', 'medium', 'hard'].includes(spec.difficulty)) spec.difficulty = 'medium'
  if (!TOPICS.includes(spec.topic)) spec.topic = '05-arrays-hashing-prefix'
  if (!spec.reference_cpp?.includes('class Solution')) return 'missing reference solution'
  return null
}

const argsOk = (sig: Signature, args: Json[]) => Array.isArray(args) && args.length === sig.params.length && sig.params.every((p, i) => fitsType(p.type, args[i]))

/** The full pipeline. `source` is a LeetCode URL/slug or a candidate from findTopProblems. */
export async function generateProblem(source: { url?: string; title?: string; lc?: number | null }, onStep: (s: Step, note?: string) => void, signal?: AbortSignal): Promise<Problem & { sources: Source[] }> {
  // 1. Facts from the live problem page
  onStep('search')
  const slug = source.url ? leetcodeSlug(source.url) : null
  const ask = slug ? `the LeetCode problem at https://leetcode.com/problems/${slug}/` : `the LeetCode problem "${source.title}"${source.lc ? ` (#${source.lc})` : ''}`
  const { data: facts, sources } = await groundedJson<Facts>(
    `Look up ${ask} on the web. Return ONLY JSON: {"title": "...", "lc": <number or null>, "difficulty": "easy|medium|hard", "statement": "the full problem statement in your own words, precise", "constraints": ["..."], "examples": ["Input: ... Output: ... Explanation: ..."]}. Note in "statement" whether it uses a custom node class or a design-class API (we will adapt it). If it is interactive, about threads, or SQL/shell, add "unsupported": "reason".`,
    signal,
  )
  // "Unsupported" from the lookup step is only a hint: the spec step adapts node/design problems itself

  // 2. Spec with tests and two independent solutions
  onStep('spec')
  let spec = await longJson<Spec>(`You are preparing a coding problem for an online judge.\n\nProblem facts:\n${JSON.stringify(facts)}\n\n${SPEC_RULES}\n\n${SPEC_SHAPE}`, signal)
  const bad = checkSpec(spec)
  if (bad) throw new Error(`This one cannot run on our judge (${bad}). Try another problem.`)

  const verify = async () => {
    const examples = spec.examples.filter((e) => argsOk(spec.signature, e.args))
    const tests = spec.tests.filter((t) => argsOk(spec.signature, t))
    if (!examples.length) throw new Error('The AI wrote examples that do not match the signature. Try again.')
    const all = [...examples.map((e) => e.args), ...tests]
    onStep('reference', `${all.length} inputs`)
    const ref = await runFull(spec.reference_cpp, spec.signature, all, signal)
    if (ref.compileError) return { ok: false as const, why: `Reference solution does not compile:\n${ref.compileError.slice(0, 1500)}` }
    onStep('crosscheck')
    const brute = spec.brute_cpp?.includes('class Solution') ? await runFull(spec.brute_cpp, spec.signature, all, signal) : { outputs: [] as (Json | undefined)[] }
    const dbl = (spec.signature.ret === 'void' ? spec.signature.params[spec.signature.mutates ?? 0].type : spec.signature.ret).includes('double')
    const disagree: number[] = []
    let agreed = 0
    all.forEach((_, i) => {
      const r = ref.outputs[i]
      const b = brute.outputs[i]
      if (r === undefined || b === undefined) return
      if (sameAnswer(b, r, spec.compare, dbl)) agreed++
      else disagree.push(i)
    })
    if (disagree.length) {
      const i = disagree[0]
      return { ok: false as const, why: `Reference and brute force disagree on ${disagree.length} input(s). First: args ${JSON.stringify(all[i]).slice(0, 400)}; reference ${JSON.stringify(ref.outputs[i]).slice(0, 200)}; brute ${JSON.stringify(brute.outputs[i]).slice(0, 200)}` }
    }
    // Keep only inputs the reference answered (a crash on an input means the input is invalid for it)
    const keep = all.map((args, i) => ({ args, expected: ref.outputs[i] })).filter((t): t is { args: Json[]; expected: Json } => t.expected !== undefined)
    if (keep.length < Math.min(20, all.length)) return { ok: false as const, why: `Reference solution crashed on ${all.length - keep.length} inputs` }
    if (agreed < Math.min(8, keep.length)) return { ok: false as const, why: 'Brute force could not confirm enough answers' }
    return { ok: true as const, examples: keep.slice(0, examples.length).map((t, j) => ({ ...t, explain: examples[j]?.explain })), tests: keep.slice(examples.length) }
  }

  let result = await verify()
  if (!result.ok) {
    // 3. One repair round with the concrete failure
    onStep('repair', result.why.split('\n')[0])
    spec = await longJson<Spec>(
      `This judge problem failed verification.\nProblem facts:\n${JSON.stringify(facts)}\n\nPrevious spec:\n${JSON.stringify(spec).slice(0, 30000)}\n\nFailure:\n${result.why}\n\nFix the solutions and/or test inputs (both solutions must be correct and agree). ${SPEC_RULES}\n\n${SPEC_SHAPE}`,
      signal,
    )
    const bad2 = checkSpec(spec)
    if (bad2) throw new Error(`This one cannot run on our judge (${bad2}). Try another problem.`)
    result = await verify()
    if (!result.ok) throw new Error(`Verification failed: ${result.why.split('\n')[0]}`)
  }

  const difficulty = spec.difficulty
  const id = spec.lc ? `lc-${spec.lc}` : `ai-${slugify(spec.title)}`
  onStep('save')
  return {
    id,
    title: spec.title,
    topic: spec.topic,
    difficulty,
    points: POINTS[difficulty],
    lc: spec.lc ?? null,
    tags: Array.isArray(spec.tags) ? spec.tags.slice(0, 5) : [],
    order: 0,
    statement: spec.statement,
    constraints: spec.constraints ?? [],
    hints: { en: spec.hints?.en ?? [], hi: spec.hints?.hi ?? spec.hints?.en ?? [] },
    signature: spec.signature,
    compare: spec.compare,
    starter: starterCode(spec.signature),
    examples: result.examples,
    tests: result.tests,
    solution: { approach: spec.approach ?? { en: '', hi: '' }, cpp: spec.reference_cpp },
    ai: true,
    sources,
  }
}
