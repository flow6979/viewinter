export default {
  id: 'three-sum',
  title: '3Sum',
  lc: 15,
  topic: '06-two-pointers-sliding-window',
  order: 2,
  difficulty: 'medium',
  tags: ['two pointers', 'sorting'],
  statement: {
    hi: 'Integer array `nums` diya hai. Saare triplets `[nums[i], nums[j], nums[k]]` return karo jahan `i`, `j`, `k` alag hon aur `nums[i] + nums[j] + nums[k] == 0`. Answer me **duplicate triplets nahi** hone chahiye. Triplets aur unke andar ke numbers kisi bhi order me ho sakte hain.',
    en: 'Given an integer array `nums`, return all triplets `[nums[i], nums[j], nums[k]]` with `i`, `j`, `k` distinct and `nums[i] + nums[j] + nums[k] == 0`. The answer must **not contain duplicate triplets**. Triplets and the numbers inside them may be in any order.',
  },
  constraints: ['3 ≤ nums.length ≤ 3000', '-10^5 ≤ nums[i] ≤ 10^5'],
  hints: {
    hi: ['Pehle array sort karo.', 'Ek number fix karo, baaki do ke liye two pointers chalao.', 'Duplicates se bachne ke liye same value wale elements skip karo.'],
    en: ['Sort the array first.', 'Fix one number and run two pointers for the other two.', 'Skip elements equal to the previous one to avoid duplicate triplets.'],
  },
  signature: { fn: 'threeSum', params: [{ name: 'nums', type: 'vector<int>' }], ret: 'vector<vector<int>>' },
  compare: 'unordered-nested',
  examples: [
    { args: [[-1, 0, 1, 2, -1, -4]], explain: { hi: 'Alag triplets: [-1,0,1] aur [-1,-1,2].', en: 'The distinct triplets are [-1,0,1] and [-1,-1,2].' } },
    { args: [[0, 1, 1]], explain: { hi: 'Koi triplet 0 nahi banata.', en: 'No triplet sums to 0.' } },
    { args: [[0, 0, 0]] },
  ],
  edge: [[[0, 0, 0, 0, 0]], [[-2, 0, 1, 1, 2]], [[1, 2, 3]], [[-100000, 50000, 50000]], [[-1, -1, -1, 2, 2, 2, 0, 0]], [[3, -2, 1, 0]]],
  solve(nums) {
    const a = [...nums].sort((x, y) => x - y)
    const out = []
    for (let i = 0; i < a.length - 2; i++) {
      if (i > 0 && a[i] === a[i - 1]) continue
      let l = i + 1, h = a.length - 1
      while (l < h) {
        const s = a[i] + a[l] + a[h]
        if (s < 0) l++
        else if (s > 0) h--
        else {
          out.push([a[i], a[l], a[h]])
          while (l < h && a[l] === a[l + 1]) l++
          while (l < h && a[h] === a[h - 1]) h--
          l++; h--
        }
      }
    }
    return out
  },
  generate(r) {
    const small = r.bool()
    const n = r.int(3, small ? 12 : 400)
    const lim = small ? 6 : r.pick([50, 300, 100000])
    return [r.array(n, -lim, lim)]
  },
  solution: {
    approach: {
      hi: 'Sort karo. Har `i` ke liye (duplicate `nums[i]` skip karke) `l = i+1`, `h = n-1` se two pointers chalao: sum chhota to `l++`, bada to `h--`, zero to triplet save karo aur dono taraf duplicates skip karo. O(n^2) time, sort ke alawa O(1) extra space.',
      en: 'Sort. For each `i` (skipping duplicate `nums[i]`), run two pointers `l = i+1`, `h = n-1`: sum too small → `l++`, too big → `h--`, zero → record the triplet and skip duplicates on both sides. O(n^2) time, O(1) extra space besides sorting.',
    },
    cpp: `class Solution {
public:
    vector<vector<int>> threeSum(vector<int>& nums) {
        sort(nums.begin(), nums.end());
        int n = nums.size();
        vector<vector<int>> out;
        for (int i = 0; i + 2 < n; i++) {
            if (i > 0 && nums[i] == nums[i - 1]) continue;
            int l = i + 1, h = n - 1;
            while (l < h) {
                int s = nums[i] + nums[l] + nums[h];
                if (s < 0) l++;
                else if (s > 0) h--;
                else {
                    out.push_back({nums[i], nums[l], nums[h]});
                    while (l < h && nums[l] == nums[l + 1]) l++;
                    while (l < h && nums[h] == nums[h - 1]) h--;
                    l++; h--;
                }
            }
        }
        return out;
    }
};`,
  },
}
