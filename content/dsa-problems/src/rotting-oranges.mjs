export default {
  id: 'rotting-oranges',
  title: 'Rotting Oranges',
  lc: 994,
  topic: '13-graphs',
  order: 2,
  difficulty: 'medium',
  tags: ['bfs', 'multi-source bfs', 'grid'],
  statement: {
    hi: 'Ek `m x n` grid me `0` = khaali cell, `1` = fresh orange, `2` = rotten orange. Har minute, har rotten orange ke 4-directionally adjacent fresh oranges rotten ho jaate hain. Minimum kitne minutes me koi fresh orange nahi bachega, woh return karo. Agar yeh possible nahi hai to `-1` return karo.',
    en: 'In an `m x n` grid, `0` is an empty cell, `1` a fresh orange and `2` a rotten orange. Every minute, any fresh orange 4-directionally adjacent to a rotten one becomes rotten. Return the minimum number of minutes until no fresh orange remains, or `-1` if that is impossible.',
  },
  constraints: ['1 ≤ m, n ≤ 10', 'grid[i][j] is 0, 1 or 2'],
  hints: {
    hi: ['Saare rotten oranges ek saath failte hain: sabko shuru me hi queue me daalo.', 'BFS level by level chalao; har level = ek minute. End me koi fresh bacha to -1.'],
    en: ['All rotten oranges spread at the same time: put all of them in the queue at the start.', 'Run BFS level by level; each level is one minute. If any fresh orange is left at the end, return -1.'],
  },
  signature: { fn: 'orangesRotting', params: [{ name: 'grid', type: 'vector<vector<int>>' }], ret: 'int' },
  examples: [
    { args: [[[2, 1, 1], [1, 1, 0], [0, 1, 1]]] },
    { args: [[[2, 1, 1], [0, 1, 1], [1, 0, 1]]], explain: { hi: 'Bottom-left wala orange kabhi rotten nahi hoga, kyunki woh kisi se 4-directionally juda nahi hai.', en: 'The bottom-left orange never rots because it is not 4-directionally connected to any other orange.' } },
    { args: [[[0, 2]]], explain: { hi: 'Shuru me hi koi fresh orange nahi hai, to answer 0.', en: 'There are no fresh oranges at minute 0, so the answer is 0.' } },
  ],
  edge: [[[[0]]], [[[1]]], [[[2]]], [[[2, 1, 1, 1, 1, 1]]], [[[1, 1], [1, 1]]], [[[2, 0, 1]]]],
  solve(grid) {
    const m = grid.length, n = grid[0].length
    const g = grid.map((row) => [...row])
    let q = [], fresh = 0
    for (let i = 0; i < m; i++) for (let j = 0; j < n; j++) g[i][j] === 2 ? q.push([i, j]) : g[i][j] === 1 && fresh++
    let minutes = 0
    while (q.length && fresh) {
      const next = []
      for (const [x, y] of q)
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const a = x + dx, b = y + dy
          if (a >= 0 && b >= 0 && a < m && b < n && g[a][b] === 1) (g[a][b] = 2), fresh--, next.push([a, b])
        }
      q = next
      minutes++
    }
    return fresh ? -1 : minutes
  },
  generate(r) {
    const big = !r.bool()
    const m = r.int(1, big ? 40 : 6), n = r.int(1, big ? 40 : 6)
    const empty = r.pick([0.05, 0.15, 0.3]), rotten = r.pick([0.01, 0.05, 0.15])
    return [Array.from({ length: m }, () => Array.from({ length: n }, () => { const x = r.next(); return x < empty ? 0 : x < empty + rotten ? 2 : 1 }))]
  },
  solution: {
    approach: {
      hi: 'Multi-source BFS: shuru me saare rotten oranges queue me daalo aur fresh count karo. Har BFS level ek minute hai; har level me adjacent fresh oranges ko rotten karke next level me daalo. Fresh khatam ya queue khaali hone pe ruko; fresh bache to -1. O(m·n) time aur space.',
      en: 'Multi-source BFS: start with every rotten orange in the queue and count the fresh ones. Each BFS level is one minute; rot the adjacent fresh oranges and push them for the next level. Stop when no fresh remain or the queue empties; if fresh remain, return -1. O(m·n) time and space.',
    },
    cpp: `class Solution {
public:
    int orangesRotting(vector<vector<int>>& grid) {
        int m = grid.size(), n = grid[0].size(), fresh = 0, minutes = 0;
        queue<pair<int, int>> q;
        for (int i = 0; i < m; i++)
            for (int j = 0; j < n; j++) {
                if (grid[i][j] == 2) q.push({i, j});
                else if (grid[i][j] == 1) fresh++;
            }
        int dx[4] = {1, -1, 0, 0}, dy[4] = {0, 0, 1, -1};
        while (!q.empty() && fresh > 0) {
            int sz = q.size();
            while (sz--) {
                auto [x, y] = q.front(); q.pop();
                for (int d = 0; d < 4; d++) {
                    int a = x + dx[d], b = y + dy[d];
                    if (a >= 0 && b >= 0 && a < m && b < n && grid[a][b] == 1) {
                        grid[a][b] = 2;
                        fresh--;
                        q.push({a, b});
                    }
                }
            }
            minutes++;
        }
        return fresh ? -1 : minutes;
    }
};`,
  },
}
