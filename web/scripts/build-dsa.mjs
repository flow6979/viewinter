#!/usr/bin/env node
// Builds the practice problems: content/dsa-problems/src/<id>.mjs  →  content/dsa-problems/<id>.json (+ index.json)
// Each source has a JS reference `solve`, examples, edge cases and a random `generate`; expected outputs come
// from `solve`. `--verify` compiles the C++ editorial solution with the same harness the site uses and runs
// every test locally, so the tests, the harness and the solution are checked against each other.
//
//   node --experimental-strip-types scripts/build-dsa.mjs [--verify] [--only id1,id2]
import { mkdirSync, readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { pathToFileURL } from 'node:url'
import { buildInput, buildProgram, parseOutput, sameAnswer, starterCode } from '../src/dsa/harness.ts'
import { buildList, buildTree, listToArray, makeRng, treeToArray } from './dsa-lib.mjs'

const ROOT = new URL('../../content/dsa-problems/', import.meta.url).pathname
const SRC = join(ROOT, 'src')
const MIN_TESTS = 30
const TARGET_TESTS = 35
const POINTS = { easy: 10, medium: 20, hard: 40 }
const TYPES = new Set(['int', 'long long', 'double', 'bool', 'char', 'string', 'vector<int>', 'vector<long long>', 'vector<double>', 'vector<bool>', 'vector<char>', 'vector<string>', 'vector<vector<int>>', 'vector<vector<char>>', 'vector<vector<string>>', 'TreeNode*', 'ListNode*', 'void'])

const args = process.argv.slice(2)
const verify = args.includes('--verify')
const only = (args.find((a) => a.startsWith('--only='))?.slice(7) ?? (args.includes('--only') ? args[args.indexOf('--only') + 1] : ''))
  .split(',')
  .filter(Boolean)

const clone = (v) => JSON.parse(JSON.stringify(v))
const retIsDouble = (sig) => (sig.ret === 'void' ? sig.params[sig.mutates].type : sig.ret).includes('double')

function toJsArg(type, v) {
  if (type === 'TreeNode*') return buildTree(v)
  if (type === 'ListNode*') return buildList(v)
  return clone(v)
}
function fromJs(type, v) {
  if (type === 'TreeNode*') return treeToArray(v)
  if (type === 'ListNode*') return listToArray(v)
  return v
}

function checkValue(type, v, where) {
  const bad = (msg) => {
    throw new Error(`${where}: ${msg} (type ${type}, value ${JSON.stringify(v)?.slice(0, 80)})`)
  }
  if (type === 'int' || type === 'long long') {
    if (!Number.isInteger(v)) bad('not an integer')
    if (!Number.isSafeInteger(v)) bad('outside the safe integer range')
    if (type === 'int' && (v > 2147483647 || v < -2147483648)) bad('does not fit in int')
  } else if (type === 'double') {
    if (typeof v !== 'number' || !Number.isFinite(v)) bad('not a finite number')
  } else if (type === 'bool') {
    if (typeof v !== 'boolean') bad('not a boolean')
  } else if (type === 'char') {
    if (typeof v !== 'string' || v.length !== 1) bad('not a single character')
  } else if (type === 'string') {
    if (typeof v !== 'string') bad('not a string')
    if (/\n/.test(v)) bad('strings must not contain newlines')
  } else if (type === 'TreeNode*' || type === 'ListNode*') {
    if (!Array.isArray(v)) bad('expected a level-order array')
  } else if (type.startsWith('vector<')) {
    if (!Array.isArray(v)) bad('not an array')
    const t = type.slice(7, -1)
    v.forEach((x, i) => checkValue(t, x, `${where}[${i}]`))
  }
}

async function loadProblem(file) {
  const mod = await import(pathToFileURL(join(SRC, file)).href + `?t=${Date.now()}`)
  return mod.default
}

function validateMeta(p, file) {
  const need = ['id', 'title', 'topic', 'difficulty', 'statement', 'signature', 'solve', 'generate', 'examples', 'solution']
  for (const k of need) if (p[k] === undefined) throw new Error(`${file}: missing "${k}"`)
  if (`${p.id}.mjs` !== file) throw new Error(`${file}: id "${p.id}" must match the file name`)
  if (!POINTS[p.difficulty]) throw new Error(`${file}: difficulty must be easy | medium | hard`)
  if (!p.statement.hi || !p.statement.en) throw new Error(`${file}: statement needs hi and en`)
  const sig = p.signature
  for (const prm of sig.params) if (!TYPES.has(prm.type) || prm.type === 'void') throw new Error(`${file}: unsupported param type ${prm.type}`)
  if (!TYPES.has(sig.ret)) throw new Error(`${file}: unsupported return type ${sig.ret}`)
  if (sig.ret === 'void' && sig.mutates === undefined) throw new Error(`${file}: void functions need signature.mutates`)
  if (!p.solution.cpp || !p.solution.approach?.hi || !p.solution.approach?.en) throw new Error(`${file}: solution needs cpp and approach.hi/en`)
}

function buildTests(p) {
  const sig = p.signature
  const rng = makeRng(p.id)
  const outType = sig.ret === 'void' ? sig.params[sig.mutates].type : sig.ret
  const seen = new Set()
  const tests = []
  const add = (rawArgs, from) => {
    if (rawArgs.length !== sig.params.length) throw new Error(`${p.id}: ${from} has ${rawArgs.length} args, signature has ${sig.params.length}`)
    sig.params.forEach((prm, i) => checkValue(prm.type, rawArgs[i], `${p.id} ${from} arg ${prm.name}`))
    const k = JSON.stringify(rawArgs)
    if (seen.has(k)) return false
    seen.add(k)
    const jsArgs = sig.params.map((prm, i) => toJsArg(prm.type, rawArgs[i]))
    const result = p.solve(...jsArgs)
    const expected = fromJs(outType, sig.ret === 'void' && result === undefined ? jsArgs[sig.mutates] : result)
    checkValue(outType, expected, `${p.id} ${from} expected`)
    tests.push({ args: clone(rawArgs), expected: clone(expected) })
    return true
  }
  const examples = p.examples.map((ex, i) => {
    add(ex.args, `example ${i + 1}`)
    return { ...tests[tests.length - 1], explain: ex.explain }
  })
  for (const [i, e] of (p.edge ?? []).entries()) add(e, `edge ${i + 1}`)
  let guard = 0
  while (tests.length < TARGET_TESTS && guard++ < 2000) add(p.generate(rng, tests.length), `generated ${tests.length}`)
  if (tests.length < MIN_TESTS) throw new Error(`${p.id}: only ${tests.length} unique tests (need ${MIN_TESTS})`)
  const inputSize = buildInput(sig, tests.map((t) => t.args)).length
  if (inputSize > 400_000) throw new Error(`${p.id}: tests are ${Math.round(inputSize / 1000)} KB of input; keep them under 400 KB`)
  return { examples, tests }
}

// Apple clang has no <bits/stdc++.h>; give it one
function shimDir() {
  const dir = join(tmpdir(), 'viewinter-dsa-include', 'bits')
  mkdirSync(dir, { recursive: true })
  const headers = ['algorithm', 'array', 'bitset', 'cassert', 'climits', 'cmath', 'cstdio', 'cstdlib', 'cstring', 'deque', 'functional', 'iomanip', 'iostream', 'iterator', 'list', 'map', 'memory', 'numeric', 'queue', 'set', 'sstream', 'stack', 'string', 'tuple', 'unordered_map', 'unordered_set', 'utility', 'vector', 'limits', 'random', 'chrono', 'cctype']
  writeFileSync(join(dir, 'stdc++.h'), headers.map((h) => `#include <${h}>`).join('\n') + '\n')
  return join(tmpdir(), 'viewinter-dsa-include')
}

function verifyCpp(p, tests) {
  const dir = join(tmpdir(), 'viewinter-dsa-build')
  mkdirSync(dir, { recursive: true })
  const src = join(dir, `${p.id}.cpp`)
  const bin = join(dir, p.id)
  writeFileSync(src, buildProgram(p.solution.cpp, p.signature, p.compare ?? 'exact'))
  execFileSync('clang++', ['-std=c++17', '-O2', '-I', shimDir(), '-o', bin, src], { stdio: ['ignore', 'pipe', 'pipe'] })
  const stdout = execFileSync(bin, { input: buildInput(p.signature, tests.map((t) => t.args)), maxBuffer: 64 * 1024 * 1024, timeout: 20000 }).toString()
  const got = parseOutput(stdout, tests.length)
  const bad = tests.map((t, i) => (sameAnswer(got[i] ?? null, t.expected, p.compare ?? 'exact', retIsDouble(p.signature)) && got[i] !== undefined ? -1 : i)).filter((i) => i >= 0)
  if (bad.length) {
    const i = bad[0]
    throw new Error(`${p.id}: C++ solution disagrees on ${bad.length} test(s); first #${i}\n  args ${JSON.stringify(tests[i].args).slice(0, 200)}\n  want ${JSON.stringify(tests[i].expected).slice(0, 200)}\n  got  ${JSON.stringify(got[i]).slice(0, 200)}`)
  }
}

const files = readdirSync(SRC).filter((f) => f.endsWith('.mjs') && (!only.length || only.includes(f.replace(/\.mjs$/, ''))))
const index = existsSync(join(ROOT, 'index.json')) && only.length ? JSON.parse(readFileSync(join(ROOT, 'index.json'), 'utf8')) : []
let failed = 0
for (const file of files.sort()) {
  try {
    const p = await loadProblem(file)
    validateMeta(p, file)
    const { examples, tests } = buildTests(p)
    if (verify) verifyCpp(p, tests)
    const out = {
      id: p.id,
      title: p.title,
      topic: p.topic,
      difficulty: p.difficulty,
      points: POINTS[p.difficulty],
      lc: p.lc ?? null,
      tags: p.tags ?? [],
      statement: p.statement,
      constraints: p.constraints ?? [],
      hints: p.hints ?? { hi: [], en: [] },
      signature: p.signature,
      compare: p.compare ?? 'exact',
      starter: starterCode(p.signature),
      examples,
      tests,
      solution: p.solution,
    }
    writeFileSync(join(ROOT, `${p.id}.json`), JSON.stringify(out))
    const meta = { id: p.id, title: p.title, topic: p.topic, difficulty: p.difficulty, points: POINTS[p.difficulty], lc: p.lc ?? null, tags: p.tags ?? [], order: p.order ?? 0 }
    const at = index.findIndex((m) => m.id === p.id)
    if (at >= 0) index[at] = meta
    else index.push(meta)
    console.log(`✓ ${p.id} · ${tests.length} tests${verify ? ' · C++ verified' : ''}`)
  } catch (e) {
    failed++
    console.log(`✗ ${file}\n  ${String(e.stderr ?? '').split('\n').slice(0, 12).join('\n  ') || ''}${e.message}\n`)
  }
}
index.sort((a, b) => a.topic.localeCompare(b.topic) || (a.order ?? 0) - (b.order ?? 0) || a.id.localeCompare(b.id))
writeFileSync(join(ROOT, 'index.json'), JSON.stringify(index, null, 1))
console.log(`${files.length - failed}/${files.length} problems built${failed ? `, ${failed} failed` : ''}`)
process.exit(failed ? 1 : 0)
