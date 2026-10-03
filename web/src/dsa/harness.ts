// LeetCode-style harness: the user writes `class Solution { ... }`, we add the includes before it and a
// main() after it that reads every test case from stdin, calls the function and prints one JSON line per test.
// Shared by the site (runner.ts) and the build script (scripts/build-dsa.mjs), so keep it plain TypeScript.

export type DsaType =
  | 'int'
  | 'long long'
  | 'double'
  | 'bool'
  | 'char'
  | 'string'
  | 'vector<int>'
  | 'vector<long long>'
  | 'vector<double>'
  | 'vector<bool>'
  | 'vector<char>'
  | 'vector<string>'
  | 'vector<vector<int>>'
  | 'vector<vector<char>>'
  | 'vector<vector<string>>'
  | 'TreeNode*'
  | 'ListNode*'
  | 'void'

export interface Param {
  name: string
  type: DsaType
}

export interface Signature {
  fn: string
  params: Param[]
  ret: DsaType
  /** for void functions that change an argument in place: index of the argument to print */
  mutates?: number
}

export type Json = null | boolean | number | string | Json[]

const SCALAR = new Set(['int', 'long long', 'double', 'bool', 'char', 'string'])

const isVector = (t: string) => t.startsWith('vector<')
const inner = (t: string) => t.slice(7, -1)

/** C++ parameter declaration as written in the starter code */
function cppParam(p: Param): string {
  if (p.type === 'TreeNode*' || p.type === 'ListNode*') return `${p.type} ${p.name}`
  if (SCALAR.has(p.type) && p.type !== 'string') return `${p.type} ${p.name}`
  return `${p.type}& ${p.name}`
}

function defaultReturn(t: DsaType): string {
  if (t === 'void') return ''
  if (t === 'bool') return 'return false;'
  if (t === 'string') return 'return "";'
  if (t === 'char') return "return ' ';"
  if (t === 'TreeNode*' || t === 'ListNode*') return 'return nullptr;'
  if (t.startsWith('vector<')) return 'return {};'
  return 'return 0;'
}

export function starterCode(sig: Signature): string {
  const ret = defaultReturn(sig.ret)
  return `class Solution {
public:
    ${sig.ret} ${sig.fn}(${sig.params.map(cppParam).join(', ')}) {
        // your code here
        ${ret}
    }
};
`
}

export const PRELUDE = `#include <bits/stdc++.h>
using namespace std;
struct ListNode { int val; ListNode *next; ListNode() : val(0), next(nullptr) {} ListNode(int x) : val(x), next(nullptr) {} ListNode(int x, ListNode *n) : val(x), next(n) {} };
struct TreeNode { int val; TreeNode *left; TreeNode *right; TreeNode() : val(0), left(nullptr), right(nullptr) {} TreeNode(int x) : val(x), left(nullptr), right(nullptr) {} TreeNode(int x, TreeNode *l, TreeNode *r) : val(x), left(l), right(r) {} };
`

