export default {
  id: 'two-sum',
  title: 'Two Sum',
  lc: 1,
  topic: '05-arrays-hashing-prefix',
  order: 1,
  difficulty: 'easy',
  tags: ['hash map'],
  statement: {
    hi: 'Ek integer array `nums` aur ek `target` diya hai. Do **alag** indices `i` aur `j` return karo jinke liye `nums[i] + nums[j] == target`. Har input ka exactly ek answer hai. Indices **badhte order** me return karo (`i < j`).',
    en: 'Given an integer array `nums` and an integer `target`, return the two **different** indices `i` and `j` such that `nums[i] + nums[j] == target`. Each input has exactly one answer. Return the indices in **increasing order** (`i < j`).',
  },
  constraints: ['2 ≤ nums.length ≤ 10^4', '-10^9 ≤ nums[i] ≤ 10^9', '-10^9 ≤ target ≤ 10^9', 'Exactly one valid answer exists'],
  hints: {
    hi: ['Har number ke liye kaunsa "complement" chahiye?', 'Ab tak dekhe numbers ko value → index map me rakho.'],
    en: ['For each number, which "complement" do you need?', 'Keep the numbers seen so far in a value → index map.'],
  },
  signature: { fn: 'twoSum', params: [{ name: 'nums', type: 'vector<int>' }, { name: 'target', type: 'int' }], ret: 'vector<int>' },
  examples: [
    { args: [[2, 7, 11, 15], 9], explain: { hi: 'nums[0] + nums[1] = 2 + 7 = 9', en: 'nums[0] + nums[1] = 2 + 7 = 9' } },
    { args: [[3, 2, 4], 6] },
    { args: [[3, 3], 6] },
  ],
  edge: [
    [[-1000000000, 1000000000], 0],
    [[0, 4, 3, 0], 0],
  ],
  solve(nums, target) {
    const seen = new Map()
    for (let i = 0; i < nums.length; i++) {
      if (seen.has(target - nums[i])) return [seen.get(target - nums[i]), i]
      seen.set(nums[i], i)
    }
    return []
  },
  // Random arrays with exactly one pair: values from a range with no other pair hitting the target
  generate(r) {
    const n = r.int(2, r.bool() ? 20 : 2000)
    const nums = r.distinct(n, -1000000, 1000000).map((x) => x * 2)
    const i = r.int(0, n - 1)
    let j = r.int(0, n - 1)
    if (j === i) j = (i + 1) % n
    nums[j] = nums[j] + 1 // the only odd number, so only nums[i] + nums[j] can hit an odd target
    return [nums, nums[i] + nums[j]]
  },
  solution: {
    approach: {
      hi: 'Ek pass + hash map: har `nums[i]` pe dekho kya `target - nums[i]` pehle aa chuka hai. Haan to dono indices return karo. O(n) time, O(n) space.',
      en: 'One pass with a hash map: at each `nums[i]`, check whether `target - nums[i]` was seen before. If so, return both indices. O(n) time, O(n) space.',
    },
    cpp: `class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        unordered_map<int, int> seen; // value -> index
        for (int i = 0; i < (int)nums.size(); i++) {
            auto it = seen.find(target - nums[i]);
            if (it != seen.end()) return {it->second, i};
            seen[nums[i]] = i;
        }
        return {};
    }
};`,
  },
}
