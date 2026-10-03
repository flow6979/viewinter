function combos(candidates, target) {
  const c = [...candidates].sort((a, b) => a - b)
  const out = []
  const cur = []
  const dfs = (start, left) => {
    if (left === 0) return void out.push([...cur])
    for (let i = start; i < c.length && c[i] <= left; i++) {
      cur.push(c[i])
      dfs(i, left - c[i])
      cur.pop()
    }
  }
  dfs(0, target)
  return out
}

export default {
  id: 'combination-sum',
  title: 'Combination Sum',
  lc: 39,
  topic: '10-recursion-backtracking',
  order: 3,
  difficulty: 'medium',
  tags: ['backtracking'],
  statement: {
    hi: '**Distinct** integers ka array `candidates` aur ek `target` diya hai. Aise saare **unique combinations** return karo jinka sum `target` ho. Ek hi number ko **kitni bhi baar** le sakte ho.\n\nDo combinations alag tab hain jab kisi number ki frequency alag ho. Combinations (aur unke andar ke numbers) kisi bhi order me ho sakte hain.',
    en: 'Given an array of **distinct** integers `candidates` and a `target`, return all **unique combinations** of `candidates` that sum to `target`. The same number may be chosen an **unlimited** number of times.\n\nTwo combinations are different if the frequency of at least one number differs. Combinations (and the numbers inside them) may be in any order.',
  },
  constraints: ['1 ≤ candidates.length ≤ 30', '2 ≤ candidates[i] ≤ 40', 'All elements of candidates are distinct', '1 ≤ target ≤ 40', 'The answer has fewer than 150 combinations'],
  hints: {
    hi: ['Duplicates se bachne ke liye combination ko non-decreasing order me banao: recursion me ek `start` index pass karo.', 'Same element dobara lene ke liye recurse `i` se karo, `i + 1` se nahi.', 'Candidates sort karo; jab `candidates[i] > remaining` ho, loop tod do.'],
    en: ['To avoid duplicates, build each combination in non-decreasing order: pass a `start` index into the recursion.', 'To reuse the same element, recurse from `i`, not `i + 1`.', 'Sort the candidates and break once `candidates[i] > remaining`.'],
  },
  signature: { fn: 'combinationSum', params: [{ name: 'candidates', type: 'vector<int>' }, { name: 'target', type: 'int' }], ret: 'vector<vector<int>>' },
  compare: 'unordered-nested',
  examples: [
    { args: [[2, 3, 6, 7], 7], explain: { hi: '2 + 2 + 3 = 7 aur 7 = 7. Bas yahi do combinations hain.', en: '2 + 2 + 3 = 7 and 7 = 7. These are the only two combinations.' } },
    { args: [[2, 3, 5], 8] },
    { args: [[2], 1] },
  ],
  edge: [[[2], 40], [[40], 40], [[39, 40], 1], [[7, 3, 2], 18], [[5, 10, 15, 20], 40]],
  solve: combos,
  generate(r) {
    for (;;) {
      const n = r.int(1, r.bool() ? 6 : 30)
      const cand = r.distinct(n, 2, 40)
      const target = r.int(1, 40)
      if (combos(cand, target).length < 150) return [cand, target]
    }
  },
  solution: {
    approach: {
      hi: 'Candidates sort karo. `dfs(start, remaining)`: `remaining == 0` pe combination save karo; warna `i = start..` har candidate lo aur `dfs(i, remaining - c[i])` call karo (same `i` → reuse allowed). `c[i] > remaining` pe break.\n`start` index ki wajah se har combination sirf ek order me banta hai, isliye duplicates nahi aate. Time output size pe depend karta hai (exponential worst case).',
      en: 'Sort the candidates. `dfs(start, remaining)`: when `remaining == 0` save the combination; otherwise for `i = start..` take candidate `i` and call `dfs(i, remaining - c[i])` (same `i` → reuse allowed). Break when `c[i] > remaining`.\nThe `start` index builds every combination in exactly one order, so no duplicates appear. Time depends on the output size (exponential in the worst case).',
    },
    cpp: `class Solution {
public:
    vector<vector<int>> combinationSum(vector<int>& candidates, int target) {
        sort(candidates.begin(), candidates.end());
        vector<vector<int>> res;
        vector<int> cur;
        dfs(candidates, 0, target, cur, res);
        return res;
    }
private:
    void dfs(const vector<int>& c, int start, int left, vector<int>& cur, vector<vector<int>>& res) {
        if (left == 0) { res.push_back(cur); return; }
        for (int i = start; i < (int)c.size() && c[i] <= left; i++) {
            cur.push_back(c[i]);
            dfs(c, i, left - c[i], cur, res);   // i, not i + 1: reuse allowed
            cur.pop_back();
        }
    }
};`,
  },
}
