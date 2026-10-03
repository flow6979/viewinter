export default {
  id: 'cheapest-flights-within-k-stops',
  title: 'Cheapest Flights Within K Stops',
  lc: 787,
  topic: '13-graphs',
  order: 6,
  difficulty: 'medium',
  tags: ['bellman-ford', 'shortest path', 'bfs'],
  statement: {
    hi: '`n` cities hain (`0` se `n - 1`). `flights[i] = [from, to, price]` ek directed flight hai. `src` se `dst` tak ki **sabse sasti** price return karo jisme **zyada se zyada `k` stops** hon (yaani max `k + 1` flights). Aisa route na ho to `-1`.',
    en: 'There are `n` cities numbered `0` to `n - 1`. `flights[i] = [from, to, price]` is a directed flight. Return the **cheapest** price from `src` to `dst` using **at most `k` stops** (that is, at most `k + 1` flights), or `-1` if there is no such route.',
  },
  constraints: ['1 ≤ n ≤ 100', '0 ≤ flights.length ≤ n·(n-1)/2', 'from ≠ to, no duplicate flights', '1 ≤ price ≤ 10^4', '0 ≤ src, dst, k < n, src ≠ dst'],
  hints: {
    hi: ['Normal Dijkstra stops ki limit ko handle nahi karta.', 'Bellman-Ford ko sirf `k + 1` rounds chalao. Har round me pichhle round ki distances ki **copy** se relax karo, taaki ek round me ek hi edge add ho.'],
    en: ['Plain Dijkstra does not respect the stop limit.', 'Run Bellman-Ford for exactly `k + 1` rounds. In each round relax from a **copy** of the previous round’s distances, so a round adds only one edge.'],
  },
  signature: {
    fn: 'findCheapestPrice',
    params: [{ name: 'n', type: 'int' }, { name: 'flights', type: 'vector<vector<int>>' }, { name: 'src', type: 'int' }, { name: 'dst', type: 'int' }, { name: 'k', type: 'int' }],
    ret: 'int',
  },
  examples: [
    { args: [4, [[0, 1, 100], [1, 2, 100], [2, 0, 100], [1, 3, 600], [2, 3, 200]], 0, 3, 1], explain: { hi: '0 → 1 → 3 ki price 700 hai. 0 → 1 → 2 → 3 sasta (400) hai par usme 2 stops hain.', en: '0 → 1 → 3 costs 700. 0 → 1 → 2 → 3 is cheaper (400) but uses 2 stops.' } },
    { args: [3, [[0, 1, 100], [1, 2, 100], [0, 2, 500]], 0, 2, 1] },
    { args: [3, [[0, 1, 100], [1, 2, 100], [0, 2, 500]], 0, 2, 0] },
  ],
  edge: [[2, [], 0, 1, 0], [2, [[0, 1, 5]], 0, 1, 0], [2, [[1, 0, 5]], 0, 1, 1], [3, [[0, 1, 1], [1, 2, 1]], 0, 2, 0], [4, [[0, 1, 1], [1, 2, 1], [2, 3, 1], [0, 3, 10]], 0, 3, 2]],
  solve(n, flights, src, dst, k) {
    let dist = new Array(n).fill(Infinity)
    dist[src] = 0
    for (let i = 0; i <= k; i++) {
      const next = [...dist]
      for (const [u, v, w] of flights) if (dist[u] + w < next[v]) next[v] = dist[u] + w
      dist = next
    }
    return dist[dst] === Infinity ? -1 : dist[dst]
  },
  generate(r) {
    const n = r.int(2, r.bool() ? 8 : 100)
    const maxM = (n * (n - 1)) / 2
    const m = r.int(0, Math.min(maxM, r.bool() ? n * 2 : n * 6))
    const seen = new Set(), flights = []
    for (let t = 0; t < m * 4 && flights.length < m; t++) {
      const u = r.int(0, n - 1), v = r.int(0, n - 1)
      if (u === v || seen.has(`${u},${v}`)) continue
      seen.add(`${u},${v}`)
      flights.push([u, v, r.int(1, r.bool() ? 100 : 10000)])
    }
    const src = r.int(0, n - 1)
    let dst = r.int(0, n - 1)
    if (dst === src) dst = (src + 1) % n
    return [n, flights, src, dst, r.int(0, Math.min(n - 1, r.bool() ? 3 : n - 1))]
  },
  solution: {
    approach: {
      hi: 'Bellman-Ford with limited rounds: `dist[src] = 0`, aur `k + 1` baar saari flights relax karo. Har round pichhle round ki copy se padhta hai, isliye round `i` ke baad `dist[v]` = max `i` flights wala sasta route. End me `dist[dst]` (INF ho to -1). O((k + 1) · E) time, O(n) space.',
      en: 'Bellman-Ford with limited rounds: set `dist[src] = 0` and relax every flight `k + 1` times. Each round reads from a copy of the previous round, so after round `i`, `dist[v]` is the cheapest route using at most `i` flights. Return `dist[dst]` (or -1 if it is INF). O((k + 1) · E) time, O(n) space.',
    },
    cpp: `class Solution {
public:
    int findCheapestPrice(int n, vector<vector<int>>& flights, int src, int dst, int k) {
        const int INF = INT_MAX;
        vector<int> dist(n, INF);
        dist[src] = 0;
        for (int i = 0; i <= k; i++) {
            vector<int> next = dist;
            for (auto& f : flights) {
                int u = f[0], v = f[1], w = f[2];
                if (dist[u] != INF && dist[u] + w < next[v]) next[v] = dist[u] + w;
            }
            dist = next;
        }
        return dist[dst] == INF ? -1 : dist[dst];
    }
};`,
  },
}
