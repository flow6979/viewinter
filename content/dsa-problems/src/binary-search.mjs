export default {
  id: 'binary-search',
  title: 'Binary Search',
  lc: 704,
  topic: '07-binary-search',
  order: 1,
  difficulty: 'easy',
  tags: ['binary search'],
  statement: {
    hi: 'Ek **sorted (badhte order)** integer array `nums` (saare elements alag) aur ek `target` diya hai. Agar `target` array me hai to uska index return karo, warna `-1`. Algorithm O(log n) ka hona chahiye.',
    en: 'Given an integer array `nums` sorted in **ascending order** (all elements distinct) and an integer `target`, return the index of `target` if it exists, otherwise `-1`. Your algorithm must run in O(log n) time.',
  },
  constraints: ['1 ≤ nums.length ≤ 10^4', '-10^4 < nums[i], target < 10^4', 'All nums[i] are unique', 'nums is sorted in ascending order'],
  hints: {
    hi: ['Beech wala element dekho — target usse chhota hai ya bada?', 'Har step pe search range aadhi ho jaati hai; `lo <= hi` tak loop chalao.'],
    en: ['Look at the middle element — is the target smaller or larger?', 'Each step halves the search range; loop while `lo <= hi`.'],
  },
  signature: { fn: 'search', params: [{ name: 'nums', type: 'vector<int>' }, { name: 'target', type: 'int' }], ret: 'int' },
  examples: [
    { args: [[-1, 0, 3, 5, 9, 12], 9], explain: { hi: '9 index 4 pe hai.', en: '9 exists at index 4.' } },
    { args: [[-1, 0, 3, 5, 9, 12], 2], explain: { hi: '2 array me nahi hai, isliye -1.', en: '2 does not exist in nums, so return -1.' } },
  ],
  edge: [[[5], 5], [[5], -5], [[1, 2], 2], [[1, 2], 0], [[1, 2, 3], 4], [[-9999, 9999], -9999]],
  solve(nums, target) {
    return nums.indexOf(target)
  },
  generate(r) {
    const n = r.int(1, r.bool() ? 12 : 3000)
    const nums = r.distinct(n, -9999, 9999).sort((a, b) => a - b)
    const target = r.bool() ? r.pick(nums) : r.int(-9999, 9999)
    return [nums, target]
  },
  solution: {
    approach: {
      hi: '`lo = 0`, `hi = n-1`. Jab tak `lo <= hi`: `mid = lo + (hi - lo) / 2`; `nums[mid] == target` to return, chhota ho to `lo = mid + 1`, bada ho to `hi = mid - 1`. Nahi mila to `-1`. O(log n) time, O(1) space.',
      en: '`lo = 0`, `hi = n-1`. While `lo <= hi`: `mid = lo + (hi - lo) / 2`; return it if `nums[mid] == target`, go right (`lo = mid + 1`) if smaller, left (`hi = mid - 1`) if larger. Not found → `-1`. O(log n) time, O(1) space.',
    },
    cpp: `class Solution {
public:
    int search(vector<int>& nums, int target) {
        int lo = 0, hi = (int)nums.size() - 1;
        while (lo <= hi) {
            int mid = lo + (hi - lo) / 2;
            if (nums[mid] == target) return mid;
            if (nums[mid] < target) lo = mid + 1;
            else hi = mid - 1;
        }
        return -1;
    }
};`,
  },
}
