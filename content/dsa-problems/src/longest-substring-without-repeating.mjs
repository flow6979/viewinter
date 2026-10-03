export default {
  id: 'longest-substring-without-repeating',
  title: 'Longest Substring Without Repeating Characters',
  lc: 3,
  topic: '06-two-pointers-sliding-window',
  order: 4,
  difficulty: 'medium',
  tags: ['sliding window', 'hash map', 'string'],
  statement: {
    hi: 'Ek string `s` di hai. Aisi sabse lambi **substring** (continuous hissa) ki length return karo jisme koi bhi character repeat na ho.',
    en: 'Given a string `s`, return the length of the longest **substring** (contiguous part) that contains no repeated characters.',
  },
  constraints: ['0 ≤ s.length ≤ 5 * 10^4', 's consists of English letters, digits, symbols and spaces'],
  hints: {
    hi: ['Ek window `[l, r]` rakho jisme saare characters unique hon.', 'Har character ki last position yaad rakho; repeat mile to `l` ko us position ke aage kood jaane do.'],
    en: ['Maintain a window `[l, r]` in which all characters are unique.', 'Remember the last position of each character; on a repeat, jump `l` past that position.'],
  },
  signature: { fn: 'lengthOfLongestSubstring', params: [{ name: 's', type: 'string' }], ret: 'int' },
  examples: [
    { args: ['abcabcbb'], explain: { hi: 'Answer "abc" hai, length 3.', en: 'The answer is "abc", with length 3.' } },
    { args: ['bbbbb'], explain: { hi: 'Answer "b" hai, length 1.', en: 'The answer is "b", with length 1.' } },
    { args: ['pwwkew'], explain: { hi: 'Answer "wke" hai, length 3. "pwke" substring nahi, subsequence hai.', en: 'The answer is "wke", with length 3. "pwke" is a subsequence, not a substring.' } },
  ],
  edge: [[''], [' '], ['au'], ['dvdf'], ['abba'], ['tmmzuxt'], ['a b!a']],
  solve(s) {
    const last = new Map()
    let l = 0, best = 0
    for (let r = 0; r < s.length; r++) {
      if (last.has(s[r]) && last.get(s[r]) >= l) l = last.get(s[r]) + 1
      last.set(s[r], r)
      best = Math.max(best, r - l + 1)
    }
    return best
  },
  generate(r) {
    const alpha = r.pick(['ab', 'abcde', 'abcdefghijklmnopqrstuvwxyz', 'abcXYZ019 !@', 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 '])
    return [r.str(r.int(0, r.bool() ? 12 : 2000), alpha)]
  },
  solution: {
    approach: {
      hi: 'Sliding window: `last[c]` me har character ki last index. `r` ko aage badhao; agar `s[r]` window ke andar pehle aa chuka hai to `l = last[s[r]] + 1`. Har step pe `r - l + 1` se answer update karo. O(n) time, O(alphabet) space.',
      en: 'Sliding window: `last[c]` stores the last index of each character. Advance `r`; if `s[r]` already appears inside the window, set `l = last[s[r]] + 1`. Update the answer with `r - l + 1` each step. O(n) time, O(alphabet) space.',
    },
    cpp: `class Solution {
public:
    int lengthOfLongestSubstring(string s) {
        vector<int> last(256, -1);
        int l = 0, best = 0;
        for (int r = 0; r < (int)s.size(); r++) {
            unsigned char c = s[r];
            if (last[c] >= l) l = last[c] + 1;
            last[c] = r;
            best = max(best, r - l + 1);
        }
        return best;
    }
};`,
  },
}
