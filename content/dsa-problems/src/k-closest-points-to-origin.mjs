const key = ([x, y]) => x * x + y * y

export default {
  id: 'k-closest-points-to-origin',
  title: 'K Closest Points to Origin',
  lc: 973,
  topic: '12-heaps-priority-queue',
  order: 3,
  difficulty: 'medium',
  tags: ['heap', 'sorting'],
  statement: {
    hi: 'Points ka array `points` (`points[i] = [x, y]`) aur integer `k` diya hai. Origin `(0, 0)` ke **k sabse kareeb** points return karo (Euclidean distance). Answer kisi bhi order me ho sakta hai. Distance barabar ho to **chhota `x`**, phir **chhota `y`** wala point pehle chuno — isse answer unique rehta hai.',
    en: 'Given an array `points` where `points[i] = [x, y]` and an integer `k`, return the **k closest** points to the origin `(0, 0)` (Euclidean distance). You may return them in any order. On equal distance, prefer the point with the **smaller `x`**, then the **smaller `y`** — this keeps the answer unique.',
  },
  constraints: ['1 ≤ k ≤ points.length ≤ 10^4', '-10^4 ≤ x, y ≤ 10^4', 'Ties are broken by (distance, x, y)'],
  hints: {
    hi: ['`sqrt` ki zarurat nahi — `x² + y²` compare karo.', 'Size `k` ka max-heap rakho, key `(dist, x, y)`; bada ho jaaye to top pop karo.'],
    en: ['No need for `sqrt` — compare `x² + y²`.', 'Keep a max-heap of size `k` keyed by `(dist, x, y)`; pop the top when it grows past `k`.'],
  },
  signature: { fn: 'kClosest', params: [{ name: 'points', type: 'vector<vector<int>>' }, { name: 'k', type: 'int' }], ret: 'vector<vector<int>>' },
  compare: 'unordered',
  examples: [
    { args: [[[1, 3], [-2, 2]], 1], explain: { hi: '(1,3) ki distance² 10, (-2,2) ki 8 — isliye [-2,2].', en: 'Squared distance of (1,3) is 10 and of (-2,2) is 8, so [-2,2].' } },
    { args: [[[3, 3], [5, -1], [-2, 4]], 2] },
  ],
  edge: [
    [[[0, 0]], 1],
    [[[1, 0], [0, 1], [-1, 0], [0, -1]], 2],
    [[[3, 4], [-3, 4], [5, 0], [0, -5]], 3],
    [[[2, 2], [2, 2], [1, 1]], 2],
    [[[10000, 10000], [-10000, -10000]], 1],
  ],
  solve(points, k) {
    return [...points].sort((a, b) => key(a) - key(b) || a[0] - b[0] || a[1] - b[1]).slice(0, k)
  },
  generate(r) {
    const n = r.int(1, r.bool() ? 10 : 2000)
    const v = r.pick([3, 20, 10000])
    return [Array.from({ length: n }, () => [r.int(-v, v), r.int(-v, v)]), r.int(1, n)]
  },
  solution: {
    approach: {
      hi: 'Har point ki key `(x² + y², x, y)` banao. Size `k` ka max-heap rakho: push karo, size `k` se zyada ho to top (sabse door) pop karo. Bache `k` points answer hain. O(n log k) time, O(k) space.',
      en: 'Give each point the key `(x² + y², x, y)`. Keep a max-heap of size `k`: push each point and pop the top (the farthest) when the size exceeds `k`. The `k` points left are the answer. O(n log k) time, O(k) space.',
    },
    cpp: `class Solution {
public:
    vector<vector<int>> kClosest(vector<vector<int>>& points, int k) {
        priority_queue<tuple<long long, int, int>> pq; // max-heap on (dist, x, y)
        for (auto& p : points) {
            long long d = 1LL * p[0] * p[0] + 1LL * p[1] * p[1];
            pq.emplace(d, p[0], p[1]);
            if ((int)pq.size() > k) pq.pop();
        }
        vector<vector<int>> out;
        while (!pq.empty()) {
            auto [d, x, y] = pq.top(); pq.pop();
            out.push_back({x, y});
        }
        return out;
    }
};`,
  },
}
