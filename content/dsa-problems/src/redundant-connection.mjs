export default {
  id: 'redundant-connection',
  title: 'Redundant Connection',
  lc: 684,
  topic: '14-dsu',
  order: 2,
  difficulty: 'medium',
  tags: ['union find', 'dsu', 'cycle detection'],
  statement: {
    hi: 'Ek tree tha jisme `n` nodes (`1` se `n`) the; usme **ek extra edge** add kar di gayi. Ab `edges` (length `n`) undirected graph hai. Woh edge return karo jise hatane se graph phir se `n` nodes ka tree ban jaaye. Agar kai answers hon to woh return karo jo input me **sabse last** aata hai.',
    en: 'A tree with `n` nodes (labelled `1` to `n`) had **one extra edge** added. Now `edges` (length `n`) is an undirected graph. Return an edge that can be removed so the result is a tree of `n` nodes. If there are multiple answers, return the one that occurs **last** in the input.',
  },
  constraints: ['3 ≤ n ≤ 1000', 'edges.length == n', 'edges[i] = [a, b], 1 ≤ a < b ≤ n', 'No repeated edges; the graph is connected'],
  hints: {
    hi: ['Edges ko order me DSU me add karo.', 'Jis edge ke dono ends pehle se same set me hain, wahi cycle banati hai. Kya woh automatically "last" wala answer hai?'],
    en: ['Add the edges to a DSU in input order.', 'The edge whose endpoints are already in the same set closes the cycle. Is that automatically the "last" valid answer?'],
  },
  signature: { fn: 'findRedundantConnection', params: [{ name: 'edges', type: 'vector<vector<int>>' }], ret: 'vector<int>' },
  examples: [
    { args: [[[1, 2], [1, 3], [2, 3]]] },
    { args: [[[1, 2], [2, 3], [3, 4], [1, 4], [1, 5]]], explain: { hi: 'Cycle 1–2–3–4–1 hai; uski edges me se input me sabse last [1, 4] hai.', en: 'The cycle is 1–2–3–4–1; among its edges, [1, 4] appears last in the input.' } },
  ],
  edge: [[[[1, 2], [2, 3], [1, 3]]], [[[2, 3], [1, 3], [1, 2]]], [[[1, 2], [1, 3], [1, 4], [3, 4]]], [[[1, 4], [3, 4], [1, 3], [1, 2], [4, 5]]]],
  solve(edges) {
    const p = [...Array(edges.length + 1).keys()]
    const find = (x) => (p[x] === x ? x : (p[x] = find(p[x])))
    for (const [a, b] of edges) {
      const x = find(a), y = find(b)
      if (x === y) return [a, b]
      p[x] = y
    }
    return []
  },
  generate(r) {
    const n = r.int(3, r.bool() ? 8 : 1000)
    const seen = new Set(), edges = []
    const add = (u, v) => {
      if (u > v) [u, v] = [v, u]
      if (u === v || seen.has(`${u},${v}`)) return false
      seen.add(`${u},${v}`)
      edges.push([u, v])
      return true
    }
    const order = r.shuffle([...Array(n).keys()].map((x) => x + 1))
    // tree: either random parents (bushy) or near-path (long cycles)
    const path = r.bool()
    for (let i = 1; i < n; i++) add(order[i], order[path ? Math.max(0, i - r.int(1, 2)) : r.int(0, i - 1)])
    while (!add(r.int(1, n), r.int(1, n)));
    return [r.shuffle(edges)]
  },
  solution: {
    approach: {
      hi: 'Edges ko input order me DSU me union karo. Jis edge `[a, b]` pe `find(a) == find(b)` ho, woh cycle close karti hai, use return karo. Graph me sirf ek cycle hai, aur yeh edge us cycle ki input me sabse last edge hai (baaki cycle edges pehle aa chuki thi), isliye yahi required answer hai. O(n · α(n)).',
      en: 'Union the edges in input order. The first edge `[a, b]` with `find(a) == find(b)` closes the cycle; return it. The graph has exactly one cycle, and this edge is the last of that cycle’s edges in the input (all the others were already added), so it is the required answer. O(n · α(n)).',
    },
    cpp: `class Solution {
    vector<int> parent;
    int find(int x) { return parent[x] == x ? x : parent[x] = find(parent[x]); }
public:
    vector<int> findRedundantConnection(vector<vector<int>>& edges) {
        int n = edges.size();
        parent.resize(n + 1);
        iota(parent.begin(), parent.end(), 0);
        for (auto& e : edges) {
            int a = find(e[0]), b = find(e[1]);
            if (a == b) return e;
            parent[a] = b;
        }
        return {};
    }
};`,
  },
}
