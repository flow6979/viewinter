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

export function starterCode(sig: Signature): string {
  return `class Solution {
public:
    ${sig.ret} ${sig.fn}(${sig.params.map(cppParam).join(', ')}) {
        
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

static void pr(int x) { cout << x; }
static void pr(long long x) { cout << x; }
static void pr(double x) { if (std::isnan(x) || std::isinf(x)) cout << "null"; else cout << fixed << setprecision(6) << x; }
static void pr(bool x) { cout << (x ? "true" : "false"); }
static void pr(const string& s) { cout << '"'; for (unsigned char c : s) { if (c == '"' || c == '\\') cout << '\\' << c; else if (c == '\n') cout << "\\n"; else if (c < 32) cout << ' '; else cout << c; } cout << '"'; }
static void pr(char c) { pr(string(1, c)); }
template <class T> static void pr(const vector<T>& v) { cout << '['; for (size_t i = 0; i < v.size(); i++) { if (i) cout << ','; pr((T)v[i]); } cout << ']'; }
static void pr(const vector<bool>& v) { cout << '['; for (size_t i = 0; i < v.size(); i++) { if (i) cout << ','; pr((bool)v[i]); } cout << ']'; }
static void pr(TreeNode* root) {
  vector<string> out; queue<TreeNode*> q; q.push(root);
  while (!q.empty()) { TreeNode* c = q.front(); q.pop(); if (c) { out.push_back(to_string(c->val)); q.push(c->left); q.push(c->right); } else out.push_back("null"); }
  while (!out.empty() && out.back() == "null") out.pop_back();
  cout << '['; for (size_t i = 0; i < out.size(); i++) { if (i) cout << ','; cout << out[i]; } cout << ']';
}
static void pr(ListNode* h) { cout << '['; bool first = true; int guard = 0; while (h && guard++ < 200000) { if (!first) cout << ','; cout << h->val; first = false; h = h->next; } cout << ']'; }
}
`

/** Full program: prelude + user code + runtime + main for this signature */
export function buildProgram(userCode: string, sig: Signature): string {
  const decls = sig.params.map((p, i) => `    ${p.type === 'void' ? 'int' : p.type} a${i}; vi_io::rd(a${i});`).join('\n')
  const args = sig.params.map((_, i) => `a${i}`).join(', ')
  const call =
    sig.ret === 'void'
      ? `    sol.${sig.fn}(${args});\n    vi_io::pr(a${sig.mutates ?? 0});`
      : `    auto res = sol.${sig.fn}(${args});\n    vi_io::pr(res);`
  return `${PRELUDE}
#line 1 "solution.cpp"
${userCode}
${RUNTIME}
int main() {
  ios::sync_with_stdio(false); cin.tie(nullptr);
  int T; if (!(cin >> T)) return 0;
  for (int t = 0; t < T; t++) {
    Solution sol;
${decls}
    cout << "@@" << t << ' ';
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

export function sameAnswer(got: Json, want: Json, mode: Compare): boolean {
  if (mode === 'float') return floatEq(got, want)
  return key(normalise(got, mode)) === key(normalise(want, mode))
}

/** stdout → result per test (missing = crashed before printing) */
export function parseOutput(stdout: string, count: number): (Json | undefined)[] {
  const out: (Json | undefined)[] = Array(count).fill(undefined)
  for (const line of stdout.split('\n')) {
    const m = line.match(/^@@(\d+) (.*)$/)
    if (!m) continue
    try {
      out[Number(m[1])] = JSON.parse(m[2])
    } catch {
      out[Number(m[1])] = m[2]
    }
  }
  return out
}
