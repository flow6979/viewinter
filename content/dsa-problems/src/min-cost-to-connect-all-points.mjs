export default {
  id: 'min-cost-to-connect-all-points',
  title: 'Min Cost to Connect All Points',
  lc: 1584,
  topic: '14-dsu',
  order: 4,
  difficulty: 'medium',
  tags: ['mst', 'kruskal', 'prim', 'union find'],
  statement: {
    hi: '2D plane pe `points[i] = [x, y]` diye hain. Do points ko jodne ki cost unki **Manhattan distance** `|x1 - x2| + |y1 - y2|` hai. Saare points ko connect karne ki **minimum total cost** return karo, jahan har do points ke beech exactly ek simple path ho.',
    en: 'You are given `points[i] = [x, y]` on a 2D plane. The cost of connecting two points is their **Manhattan distance** `|x1 - x2| + |y1 - y2|`. Return the **minimum total cost** to connect all points so that there is exactly one simple path between any two points.',
  },
  constraints: ['1 ≤ points.length ≤ 1000', '-10^6 ≤ x, y ≤ 10^6', 'All points are distinct'],
  hints: {
    hi: ['Yeh complete graph ka Minimum Spanning Tree hai.', 'Kruskal: saari O(n²) edges sort karke DSU se jodo. Ya dense graph ke liye O(n²) Prim.'],
    en: ['This is the Minimum Spanning Tree of a complete graph.', 'Kruskal: sort all O(n²) edges and join them with a DSU. Or use O(n²) Prim for the dense graph.'],
  },
  signature: { fn: 'minCostConnectPoints', params: [{ name: 'points', type: 'vector<vector<int>>' }], ret: 'int' },
  examples: [
    { args: [[[0, 0], [2, 2], [3, 10], [5, 2], [7, 0]]] },
    { args: [[[3, 12], [-2, 5], [-4, 1]]] },
  ],
  edge: [[[[0, 0]]], [[[-1000000, -1000000], [1000000, 1000000]]], [[[0, 0], [1, 1], [1, 0], [-1, 1]]], [[[1, 1], [1, 2], [1, 3], [1, 4]]]],
  solve(points) {
    const n = points.length
    const best = new Array(n).fill(Infinity), used = new Array(n).fill(false)
    best[0] = 0
    let total = 0
    for (let it = 0; it < n; it++) {
      let u = -1
      for (let i = 0; i < n; i++) if (!used[i] && (u < 0 || best[i] < best[u])) u = i
      used[u] = true
      total += best[u]
      for (let v = 0; v < n; v++) {
        if (used[v]) continue
        const d = Math.abs(points[u][0] - points[v][0]) + Math.abs(points[u][1] - points[v][1])
        if (d < best[v]) best[v] = d
      }
    }
    return total
  },
  generate(r) {
    const n = r.int(1, r.bool() ? 8 : 300)
    const R = r.pick([10, 1000, 1000000])
    const seen = new Set(), pts = []
    while (pts.length < n) {
      const x = r.int(-R, R), y = r.int(-R, R)
      if (!seen.has(`${x},${y}`)) seen.add(`${x},${y}`), pts.push([x, y])
    }
    return [pts]
  },
  solution: {
    approach: {
      hi: 'Kruskal: har pair `(i, j)` ki edge banao (cost = Manhattan distance), cost se sort karo, aur DSU se un edges ko lo jo do alag components jodti hain. `n - 1` edges milte hi ruk jao. Greedy sahi hai kyunki MST ka cut property. O(n² log n) time, O(n²) space.',
      en: 'Kruskal: build an edge for every pair `(i, j)` (cost = Manhattan distance), sort by cost, and take each edge that joins two different DSU components. Stop after `n - 1` edges. The greedy choice is correct by the MST cut property. O(n² log n) time, O(n²) space.',
    },
    cpp: `class Solution {
    vector<int> parent;
    int find(int x) { return parent[x] == x ? x : parent[x] = find(parent[x]); }
public:
    int minCostConnectPoints(vector<vector<int>>& points) {
        int n = points.size();
        vector<array<int, 3>> edges; // cost, i, j
        edges.reserve((size_t)n * (n - 1) / 2);
        for (int i = 0; i < n; i++)
            for (int j = i + 1; j < n; j++)
                edges.push_back({abs(points[i][0] - points[j][0]) + abs(points[i][1] - points[j][1]), i, j});
        sort(edges.begin(), edges.end());
        parent.resize(n);
        iota(parent.begin(), parent.end(), 0);
        int total = 0, taken = 0;
        for (auto& [c, i, j] : edges) {
            if (taken == n - 1) break;
            int a = find(i), b = find(j);
            if (a == b) continue;
            parent[a] = b;
            total += c;
            taken++;
        }
        return total;
    }
};`,
  },
}
