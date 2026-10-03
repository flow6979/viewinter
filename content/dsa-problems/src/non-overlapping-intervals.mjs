export default {
  id: 'non-overlapping-intervals',
  title: 'Non-overlapping Intervals',
  lc: 435,
  topic: '08-greedy-intervals',
  order: 3,
  difficulty: 'medium',
  tags: ['greedy', 'sorting', 'intervals'],
  statement: {
    hi: 'Ek array `intervals` diya hai jahan `intervals[i] = [start, end]`. **Kam se kam** kitne intervals hatane padenge taaki baaki sab non-overlapping ho jaayein? (`[1,2]` aur `[2,3]` overlap **nahi** karte.)',
    en: 'Given an array `intervals` where `intervals[i] = [start, end]`, return the **minimum** number of intervals you must remove so that the rest are non-overlapping. (`[1,2]` and `[2,3]` do **not** overlap.)',
  },
  constraints: ['1 ≤ intervals.length ≤ 10^5', '-5·10^4 ≤ start < end ≤ 5·10^4'],
  hints: {
    hi: ['Ulta socho: zyada se zyada kitne non-overlapping intervals rakh sakte ho?', 'End ke hisaab se sort karo aur jo sabse jaldi khatam ho use pehle chuno.'],
    en: ['Flip it: what is the maximum number of non-overlapping intervals you can keep?', 'Sort by end and always keep the one that finishes earliest.'],
  },
  signature: { fn: 'eraseOverlapIntervals', params: [{ name: 'intervals', type: 'vector<vector<int>>' }], ret: 'int' },
  examples: [
    { args: [[[1, 2], [2, 3], [3, 4], [1, 3]]], explain: { hi: '[1,3] hata do, baaki non-overlapping hain.', en: 'Remove [1,3] and the rest are non-overlapping.' } },
    { args: [[[1, 2], [1, 2], [1, 2]]], explain: { hi: 'Do [1,2] hatane padenge.', en: 'You need to remove two [1,2] intervals.' } },
    { args: [[[1, 2], [2, 3]]] },
  ],
  edge: [
    [[[0, 1]]],
    [[[-50000, 50000], [-3, -2], [0, 1], [5, 9]]],
    [[[1, 100], [11, 22], [1, 11], [2, 12]]],
    [[[-2, -1], [-1, 0], [0, 1]]],
    [[[1, 5], [1, 5], [1, 5], [1, 5]]],
  ],
  solve(intervals) {
    const a = [...intervals].sort((p, q) => p[1] - q[1])
    let kept = 0
    let end = -Infinity
    for (const [s, e] of a) {
      if (s >= end) {
        kept++
        end = e
      }
    }
    return intervals.length - kept
  },
  generate(r) {
    const n = r.int(1, r.bool() ? 10 : 2500)
    const range = r.pick([10, 100, 50000])
    const maxLen = r.pick([2, 10, 1000])
    return [
      Array.from({ length: n }, () => {
        const s = r.int(-range, range)
        return [s, Math.min(50000, s + r.int(1, maxLen))]
      }).map(([s, e]) => (s < e ? [s, e] : [s - 1, e])),
    ]
  },
  solution: {
    approach: {
      hi: 'Intervals ko end se sort karo. Greedy: jo interval sabse pehle khatam hota hai use rakho, kyunki wo aage ke liye sabse zyada jagah chhodta hai. Agla interval tabhi rakho jab `start ≥ lastEnd`. Answer = total − kept. O(n log n) time.',
      en: 'Sort intervals by end. Greedily keep the interval that finishes first, since it leaves the most room for the rest; keep the next one only if `start ≥ lastEnd`. Answer = total − kept. O(n log n) time.',
    },
    cpp: `class Solution {
public:
    int eraseOverlapIntervals(vector<vector<int>>& intervals) {
        sort(intervals.begin(), intervals.end(),
             [](const vector<int>& a, const vector<int>& b) { return a[1] < b[1]; });
        int kept = 0;
        long long end = LLONG_MIN;
        for (auto& iv : intervals) {
            if (iv[0] >= end) { kept++; end = iv[1]; }
        }
        return (int)intervals.size() - kept;
    }
};`,
  },
}
