export default {
  id: 'median-of-two-sorted-arrays',
  title: 'Median of Two Sorted Arrays',
  lc: 4,
  topic: '07-binary-search',
  order: 5,
  difficulty: 'hard',
  tags: ['binary search', 'divide and conquer'],
  statement: {
    hi: 'Do sorted arrays `nums1` (size `m`) aur `nums2` (size `n`) diye hain. Dono ko mila kar bane sorted array ka **median** return karo. Overall time complexity O(log(m + n)) honi chahiye.',
    en: 'Given two sorted arrays `nums1` of size `m` and `nums2` of size `n`, return the **median** of the two sorted arrays combined. The overall run time complexity should be O(log(m + n)).',
  },
  constraints: ['0 ≤ m, n ≤ 1000', '1 ≤ m + n ≤ 2000', '-10^6 ≤ nums1[i], nums2[i] ≤ 10^6', 'Both arrays are sorted in non-decreasing order'],
  hints: {
    hi: ['Chhote array pe ek partition `i` chuno; doosre ka partition `j = (m + n + 1) / 2 - i` apne aap fix ho jaata hai.', 'Partition sahi hai jab `left1 <= right2` aur `left2 <= right1`. Galat ho to `i` ko binary search se khiskao.'],
    en: ['Choose a cut `i` in the smaller array; the cut in the other is then forced: `j = (m + n + 1) / 2 - i`.', 'The cut is correct when `left1 <= right2` and `left2 <= right1`. Otherwise move `i` by binary search.'],
  },
  signature: { fn: 'findMedianSortedArrays', params: [{ name: 'nums1', type: 'vector<int>' }, { name: 'nums2', type: 'vector<int>' }], ret: 'double' },
  compare: 'float',
  examples: [
    { args: [[1, 3], [2]], explain: { hi: 'Merged array = [1,2,3], median 2.', en: 'Merged array = [1,2,3], median is 2.' } },
    { args: [[1, 2], [3, 4]], explain: { hi: 'Merged array = [1,2,3,4], median (2 + 3) / 2 = 2.5.', en: 'Merged array = [1,2,3,4], median is (2 + 3) / 2 = 2.5.' } },
  ],
  edge: [[[], [1]], [[2], []], [[], [2, 3]], [[1, 1, 1], [1, 1]], [[1, 2, 3], [4, 5, 6]], [[-1000000], [1000000]], [[5], [1, 2, 3, 4, 6]]],
  solve(a, b) {
    const m = [...a, ...b].sort((x, y) => x - y)
    const k = m.length
    return k % 2 ? m[(k - 1) / 2] : (m[k / 2 - 1] + m[k / 2]) / 2
  },
  generate(r) {
    const small = r.bool()
    const m = r.int(0, small ? 6 : 1000)
    const n = r.int(m === 0 ? 1 : 0, small ? 6 : 1000)
    const lim = r.pick([5, 1000000])
    const sort = (x) => x.sort((p, q) => p - q)
    return [sort(r.array(m, -lim, lim)), sort(r.array(n, -lim, lim))]
  },
  solution: {
    approach: {
      hi: 'Chhote array (`A`, size `m`) pe partition `i` ka binary search, `j = (m + n + 1) / 2 - i`. `Aleft = A[i-1]`, `Aright = A[i]` (boundary pe ±infinity), waise hi `B` ke liye. `Aleft > Bright` → `i` chhota karo; `Bleft > Aright` → `i` bada karo; warna median left ka max (odd) ya `(maxLeft + minRight) / 2.0` (even). O(log(min(m, n))) time.',
      en: 'Binary search a cut `i` in the smaller array (`A`, size `m`), with `j = (m + n + 1) / 2 - i`. `Aleft = A[i-1]`, `Aright = A[i]` (±infinity at the borders), likewise for `B`. `Aleft > Bright` → decrease `i`; `Bleft > Aright` → increase `i`; otherwise the median is the max of the left side (odd total) or `(maxLeft + minRight) / 2.0` (even). O(log(min(m, n))) time.',
    },
    cpp: `class Solution {
public:
    double findMedianSortedArrays(vector<int>& nums1, vector<int>& nums2) {
        if (nums1.size() > nums2.size()) return findMedianSortedArrays(nums2, nums1);
        int m = nums1.size(), n = nums2.size();
        int half = (m + n + 1) / 2, lo = 0, hi = m;
        while (lo <= hi) {
            int i = (lo + hi) / 2, j = half - i;
            int aL = i > 0 ? nums1[i - 1] : INT_MIN, aR = i < m ? nums1[i] : INT_MAX;
            int bL = j > 0 ? nums2[j - 1] : INT_MIN, bR = j < n ? nums2[j] : INT_MAX;
            if (aL > bR) hi = i - 1;
            else if (bL > aR) lo = i + 1;
            else {
                int maxLeft = max(aL, bL);
                if ((m + n) % 2) return maxLeft;
                return (maxLeft + (long long)min(aR, bR)) / 2.0;
            }
        }
        return 0.0;
    }
};`,
  },
}