// Readers and JSON printers, appended after the user's code
const RUNTIME = String.raw`
namespace vi_io {
static string tok() { string s; cin >> s; return s; }
static void rd(int& x) { long long v; cin >> v; x = (int)v; }
static void rd(long long& x) { cin >> x; }
static void rd(double& x) { cin >> x; }
static void rd(bool& x) { int v; cin >> v; x = v != 0; }
static void rd(char& x) { int v; cin >> v; x = (char)v; }
static void rd(string& s) { int n; cin >> n; cin.get(); s.assign(n, ' '); if (n) cin.read(&s[0], n); }
template <class T> static void rd(vector<T>& v) { int n; cin >> n; v.assign(n, T()); for (auto& e : v) { T t; rd(t); e = t; } }
static void rd(vector<bool>& v) { int n; cin >> n; v.assign(n, false); for (int i = 0; i < n; i++) { bool b; rd(b); v[i] = b; } }
static void rd(TreeNode*& root) {
  int n; cin >> n; vector<string> a(n); for (auto& s : a) s = tok();
  if (!n || a[0] == "null") { root = nullptr; return; }
  root = new TreeNode(stoi(a[0])); queue<TreeNode*> q; q.push(root); int i = 1;
  while (!q.empty() && i < n) { TreeNode* c = q.front(); q.pop();
    if (i < n && a[i] != "null") { c->left = new TreeNode(stoi(a[i])); q.push(c->left); } i++;
    if (i < n && a[i] != "null") { c->right = new TreeNode(stoi(a[i])); q.push(c->right); } i++; }
}
static void rd(ListNode*& head) { int n; cin >> n; ListNode d; ListNode* t = &d; for (int i = 0; i < n; i++) { int v; cin >> v; t->next = new ListNode(v); t = t->next; } head = d.next; }

static string js(int x) { return to_string(x); }
static string js(long long x) { return to_string(x); }
static string js(double x) { if (std::isnan(x) || std::isinf(x)) return "null"; ostringstream o; o << fixed << setprecision(6) << x; return o.str(); }
static string js(bool x) { return x ? "true" : "false"; }
static string js(const string& s) { string o = "\""; for (unsigned char c : s) { if (c == '"' || c == '\\') { o += '\\'; o += (char)c; } else if (c == '\n') o += "\\n"; else if (c < 32) o += ' '; else o += (char)c; } return o + "\""; }
static string js(char c) { return js(string(1, c)); }
template <class T> static string js(const vector<T>& v) { string o = "["; for (size_t i = 0; i < v.size(); i++) { if (i) o += ','; o += js((T)v[i]); } return o + "]"; }
static string js(const vector<bool>& v) { string o = "["; for (size_t i = 0; i < v.size(); i++) { if (i) o += ','; o += js((bool)v[i]); } return o + "]"; }
static string js(TreeNode* root) {
  vector<string> out; queue<TreeNode*> q; q.push(root);
  while (!q.empty()) { TreeNode* c = q.front(); q.pop(); if (c) { out.push_back(to_string(c->val)); q.push(c->left); q.push(c->right); } else out.push_back("null"); }
  while (!out.empty() && out.back() == "null") out.pop_back();
  string o = "["; for (size_t i = 0; i < out.size(); i++) { if (i) o += ','; o += out[i]; } return o + "]";
}
static string js(ListNode* h) { string o = "["; bool first = true; int guard = 0; while (h && guard++ < 200000) { if (!first) o += ','; o += to_string(h->val); first = false; h = h->next; } return o + "]"; }
// Canonical text per compare mode (0 exact, 1 unordered, 2 unordered-nested, 3 float): order-free answers are sorted here
static string joinSorted(vector<string> parts) { sort(parts.begin(), parts.end()); string o = "["; for (size_t i = 0; i < parts.size(); i++) { if (i) o += ','; o += parts[i]; } return o + "]"; }
template <class U> static string innerCanon(const vector<U>& w) { vector<string> p; for (size_t i = 0; i < w.size(); i++) p.push_back(js((U)w[i])); return joinSorted(p); }
template <class U> static string innerCanon(const U& x) { return js(x); }
template <class T> static string canon(const T& x, int) { return js(x); }
template <class T> static string canon(const vector<T>& v, int mode) {
  if (mode != 1 && mode != 2) return js(v);
  vector<string> p; for (size_t i = 0; i < v.size(); i++) p.push_back(mode == 2 ? innerCanon((T)v[i]) : js((T)v[i])); return joinSorted(p);
}
// Online judges cap total output (~32 KB), so long answers travel as a fingerprint: FNV-1a 64, length, prefix
static void out(int t, const string& s) {
  cout << "@@" << t << ' ';
  if (s.size() <= VI_LIMIT) { cout << s; return; }
  unsigned long long h = 14695981039346656037ULL; for (unsigned char c : s) { h ^= c; h *= 1099511628211ULL; }
  cout << '#' << hex << h << dec << ' ' << s.size() << ' ' << s.substr(0, 120);
}
}
`

