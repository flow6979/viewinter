export default {
  id: 'jump-game',
  title: 'Jump Game',
  lc: 55,
  topic: '08-greedy-intervals',
  order: 1,
  difficulty: 'medium',
  tags: ['greedy', 'array'],
  statement: {
    hi: 'Ek integer array `nums` diya hai. Tum index `0` pe khade ho, aur `nums[i]` batata hai ki index `i` se **maximum** kitna aage jump kar sakte ho. Agar last index tak pahunch sakte ho to `true` return karo, warna `false`.',
    en: 'You are given an integer array `nums`. You start at index `0`, and `nums[i]` is the **maximum** jump length from index `i`. Return `true` if you can reach the last index, otherwise `false`.',
  },
  constraints: ['1 ≤ nums.length ≤ 10^4', '0 ≤ nums[i] ≤ 10^5'],
  hints: {
    hi: ['Ab tak ka sabse door pahunchne wala index (`reach`) track karo.', 'Agar kabhi `i > reach` ho gaya, to aage nahi badh sakte.'],
    en: ['Track the farthest index reachable so far (`reach`).', 'If you ever have `i > reach`, you are stuck.'],
  },
  signature: { fn: 'canJump', params: [{ name: 'nums', type: 'vector<int>' }], ret: 'bool' },
  examples: [
    { args: [[2, 3, 1, 1, 4]], explain: { hi: 'Index 0 se 1 pe jump, phir 3 steps se last index.', en: 'Jump 1 step from index 0 to 1, then 3 steps to the last index.' } },
    { args: [[3, 2, 1, 0, 4]], explain: { hi: 'Hamesha index 3 pe aa kar ruk jaate ho, jahan jump 0 hai.', en: 'You always land on index 3, whose jump length is 0.' } },
  ],
  edge: [[[0]], [[5]], [[0, 1]], [[1, 0]], [[2, 0, 0]], [[1, 1, 0, 1]], [[100000, 0, 0, 0, 0]]],
  solve(nums) {
    let reach = 0
    for (let i = 0; i < nums.length; i++) {
      if (i > reach) return false
      reach = Math.max(reach, i + nums[i])
    }
    return true
  },
  generate(r) {
    const n = r.int(1, r.bool() ? 10 : 3000)
    const hi = r.pick([1, 2, 3, 5])
    const nums = r.array(n, 0, hi).map((x) => (r.int(0, 9) === 0 ? 0 : x))
    return [nums]
  },
  solution: {
    approach: {
      hi: 'Greedy: left se right chalo aur `reach = max(reach, i + nums[i])` rakho. Agar kisi index `i` pe `i > reach` hai to wahan pahunchna hi possible nahi, `false`. Loop poora ho gaya to `true`. O(n) time, O(1) space.',
      en: 'Greedy: scan left to right keeping `reach = max(reach, i + nums[i])`. If some index has `i > reach`, it cannot be reached, so return `false`. If the loop finishes, return `true`. O(n) time, O(1) space.',
    },
    cpp: `class Solution {
public:
    bool canJump(vector<int>& nums) {
        int reach = 0;
        for (int i = 0; i < (int)nums.size(); i++) {
            if (i > reach) return false;
            reach = max(reach, i + nums[i]);
        }
        return true;
    }
};`,
  },
}
