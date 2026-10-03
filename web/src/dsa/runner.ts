// Compiles and runs the user's C++ on Compiler Explorer (godbolt.org: free, CORS-enabled, real g++).
// All test cases go in one run: the harness prints "@@i <json>" per test, so one request judges everything.
import { buildInput, buildProgram, parseOutput, type Compare, type Got, type Json, type Signature } from './harness'

const ENDPOINT = 'https://godbolt.org/api/compiler/g132/compile'

export interface RunResult {
  /** compiler errors (solution.cpp:line:col ...) — nothing ran */
  compileError?: string
  /** stdout parsed per test; undefined = the program died before printing it */
  outputs: (Got | undefined)[]
  stderr: string
  exitCode: number
  timedOut: boolean
  ms?: number
}

const stripAnsi = (s: string) => s.replace(/\x1b\[[0-9;]*[A-Za-z]/g, '')
const lines = (arr?: { text: string }[]) => (arr ?? []).map((l) => stripAnsi(l.text)).join('\n')

export async function runCpp(code: string, sig: Signature, tests: Json[][], compare: Compare, signal?: AbortSignal, full = false): Promise<RunResult & { truncated?: boolean }> {
  const body = {
    source: buildProgram(code, sig, compare, full),
    options: {
      userArguments: '-O2 -std=c++17 -fdiagnostics-color=never',
      executeParameters: { args: [], stdin: buildInput(sig, tests) },
      compilerOptions: { executorRequest: true },
      filters: { execute: true },
      tools: [],
      libraries: [],
    },
    lang: 'c++',
    allowStoreCodeDebug: false,
  }
  let res: Response
  try {
    res = await fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(body), signal })
  } catch (e) {
    if ((e as Error).name === 'AbortError') throw e
    throw new Error('Compiler service tak nahi pahunch paaye. Internet check karo. / Could not reach the compiler service.')
  }
  if (res.status === 429) throw new Error('Compiler busy hai (rate limit). 30 sec baad try karo. / Compiler is rate-limited, try again in 30 seconds.')
  if (!res.ok) throw new Error(`Compiler error ${res.status}`)
  const data = await res.json()
  const build = data.buildResult
  if (build && build.code !== 0) {
    const err = lines(build.stderr) || lines(build.stdout) || 'Compilation failed'
    // Only the user's file matters; drop notes from the harness and the include chain
    const mine = err
      .split('\n')
      .filter((l: string) => !/^In file included|^\s+from /.test(l))
      .join('\n')
    return { compileError: mine.trim(), outputs: Array(tests.length).fill(undefined), stderr: '', exitCode: build.code, timedOut: false }
  }
  return {
    outputs: parseOutput(lines(data.stdout), tests.length),
    stderr: lines(data.stderr),
    exitCode: data.code ?? 0,
    timedOut: !!data.timedOut,
    ms: data.execTime ? Number(data.execTime) : undefined,
    truncated: !!data.truncated,
  }
}

/**
 * Runs a trusted reference solution and returns every answer in full (to compute expected outputs).
 * The judge caps output at ~32 KB, so when a batch gets truncated we split it and try again.
 */
export async function runFull(code: string, sig: Signature, tests: Json[][], signal?: AbortSignal): Promise<{ compileError?: string; outputs: (Json | undefined)[] }> {
  if (!tests.length) return { outputs: [] }
  const res = await runCpp(code, sig, tests, 'exact', signal, true)
  if (res.compileError) return { compileError: res.compileError, outputs: [] }
  if (res.truncated && tests.length > 1) {
    const mid = Math.ceil(tests.length / 2)
    const a = await runFull(code, sig, tests.slice(0, mid), signal)
    if (a.compileError) return a
    const b = await runFull(code, sig, tests.slice(mid), signal)
    return { compileError: b.compileError, outputs: [...a.outputs, ...b.outputs] }
  }
  return { outputs: res.outputs.map((o) => (o && typeof o === 'object' && !Array.isArray(o) ? undefined : (o as Json | undefined))) }
}
