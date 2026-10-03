export default {
  id: 'longest-repeating-character-replacement',
  title: 'Longest Repeating Character Replacement',
  lc: 424,
  topic: '06-two-pointers-sliding-window',
  order: 5,
  difficulty: 'medium',
  tags: ['sliding window', 'string'],
  statement: {
    hi: 'String `s` (sirf uppercase English letters) aur integer `k` diye hain. Tum kisi bhi character ko kisi aur uppercase letter se badal sakte ho, zyada se zyada `k` baar. Aisa karne ke baad sabse lambi substring ki length return karo jisme saare letters same hon.',
    en: 'Given a string `s` of uppercase English letters and an integer `k`, you may change any character to any other uppercase letter at most `k` times. Return the length of the longest substring containing only one repeated letter after these operations.',
  },
  constraints: ['1 ≤ s.length ≤ 10^5', 's consists of only uppercase English letters', '0 ≤ k ≤ s.length'],
  hints: {
    hi: ['Ek window valid hai agar `window length - sabse frequent letter ki count ≤ k`.', 'Window ko right se badhao; invalid ho jaaye to left se ek step sikodo.'],
    en: ['A window is valid if `window length - count of its most frequent letter ≤ k`.', 'Grow the window on the right; when it becomes invalid, shrink it from the left by one step.'],
  },
  signature: { fn: 'characterReplacement', params: [{ name: 's', type: 'string' }, { name: 'k', type: 'int' }], ret: 'int' },
  examples: [
    { args: ['ABAB', 2], explain: { hi: 'Dono A ko B (ya dono B ko A) bana do: "BBBB", length 4.', en: 'Replace the two A\'s with B (or vice versa): "BBBB", length 4.' } },
    { args: ['AABABBA', 1], explain: { hi: 'Beech wala A ko B banao: "AABBBBA" me "BBBB" length 4.', en: 'Replace the middle A with B: "AABBBBA" contains "BBBB", length 4.' } },
  ],
  edge: [['A', 0], ['A', 1], ['ABCDE', 0], ['ABCDE', 5], ['AAAA', 0], ['ABBB', 2], ['BAAAB', 2]],
  solve(s, k) {
    const cnt = new Array(26).fill(0)
    let l = 0, maxf = 0, best = 0
    for (let r = 0; r < s.length; r++) {
      const c = s.charCodeAt(r) - 65
      maxf = Math.max(maxf, ++cnt[c])
      if (r - l + 1 - maxf > k) {
        cnt[s.charCodeAt(l) - 65]--
        l++
      }
      best = Math.max(best, r - l + 1)
    }
    return best
  },
  generate(r) {
    const n = r.int(1, r.bool() ? 12 : 2000)
    const s = r.str(n, r.pick(['AB', 'ABC', 'ABCDEFG', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ']))
    return [s, r.int(0, r.bool() ? Math.min(n, 3) : n)]
  },
  solution: {
    approach: {
      hi: 'Sliding window + 26 size count array. `maxf` = window me ab tak ki sabse badi frequency. Agar `window length - maxf > k` ho to left se ek char hatao (window kabhi chhoti nahi hoti, sirf slide hoti hai). `maxf` ko ghatane ki zaroorat nahi kyunki answer sirf bada `maxf` milne pe badhta hai. O(n) time, O(1) space.',
      en: 'Sliding window + a 26-entry count array. `maxf` = the highest frequency seen in a window so far. If `window length - maxf > k`, drop one char from the left (the window never shrinks, it only slides). `maxf` never needs to decrease, because the answer only grows when a larger `maxf` appears. O(n) time, O(1) space.',
    },
    cpp: `class Solution {
public:
    int characterReplacement(string s, int k) {
        int cnt[26] = {0};
        int l = 0, maxf = 0, best = 0;
        for (int r = 0; r < (int)s.size(); r++) {
            maxf = max(maxf, ++cnt[s[r] - 'A']);
            if (r - l + 1 - maxf > k) {
                cnt[s[l] - 'A']--;
                l++;
            }
            best = max(best, r - l + 1);
        }
        return best;
    }
};`,
  },
}
