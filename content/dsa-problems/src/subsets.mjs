export default {
  id: 'subsets',
  title: 'Subsets',
  lc: 78,
  topic: '10-recursion-backtracking',
  order: 1,
  difficulty: 'medium',
  tags: ['backtracking', 'bit manipulation'],
  statement: {
    hi: 'Ek integer array `nums` diya hai jisme saare elements **distinct** hain. Uske saare possible **subsets** (power set) return karo.\n\nAnswer me duplicate subsets nahi hone chahiye. Subsets aur unke andar ke elements kisi bhi order me ho sakte hain.',
    en: 'Given an integer array `nums` of **unique** elements, return all possible **subsets** (the power set).\n\nThe answer must not contain duplicate subsets. The subsets, and the elements inside each subset, may be in any order.',
  },
  constraints: ['1 ≤ nums.length ≤ 10', '-10 ≤ nums[i] ≤ 10', 'All the numbers of nums are unique'],
  hints: {
    hi: ['Har element ke liye do choices hain: lo ya chhodo.', 'Recursion me index `i` aur current subset pass karo; `i == n` pe current subset answer me daalo.'],
    en: ['Each element has two choices: take it or skip it.', 'Recurse with an index `i` and the current subset; when `i == n`, add the current subset to the answer.'],
  },
  signature: { fn: 'subsets', params: [{ name: 'nums', type: 'vector<int>' }], ret: 'vector<vector<int>>' },
  compare: 'unordered-nested',
  examples: [
    { args: [[1, 2, 3]], explain: { hi: '3 elements → 2^3 = 8 subsets, empty subset bhi shaamil hai.', en: '3 elements → 2^3 = 8 subsets, including the empty one.' } },
    { args: [[0]] },
  ],
  edge: [[[-10]], [[10, -10]], [[5, 4, 3, 2, 1]], [[-10, -9, -8, -7, -6, -5, -4, -3, -2, -1]]],
  solve(nums) {
    const out = []
    const n = nums.length
    for (let m = 0; m < 1 << n; m++) out.push(nums.filter((_, i) => m & (1 << i)))
    return out
  },
  generate(r) {
    const n = r.int(1, r.bool() ? 5 : 10)
    return [r.distinct(n, -10, 10)]
  },
  solution: {
    approach: {
      hi: 'Backtracking: index `i` pe pehle element ko subset me daal ke aage badho, phir use hata ke (skip karke) aage badho. Har leaf ek subset hai.\nKul 2^n subsets, har ek copy karne me O(n): O(n · 2^n) time.',
      en: 'Backtracking: at index `i`, first include the element and recurse, then remove it (skip) and recurse. Every leaf is one subset.\nThere are 2^n subsets and copying each costs O(n): O(n · 2^n) time.',
    },
    cpp: `class Solution {
public:
    vector<vector<int>> subsets(vector<int>& nums) {
        vector<vector<int>> res;
        vector<int> cur;
        dfs(nums, 0, cur, res);
        return res;
    }
private:
    void dfs(const vector<int>& nums, int i, vector<int>& cur, vector<vector<int>>& res) {
        if (i == (int)nums.size()) { res.push_back(cur); return; }
        cur.push_back(nums[i]);
        dfs(nums, i + 1, cur, res);   // take nums[i]
        cur.pop_back();
        dfs(nums, i + 1, cur, res);   // skip nums[i]
    }
};`,
  },
}
