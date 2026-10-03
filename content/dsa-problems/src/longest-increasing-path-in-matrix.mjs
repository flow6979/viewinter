export default {
  id: 'longest-increasing-path-in-matrix',
  title: 'Longest Increasing Path in a Matrix',
  lc: 329,
  topic: '16-dp-on-trees-graphs',
  order: 2,
  difficulty: 'hard',
  tags: ['dp', 'memoization', 'dfs', 'dag'],
  statement: {
    hi: 'Ek `m x n` integer `matrix` diya hai. Sabse lambe **strictly increasing path** ki length return karo. Har cell se sirf 4 directions (up, down, left, right) me ja sakte ho — diagonal ya boundary ke bahar nahi.',
    en: 'Given an `m x n` integer `matrix`, return the length of the longest **strictly increasing path**. From each cell you may move in 4 directions (up, down, left, right) — no diagonals and no wrapping around.',
  },
  constraints: ['1 ≤ m, n ≤ 200', '0 ≤ matrix[i][j] ≤ 2^31 - 1'],
  hints: {
    hi: ['Strictly increasing edges ka graph ek DAG hai — cycle possible nahi.', 'Memoized DFS: best(cell) = 1 + max best(neighbour) jahan neighbour bada ho. Har cell ek hi baar compute hoga.'],
    en: ['Edges that go strictly upward form a DAG — no cycles are possible.', 'Memoized DFS: best(cell) = 1 + max best(neighbour) over larger neighbours. Each cell is computed once.'],
  },
  signature: { fn: 'longestIncreasingPath', params: [{ name: 'matrix', type: 'vector<vector<int>>' }], ret: 'int' },
  examples: [
    { args: [[[9, 9, 4], [6, 6, 8], [2, 1, 1]]], explain: { hi: 'Path [1, 2, 6, 9].', en: 'The path is [1, 2, 6, 9].' } },
    { args: [[[3, 4, 5], [3, 2, 6], [2, 2, 1]]], explain: { hi: 'Path [3, 4, 5, 6].', en: 'The path is [3, 4, 5, 6].' } },
    { args: [[[1]]] },
  ],
  edge: [
    [[[7, 7], [7, 7]]],
    [[[1, 2, 3, 4, 5]]],
    [[[5], [4], [3], [2], [1]]],
    [[[1, 2, 3], [8, 9, 4], [7, 6, 5]]],
    [[[0, 2147483647]]],
  ],
  solve(matrix) {
    const m = matrix.length,
      n = matrix[0].length
    const memo = Array.from({ length: m }, () => Array(n).fill(0))
    const D = [[1, 0], [-1, 0], [0, 1], [0, -1]]
    const go = (i, j) => {
      if (memo[i][j]) return memo[i][j]
      let best = 1
      for (const [di, dj] of D) {
        const x = i + di,
          y = j + dj
        if (x >= 0 && y >= 0 && x < m && y < n && matrix[x][y] > matrix[i][j]) best = Math.max(best, 1 + go(x, y))
      }
      return (memo[i][j] = best)
    }
    let ans = 0
    for (let i = 0; i < m; i++) for (let j = 0; j < n; j++) ans = Math.max(ans, go(i, j))
    return ans
  },
  generate(r, i) {
    const big = i % 3 !== 0
    const m = r.int(1, big ? 60 : 5)
    const n = r.int(1, big ? 60 : 5)
    const kind = r.int(0, 3)
    if (kind === 0) {
      // snake: a long path through the whole grid, then a bit of noise
      const g = Array.from({ length: m }, () => Array(n).fill(0))
      let v = 0
      for (let x = 0; x < m; x++) for (let k = 0; k < n; k++) g[x][x % 2 ? n - 1 - k : k] = v++
      for (let t = r.int(0, 5); t > 0; t--) g[r.int(0, m - 1)][r.int(0, n - 1)] = r.int(0, m * n)
      return [g]
    }
    const hi = r.pick([3, 20, 1000, 2147483647])
    return [Array.from({ length: m }, () => r.array(n, 0, hi))]
  },
  solution: {
    approach: {
      hi: 'Har cell ek DAG node hai, edge chhote se bade neighbour ki taraf. `dfs(i, j)` = us cell se shuru hone wala longest path, memo me save. Sab cells pe dfs chalao aur max lo. Har cell aur edge ek baar — O(m·n) time, O(m·n) space.',
      en: 'Each cell is a DAG node with edges from smaller to larger neighbours. `dfs(i, j)` = longest path starting at that cell, cached in a memo. Run dfs from every cell and take the max. Each cell and edge is handled once — O(m·n) time, O(m·n) space.',
    },
    cpp: `class Solution {
    int m, n;
    vector<vector<int>> memo;
    int dfs(vector<vector<int>>& a, int i, int j) {
        if (memo[i][j]) return memo[i][j];
        static const int D[4][2] = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};
        int best = 1;
        for (auto& d : D) {
            int x = i + d[0], y = j + d[1];
            if (x >= 0 && y >= 0 && x < m && y < n && a[x][y] > a[i][j])
                best = max(best, 1 + dfs(a, x, y));
        }
        return memo[i][j] = best;
    }
public:
    int longestIncreasingPath(vector<vector<int>>& matrix) {
        m = matrix.size(), n = matrix[0].size();
        memo.assign(m, vector<int>(n, 0));
        int ans = 0;
        for (int i = 0; i < m; i++)
            for (int j = 0; j < n; j++) ans = max(ans, dfs(matrix, i, j));
        return ans;
    }
};`,
  },
}
