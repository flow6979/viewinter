export default {
  id: 'find-minimum-in-rotated-sorted-array',
  title: 'Find Minimum in Rotated Sorted Array',
  lc: 153,
  topic: '07-binary-search',
  order: 2,
  difficulty: 'medium',
  tags: ['binary search'],
  statement: {
    hi: 'Ek badhte order ka sorted array (saare elements alag) `1` se `n` baar rotate kiya gaya hai, jaise `[0,1,2,4,5,6,7]` → `[4,5,6,7,0,1,2]`. Rotated array `nums` me se **minimum** element return karo. O(log n) me karo.',
    en: 'An ascending sorted array of distinct elements has been rotated between `1` and `n` times, e.g. `[0,1,2,4,5,6,7]` → `[4,5,6,7,0,1,2]`. Given the rotated array `nums`, return its **minimum** element. Solve it in O(log n).',
  },
  constraints: ['1 ≤ n ≤ 5000', '-5000 ≤ nums[i] ≤ 5000', 'All integers of nums are unique', 'nums is sorted and rotated between 1 and n times'],
  hints: {
    hi: ['`nums[mid]` ko `nums[hi]` se compare karo.', 'Agar `nums[mid] > nums[hi]` to minimum zaroor `mid` ke right me hai; warna `mid` ya uske left me.'],
    en: ['Compare `nums[mid]` with `nums[hi]`.', 'If `nums[mid] > nums[hi]`, the minimum must be to the right of `mid`; otherwise it is at `mid` or to its left.'],
  },
  signature: { fn: 'findMin', params: [{ name: 'nums', type: 'vector<int>' }], ret: 'int' },
  examples: [
    { args: [[3, 4, 5, 1, 2]], explain: { hi: 'Original array [1,2,3,4,5] ko 3 baar rotate kiya gaya.', en: 'The original array was [1,2,3,4,5] rotated 3 times.' } },
    { args: [[4, 5, 6, 7, 0, 1, 2]] },
    { args: [[11, 13, 15, 17]], explain: { hi: '4 baar rotate kiya — array wahi ka wahi hai.', en: 'Rotated 4 times — the array is back to its original order.' } },
  ],
  edge: [[[1]], [[2, 1]], [[1, 2]], [[-5000, 5000]], [[5, 1, 2, 3, 4]], [[2, 3, 4, 5, 1]]],
  solve(nums) {
    return Math.min(...nums)
  },
  generate(r) {
    const n = r.int(1, r.bool() ? 12 : 3000)
    const sorted = r.distinct(n, -5000, 5000).sort((a, b) => a - b)
    const k = r.int(0, n - 1)
    return [[...sorted.slice(k), ...sorted.slice(0, k)]]
  },
  solution: {
    approach: {
      hi: '`lo = 0`, `hi = n-1`, jab tak `lo < hi`: `mid` nikalo. `nums[mid] > nums[hi]` matlab rotation point right me hai → `lo = mid + 1`; warna `hi = mid`. Loop khatam hone pe `nums[lo]` minimum hai. O(log n) time, O(1) space.',
      en: '`lo = 0`, `hi = n-1`, while `lo < hi`: take `mid`. `nums[mid] > nums[hi]` means the rotation point is to the right → `lo = mid + 1`; otherwise `hi = mid`. When the loop ends, `nums[lo]` is the minimum. O(log n) time, O(1) space.',
    },
    cpp: `class Solution {
public:
    int findMin(vector<int>& nums) {
        int lo = 0, hi = (int)nums.size() - 1;
        while (lo < hi) {
            int mid = lo + (hi - lo) / 2;
            if (nums[mid] > nums[hi]) lo = mid + 1;
            else hi = mid;
        }
        return nums[lo];
    }
};`,
  },
}
