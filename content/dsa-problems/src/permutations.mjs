export default {
  id: 'permutations',
  title: 'Permutations',
  lc: 46,
  topic: '10-recursion-backtracking',
  order: 2,
  difficulty: 'medium',
  tags: ['backtracking'],
  statement: {
    hi: 'Distinct integers ka ek array `nums` diya hai. Uske saare possible **permutations** return karo. Permutations kisi bhi order me return kar sakte ho.',
    en: 'Given an array `nums` of distinct integers, return all the possible **permutations**. You may return the permutations in any order.',
  },
  constraints: ['1 ≤ nums.length ≤ 6', '-10 ≤ nums[i] ≤ 10', 'All the integers of nums are unique'],
  hints: {
    hi: ['Har position pe koi bhi ek aisa element rakho jo abhi tak use nahi hua.', 'Ek `used[]` array rakho, ya in-place swap karke position `i` fix karo.'],
    en: ['At each position, place any element that has not been used yet.', 'Keep a `used[]` array, or fix position `i` by swapping in place.'],
  },
  signature: { fn: 'permute', params: [{ name: 'nums', type: 'vector<int>' }], ret: 'vector<vector<int>>' },
  compare: 'unordered',
  examples: [
    { args: [[1, 2, 3]], explain: { hi: '3! = 6 permutations.', en: '3! = 6 permutations.' } },
    { args: [[0, 1]] },
    { args: [[1]] },
  ],
  edge: [[[-10]], [[10, -10]], [[6, 5, 4, 3, 2, 1]], [[-1, -2, -3]]],
  solve(nums) {
    const out = []
    const cur = []
    const used = nums.map(() => false)
    const dfs = () => {
      if (cur.length === nums.length) return void out.push([...cur])
      for (let i = 0; i < nums.length; i++) {
        if (used[i]) continue
        used[i] = true
        cur.push(nums[i])
        dfs()
        cur.pop()
        used[i] = false
      }
    }
    dfs()
    return out
  },
  generate(r) {
    return [r.distinct(r.int(1, 6), -10, 10)]
  },
  solution: {
    approach: {
      hi: 'Backtracking: `cur` me permutation banao; har step pe har unused element try karo, recurse karo, phir undo karo. `cur.size() == n` hote hi answer me daalo.\nn! permutations × O(n) copy: O(n · n!) time.',
      en: 'Backtracking: build the permutation in `cur`; at each step try every unused element, recurse, then undo. When `cur.size() == n`, record it.\nn! permutations × O(n) copy: O(n · n!) time.',
    },
    cpp: `class Solution {
public:
    vector<vector<int>> permute(vector<int>& nums) {
        vector<vector<int>> res;
        vector<int> cur;
        vector<bool> used(nums.size(), false);
        dfs(nums, used, cur, res);
        return res;
    }
private:
    void dfs(const vector<int>& nums, vector<bool>& used, vector<int>& cur, vector<vector<int>>& res) {
        if (cur.size() == nums.size()) { res.push_back(cur); return; }
        for (int i = 0; i < (int)nums.size(); i++) {
            if (used[i]) continue;
            used[i] = true;
            cur.push_back(nums[i]);
            dfs(nums, used, cur, res);
            cur.pop_back();
            used[i] = false;
        }
    }
};`,
  },
}
