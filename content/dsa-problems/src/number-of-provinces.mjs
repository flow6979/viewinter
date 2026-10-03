export default {
  id: 'number-of-provinces',
  title: 'Number of Provinces',
  lc: 547,
  topic: '14-dsu',
  order: 1,
  difficulty: 'medium',
  tags: ['union find', 'dsu', 'dfs'],
  statement: {
    hi: '`n` cities hain aur ek `n x n` matrix `isConnected` diya hai: `isConnected[i][j] = 1` matlab city `i` aur `j` directly connected hain. Connection transitive hai (a–b aur b–c ho to a, c bhi ek group me). Aise groups ko **province** kehte hain. Total provinces ki count return karo.',
    en: 'There are `n` cities and an `n x n` matrix `isConnected` where `isConnected[i][j] = 1` means cities `i` and `j` are directly connected. Connection is transitive (if a–b and b–c, then a and c are in the same group). Such a group is a **province**. Return the total number of provinces.',
  },
  constraints: ['1 ≤ n ≤ 200', 'isConnected[i][j] is 0 or 1', 'isConnected[i][i] == 1', 'isConnected[i][j] == isConnected[j][i]'],
  hints: {
    hi: ['Har city ek alag set se shuru karti hai.', 'Har `1` wale pair `(i, j)` ko union karo. Jitne successful unions, utne sets kam.'],
    en: ['Every city starts as its own set.', 'Union every pair `(i, j)` with a `1`. Each successful union reduces the number of sets by one.'],
  },
  signature: { fn: 'findCircleNum', params: [{ name: 'isConnected', type: 'vector<vector<int>>' }], ret: 'int' },
  examples: [{ args: [[[1, 1, 0], [1, 1, 0], [0, 0, 1]]] }, { args: [[[1, 0, 0], [0, 1, 0], [0, 0, 1]]] }],
  edge: [[[[1]]], [[[1, 1], [1, 1]]], [[[1, 0], [0, 1]]], [[[1, 0, 1], [0, 1, 1], [1, 1, 1]]]],
  solve(a) {
    const n = a.length
    const p = [...Array(n).keys()]
    const find = (x) => (p[x] === x ? x : (p[x] = find(p[x])))
    let count = n
    for (let i = 0; i < n; i++)
      for (let j = i + 1; j < n; j++)
        if (a[i][j]) {
          const x = find(i), y = find(j)
          if (x !== y) (p[x] = y), count--
        }
    return count
  },
  generate(r) {
    const n = r.int(1, r.bool() ? 8 : 120)
    const prob = r.pick([0.5 / n, 1 / n, 2 / n, 0.2])
    const a = Array.from({ length: n }, () => new Array(n).fill(0))
    for (let i = 0; i < n; i++) {
      a[i][i] = 1
      for (let j = i + 1; j < n; j++) if (r.next() < prob) a[i][j] = a[j][i] = 1
    }
    return [a]
  },
  solution: {
    approach: {
      hi: 'DSU (path compression + union by size). `count = n` se shuru karo; har `isConnected[i][j] = 1` (i < j) pe union karo aur agar dono alag sets me the to `count--`. End me `count` hi provinces hain. O(n² · α(n)).',
      en: 'DSU with path compression and union by size. Start with `count = n`; for each `isConnected[i][j] = 1` with i < j, union the two cities and decrement `count` when they were in different sets. The final `count` is the number of provinces. O(n² · α(n)).',
    },
    cpp: `class Solution {
    vector<int> parent, sz;
    int find(int x) { return parent[x] == x ? x : parent[x] = find(parent[x]); }
    bool unite(int a, int b) {
        a = find(a), b = find(b);
        if (a == b) return false;
        if (sz[a] < sz[b]) swap(a, b);
        parent[b] = a;
        sz[a] += sz[b];
        return true;
    }
public:
    int findCircleNum(vector<vector<int>>& isConnected) {
        int n = isConnected.size(), count = n;
        parent.resize(n);
        sz.assign(n, 1);
        iota(parent.begin(), parent.end(), 0);
        for (int i = 0; i < n; i++)
            for (int j = i + 1; j < n; j++)
                if (isConnected[i][j] && unite(i, j)) count--;
        return count;
    }
};`,
  },
}
