export default {
  id: 'house-robber',
  title: 'House Robber',
  lc: 198,
  topic: '15-dp',
  order: 2,
  difficulty: 'medium',
  tags: ['dp'],
  statement: {
    hi: 'Ek line me ghar hain, `nums[i]` = ghar `i` me paisa. Do **adjacent** ghar ek hi raat me loote to alarm baj jaata hai. Bina alarm bajaye maximum kitna paisa loot sakte ho, return karo.',
    en: 'Houses stand in a row and `nums[i]` is the money in house `i`. Robbing two **adjacent** houses on the same night triggers the alarm. Return the maximum amount you can rob without triggering it.',
  },
  constraints: ['1 ≤ nums.length ≤ 100', '0 ≤ nums[i] ≤ 400'],
  hints: {
    hi: ['Ghar `i` pe do choice: loot lo (to `i-1` skip) ya chhod do.', 'best(i) = max(best(i-1), best(i-2) + nums[i]).'],
    en: ['At house `i` you either rob it (and skip `i-1`) or skip it.', 'best(i) = max(best(i-1), best(i-2) + nums[i]).'],
  },
  signature: { fn: 'rob', params: [{ name: 'nums', type: 'vector<int>' }], ret: 'int' },
  examples: [
    { args: [[1, 2, 3, 1]], explain: { hi: 'Ghar 0 aur 2 loot lo: 1 + 3 = 4.', en: 'Rob houses 0 and 2: 1 + 3 = 4.' } },
    { args: [[2, 7, 9, 3, 1]], explain: { hi: 'Ghar 0, 2, 4: 2 + 9 + 1 = 12.', en: 'Houses 0, 2, 4: 2 + 9 + 1 = 12.' } },
  ],
  edge: [[[5]], [[0]], [[1, 2]], [[2, 1, 1, 2]], [[0, 0, 0, 0]], [[400, 400, 400, 400, 400]]],
  solve(nums) {
    let prev2 = 0,
      prev1 = 0
    for (const x of nums) [prev2, prev1] = [prev1, Math.max(prev1, prev2 + x)]
    return prev1
  },
  generate(r, i) {
    const n = i % 3 === 0 ? r.int(1, 10) : r.int(1, 100)
    return [r.array(n, 0, 400)]
  },
  solution: {
    approach: {
      hi: 'DP: `best(i)` = pehle `i` gharon se max loot. Ghar `i` lootoge to `best(i-2) + nums[i]`, warna `best(i-1)`. Sirf do pichhli values chahiye. O(n) time, O(1) space.',
      en: 'DP: `best(i)` = max loot from the first `i` houses. Robbing house `i` gives `best(i-2) + nums[i]`, skipping it gives `best(i-1)`. Only two previous values are needed. O(n) time, O(1) space.',
    },
    cpp: `class Solution {
public:
    int rob(vector<int>& nums) {
        int prev2 = 0, prev1 = 0;
        for (int x : nums) {
            int cur = max(prev1, prev2 + x);
            prev2 = prev1;
            prev1 = cur;
        }
        return prev1;
    }
};`,
  },
}
