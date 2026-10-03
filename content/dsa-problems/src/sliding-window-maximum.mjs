export default {
  id: 'sliding-window-maximum',
  title: 'Sliding Window Maximum',
  lc: 239,
  topic: '09-stack-queue-monotonic',
  order: 5,
  difficulty: 'hard',
  tags: ['monotonic deque', 'sliding window'],
  statement: {
    hi: 'Ek integer array `nums` aur window size `k` diya hai. Size `k` ki window left se right ek-ek step khisakti hai. Har position pe window ka **maximum** nikaal ke un sabka array return karo.',
    en: 'Given an integer array `nums` and a window size `k`, a window of size `k` slides from left to right one step at a time. Return an array of the **maximum** of each window position.',
  },
  constraints: ['1 ≤ nums.length ≤ 10^5', '-10^4 ≤ nums[i] ≤ 10^4', '1 ≤ k ≤ nums.length'],
  hints: {
    hi: ['Har window ko scan karna O(nk) hai — kya kuch reuse ho sakta hai?', 'Ek deque me indices rakho jinke values decreasing hon; front hamesha window ka max hoga.'],
    en: ['Rescanning every window is O(nk) — what can you reuse?', 'Keep a deque of indices with decreasing values; its front is always the window maximum.'],
  },
  signature: { fn: 'maxSlidingWindow', params: [{ name: 'nums', type: 'vector<int>' }, { name: 'k', type: 'int' }], ret: 'vector<int>' },
  examples: [{ args: [[1, 3, -1, -3, 5, 3, 6, 7], 3] }, { args: [[1], 1] }],
  edge: [[[5, 4, 3, 2, 1], 1], [[5, 4, 3, 2, 1], 5], [[1, 2, 3, 4, 5], 2], [[2, 2, 2, 2], 3], [[-10000, -10000, 10000], 2], [[9, 11], 2]],
  solve(nums, k) {
    const dq = []
    let head = 0
    const out = []
    for (let i = 0; i < nums.length; i++) {
      while (dq.length > head && nums[dq[dq.length - 1]] <= nums[i]) dq.pop()
      dq.push(i)
      if (dq[head] <= i - k) head++
      if (i >= k - 1) out.push(nums[dq[head]])
    }
    return out
  },
  generate(r) {
    const n = r.int(1, r.bool() ? 10 : 3000)
    const k = r.int(1, r.bool() ? Math.min(n, 5) : n)
    const v = r.pick([3, 100, 10000])
    return [r.array(n, -v, v), k]
  },
  solution: {
    approach: {
      hi: 'Monotonic deque of indices (values decreasing). Naya `i` aane pe peeche se chhote/barabar values pop karo, phir `i` push. Agar front window se bahar (`≤ i - k`) hai to front pop. `i ≥ k - 1` hone par front ka value answer me daalo. O(n) time, O(k) space.',
      en: 'Monotonic deque of indices with decreasing values. For each `i`, pop smaller-or-equal values from the back, then push `i`; pop the front if it fell out of the window (`≤ i - k`). Once `i ≥ k - 1`, the front value is that window’s max. O(n) time, O(k) space.',
    },
    cpp: `class Solution {
public:
    vector<int> maxSlidingWindow(vector<int>& nums, int k) {
        deque<int> dq;
        vector<int> out;
        for (int i = 0; i < (int)nums.size(); i++) {
            while (!dq.empty() && nums[dq.back()] <= nums[i]) dq.pop_back();
            dq.push_back(i);
            if (dq.front() <= i - k) dq.pop_front();
            if (i >= k - 1) out.push_back(nums[dq.front()]);
        }
        return out;
    }
};`,
  },
}
