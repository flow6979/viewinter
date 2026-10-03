export default {
  id: 'partition-equal-subset-sum',
  title: 'Partition Equal Subset Sum',
  lc: 416,
  topic: '15-dp',
  order: 8,
  difficulty: 'medium',
  tags: ['dp', '0/1 knapsack', 'subset sum'],
  statement: {
    hi: 'Positive integers ka array `nums` diya hai. Kya isse **do subsets** me baant sakte ho jinka sum barabar ho? `true` ya `false` return karo.',
    en: 'Given an array `nums` of positive integers, return `true` if it can be split into **two subsets** with equal sums, otherwise `false`.',
  },
  constraints: ['1 ≤ nums.length ≤ 200', '1 ≤ nums[i] ≤ 100'],
  hints: {
    hi: ['Total sum odd ho to seedha false.', 'Ab sawal: kya koi subset `sum / 2` bana sakta hai? 0/1 knapsack ki tarah boolean dp, peeche se update karo.'],
    en: ['If the total is odd, the answer is false.', 'Now the question is: can some subset reach `sum / 2`? Use a 0/1-knapsack boolean dp, updating from high to low.'],
  },
  signature: { fn: 'canPartition', params: [{ name: 'nums', type: 'vector<int>' }], ret: 'bool' },
  examples: [
    { args: [[1, 5, 11, 5]], explain: { hi: '[1, 5, 5] aur [11].', en: '[1, 5, 5] and [11].' } },
    { args: [[1, 2, 3, 5]] },
  ],
  edge: [[[1]], [[2, 2]], [[1, 2]], [[100, 100, 100, 100, 100, 100, 100, 100, 100, 99, 1]], [[3, 3, 3, 4, 5]], [[1, 1, 1, 1, 1, 1, 1]]],
  solve(nums) {
    const total = nums.reduce((a, b) => a + b, 0)
    if (total % 2) return false
    const half = total / 2
    const can = Array(half + 1).fill(false)
    can[0] = true
    for (const x of nums) for (let s = half; s >= x; s--) if (can[s - x]) can[s] = true
    return can[half]
  },
  generate(r, i) {
    const n = i % 3 === 0 ? r.int(1, 10) : r.int(1, 200)
    const hi = r.pick([10, 100])
    const a = r.array(n, 1, hi)
    // make the total even about 2/3 of the time so the interesting case appears often
    const total = a.reduce((x, y) => x + y, 0)
    if (total % 2 && r.int(0, 2) > 0) {
      const k = r.int(0, n - 1)
      a[k] = a[k] < hi ? a[k] + 1 : a[k] - 1
      if (a[k] < 1) a[k] = 1
    }
    return [a]
  },
  solution: {
    approach: {
      hi: 'Total odd ho to false. Warna `target = sum / 2` aur boolean `can[s]` = kya koi subset sum `s` bana sakta hai. Har number ke liye `s` ko target se neeche tak loop karo (taaki number ek hi baar use ho). O(n · sum) time, O(sum) space.',
      en: 'If the total is odd, return false. Otherwise `target = sum / 2` and boolean `can[s]` = can some subset reach `s`. For each number, loop `s` downward from target (so each number is used once). O(n · sum) time, O(sum) space.',
    },
    cpp: `class Solution {
public:
    bool canPartition(vector<int>& nums) {
        int total = 0;
        for (int x : nums) total += x;
        if (total % 2) return false;
        int half = total / 2;
        vector<bool> can(half + 1, false);
        can[0] = true;
        for (int x : nums)
            for (int s = half; s >= x; s--)
                if (can[s - x]) can[s] = true;
        return can[half];
    }
};`,
  },
}