/** Full program: prelude + user code + runtime + main for this signature */
/** full = print every answer in full (used to compute expected outputs from a reference solution) */
export function buildProgram(userCode: string, sig: Signature, compare: Compare = 'exact', full = false): string {
  const mode = { exact: 0, unordered: 1, 'unordered-nested': 2, float: 3 }[compare]
  const decls = sig.params.map((p, i) => `    ${p.type === 'void' ? 'int' : p.type} a${i}; vi_io::rd(a${i});`).join('\n')
  const args = sig.params.map((_, i) => `a${i}`).join(', ')
  const call =
    sig.ret === 'void'
      ? `    sol.${sig.fn}(${args});\n    vi_io::out(t, vi_io::canon(a${sig.mutates ?? 0}, ${mode}));`
      : `    auto res = sol.${sig.fn}(${args});\n    vi_io::out(t, vi_io::canon(res, ${mode}));`
  return `${PRELUDE}
#line 1 "solution.cpp"
${userCode}
#define VI_LIMIT ${full ? '100000000' : '600'}
${RUNTIME}
int main() {
  ios::sync_with_stdio(false); cin.tie(nullptr);
  int T; if (!(cin >> T)) return 0;
  for (int t = 0; t < T; t++) {
    Solution sol;
${decls}
${call}
    cout << '\\n' << flush;
  }
}
`
}

// ---- stdin encoding (mirrors vi_io::rd) ----

function enc(type: DsaType, v: Json): string {
  if (type === 'string') {
    const s = String(v)
    return `${s.length}\n${s}`
  }
  if (type === 'char') return String(String(v).charCodeAt(0))
  if (type === 'bool') return v ? '1' : '0'
  if (type === 'int' || type === 'long long' || type === 'double') return String(v)
  if (type === 'TreeNode*') {
    const a = (v as Json[]) ?? []
    return `${a.length} ${a.map((x) => (x === null ? 'null' : String(x))).join(' ')}`
  }
  if (type === 'ListNode*') {
    const a = (v as Json[]) ?? []
    return `${a.length} ${a.join(' ')}`
  }
  if (isVector(type)) {
    const a = v as Json[]
    const t = inner(type) as DsaType
    return [String(a.length), ...a.map((x) => enc(t, x))].join('\n')
  }
  throw new Error(`Unsupported type ${type}`)
}

/** stdin for many test cases: "T" then each test's arguments */
export function buildInput(sig: Signature, tests: Json[][]): string {
  const parts = [String(tests.length)]
  for (const args of tests) sig.params.forEach((p, i) => parts.push(enc(p.type, args[i])))
  return parts.join('\n') + '\n'
}

// ---- comparing outputs ----

export type Compare = 'exact' | 'unordered' | 'unordered-nested' | 'float'

const key = (v: Json) => JSON.stringify(v)

function normalise(v: Json, mode: Compare): Json {
  if (!Array.isArray(v)) return v
  if (mode === 'unordered-nested') return v.map((x) => (Array.isArray(x) ? [...x].sort((a, b) => (key(a) < key(b) ? -1 : key(a) > key(b) ? 1 : 0)) : x)).sort((a, b) => (key(a) < key(b) ? -1 : key(a) > key(b) ? 1 : 0))
  if (mode === 'unordered') return [...v].sort((a, b) => (key(a) < key(b) ? -1 : key(a) > key(b) ? 1 : 0))
  return v
}

function floatEq(a: Json, b: Json): boolean {
  if (typeof a === 'number' && typeof b === 'number') return Math.abs(a - b) <= 1e-5 * Math.max(1, Math.abs(b))
  if (Array.isArray(a) && Array.isArray(b)) return a.length === b.length && a.every((x, i) => floatEq(x, b[i]))
  return key(a) === key(b)
}

/** A long answer the program sent as a fingerprint instead of the full text */
export interface Fingerprint {
  hash: string
  len: number
  prefix: string
}
export type Got = Json | Fingerprint
export const isFingerprint = (v: unknown): v is Fingerprint => !!v && typeof v === 'object' && !Array.isArray(v) && 'hash' in (v as object)

