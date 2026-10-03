export default {
  id: 'product-of-array-except-self',
  title: 'Product of Array Except Self',
  lc: 238,
  topic: '05-arrays-hashing-prefix',
  order: 5,
  difficulty: 'medium',
  tags: ['array', 'prefix product'],
  statement: {
    hi: 'Ek integer array `nums` diya hai. Ek array `answer` return karo jahan `answer[i]` = `nums[i]` ko chhod ke baaki saare elements ka product. **Division use mat karo** aur O(n) me karo. Har product 32-bit int me fit hota hai.',
    en: 'Given an integer array `nums`, return an array `answer` where `answer[i]` is the product of all elements of `nums` except `nums[i]`. Do it in O(n) **without using division**. Every product fits in a 32-bit int.',
  },
  constraints: ['2 ≤ nums.length ≤ 10^5', '-30 ≤ nums[i] ≤ 30', 'Har prefix/suffix product 32-bit int me fit hota hai / Every prefix/suffix product fits in a 32-bit int'],
  hints: {
    hi: ['`answer[i]` = (i ke left ka product) × (i ke right ka product).', 'Pehle left-to-right pass me prefix products bharo, phir right-to-left ek running suffix product se multiply karo.'],
    en: ['`answer[i]` = (product of everything left of i) × (product of everything right of i).', 'Fill prefix products in a left-to-right pass, then multiply by a running suffix product from right to left.'],
  },
  signature: { fn: 'productExceptSelf', params: [{ name: 'nums', type: 'vector<int>' }], ret: 'vector<int>' },
  examples: [
    { args: [[1, 2, 3, 4]], explain: { hi: 'answer[0] = 2·3·4 = 24, answer[1] = 1·3·4 = 12, ...', en: 'answer[0] = 2·3·4 = 24, answer[1] = 1·3·4 = 12, ...' } },
    { args: [[-1, 1, 0, -3, 3]] },
  ],
  edge: [[[2, 3]], [[0, 0]], [[0, 5]], [[-1, -1, -1]], [[1, 1, 1, 1]], [[0, 1, 2, 0, 3]], [[30, -30, 30, 2]]],
  solve(nums) {
    const n = nums.length
    const res = Array(n).fill(1)
    let p = 1
    for (let i = 0; i < n; i++) (res[i] = p), (p *= nums[i])
    p = 1
    for (let i = n - 1; i >= 0; i--) (res[i] *= p), (p *= nums[i])
    return res.map((x) => (x === 0 ? 0 : x))
  },
  // Mostly ±1 with a few larger values so every partial product stays well inside int
  generate(r) {
    const n = r.int(2, r.bool() ? 10 : 3000)
    const nums = Array.from({ length: n }, () => r.pick([1, -1, 1, -1, 1]))
    const big = r.int(0, Math.min(n, 4))
    for (let k = 0; k < big; k++) nums[r.int(0, n - 1)] = r.int(-30, 30)
    if (r.int(0, 3) === 0) nums[r.int(0, n - 1)] = 0
    return [nums]
  },
  solution: {
    approach: {
      hi: 'Pehle pass me `ans[i]` = left prefix product (i se pehle tak). Doosre pass me right se chalte hue `suffix` variable rakho: `ans[i] *= suffix; suffix *= nums[i]`. Division nahi, O(n) time, output ke alawa O(1) space.',
      en: 'First pass: `ans[i]` = product of everything before i. Second pass from the right with a `suffix` variable: `ans[i] *= suffix; suffix *= nums[i]`. No division, O(n) time, O(1) extra space besides the output.',
    },
    cpp: `class Solution {
public:
    vector<int> productExceptSelf(vector<int>& nums) {
        int n = nums.size();
        vector<int> ans(n, 1);
        int prefix = 1;
        for (int i = 0; i < n; i++) {
            ans[i] = prefix;
            prefix *= nums[i];
        }
        int suffix = 1;
        for (int i = n - 1; i >= 0; i--) {
            ans[i] *= suffix;
            suffix *= nums[i];
        }
        return ans;
    }
};`,
  },
}
