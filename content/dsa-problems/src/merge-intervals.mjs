export default {
  id: 'merge-intervals',
  title: 'Merge Intervals',
  lc: 56,
  topic: '08-greedy-intervals',
  order: 2,
  difficulty: 'medium',
  tags: ['sorting', 'intervals'],
  statement: {
    hi: 'Ek array `intervals` diya hai jahan `intervals[i] = [start, end]`. Saare **overlapping** intervals ko merge karo aur bache hue non-overlapping intervals return karo jo saare input ko cover karein. Result ko **start ke badhte order** me return karo. (`[1,4]` aur `[4,5]` overlap maane jaate hain.)',
    en: 'Given an array `intervals` where `intervals[i] = [start, end]`, merge all **overlapping** intervals and return the non-overlapping intervals that cover all the input. Return the result **sorted by start**. (`[1,4]` and `[4,5]` count as overlapping.)',
  },
  constraints: ['1 ≤ intervals.length ≤ 10^4', 'intervals[i].length == 2', '0 ≤ start ≤ end ≤ 10^4'],
  hints: {
    hi: ['Pehle intervals ko start ke hisaab se sort karo.', 'Sorted order me, naya interval sirf last merged interval se hi overlap kar sakta hai.'],
    en: ['Sort the intervals by start first.', 'In sorted order, a new interval can only overlap the last merged interval.'],
  },
  signature: { fn: 'merge', params: [{ name: 'intervals', type: 'vector<vector<int>>' }], ret: 'vector<vector<int>>' },
  examples: [
    { args: [[[1, 3], [2, 6], [8, 10], [15, 18]]], explain: { hi: '[1,3] aur [2,6] overlap karte hain, isliye [1,6] ban jaata hai.', en: '[1,3] and [2,6] overlap, so they merge into [1,6].' } },
    { args: [[[1, 4], [4, 5]]], explain: { hi: '[1,4] aur [4,5] touch karte hain, isliye overlap maane jaate hain.', en: '[1,4] and [4,5] touch, so they count as overlapping.' } },
    { args: [[[4, 7], [1, 4]]] },
  ],
  edge: [
    [[[5, 5]]],
    [[[1, 10], [2, 3], [4, 5]]],
    [[[1, 2], [3, 4], [5, 6]]],
    [[[2, 2], [2, 2], [2, 2]]],
    [[[6, 8], [1, 9], [2, 4], [4, 7]]],
    [[[0, 0], [1, 1]]],
  ],
  solve(intervals) {
    const a = intervals.map((x) => [...x]).sort((p, q) => p[0] - q[0] || p[1] - q[1])
    const out = []
    for (const [s, e] of a) {
      if (out.length && s <= out[out.length - 1][1]) out[out.length - 1][1] = Math.max(out[out.length - 1][1], e)
      else out.push([s, e])
    }
    return out
  },
  generate(r) {
    const n = r.int(1, r.bool() ? 10 : 2000)
    const range = r.pick([20, 200, 10000])
    const maxLen = r.pick([0, 3, 30, 300])
    return [
      Array.from({ length: n }, () => {
        const s = r.int(0, range)
        return [s, Math.min(10000, s + r.int(0, maxLen))]
      }),
    ]
  },
  solution: {
    approach: {
      hi: 'Intervals ko start se sort karo. Phir ek-ek karke dekho: agar current ka start last merged ke end se ≤ hai to end ko max se badha do, warna naya interval push karo. Sort ki wajah se O(n log n) time, O(n) output space.',
      en: 'Sort the intervals by start. Walk through them: if the current start is ≤ the end of the last merged interval, extend that end with max; otherwise push a new interval. O(n log n) time for the sort, O(n) output space.',
    },
    cpp: `class Solution {
public:
    vector<vector<int>> merge(vector<vector<int>>& intervals) {
        sort(intervals.begin(), intervals.end());
        vector<vector<int>> out;
        for (auto& iv : intervals) {
            if (!out.empty() && iv[0] <= out.back()[1])
                out.back()[1] = max(out.back()[1], iv[1]);
            else
                out.push_back(iv);
        }
        return out;
    }
};`,
  },
}
