export default {
  id: 'contains-duplicate',
  title: 'Contains Duplicate',
  lc: 217,
  topic: '05-arrays-hashing-prefix',
  order: 2,
  difficulty: 'easy',
  tags: ['hash set', 'array'],
  statement: {
    hi: 'Ek integer array `nums` diya hai. Agar koi value array me **kam se kam do baar** aati hai to `true` return karo, aur agar saare elements distinct hain to `false`.',
    en: 'Given an integer array `nums`, return `true` if any value appears **at least twice** in the array, and `false` if every element is distinct.',
  },
  constraints: ['1 ≤ nums.length ≤ 10^5', '-10^9 ≤ nums[i] ≤ 10^9'],
  hints: {
    hi: ['Ab tak dekhe numbers ko kahin yaad rakho.', '`unordered_set` me O(1) average me check + insert ho jata hai.'],
    en: ['Remember the numbers you have seen so far.', 'An `unordered_set` checks and inserts in O(1) on average.'],
  },
  signature: { fn: 'containsDuplicate', params: [{ name: 'nums', type: 'vector<int>' }], ret: 'bool' },
  examples: [
    { args: [[1, 2, 3, 1]], explain: { hi: '1 do baar aata hai.', en: '1 appears twice.' } },
    { args: [[1, 2, 3, 4]] },
    { args: [[1, 1, 1, 3, 3, 4, 3, 2, 4, 2]] },
  ],
  edge: [[[1]], [[7, 7]], [[-1000000000, 1000000000]], [[0, 5, 5]], [[-3, -2, -1, -3]]],
  solve(nums) {
    return new Set(nums).size !== nums.length
  },
  generate(r) {
    const n = r.int(1, r.bool() ? 10 : 3000)
    const nums = r.distinct(n, -1000000000, 1000000000)
    if (n > 1 && r.bool()) nums[r.int(0, n - 1)] = nums[r.int(0, n - 1)]
    if (n > 1 && r.int(0, 3) === 0) return [r.array(n, -5, 5)]
    return [nums]
  },
  solution: {
    approach: {
      hi: 'Ek `unordered_set` banao. Har number pe dekho kya set me pehle se hai: haan to `true`. Warna insert karo. Loop khatam to `false`. O(n) time, O(n) space. (Sort karke adjacent compare bhi chalega: O(n log n).)',
      en: 'Use an `unordered_set`. For each number, if it is already in the set return `true`, else insert it. If the loop ends, return `false`. O(n) time, O(n) space. (Sorting and comparing neighbours also works in O(n log n).)',
    },
    cpp: `class Solution {
public:
    bool containsDuplicate(vector<int>& nums) {
        unordered_set<int> seen;
        for (int x : nums) {
            if (seen.count(x)) return true;
            seen.insert(x);
        }
        return false;
    }
};`,
  },
}
