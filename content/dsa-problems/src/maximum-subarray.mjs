export default {
  id: 'maximum-subarray',
  title: 'Maximum Subarray',
  lc: 53,
  topic: '05-arrays-hashing-prefix',
  order: 8,
  difficulty: 'medium',
  tags: ['array', 'kadane', 'dp'],
  statement: {
    hi: 'Ek integer array `nums` diya hai. Woh **non-empty subarray** (lagatar elements) dhoondo jiska sum sabse bada ho, aur woh sum return karo.',
    en: 'Given an integer array `nums`, find the **non-empty subarray** (contiguous elements) with the largest sum and return that sum.',
  },
  constraints: ['1 ≤ nums.length ≤ 10^5', '-10^4 ≤ nums[i] ≤ 10^4'],
  hints: {
    hi: ['Index i pe khatam hone wala best sum kya hai? Ya to `nums[i]` akela, ya pichhla best + `nums[i]`.', 'Kadane: `cur = max(nums[i], cur + nums[i])`, aur `best` me max rakho. Sab negative ho tab bhi chalna chahiye.'],
    en: ['What is the best sum of a subarray ending at index i? Either `nums[i]` alone or the previous best + `nums[i]`.', 'Kadane: `cur = max(nums[i], cur + nums[i])`, track the max in `best`. It must work when all numbers are negative.'],
  },
  signature: { fn: 'maxSubArray', params: [{ name: 'nums', type: 'vector<int>' }], ret: 'int' },
  examples: [
    { args: [[-2, 1, -3, 4, -1, 2, 1, -5, 4]], explain: { hi: 'Subarray [4, -1, 2, 1] ka sum 6 hai.', en: 'The subarray [4, -1, 2, 1] has sum 6.' } },
    { args: [[1]] },
    { args: [[5, 4, -1, 7, 8]] },
  ],
  edge: [[[-1]], [[-3, -2, -5]], [[0, 0, 0]], [[10000, -10000, 10000]], [[-10000, 1, -10000]], [[2, -1, 2, -1, 2]]],
  solve(nums) {
    let cur = nums[0]
    let best = nums[0]
    for (let i = 1; i < nums.length; i++) {
      cur = Math.max(nums[i], cur + nums[i])
      best = Math.max(best, cur)
    }
    return best
  },
  generate(r) {
    const n = r.int(1, r.bool() ? 10 : 3000)
    const lo = r.pick([-10000, -100, -10])
    const hi = r.pick([10000, 100, 10, -1])
    return [r.array(n, lo, hi)]
  },
  solution: {
    approach: {
      hi: 'Kadane ka algorithm: `cur` = index i pe khatam hone wala best sum = `max(nums[i], cur + nums[i])`. Agar pichhla sum negative hai to use chhod do aur naya shuru karo. `best` me sabse bada `cur` rakho. O(n) time, O(1) space.',
      en: 'Kadane\'s algorithm: `cur` = best sum ending at i = `max(nums[i], cur + nums[i])`; a negative running sum is dropped and a new subarray starts. Keep the largest `cur` in `best`. O(n) time, O(1) space.',
    },
    cpp: `class Solution {
public:
    int maxSubArray(vector<int>& nums) {
        int cur = nums[0], best = nums[0];
        for (int i = 1; i < (int)nums.size(); i++) {
            cur = max(nums[i], cur + nums[i]);
            best = max(best, cur);
        }
        return best;
    }
};`,
  },
}
