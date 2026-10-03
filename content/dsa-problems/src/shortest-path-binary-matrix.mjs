export default {
  id: 'shortest-path-binary-matrix',
  title: 'Shortest Path in Binary Matrix',
  lc: 1091,
  topic: '13-graphs',
  order: 3,
  difficulty: 'medium',
  tags: ['bfs', 'grid', 'shortest path'],
  statement: {
    hi: 'Ek `n x n` binary matrix `grid` diya hai. Top-left `(0, 0)` se bottom-right `(n-1, n-1)` tak ke **sabse chhote clear path** ki length return karo; path na ho to `-1`. Clear path ke saare cells `0` hone chahiye aur consecutive cells **8 directions** me se kisi me bhi adjacent ho sakte hain. Length = path me visited cells ki count.',
    en: 'Given an `n x n` binary matrix `grid`, return the length of the **shortest clear path** from the top-left `(0, 0)` to the bottom-right `(n-1, n-1)`, or `-1` if none exists. Every cell on a clear path is `0`, and consecutive cells are adjacent in any of the **8 directions**. The length is the number of cells visited.',
  },
  constraints: ['1 ≤ n ≤ 100', 'grid[i][j] is 0 or 1'],
  hints: {
    hi: ['Unweighted grid me shortest path = BFS.', 'Start ya end cell hi 1 ho to seedha -1. Neighbours 8 hain, 4 nahi.'],
    en: ['Shortest path on an unweighted grid means BFS.', 'If the start or end cell is 1, the answer is -1 right away. There are 8 neighbours, not 4.'],
  },
  signature: { fn: 'shortestPathBinaryMatrix', params: [{ name: 'grid', type: 'vector<vector<int>>' }], ret: 'int' },
  examples: [
    { args: [[[0, 1], [1, 0]]], explain: { hi: 'Diagonal move: (0,0) → (1,1), do cells.', en: 'One diagonal move: (0,0) → (1,1), two cells.' } },
    { args: [[[0, 0, 0], [1, 1, 0], [1, 1, 0]]] },
    { args: [[[1, 0, 0], [1, 1, 0], [1, 1, 0]]] },
  ],
  edge: [[[[0]]], [[[1]]], [[[0, 0], [0, 1]]], [[[0, 1], [1, 1]]], [[[0, 0, 0], [0, 0, 0], [0, 0, 0]]]],
  solve(grid) {
    const n = grid.length
    if (grid[0][0] || grid[n - 1][n - 1]) return -1
    const dist = grid.map((row) => row.map(() => 0))
    dist[0][0] = 1
    const q = [[0, 0]]
    for (let h = 0; h < q.length; h++) {
      const [x, y] = q[h]
      if (x === n - 1 && y === n - 1) return dist[x][y]
      for (let dx = -1; dx <= 1; dx++)
        for (let dy = -1; dy <= 1; dy++) {
          const a = x + dx, b = y + dy
          if (a >= 0 && b >= 0 && a < n && b < n && !grid[a][b] && !dist[a][b]) (dist[a][b] = dist[x][y] + 1), q.push([a, b])
        }
    }
    return -1
  },
  generate(r) {
    const n = r.int(1, r.bool() ? 6 : 60)
    const p = r.pick([0.1, 0.25, 0.35, 0.45])
    const g = Array.from({ length: n }, () => Array.from({ length: n }, () => (r.next() < p ? 1 : 0)))
    if (r.int(0, 4)) (g[0][0] = 0), (g[n - 1][n - 1] = 0)
    return [g]
  },
  solution: {
    approach: {
      hi: 'BFS from `(0, 0)` with distance 1, 8 neighbours check karo. BFS pehli baar jab kisi cell tak pahunchta hai woh shortest distance hoti hai, isliye `(n-1, n-1)` milte hi return. Start/end blocked ho ya queue khaali ho jaye to -1. O(n²) time aur space.',
      en: 'BFS from `(0, 0)` with distance 1, exploring all 8 neighbours. BFS reaches each cell first along a shortest path, so return as soon as `(n-1, n-1)` is popped. If the start/end is blocked or the queue empties, return -1. O(n²) time and space.',
    },
    cpp: `class Solution {
public:
    int shortestPathBinaryMatrix(vector<vector<int>>& grid) {
        int n = grid.size();
        if (grid[0][0] || grid[n - 1][n - 1]) return -1;
        vector<vector<int>> dist(n, vector<int>(n, 0));
        queue<pair<int, int>> q;
        q.push({0, 0});
        dist[0][0] = 1;
        while (!q.empty()) {
            auto [x, y] = q.front(); q.pop();
            if (x == n - 1 && y == n - 1) return dist[x][y];
            for (int dx = -1; dx <= 1; dx++)
                for (int dy = -1; dy <= 1; dy++) {
                    int a = x + dx, b = y + dy;
                    if (a >= 0 && b >= 0 && a < n && b < n && !grid[a][b] && !dist[a][b]) {
                        dist[a][b] = dist[x][y] + 1;
                        q.push({a, b});
                    }
                }
        }
        return -1;
    }
};`,
  },
}
