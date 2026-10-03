export default {
  id: 'number-of-islands',
  title: 'Number of Islands',
  lc: 200,
  topic: '13-graphs',
  order: 1,
  difficulty: 'medium',
  tags: ['dfs', 'bfs', 'grid'],
  statement: {
    hi: "Ek `m x n` grid diya hai jisme `'1'` land hai aur `'0'` water. **Islands** ki count return karo. Island un land cells ka group hai jo horizontally ya vertically jude hue hain. Grid ke bahar sab water maano.",
    en: "Given an `m x n` grid where `'1'` is land and `'0'` is water, return the number of **islands**. An island is a group of land cells connected horizontally or vertically. Assume everything outside the grid is water.",
  },
  constraints: ['1 ≤ m, n ≤ 300', "grid[i][j] is '0' or '1'"],
  hints: {
    hi: ['Har unvisited land cell ek naye island ki shuruaat hai.', 'Wahan se DFS/BFS karke poora island visited mark kar do.'],
    en: ['Every unvisited land cell starts a new island.', 'From there, DFS/BFS and mark the whole island visited.'],
  },
  signature: { fn: 'numIslands', params: [{ name: 'grid', type: 'vector<vector<char>>' }], ret: 'int' },
  examples: [
    { args: [[['1', '1', '1', '1', '0'], ['1', '1', '0', '1', '0'], ['1', '1', '0', '0', '0'], ['0', '0', '0', '0', '0']]] },
    {
      args: [[['1', '1', '0', '0', '0'], ['1', '1', '0', '0', '0'], ['0', '0', '1', '0', '0'], ['0', '0', '0', '1', '1']]],
      explain: { hi: 'Teen alag groups: top-left 2x2, beech ka ek cell, aur bottom-right ke do cells.', en: 'Three groups: the top-left 2x2 block, the single middle cell, and the two bottom-right cells.' },
    },
  ],
  edge: [[[['0']]], [[['1']]], [[['1', '0', '1', '0', '1']]], [[['1'], ['0'], ['1']]], [[['1', '0'], ['0', '1']]], [[['1', '1'], ['1', '1']]]],
  solve(grid) {
    const m = grid.length, n = grid[0].length
    const g = grid.map((row) => [...row])
    let count = 0
    for (let i = 0; i < m; i++)
      for (let j = 0; j < n; j++) {
        if (g[i][j] !== '1') continue
        count++
        const st = [[i, j]]
        g[i][j] = '0'
        while (st.length) {
          const [x, y] = st.pop()
          for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
            const a = x + dx, b = y + dy
            if (a >= 0 && b >= 0 && a < m && b < n && g[a][b] === '1') (g[a][b] = '0'), st.push([a, b])
          }
        }
      }
    return count
  },
  generate(r) {
    const big = !r.bool()
    const m = r.int(1, big ? 60 : 6), n = r.int(1, big ? 60 : 6)
    const p = r.pick([0.2, 0.35, 0.5, 0.65, 0.8])
    return [Array.from({ length: m }, () => Array.from({ length: n }, () => (r.next() < p ? '1' : '0')))]
  },
  solution: {
    approach: {
      hi: 'Grid ke har cell pe jao. Agar land mila jo abhi tak visit nahi hua, count++ karo aur DFS/BFS se uska poora island `0` kar do (visited). Har cell ek hi baar process hota hai: O(m·n) time, worst case O(m·n) stack/queue.',
      en: 'Scan every cell. On an unvisited land cell, increment the count and flood-fill (DFS/BFS) its whole island to `0` so it is not counted again. Each cell is processed once: O(m·n) time, O(m·n) worst-case stack/queue.',
    },
    cpp: `class Solution {
public:
    int numIslands(vector<vector<char>>& grid) {
        int m = grid.size(), n = grid[0].size(), count = 0;
        int dx[4] = {1, -1, 0, 0}, dy[4] = {0, 0, 1, -1};
        for (int i = 0; i < m; i++)
            for (int j = 0; j < n; j++) {
                if (grid[i][j] != '1') continue;
                count++;
                queue<pair<int, int>> q;
                q.push({i, j});
                grid[i][j] = '0';
                while (!q.empty()) {
                    auto [x, y] = q.front(); q.pop();
                    for (int d = 0; d < 4; d++) {
                        int a = x + dx[d], b = y + dy[d];
                        if (a >= 0 && b >= 0 && a < m && b < n && grid[a][b] == '1') {
                            grid[a][b] = '0';
                            q.push({a, b});
                        }
                    }
                }
            }
        return count;
    }
};`,
  },
}
