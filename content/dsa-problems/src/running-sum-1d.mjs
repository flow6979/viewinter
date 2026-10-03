export default {
  id: 'running-sum-1d',
  title: 'Running Sum of 1d Array',
  lc: 1480,
  topic: '01-cpp-basics',
  order: 1,
  difficulty: 'easy',
  tags: ['array', 'prefix sum'],
  statement: {
    hi: 'Ek integer array `nums` diya hai. Uska **running sum** return karo, jahan `runningSum[i] = nums[0] + nums[1] + ... + nums[i]`.',
    en: 'Given an integer array `nums`, return its **running sum**, where `runningSum[i] = nums[0] + nums[1] + ... + nums[i]`.',
  },
  constraints: ['1 ≤ nums.length ≤ 1000', '-10^6 ≤ nums[i] ≤ 10^6'],
  hints: {
    hi: ['Har index ka answer pichhle index ke answer se kaise juda hai?', 'Ek variable me ab tak ka sum rakho aur har step pe add karo.'],
    en: ['How is the answer at index i related to the answer at index i-1?', 'Keep the sum so far in a variable and add each element to it.'],
  },
  signature: { fn: 'runningSum', params: [{ name: 'nums', type: 'vector<int>' }], ret: 'vector<int>' },
  examples: [
    { args: [[1, 2, 3, 4]], explain: { hi: '[1, 1+2, 1+2+3, 1+2+3+4] = [1, 3, 6, 10]', en: '[1, 1+2, 1+2+3, 1+2+3+4] = [1, 3, 6, 10]' } },
    { args: [[1, 1, 1, 1, 1]] },
    { args: [[3, 1, 2, 10, 1]] },
  ],
  edge: [[[5]], [[-1000000]], [[0, 0, 0]], [[1000000, -1000000, 1000000, -1000000]], [[-3, -2, -1]]],
  solve(nums) {
    let s = 0
    return nums.map((x) => (s += x))
  },
  generate(r) {
    const n = r.int(1, r.bool() ? 10 : 1000)
    const m = r.pick([10, 1000, 1000000])
    return [r.array(n, -m, m)]
  },
  solution: {
    approach: {
      hi: 'Ek variable `sum` me prefix sum rakho. Har element ko add karo aur result me push karo. O(n) time, O(1) extra space (output ke alawa).',
      en: 'Keep a prefix sum in a variable `sum`. Add each element and push the current sum to the result. O(n) time, O(1) extra space besides the output.',
    },
    cpp: `class Solution {
public:
    vector<int> runningSum(vector<int>& nums) {
        vector<int> res;
        int sum = 0;
        for (int x : nums) {
            sum += x;
            res.push_back(sum);
        }
        return res;
    }
};`,
  },
}
