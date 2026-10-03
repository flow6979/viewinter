export default {
  id: 'search-in-rotated-sorted-array',
  title: 'Search in Rotated Sorted Array',
  lc: 33,
  topic: '07-binary-search',
  order: 3,
  difficulty: 'medium',
  tags: ['binary search'],
  statement: {
    hi: 'Ek badhte order me sorted array (saare values alag) ko kisi unknown pivot pe rotate kiya gaya hai, jaise `[0,1,2,4,5,6,7]` → `[4,5,6,7,0,1,2]`. Rotated array `nums` aur `target` diye hain; `target` ka index return karo, ya `-1` agar nahi hai. O(log n) me karo.',
    en: 'An ascending sorted array of distinct values was rotated at an unknown pivot, e.g. `[0,1,2,4,5,6,7]` → `[4,5,6,7,0,1,2]`. Given the rotated array `nums` and an integer `target`, return the index of `target`, or `-1` if it is not present. Solve it in O(log n).',
  },
  constraints: ['1 ≤ nums.length ≤ 5000', '-10^4 ≤ nums[i], target ≤ 10^4', 'All values of nums are unique', 'nums is an ascending array that is possibly rotated'],
  hints: {
    hi: ['`mid` pe todne pe kam se kam ek half hamesha properly sorted hota hai.', 'Check karo `target` us sorted half ki range me aata hai ya nahi — usi hisaab se side chuno.'],
    en: ['When you split at `mid`, at least one half is always properly sorted.', 'Check whether `target` lies within the range of that sorted half and pick the side accordingly.'],
  },
  signature: { fn: 'search', params: [{ name: 'nums', type: 'vector<int>' }, { name: 'target', type: 'int' }], ret: 'int' },
  examples: [
    { args: [[4, 5, 6, 7, 0, 1, 2], 0], explain: { hi: '0 index 4 pe hai.', en: '0 is at index 4.' } },
    { args: [[4, 5, 6, 7, 0, 1, 2], 3] },
    { args: [[1], 0] },
  ],
  edge: [[[1], 1], [[3, 1], 1], [[3, 1], 3], [[1, 3], 3], [[5, 1, 3], 5], [[2, 3, 4, 5, 1], 1], [[6, 7, 1, 2, 3, 4, 5], 7]],
  solve(nums, target) {
    return nums.indexOf(target)
  },
  generate(r) {
    const n = r.int(1, r.bool() ? 12 : 3000)
    const sorted = r.distinct(n, -10000, 10000).sort((a, b) => a - b)
    const k = r.int(0, n - 1)
    const nums = [...sorted.slice(k), ...sorted.slice(0, k)]
    return [nums, r.bool() ? r.pick(nums) : r.int(-10000, 10000)]
  },
  solution: {
    approach: {
      hi: 'Normal binary search, bas har step pe dekho kaunsa half sorted hai. Agar `nums[lo] <= nums[mid]` to left half sorted hai: `target` uski range `[nums[lo], nums[mid])` me ho to left jao, warna right. Nahi to right half sorted hai aur waise hi check karo. O(log n) time, O(1) space.',
      en: 'Ordinary binary search, but at each step decide which half is sorted. If `nums[lo] <= nums[mid]` the left half is sorted: go left if `target` is in `[nums[lo], nums[mid])`, else go right. Otherwise the right half is sorted; check it the same way. O(log n) time, O(1) space.',
    },
    cpp: `class Solution {
public:
    int search(vector<int>& nums, int target) {
        int lo = 0, hi = (int)nums.size() - 1;
        while (lo <= hi) {
            int mid = lo + (hi - lo) / 2;
            if (nums[mid] == target) return mid;
            if (nums[lo] <= nums[mid]) {
                if (nums[lo] <= target && target < nums[mid]) hi = mid - 1;
                else lo = mid + 1;
            } else {
                if (nums[mid] < target && target <= nums[hi]) lo = mid + 1;
                else hi = mid - 1;
            }
        }
        return -1;
    }
};`,
  },
}
