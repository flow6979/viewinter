export default {
  id: 'subarray-sum-equals-k',
  title: 'Subarray Sum Equals K',
  lc: 560,
  topic: '05-arrays-hashing-prefix',
  order: 9,
  difficulty: 'medium',
  tags: ['prefix sum', 'hash map'],
  statement: {
    hi: 'Ek integer array `nums` aur integer `k` diya hai. Aise **subarrays** (lagatar, non-empty) ki total ginti return karo jinka sum exactly `k` ho. Numbers negative bhi ho sakte hain.',
    en: 'Given an integer array `nums` and an integer `k`, return the total number of **subarrays** (contiguous, non-empty) whose sum equals `k`. Numbers may be negative.',
  },
  constraints: ['1 ≤ nums.length ≤ 2 * 10^4', '-1000 ≤ nums[i] ≤ 1000', '-10^7 ≤ k ≤ 10^7'],
  hints: {
    hi: ['Subarray `[i..j]` ka sum = `prefix[j+1] - prefix[i]`.', 'Har prefix sum `p` pe, kitne pehle wale prefix sums `p - k` ke barabar the? Unhe `unordered_map` me gino. Negative numbers ki wajah se sliding window kaam nahi karega.'],
    en: ['The sum of `[i..j]` is `prefix[j+1] - prefix[i]`.', 'At each prefix sum `p`, how many earlier prefix sums equal `p - k`? Count them in an `unordered_map`. Sliding window fails because of negative numbers.'],
  },
  signature: { fn: 'subarraySum', params: [{ name: 'nums', type: 'vector<int>' }, { name: 'k', type: 'int' }], ret: 'int' },
  examples: [
    { args: [[1, 1, 1], 2], explain: { hi: '[1,1] do jagah: index 0..1 aur 1..2.', en: '[1,1] twice: indices 0..1 and 1..2.' } },
    { args: [[1, 2, 3], 3], explain: { hi: '[1,2] aur [3].', en: '[1,2] and [3].' } },
  ],
  edge: [[[1], 0], [[0], 0], [[0, 0, 0], 0], [[-1, -1, 1], 0], [[1, -1, 1, -1], 0], [[1000, 1000], 2000], [[5], 5]],
  solve(nums, k) {
    const seen = new Map([[0, 1]])
    let p = 0
    let count = 0
    for (const x of nums) {
      p += x
      count += seen.get(p - k) ?? 0
      seen.set(p, (seen.get(p) ?? 0) + 1)
    }
    return count
  },
  generate(r) {
    const n = r.int(1, r.bool() ? 10 : 3000)
    const m = r.pick([1, 3, 10, 1000])
    const nums = r.array(n, -m, m)
    // pick k as a real subarray sum most of the time
    if (r.int(0, 3) > 0) {
      const i = r.int(0, n - 1)
      const j = r.int(i, n - 1)
      let s = 0
      for (let t = i; t <= j; t++) s += nums[t]
      return [nums, s]
    }
    return [nums, r.int(-20, 20)]
  },
  solution: {
    approach: {
      hi: 'Running prefix sum `p` rakho aur `unordered_map` me har prefix sum ki ginti (shuru me `{0: 1}`). Har element pe `count += freq[p - k]`, phir `freq[p]++`. Har aisa purana prefix ek valid subarray deta hai. O(n) time, O(n) space.',
      en: 'Keep a running prefix sum `p` and an `unordered_map` counting prefix sums (start with `{0: 1}`). At each element add `freq[p - k]` to the answer, then `freq[p]++`. Each matching earlier prefix gives one valid subarray. O(n) time, O(n) space.',
    },
    cpp: `class Solution {
public:
    int subarraySum(vector<int>& nums, int k) {
        unordered_map<int, int> freq;
        freq[0] = 1;
        int p = 0, count = 0;
        for (int x : nums) {
            p += x;
            auto it = freq.find(p - k);
            if (it != freq.end()) count += it->second;
            freq[p]++;
        }
        return count;
    }
};`,
  },
}
