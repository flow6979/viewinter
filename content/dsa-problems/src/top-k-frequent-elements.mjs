export default {
  id: 'top-k-frequent-elements',
  title: 'Top K Frequent Elements',
  lc: 347,
  topic: '05-arrays-hashing-prefix',
  order: 6,
  difficulty: 'medium',
  tags: ['hash map', 'bucket sort', 'heap'],
  statement: {
    hi: 'Ek integer array `nums` aur integer `k` diya hai. Sabse zyada baar aane wale `k` elements return karo (kisi bhi order me). Agar do values ki frequency barabar ho to **chhoti value** ko pehle chuno.',
    en: 'Given an integer array `nums` and an integer `k`, return the `k` most frequent elements (in any order). If two values have the same frequency, prefer the **smaller value**.',
  },
  constraints: ['1 ≤ nums.length ≤ 10^5', '-10^4 ≤ nums[i] ≤ 10^4', '1 ≤ k ≤ number of distinct values'],
  hints: {
    hi: ['Pehle `unordered_map` me har value ki frequency gino.', '(frequency desc, value asc) ke hisaab se sort karo aur pehle k lo. Bonus: bucket sort se O(n).'],
    en: ['First count each value\'s frequency in an `unordered_map`.', 'Sort by (frequency desc, value asc) and take the first k. Bonus: bucket sort gives O(n).'],
  },
  signature: { fn: 'topKFrequent', params: [{ name: 'nums', type: 'vector<int>' }, { name: 'k', type: 'int' }], ret: 'vector<int>' },
  compare: 'unordered',
  examples: [
    { args: [[1, 1, 1, 2, 2, 3], 2], explain: { hi: '1 teen baar, 2 do baar.', en: '1 appears three times, 2 twice.' } },
    { args: [[1], 1] },
    { args: [[4, 1, -1, 2, -1, 2, 3], 2], explain: { hi: '-1 aur 2 dono do baar aate hain.', en: '-1 and 2 both appear twice.' } },
  ],
  edge: [[[5, 5, 5], 1], [[1, 2, 3, 4], 2], [[3, 2, 1], 3], [[-10000, 10000, 10000, -10000, 0], 2], [[7, 7, 8, 8, 9], 1]],
  solve(nums, k) {
    const c = new Map()
    for (const x of nums) c.set(x, (c.get(x) ?? 0) + 1)
    return [...c.entries()].sort((a, b) => b[1] - a[1] || a[0] - b[0]).slice(0, k).map((e) => e[0])
  },
  generate(r) {
    const n = r.int(1, r.bool() ? 12 : 3000)
    const range = r.pick([3, 10, 100, 10000])
    const nums = r.array(n, -range, range)
    const d = new Set(nums).size
    return [nums, r.int(1, Math.min(d, r.bool() ? 3 : d))]
  },
  solution: {
    approach: {
      hi: '`unordered_map` me frequency gino. (value, freq) pairs ko vector me daal ke sort karo: freq zyada pehle, barabar ho to chhoti value pehle. Pehle k values return karo. O(n + d log d) time (d = distinct values).',
      en: 'Count frequencies in an `unordered_map`. Put (value, freq) pairs in a vector and sort by higher freq first, then smaller value. Return the first k values. O(n + d log d) time (d = number of distinct values).',
    },
    cpp: `class Solution {
public:
    vector<int> topKFrequent(vector<int>& nums, int k) {
        unordered_map<int, int> cnt;
        for (int x : nums) cnt[x]++;
        vector<pair<int, int>> v(cnt.begin(), cnt.end()); // (value, freq)
        sort(v.begin(), v.end(), [](const pair<int, int>& a, const pair<int, int>& b) {
            if (a.second != b.second) return a.second > b.second;
            return a.first < b.first;
        });
        vector<int> res;
        for (int i = 0; i < k; i++) res.push_back(v[i].first);
        return res;
    }
};`,
  },
}
