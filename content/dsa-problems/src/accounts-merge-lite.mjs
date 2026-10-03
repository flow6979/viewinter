export default {
  id: 'accounts-merge-lite',
  title: 'Group Sizes After Merging',
  lc: null,
  topic: '14-dsu',
  order: 3,
  difficulty: 'medium',
  tags: ['union find', 'dsu'],
  statement: {
    hi: '`n` user accounts hain, ids `0` se `n - 1`. `pairs[i] = [a, b]` batata hai ki account `a` aur `b` ek hi insaan ke hain (yeh relation transitive hai). Saare same-person accounts ko ek group me merge karo aur har group ka **size** return karo, **ascending order** me sorted.',
    en: 'There are `n` user accounts with ids `0` to `n - 1`. `pairs[i] = [a, b]` says accounts `a` and `b` belong to the same person (the relation is transitive). Merge all accounts of the same person into one group and return the **size** of every group, sorted in **ascending order**.',
  },
  constraints: ['1 ≤ n ≤ 10^5', '0 ≤ pairs.length ≤ 10^5', '0 ≤ a, b < n (a may equal b; pairs may repeat)'],
  hints: {
    hi: ['Har pair pe union karo; DSU me har root ke saath size rakho.', 'End me sirf roots (`find(x) == x`) ke sizes collect karke sort karo.'],
    en: ['Union every pair; keep a size for each DSU root.', 'At the end, collect the sizes of the roots only (`find(x) == x`) and sort them.'],
  },
  signature: { fn: 'groupSizes', params: [{ name: 'n', type: 'int' }, { name: 'pairs', type: 'vector<vector<int>>' }], ret: 'vector<int>' },
  examples: [
    { args: [5, [[0, 1], [1, 2], [3, 4]]], explain: { hi: 'Groups {0, 1, 2} aur {3, 4}: sizes [2, 3].', en: 'Groups {0, 1, 2} and {3, 4}: sizes [2, 3].' } },
    { args: [4, []], explain: { hi: 'Koi merge nahi, har account akela.', en: 'No merges, every account is alone.' } },
    { args: [3, [[0, 2], [2, 0], [1, 1]]] },
  ],
  edge: [[1, []], [1, [[0, 0]]], [2, [[0, 1]]], [6, [[0, 1], [2, 3], [4, 5], [1, 2], [3, 4]]], [7, [[6, 5], [5, 4]]]],
  solve(n, pairs) {
    const p = [...Array(n).keys()]
    const find = (x) => {
      while (p[x] !== x) (p[x] = p[p[x]]), (x = p[x])
      return x
    }
    for (const [a, b] of pairs) {
      const x = find(a), y = find(b)
      if (x !== y) p[x] = y
    }
    const cnt = new Map()
    for (let i = 0; i < n; i++) cnt.set(find(i), (cnt.get(find(i)) ?? 0) + 1)
    return [...cnt.values()].sort((a, b) => a - b)
  },
  generate(r) {
    const n = r.int(1, r.bool() ? 10 : 2500)
    const m = r.int(0, Math.min(3000, r.pick([n / 4, n / 2, n, 2 * n]) | 0))
    const pairs = Array.from({ length: m }, () => [r.int(0, n - 1), r.int(0, n - 1)])
    return [n, pairs]
  },
  solution: {
    approach: {
      hi: 'DSU with union by size + path compression. Har pair `(a, b)` pe union. Phir har root (`find(x) == x`) ka size ek list me daalo aur sort karo. Union operations ~O(α(n)) each, sort O(n log n), total O((n + m) · α(n) + n log n).',
      en: 'DSU with union by size and path compression. Union every pair `(a, b)`. Then push the size of each root (`find(x) == x`) into a list and sort it. Each union is ~O(α(n)), so the total is O((n + m) · α(n) + n log n).',
    },
    cpp: `class Solution {
    vector<int> parent, sz;
    int find(int x) { return parent[x] == x ? x : parent[x] = find(parent[x]); }
public:
    vector<int> groupSizes(int n, vector<vector<int>>& pairs) {
        parent.resize(n);
        sz.assign(n, 1);
        iota(parent.begin(), parent.end(), 0);
        for (auto& p : pairs) {
            int a = find(p[0]), b = find(p[1]);
            if (a == b) continue;
            if (sz[a] < sz[b]) swap(a, b);
            parent[b] = a;
            sz[a] += sz[b];
        }
        vector<int> res;
        for (int i = 0; i < n; i++)
            if (find(i) == i) res.push_back(sz[i]);
        sort(res.begin(), res.end());
        return res;
    }
};`,
  },
}
