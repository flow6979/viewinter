// exact count with a cap so we only keep grids whose answer fits the LeetCode guarantee (≤ 2·10^9)
const LIMIT = 2000000000
function paths(m, n) {
  const row = Array(n).fill(1)
  for (let i = 1; i < m; i++) for (let j = 1; j < n; j++) row[j] = Math.min(row[j] + row[j - 1], LIMIT + 1)
  return row[n - 1]
}

export default {
  id: 'unique-paths',
  title: 'Unique Paths',
  lc: 62,
  topic: '15-dp',
  order: 3,
  difficulty: 'medium',
  tags: ['dp', 'grid', 'combinatorics'],
  statement: {
    hi: 'Ek `m x n` grid me robot top-left cell pe hai. Wo sirf **right** ya **down** chal sakta hai. Bottom-right cell tak pahunchne ke kitne unique paths hain, return karo.',
    en: 'A robot sits at the top-left cell of an `m x n` grid. It can only move **right** or **down**. Return the number of unique paths to the bottom-right cell.',
  },
  constraints: ['1 ≤ m, n ≤ 100', 'The answer is ≤ 2 · 10^9'],
  hints: {
    hi: ['Cell `(i, j)` pe sirf upar wale ya left wale cell se aa sakte ho.', 'dp[i][j] = dp[i-1][j] + dp[i][j-1]; ek row ka array kaafi hai.'],
    en: ['You can enter cell `(i, j)` only from above or from the left.', 'dp[i][j] = dp[i-1][j] + dp[i][j-1]; a single row array is enough.'],
  },
  signature: { fn: 'uniquePaths', params: [{ name: 'm', type: 'int' }, { name: 'n', type: 'int' }], ret: 'int' },
  examples: [{ args: [3, 7] }, { args: [3, 2], explain: { hi: 'Right→Down→Down, Down→Down→Right, Down→Right→Down.', en: 'Right→Down→Down, Down→Down→Right, Down→Right→Down.' } }],
  edge: [[1, 1], [1, 100], [100, 1], [2, 2], [17, 17], [10, 10]],
  solve(m, n) {
    return paths(m, n)
  },
  generate(r, i) {
    for (;;) {
      const m = i % 2 ? r.int(1, 10) : r.int(1, 100)
      const n = i % 2 ? r.int(1, 10) : r.int(1, 100)
      if (paths(m, n) <= LIMIT) return [m, n]
    }
  },
  solution: {
    approach: {
      hi: 'DP: har cell ke paths = upar wale + left wale ke paths. Pehli row aur column me sab 1. Ek 1D array ko row by row update karo. O(m·n) time, O(n) space. (Combinatorics: C(m+n-2, m-1) bhi chalega.)',
      en: 'DP: paths into a cell = paths into the cell above + the cell to the left. The first row and column are all 1. Update a 1D array row by row. O(m·n) time, O(n) space. (Combinatorics: C(m+n-2, m-1) also works.)',
    },
    cpp: `class Solution {
public:
    int uniquePaths(int m, int n) {
        vector<long long> row(n, 1);
        for (int i = 1; i < m; i++)
            for (int j = 1; j < n; j++) row[j] += row[j - 1];
        return (int)row[n - 1];
    }
};`,
  },
}
