function gen(n, d) {
  const out = []
  const dfs = (s, open, close) => {
    if (s.length === 2 * n) return void out.push(s)
    if (open < n && open - close < d) dfs(s + '(', open + 1, close)
    if (close < open) dfs(s + ')', open, close + 1)
  }
  dfs('', 0, 0)
  return out
}

export default {
  id: 'generate-parentheses',
  title: 'Generate Parentheses',
  lc: 22,
  topic: '10-recursion-backtracking',
  order: 4,
  difficulty: 'medium',
  tags: ['backtracking', 'string'],
  statement: {
    hi: '`n` pairs of parentheses diye hain. Saare **well-formed** (balanced) combinations generate karo jinki **nesting depth `maxDepth` se zyada na ho**. (Depth = kisi bhi point pe khule hue `(` ki sankhya; `maxDepth = n` rakhne pe ye original problem hai.)\n\nStrings kisi bhi order me return kar sakte ho.',
    en: 'Given `n` pairs of parentheses, generate all **well-formed** (balanced) combinations whose **nesting depth does not exceed `maxDepth`**. (Depth = number of currently open `(` at any point; `maxDepth = n` gives the original problem.)\n\nYou may return the strings in any order.',
  },
  constraints: ['1 ≤ n ≤ 8', '1 ≤ maxDepth ≤ n'],
  hints: {
    hi: ['String ko character by character banao; `(` tab daal sakte ho jab `open < n` ho (aur depth limit ke andar ho).', '`)` sirf tab daalo jab `close < open` ho — isse string kabhi invalid nahi banegi.'],
    en: ['Build the string one character at a time; you may add `(` while `open < n` (and the depth limit allows it).', 'Add `)` only when `close < open` — that way the string never becomes invalid.'],
  },
  signature: { fn: 'generateParenthesis', params: [{ name: 'n', type: 'int' }, { name: 'maxDepth', type: 'int' }], ret: 'vector<string>' },
  compare: 'unordered',
  examples: [
    { args: [3, 3], explain: { hi: '`maxDepth = n`, to ye LeetCode wala case hai: 5 strings.', en: '`maxDepth = n`, so this is the LeetCode case: 5 strings.' } },
    { args: [3, 2], explain: { hi: '"((()))" ki depth 3 hai, isliye wo bahar ho gaya.', en: '"((()))" has depth 3, so it is excluded.' } },
    { args: [1, 1] },
  ],
  edge: [[8, 8], [8, 1], [2, 1], [2, 2], [5, 3]],
  solve: gen,
  generate(r) {
    const n = r.int(1, 8)
    return [n, r.bool() ? n : r.int(1, n)]
  },
  solution: {
    approach: {
      hi: 'Backtracking with counts: `dfs(s, open, close)`. `(` add karo agar `open < n` aur `open - close < maxDepth`; `)` add karo agar `close < open`. Length `2n` pe string save karo.\nHar prefix valid rehta hai, isliye koi wasted branch nahi. Time output size ke proportional (Catalan number × n).',
      en: 'Backtracking with counts: `dfs(s, open, close)`. Add `(` if `open < n` and `open - close < maxDepth`; add `)` if `close < open`. Save the string at length `2n`.\nEvery prefix stays valid, so no branch is wasted. Time is proportional to the output size (Catalan number × n).',
    },
    cpp: `class Solution {
public:
    vector<string> generateParenthesis(int n, int maxDepth) {
        vector<string> res;
        string cur;
        dfs(n, maxDepth, 0, 0, cur, res);
        return res;
    }
private:
    void dfs(int n, int d, int open, int close, string& cur, vector<string>& res) {
        if ((int)cur.size() == 2 * n) { res.push_back(cur); return; }
        if (open < n && open - close < d) {
            cur.push_back('(');
            dfs(n, d, open + 1, close, cur, res);
            cur.pop_back();
        }
        if (close < open) {
            cur.push_back(')');
            dfs(n, d, open, close + 1, cur, res);
            cur.pop_back();
        }
    }
};`,
  },
}
