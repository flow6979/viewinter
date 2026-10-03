export default {
  id: 'edit-distance',
  title: 'Edit Distance',
  lc: 72,
  topic: '15-dp',
  order: 9,
  difficulty: 'medium',
  tags: ['dp', 'string'],
  statement: {
    hi: 'Do strings `word1` aur `word2` di hain. `word1` ko `word2` me badalne ke liye **minimum operations** return karo. Allowed operations: ek character **insert**, **delete** ya **replace** karna.',
    en: 'Given two strings `word1` and `word2`, return the **minimum number of operations** to convert `word1` into `word2`. Allowed operations: **insert**, **delete** or **replace** a character.',
  },
  constraints: ['0 ≤ word1.length, word2.length ≤ 500', 'Both strings contain only lowercase English letters'],
  hints: {
    hi: ['dp[i][j] = `word1` ke pehle i chars ko `word2` ke pehle j chars me badalne ka cost.', 'Chars equal → dp[i-1][j-1]. Warna 1 + min(insert dp[i][j-1], delete dp[i-1][j], replace dp[i-1][j-1]).'],
    en: ['dp[i][j] = cost to turn the first i chars of `word1` into the first j chars of `word2`.', 'Equal chars → dp[i-1][j-1]. Otherwise 1 + min(insert dp[i][j-1], delete dp[i-1][j], replace dp[i-1][j-1]).'],
  },
  signature: { fn: 'minDistance', params: [{ name: 'word1', type: 'string' }, { name: 'word2', type: 'string' }], ret: 'int' },
  examples: [
    { args: ['horse', 'ros'], explain: { hi: "horse → rorse ('h' replace 'r') → rose ('r' delete) → ros ('e' delete).", en: "horse → rorse (replace 'h' with 'r') → rose (delete 'r') → ros (delete 'e')." } },
    { args: ['intention', 'execution'] },
  ],
  edge: [['', ''], ['', 'abc'], ['abc', ''], ['a', 'a'], ['a', 'b'], ['abc', 'cba'], ['kitten', 'sitting']],
  solve(a, b) {
    const m = b.length
    let prev = Array.from({ length: m + 1 }, (_, j) => j)
    for (let i = 1; i <= a.length; i++) {
      const cur = [i]
      for (let j = 1; j <= m; j++)
        cur[j] = a[i - 1] === b[j - 1] ? prev[j - 1] : 1 + Math.min(prev[j - 1], prev[j], cur[j - 1])
      prev = cur
    }
    return prev[m]
  },
  generate(r, i) {
    const alpha = r.pick(['ab', 'abc', 'abcdefgh', 'abcdefghijklmnopqrstuvwxyz'])
    const big = i % 3 !== 0
    const a = r.str(r.int(0, big ? 500 : 8), alpha)
    if (r.bool() && a.length) {
      // a similar second word: a few random edits of the first
      let b = a
      for (let k = r.int(1, 10); k > 0; k--) {
        const p = r.int(0, b.length)
        const op = r.int(0, 2)
        if (op === 0) b = b.slice(0, p) + r.str(1, alpha) + b.slice(p)
        else if (op === 1) b = b.slice(0, p) + b.slice(p + 1)
        else b = b.slice(0, p) + r.str(1, alpha) + b.slice(p + 1)
      }
      return [a, b.slice(0, 500)]
    }
    return [a, r.str(r.int(0, big ? 500 : 8), alpha)]
  },
  solution: {
    approach: {
      hi: 'Classic Levenshtein DP. Base: dp[i][0] = i (sab delete), dp[0][j] = j (sab insert). Chars equal ho to diagonal copy, warna 1 + teen neighbours ka min. Ek row rakhna kaafi hai. O(m·n) time, O(n) space.',
      en: 'Classic Levenshtein DP. Base: dp[i][0] = i (delete all), dp[0][j] = j (insert all). Equal chars copy the diagonal, otherwise 1 + the min of the three neighbours. One row is enough. O(m·n) time, O(n) space.',
    },
    cpp: `class Solution {
public:
    int minDistance(string& word1, string& word2) {
        int n = word1.size(), m = word2.size();
        vector<int> prev(m + 1), cur(m + 1);
        for (int j = 0; j <= m; j++) prev[j] = j;
        for (int i = 1; i <= n; i++) {
            cur[0] = i;
            for (int j = 1; j <= m; j++)
                cur[j] = word1[i - 1] == word2[j - 1] ? prev[j - 1]
                                                     : 1 + min({prev[j - 1], prev[j], cur[j - 1]});
            swap(prev, cur);
        }
        return prev[m];
    }
};`,
  },
}
