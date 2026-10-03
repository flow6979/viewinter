export default {
  id: 'network-delay-time',
  title: 'Network Delay Time',
  lc: 743,
  topic: '13-graphs',
  order: 5,
  difficulty: 'medium',
  tags: ['dijkstra', 'shortest path', 'heap'],
  statement: {
    hi: '`n` nodes ka network hai, `1` se `n` tak labelled. `times[i] = [u, v, w]` ek directed edge hai: signal ko `u` se `v` tak jaane me `w` time lagta hai. Node `k` se signal bheja jaata hai. Saare `n` nodes tak signal pahunchne ka **minimum time** return karo; agar koi node tak na pahunch sake to `-1`.',
    en: 'There is a network of `n` nodes labelled `1` to `n`. `times[i] = [u, v, w]` is a directed edge: a signal takes `w` time to travel from `u` to `v`. A signal is sent from node `k`. Return the **minimum time** for all `n` nodes to receive it, or `-1` if some node can never receive it.',
  },
  constraints: ['1 ≤ k ≤ n ≤ 100', '0 ≤ times.length ≤ 6000', '1 ≤ u, v ≤ n, u ≠ v', '0 ≤ w ≤ 100', 'All (u, v) pairs are unique'],
  hints: {
    hi: ['Har node tak signal sabse jaldi kab pahunchta hai? Yeh single-source shortest path hai.', 'Weights non-negative hain, to Dijkstra (min-heap). Answer = saari distances ka maximum.'],
    en: ['When does the signal reach each node at the earliest? That is single-source shortest path.', 'Weights are non-negative, so use Dijkstra with a min-heap. The answer is the maximum of all distances.'],
  },
  signature: { fn: 'networkDelayTime', params: [{ name: 'times', type: 'vector<vector<int>>' }, { name: 'n', type: 'int' }, { name: 'k', type: 'int' }], ret: 'int' },
  examples: [
    { args: [[[2, 1, 1], [2, 3, 1], [3, 4, 1]], 4, 2] },
    { args: [[[1, 2, 1]], 2, 1] },
    { args: [[[1, 2, 1]], 2, 2], explain: { hi: 'Node 2 se node 1 tak koi edge nahi hai.', en: 'There is no edge from node 2 back to node 1.' } },
  ],
  edge: [[[], 1, 1], [[[1, 2, 0]], 2, 1], [[[1, 2, 5], [1, 3, 1], [3, 2, 1]], 3, 1], [[[1, 2, 1], [2, 3, 1]], 4, 1], [[[1, 2, 100], [2, 1, 100]], 2, 2]],
  solve(times, n, k) {
    const dist = new Array(n + 1).fill(Infinity)
    dist[k] = 0
    // Bellman-Ford style relaxation is plenty fast for n ≤ 100
    for (let it = 0; it < n; it++) {
      let changed = false
      for (const [u, v, w] of times) if (dist[u] + w < dist[v]) (dist[v] = dist[u] + w), (changed = true)
      if (!changed) break
    }
    let ans = 0
    for (let i = 1; i <= n; i++) ans = Math.max(ans, dist[i])
    return ans === Infinity ? -1 : ans
  },
  generate(r) {
    const n = r.int(1, r.bool() ? 8 : 100)
    const m = r.int(n === 1 ? 0 : 1, Math.min(n * (n - 1), r.bool() ? n * 2 : n * 8))
    const seen = new Set(), times = []
    for (let t = 0; t < m * 4 && times.length < m; t++) {
      const u = r.int(1, n), v = r.int(1, n)
      if (u === v || seen.has(`${u},${v}`)) continue
      seen.add(`${u},${v}`)
      times.push([u, v, r.int(0, 100)])
    }
    return [times, n, r.int(1, n)]
  },
  solution: {
    approach: {
      hi: 'Dijkstra: `dist[k] = 0`, min-heap me `(dist, node)` rakho. Sabse chhoti distance wala node nikalo (stale entries skip), aur uske outgoing edges relax karo. End me koi node `INF` pe hai to -1, warna sabse badi distance. O(E log V).',
      en: 'Dijkstra: set `dist[k] = 0` and keep `(dist, node)` pairs in a min-heap. Pop the closest node (skip stale entries) and relax its outgoing edges. If any node is still `INF` at the end, return -1; otherwise return the largest distance. O(E log V).',
    },
    cpp: `class Solution {
public:
    int networkDelayTime(vector<vector<int>>& times, int n, int k) {
        vector<vector<pair<int, int>>> adj(n + 1);
        for (auto& t : times) adj[t[0]].push_back({t[1], t[2]});
        const int INF = INT_MAX;
        vector<int> dist(n + 1, INF);
        priority_queue<pair<int, int>, vector<pair<int, int>>, greater<>> pq;
        dist[k] = 0;
        pq.push({0, k});
        while (!pq.empty()) {
            auto [d, u] = pq.top(); pq.pop();
            if (d > dist[u]) continue;
            for (auto [v, w] : adj[u])
                if (d + w < dist[v]) {
                    dist[v] = d + w;
                    pq.push({dist[v], v});
                }
        }
        int ans = 0;
        for (int i = 1; i <= n; i++) {
            if (dist[i] == INF) return -1;
            ans = max(ans, dist[i]);
        }
        return ans;
    }
};`,
  },
}
