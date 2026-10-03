export default {
  id: 'valid-anagram',
  title: 'Valid Anagram',
  lc: 242,
  topic: '05-arrays-hashing-prefix',
  order: 3,
  difficulty: 'easy',
  tags: ['hash map', 'string', 'counting'],
  statement: {
    hi: 'Do strings `s` aur `t` di hain. Agar `t`, `s` ka **anagram** hai (same letters, same count, order alag ho sakta hai) to `true` return karo, warna `false`.',
    en: 'Given two strings `s` and `t`, return `true` if `t` is an **anagram** of `s` (same letters with the same counts, possibly in a different order), and `false` otherwise.',
  },
  constraints: ['1 ≤ s.length, t.length ≤ 5 * 10^4', '`s` aur `t` me sirf lowercase English letters / `s` and `t` contain only lowercase English letters'],
  hints: {
    hi: ['Length alag ho to anagram ho hi nahi sakta.', '26 size ka count array: `s` ke letters ++, `t` ke letters --. Aakhir me sab zero?'],
    en: ['If the lengths differ, it cannot be an anagram.', 'Use a count array of size 26: ++ for letters of `s`, -- for letters of `t`. Is everything zero at the end?'],
  },
  signature: { fn: 'isAnagram', params: [{ name: 's', type: 'string' }, { name: 't', type: 'string' }], ret: 'bool' },
  examples: [
    { args: ['anagram', 'nagaram'] },
    { args: ['rat', 'car'] },
  ],
  edge: [['a', 'a'], ['a', 'b'], ['ab', 'a'], ['aab', 'abb'], ['zzzz', 'zzzz'], ['abc', 'cbad']],
  solve(s, t) {
    if (s.length !== t.length) return false
    return [...s].sort().join('') === [...t].sort().join('')
  },
  generate(r) {
    const alpha = r.pick(['ab', 'abc', 'abcdefghijklmnopqrstuvwxyz'])
    const n = r.int(1, r.bool() ? 10 : 2000)
    const s = r.str(n, alpha)
    const kind = r.int(0, 2)
    if (kind === 0) return [s, r.shuffle([...s]).join('')]
    if (kind === 1) {
      const a = r.shuffle([...s])
      a[r.int(0, n - 1)] = r.pick(alpha)
      return [s, a.join('')]
    }
    return [s, r.str(r.int(1, n + 1), alpha)]
  },
  solution: {
    approach: {
      hi: 'Length alag to `false`. Warna 26 ka count array lo: `s` ke har char pe `cnt[c-\'a\']++`, `t` pe `--`. Koi bhi count non-zero to `false`. O(n) time, O(1) space.',
      en: 'If lengths differ, return `false`. Otherwise use a count array of 26: `cnt[c-\'a\']++` for each char of `s`, `--` for `t`. Any non-zero count means `false`. O(n) time, O(1) space.',
    },
    cpp: `class Solution {
public:
    bool isAnagram(string s, string t) {
        if (s.size() != t.size()) return false;
        int cnt[26] = {0};
        for (char c : s) cnt[c - 'a']++;
        for (char c : t) cnt[c - 'a']--;
        for (int i = 0; i < 26; i++)
            if (cnt[i] != 0) return false;
        return true;
    }
};`,
  },
}
