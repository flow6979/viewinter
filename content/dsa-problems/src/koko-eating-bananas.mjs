export default {
  id: 'koko-eating-bananas',
  title: 'Koko Eating Bananas',
  lc: 875,
  topic: '07-binary-search',
  order: 4,
  difficulty: 'medium',
  tags: ['binary search on answer'],
  statement: {
    hi: '`n` dher (piles) me bananas hain, `piles[i]` bananas `i`-th dher me. Koko ek speed `k` (bananas/hour) chunti hai: har ghante woh ek dher se `k` bananas khaati hai; dher me `k` se kam hon to sab kha leti hai aur us ghante aur nahi khaati. Sabse chhota integer `k` return karo jisse woh `h` ghanton me saare bananas kha le.',
    en: 'There are `n` piles of bananas, the `i`-th pile has `piles[i]` bananas. Koko picks an eating speed `k` (bananas per hour): each hour she picks one pile and eats `k` bananas from it; if the pile has fewer than `k`, she eats all of it and nothing more that hour. Return the minimum integer `k` such that she can eat all the bananas within `h` hours.',
  },
  constraints: ['1 ≤ piles.length ≤ 10^4', 'piles.length ≤ h ≤ 10^9', '1 ≤ piles[i] ≤ 10^9'],
  hints: {
    hi: ['Speed `k` pe total ghante = sum of `ceil(piles[i] / k)`. `k` badhne pe ye kabhi nahi badhta.', 'Isliye answer `k` pe binary search karo, range `[1, max(piles)]`.'],
    en: ['At speed `k` the total hours are the sum of `ceil(piles[i] / k)`, which never increases as `k` grows.', 'So binary search on the answer `k` over `[1, max(piles)]`.'],
  },
  signature: { fn: 'minEatingSpeed', params: [{ name: 'piles', type: 'vector<int>' }, { name: 'h', type: 'int' }], ret: 'int' },
  examples: [
    { args: [[3, 6, 7, 11], 8] },
    { args: [[30, 11, 23, 4, 20], 5], explain: { hi: 'Har dher ke liye ek hi ghanta hai, isliye `k` = sabse bada dher = 30.', en: 'One hour per pile, so `k` must be the largest pile, 30.' } },
    { args: [[30, 11, 23, 4, 20], 6] },
  ],
  edge: [[[1], 1], [[1000000000], 2], [[1000000000], 1000000000], [[1, 1, 1, 1], 4], [[1000000000, 1000000000], 3], [[5, 5, 5], 1000000000]],
  solve(piles, h) {
    const hours = (k) => piles.reduce((s, p) => s + Math.ceil(p / k), 0)
    let lo = 1, hi = Math.max(...piles)
    while (lo < hi) {
      const mid = Math.floor((lo + hi) / 2)
      if (hours(mid) <= h) hi = mid
      else lo = mid + 1
    }
    return lo
  },
  generate(r) {
    const n = r.int(1, r.bool() ? 10 : 3000)
    const big = r.bool()
    const piles = r.array(n, 1, big ? 1000000000 : 100)
    const sum = piles.reduce((a, b) => a + b, 0)
    const h = r.int(n, Math.min(1000000000, Math.max(n, r.bool() ? n * 3 : sum)))
    return [piles, h]
  },
  solution: {
    approach: {
      hi: 'Answer pe binary search: `lo = 1`, `hi = max(piles)`. `mid` speed pe ghante gino (`(p + mid - 1) / mid` ka sum, `long long` me). `≤ h` ho to `mid` chal jaayega → `hi = mid`, warna `lo = mid + 1`. O(n log(max)) time, O(1) space.',
      en: 'Binary search on the answer: `lo = 1`, `hi = max(piles)`. Count hours at speed `mid` (sum of `(p + mid - 1) / mid`, in `long long`). If `≤ h`, `mid` works → `hi = mid`, else `lo = mid + 1`. O(n log(max)) time, O(1) space.',
    },
    cpp: `class Solution {
public:
    int minEatingSpeed(vector<int>& piles, int h) {
        int lo = 1, hi = *max_element(piles.begin(), piles.end());
        while (lo < hi) {
            int mid = lo + (hi - lo) / 2;
            long long hours = 0;
            for (int p : piles) hours += (p + (long long)mid - 1) / mid;
            if (hours <= h) hi = mid;
            else lo = mid + 1;
        }
        return lo;
    }
};`,
  },
}
