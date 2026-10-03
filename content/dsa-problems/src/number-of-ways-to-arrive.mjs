const MOD = 1000000007

export default {
  id: 'number-of-ways-to-arrive',
  title: 'Number of Ways to Arrive at Destination',
  lc: 1976,
  topic: '16-dp-on-trees-graphs',
  order: 3,
  difficulty: 'medium',
  tags: ['dijkstra', 'dp', 'shortest path', 'graph'],
  statement: {
    hi: 'Ek city me `n` intersections hain (`0` se `n-1`) aur `roads[i] = [u, v, time]` ek **bidirectional** road hai jise paar karne me `time` lagta hai. Har intersection doosre se pahuncha ja sakta hai. `0` se `n-1` tak **shortest time** wale kitne alag raste hain, return karo. Answer bada ho sakta hai, isliye `10^9 + 7` ka modulo lo.',
    en: 'A city has `n` intersections (`0` to `n-1`) and `roads[i] = [u, v, time]` is a **bidirectional** road that takes `time` to travel. Every intersection is reachable from every other. Return the number of different ways to travel from `0` to `n-1` in the **shortest possible time**, modulo `10^9 + 7`.',
  },
  constraints: ['1 ≤ n ≤ 200', 'n - 1 ≤ roads.length ≤ n·(n-1)/2', 'roads[i] = [u, v, time], 0 ≤ u, v < n, u ≠ v', '1 ≤ time ≤ 10^9', 'At most one road between any two intersections', 'The graph is connected'],
  hints: {
    hi: ['Pehle Dijkstra se `dist[]` nikalo — distances bade ho sakte hain, `long long` use karo.', 'ways[v]: chhota dist mila to ways[v] = ways[u]; barabar dist mila to ways[v] += ways[u] (mod).'],
    en: ['Run Dijkstra for `dist[]` first — distances can be large, use `long long`.', 'ways[v]: on a strictly shorter dist set ways[v] = ways[u]; on an equal dist add ways[u] (mod).'],
  },
  signature: { fn: 'countPaths', params: [{ name: 'n', type: 'int' }, { name: 'roads', type: 'vector<vector<int>>' }], ret: 'int' },
  examples: [
    {
      args: [7, [[0, 6, 7], [0, 1, 2], [1, 2, 3], [1, 3, 3], [6, 3, 3], [3, 5, 1], [6, 5, 1], [2, 5, 1], [0, 4, 5], [4, 6, 2]]],
      explain: { hi: 'Shortest time 7 hai; 4 raste: 0➝6, 0➝4➝6, 0➝1➝2➝5➝6, 0➝1➝3➝5➝6.', en: 'The shortest time is 7, reached by 4 routes: 0➝6, 0➝4➝6, 0➝1➝2➝5➝6, 0➝1➝3➝5➝6.' },
    },
    { args: [2, [[1, 0, 10]]] },
  ],
  edge: [
    [1, []],
    [3, [[0, 1, 1], [1, 2, 1], [0, 2, 2]]],
    [4, [[0, 1, 1], [0, 2, 1], [1, 3, 1], [2, 3, 1]]],
    [3, [[0, 1, 1000000000], [1, 2, 1000000000]]],
  ],
  solve(n, roads) {
    const adj = Array.from({ length: n }, () => [])
    for (const [u, v, t] of roads) adj[u].push([v, t]), adj[v].push([u, t])
    // O(n^2) Dijkstra (n ≤ 200), safe in JS since distances stay below 2^53
    const dist = Array(n).fill(Infinity)
    const ways = Array(n).fill(0)
    const done = Array(n).fill(false)
    dist[0] = 0
    ways[0] = 1
    for (let it = 0; it < n; it++) {
      let u = -1
      for (let v = 0; v < n; v++) if (!done[v] && (u < 0 || dist[v] < dist[u])) u = v
      if (dist[u] === Infinity) break
      done[u] = true
      for (const [v, t] of adj[u]) {
        const d = dist[u] + t
        if (d < dist[v]) (dist[v] = d), (ways[v] = ways[u])
        else if (d === dist[v]) ways[v] = (ways[v] + ways[u]) % MOD
      }
    }
    return ways[n - 1]
  },
  generate(r, i) {
    if (i % 3 === 1) {
      // layered graph: full links between consecutive layers, so the count grows fast and the modulo matters
      const k = r.int(2, 6)
      const layers = r.int(2, Math.floor(198 / k))
      const n = k * layers + 2
      const id = (l, j) => 1 + l * k + j
      const w = r.pick([1, 7, 1000000000])
      const edges = []
      for (let j = 0; j < k; j++) edges.push([0, id(0, j), w], [id(layers - 1, j), n - 1, w])
      for (let l = 0; l + 1 < layers; l++) for (let a = 0; a < k; a++) for (let b = 0; b < k; b++) edges.push([id(l, a), id(l + 1, b), w])
      if (r.bool()) edges[r.int(0, edges.length - 1)][2] += 1 // break a few ties
      return [n, r.shuffle(edges)]
    }
    const n = i % 3 === 0 ? r.int(2, 10) : r.int(2, 200)
    const maxM = (n * (n - 1)) / 2
    const m = Math.min(maxM, r.int(n - 1, Math.min(maxM, n * r.pick([1, 2, 5, 15]))))
    // tiny weights create many ties (lots of shortest paths); sometimes use huge weights
    const hi = r.pick([1, 1, 2, 3, 10, 1000000000])
    const edges = r.connectedEdges(n, m).map(([u, v]) => [u, v, r.int(1, hi)])
    return [n, edges]
  },
  solution: {
    approach: {
      hi: 'Dijkstra ke saath counting DP. `dist[0] = 0, ways[0] = 1`. Edge relax karte waqt: naya dist chhota → `ways[v] = ways[u]`; barabar → `ways[v] += ways[u]`. Node pop hone tak uske saare shortest predecessors process ho chuke hote hain (positive weights). O((n + m) log n) time.',
      en: 'Dijkstra with a counting DP. `dist[0] = 0, ways[0] = 1`. When relaxing an edge: a strictly shorter dist → `ways[v] = ways[u]`; an equal dist → `ways[v] += ways[u]`. With positive weights, every shortest predecessor of a node is finalized before the node is popped. O((n + m) log n) time.',
    },
    cpp: `class Solution {
public:
    int countPaths(int n, vector<vector<int>>& roads) {
        const int MOD = 1e9 + 7;
        vector<vector<pair<int, int>>> adj(n);
        for (auto& e : roads) {
            adj[e[0]].push_back({e[1], e[2]});
            adj[e[1]].push_back({e[0], e[2]});
        }
        vector<long long> dist(n, LLONG_MAX);
        vector<long long> ways(n, 0);
        priority_queue<pair<long long, int>, vector<pair<long long, int>>, greater<>> pq;
        dist[0] = 0, ways[0] = 1;
        pq.push({0, 0});
        while (!pq.empty()) {
            auto [d, u] = pq.top();
            pq.pop();
            if (d > dist[u]) continue;
            for (auto [v, t] : adj[u]) {
                long long nd = d + t;
                if (nd < dist[v]) {
                    dist[v] = nd;
                    ways[v] = ways[u];
                    pq.push({nd, v});
                } else if (nd == dist[v]) {
                    ways[v] = (ways[v] + ways[u]) % MOD;
                }
            }
        }
        return ways[n - 1];
    }
};`,
  },
}
