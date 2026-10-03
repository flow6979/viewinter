export default {
  id: 'longest-consecutive-sequence',
  title: 'Longest Consecutive Sequence',
  lc: 128,
  topic: '05-arrays-hashing-prefix',
  order: 7,
  difficulty: 'medium',
  tags: ['hash set', 'array'],
  statement: {
    hi: 'Ek unsorted integer array `nums` diya hai. Sabse lambi **consecutive elements sequence** (jaise 4, 5, 6, 7) ki length return karo. Elements array me kisi bhi position pe ho sakte hain. O(n) me karne ki koshish karo.',
    en: 'Given an unsorted integer array `nums`, return the length of the longest **consecutive elements sequence** (like 4, 5, 6, 7). The elements can be anywhere in the array. Aim for O(n).',
  },
  constraints: ['0 ≤ nums.length ≤ 10^5', '-10^9 ≤ nums[i] ≤ 10^9'],
  hints: {
    hi: ['Saare numbers `unordered_set` me daalo.', 'Sequence sirf us `x` se gino jiska `x - 1` set me nahi hai — wahi sequence ki shuruaat hai.'],
    en: ['Put all numbers in an `unordered_set`.', 'Only start counting from an `x` whose `x - 1` is not in the set — that is where a sequence begins.'],
  },
  signature: { fn: 'longestConsecutive', params: [{ name: 'nums', type: 'vector<int>' }], ret: 'int' },
  examples: [
    { args: [[100, 4, 200, 1, 3, 2]], explain: { hi: 'Sabse lambi sequence [1, 2, 3, 4] hai, length 4.', en: 'The longest sequence is [1, 2, 3, 4], length 4.' } },
    { args: [[0, 3, 7, 2, 5, 8, 4, 6, 0, 1]] },
    { args: [[1, 0, 1, 2]] },
  ],
  edge: [[[]], [[5]], [[2, 2, 2]], [[-1000000000, 1000000000]], [[-2, -1, 0, 1, 2]], [[10, 5, 12, 3, 55, 30, 4, 11, 2]]],
  solve(nums) {
    const s = new Set(nums)
    let best = 0
    for (const x of s) {
      if (s.has(x - 1)) continue
      let y = x
      while (s.has(y + 1)) y++
      best = Math.max(best, y - x + 1)
    }
    return best
  },
  generate(r) {
    const n = r.int(0, r.bool() ? 12 : 3000)
    const range = r.pick([10, n * 2 + 5, 1000000000])
    if (r.int(0, 3) === 0 && n > 0) {
      const start = r.int(-1000000, 1000000)
      const len = r.int(1, n)
      const nums = Array.from({ length: len }, (_, i) => start + i).concat(r.array(n - len, -range, range))
      return [r.shuffle(nums)]
    }
    return [r.array(n, -range, range)]
  },
  solution: {
    approach: {
      hi: 'Sab numbers `unordered_set` me daalo. Har `x` ke liye agar `x - 1` set me nahi hai to `x` ek sequence ka start hai: wahan se `x + 1, x + 2, ...` tab tak gino jab tak set me hain. Har number sirf ek baar count hota hai, isliye O(n) average time, O(n) space.',
      en: 'Put all numbers in an `unordered_set`. For each `x` with `x - 1` not in the set, `x` starts a sequence: count `x + 1, x + 2, ...` while they are present. Each number is walked once, so O(n) average time, O(n) space.',
    },
    cpp: `class Solution {
public:
    int longestConsecutive(vector<int>& nums) {
        unordered_set<int> s(nums.begin(), nums.end());
        int best = 0;
        for (int x : s) {
            if (s.count(x - 1)) continue; // not the start of a sequence
            long long y = x;
            while (y + 1 <= INT_MAX && s.count((int)(y + 1))) y++;
            best = max(best, (int)(y - x + 1));
        }
        return best;
    }
};`,
  },
}