/** Same text vi_io::js / canon produce in C++ (only used for long answers) */
function cppText(v: Json, dbl: boolean): string {
  if (v === null) return 'null'
  if (typeof v === 'number') return dbl ? v.toFixed(6) : String(v)
  if (typeof v === 'boolean') return v ? 'true' : 'false'
  if (typeof v === 'string') {
    let o = '"'
    for (const ch of v) o += ch === '"' || ch === '\\' ? '\\' + ch : ch === '\n' ? '\\n' : ch.charCodeAt(0) < 32 ? ' ' : ch
    return o + '"'
  }
  return '[' + v.map((x) => cppText(x, dbl)).join(',') + ']'
}
const byteSort = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0)
function canonText(v: Json, mode: Compare, dbl: boolean): string {
  if (!Array.isArray(v) || (mode !== 'unordered' && mode !== 'unordered-nested')) return cppText(v, dbl)
  const parts = v.map((x) => (mode === 'unordered-nested' && Array.isArray(x) ? '[' + x.map((y) => cppText(y, dbl)).sort(byteSort).join(',') + ']' : cppText(x, dbl)))
  return '[' + parts.sort(byteSort).join(',') + ']'
}
function fnv1a(text: string): string {
  let h = 0xcbf29ce484222325n
  for (const b of new TextEncoder().encode(text)) h = ((h ^ BigInt(b)) * 0x100000001b3n) & 0xffffffffffffffffn
  return h.toString(16)
}

export function sameAnswer(got: Got, want: Json, mode: Compare, dbl = false): boolean {
  if (isFingerprint(got)) {
    const text = canonText(want, mode, dbl)
    return text.length === got.len && fnv1a(text) === got.hash
  }
  if (mode === 'float') return floatEq(got, want)
  return key(normalise(got, mode)) === key(normalise(want, mode))
}

/** stdout → result per test (missing = crashed before printing) */
export function parseOutput(stdout: string, count: number): (Got | undefined)[] {
  const out: (Got | undefined)[] = Array(count).fill(undefined)
  for (const line of stdout.split('\n')) {
    const m = line.match(/^@@(\d+) (.*)$/)
    if (!m) continue
    const fp = m[2].match(/^#([0-9a-f]+) (\d+) (.*)$/)
    if (fp) {
      out[Number(m[1])] = { hash: fp[1], len: Number(fp[2]), prefix: fp[3] }
      continue
    }
    try {
      out[Number(m[1])] = JSON.parse(m[2])
    } catch {
      out[Number(m[1])] = m[2]
    }
  }
  return out
}

const TYPES = new Set<string>(['int', 'long long', 'double', 'bool', 'char', 'string', 'vector<int>', 'vector<long long>', 'vector<double>', 'vector<bool>', 'vector<char>', 'vector<string>', 'vector<vector<int>>', 'vector<vector<char>>', 'vector<vector<string>>', 'TreeNode*', 'ListNode*', 'void'])
export const isSupportedType = (t: string): t is DsaType => TYPES.has(t)

/** True when a JSON value fits the C++ type (used to check AI-written test inputs before running them) */
export function fitsType(type: DsaType, v: Json): boolean {
  if (type === 'int') return Number.isInteger(v) && (v as number) <= 2147483647 && (v as number) >= -2147483648
  if (type === 'long long') return Number.isSafeInteger(v)
  if (type === 'double') return typeof v === 'number' && Number.isFinite(v)
  if (type === 'bool') return typeof v === 'boolean'
  if (type === 'char') return typeof v === 'string' && v.length === 1
  if (type === 'string') return typeof v === 'string' && !v.includes('\n')
  if (type === 'TreeNode*') return Array.isArray(v) && v.every((x) => x === null || Number.isInteger(x))
  if (type === 'ListNode*') return Array.isArray(v) && v.every((x) => Number.isInteger(x))
  if (type.startsWith('vector<')) return Array.isArray(v) && v.every((x) => fitsType(inner(type) as DsaType, x))
  return false
}
