export default {
  id: 'longest-increasing-subsequence',
  title: 'Longest Increasing Subsequence',
  lc: 300,
  topic: '15-dp',
  order: 6,
  difficulty: 'medium',
  tags: ['dp', 'binary search'],
  statement: {
    hi: 'Integer array `nums` diya hai. Sabse lambi **strictly increasing subsequence** ki length return karo. Subsequence me elements ka order wahi rehta hai, beech ke elements hata sakte ho.',
    en: 'Given an integer array `nums`, return the length of the longest **strictly increasing subsequence**. A subsequence keeps the original order but may skip elements.',
  },
  constraints: ['1 ≤ nums.length ≤ 2500', '-10^4 ≤ nums[i] ≤ 10^4'],
  hints: {
    hi: ['O(n²): dp[i] = `i` pe khatam hone wali LIS ki length = 1 + max dp[j] jahan j < i aur nums[j] < nums[i].', 'O(n log n): `tails[k]` = length k+1 wali increasing subsequence ka sabse chhota possible last element; binary search se update karo.'],
    en: ['O(n²): dp[i] = length of the LIS ending at `i` = 1 + max dp[j] over j < i with nums[j] < nums[i].', 'O(n log n): `tails[k]` = smallest possible last element of an increasing subsequence of length k+1; update it with binary search.'],
  },
  signature: { fn: 'lengthOfLIS', params: [{ name: 'nums', type: 'vector<int>' }], ret: 'int' },
  examples: [
    { args: [[10, 9, 2, 5, 3, 7, 101, 18]], explain: { hi: 'Ek LIS hai [2, 3, 7, 101], length 4.', en: 'One LIS is [2, 3, 7, 101], length 4.' } },
    { args: [[0, 1, 0, 3, 2, 3]] },
    { args: [[7, 7, 7, 7, 7, 7, 7]] },
  ],
  edge: [[[5]], [[1, 2, 3, 4, 5]], [[5, 4, 3, 2, 1]], [[-10000, 10000]], [[3, 3, 4, 4, 5, 5]], [[4, 10, 4, 3, 8, 9]]],
  solve(nums) {
    const tails = []
    for (const x of nums) {
      let lo = 0,
        hi = tails.length
      while (lo < hi) {
        const mid = (lo + hi) >> 1
        if (tails[mid] < x) lo = mid + 1
        else hi = mid
      }
      tails[lo] = x
    }
    return tails.length
  },
  generate(r, i) {
    const n = i % 3 === 0 ? r.int(1, 10) : r.int(1, 2500)
    const range = r.pick([5, 100, 10000])
    const a = r.array(n, -range, range)
    if (i % 7 === 3) a.sort((x, y) => x - y)
    return [a]
  },
  solution: {
    approach: {
      hi: 'Patience sorting: `tails` array rakho jahan `tails[k]` = length k+1 ki increasing subsequence ka sabse chhota end. Har `x` ke liye `lower_bound(tails, x)` wali position replace karo (ya end me push). `tails` ki length hi answer hai. O(n log n) time, O(n) space.',
      en: 'Patience sorting: keep `tails`, where `tails[k]` is the smallest tail of an increasing subsequence of length k+1. For each `x`, replace the `lower_bound(tails, x)` position (or append). The size of `tails` is the answer. O(n log n) time, O(n) space.',
    },
    cpp: `class Solution {
public:
    int lengthOfLIS(vector<int>& nums) {
        vector<int> tails;
        for (int x : nums) {
            auto it = lower_bound(tails.begin(), tails.end(), x);
            if (it == tails.end()) tails.push_back(x);
            else *it = x;
        }
        return tails.size();
    }
};`,
  },
}
