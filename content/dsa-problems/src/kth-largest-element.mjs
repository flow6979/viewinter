export default {
  id: 'kth-largest-element',
  title: 'Kth Largest Element in an Array',
  lc: 215,
  topic: '12-heaps-priority-queue',
  order: 2,
  difficulty: 'medium',
  tags: ['heap', 'quickselect'],
  statement: {
    hi: 'Ek integer array `nums` aur integer `k` diya hai. Array ka **k-th sabse bada** element return karo — sorted order me k-th bada, k-th distinct nahi. Kya bina poora sort kiye kar sakte ho?',
    en: 'Given an integer array `nums` and an integer `k`, return the **k-th largest** element in the array — the k-th largest in sorted order, not the k-th distinct element. Can you do it without fully sorting?',
  },
  constraints: ['1 ≤ k ≤ nums.length ≤ 10^5', '-10^4 ≤ nums[i] ≤ 10^4'],
  hints: {
    hi: ['Size `k` ka **min-heap** rakho.', 'Heap bada ho jaaye to smallest pop karo; aakhir me top hi answer hai.'],
    en: ['Keep a **min-heap** of size `k`.', 'Pop the smallest whenever it grows past `k`; the top at the end is the answer.'],
  },
  signature: { fn: 'findKthLargest', params: [{ name: 'nums', type: 'vector<int>' }, { name: 'k', type: 'int' }], ret: 'int' },
  examples: [{ args: [[3, 2, 1, 5, 6, 4], 2] }, { args: [[3, 2, 3, 1, 2, 4, 5, 5, 6], 4] }],
  edge: [[[1], 1], [[2, 1], 2], [[7, 7, 7, 7], 3], [[-10000, 10000, 0], 1], [[-1, -2, -3, -4], 4]],
  solve(nums, k) {
    return [...nums].sort((a, b) => b - a)[k - 1]
  },
  generate(r) {
    const n = r.int(1, r.bool() ? 10 : 3000)
    const v = r.pick([5, 100, 10000])
    return [r.array(n, -v, v), r.int(1, n)]
  },
  solution: {
    approach: {
      hi: 'Size `k` ka min-heap: har number push karo, size `k` se zyada ho to top (sabse chhota) pop karo. Heap me hamesha ab tak ke `k` sabse bade bachte hain, aur top unme sabse chhota = k-th largest. O(n log k) time, O(k) space. (Quickselect average O(n) bhi deta hai.)',
      en: 'Min-heap of size `k`: push every number and pop the top (smallest) whenever the size exceeds `k`. The heap always holds the `k` largest so far, and its top is the smallest of them, the k-th largest. O(n log k) time, O(k) space. (Quickselect gives O(n) on average.)',
    },
    cpp: `class Solution {
public:
    int findKthLargest(vector<int>& nums, int k) {
        priority_queue<int, vector<int>, greater<int>> pq;
        for (int x : nums) {
            pq.push(x);
            if ((int)pq.size() > k) pq.pop();
        }
        return pq.top();
    }
};`,
  },
}
