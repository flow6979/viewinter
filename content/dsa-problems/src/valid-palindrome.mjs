export default {
  id: 'valid-palindrome',
  title: 'Valid Palindrome',
  lc: 125,
  topic: '06-two-pointers-sliding-window',
  order: 1,
  difficulty: 'easy',
  tags: ['two pointers', 'string'],
  statement: {
    hi: 'Ek string `s` di hai. Saare uppercase letters ko lowercase karo aur saare non-alphanumeric characters hata do. Agar bachi hui string aage aur peeche se same padhi jaati hai (palindrome) to `true` return karo, warna `false`.',
    en: 'Given a string `s`, convert all uppercase letters to lowercase and remove all non-alphanumeric characters. Return `true` if the resulting string reads the same forward and backward (a palindrome), otherwise `false`.',
  },
  constraints: ['1 ≤ s.length ≤ 2 * 10^5', 's consists only of printable ASCII characters'],
  hints: {
    hi: ['Nayi string banaye bina kaam ho sakta hai — do pointers, ek shuru se ek end se.', 'Non-alphanumeric characters ko skip karo, aur compare karte waqt dono ko lowercase karo.'],
    en: ['You can do it without building a new string — two pointers, one from each end.', 'Skip non-alphanumeric characters and compare both sides in lowercase.'],
  },
  signature: { fn: 'isPalindrome', params: [{ name: 's', type: 'string' }], ret: 'bool' },
  examples: [
    { args: ['A man, a plan, a canal: Panama'], explain: { hi: 'Saaf karne ke baad "amanaplanacanalpanama" palindrome hai.', en: 'After cleaning, "amanaplanacanalpanama" is a palindrome.' } },
    { args: ['race a car'], explain: { hi: '"raceacar" palindrome nahi hai.', en: '"raceacar" is not a palindrome.' } },
    { args: [' '], explain: { hi: 'Saaf karne ke baad string khaali hai, aur khaali string palindrome hai.', en: 'After cleaning the string is empty, and an empty string is a palindrome.' } },
  ],
  edge: [['a'], ['.,'], ['0P'], ['ab_a'], ['Aa'], ['1b1'], ['!!a!b!!']],
  solve(s) {
    const t = s.toLowerCase().replace(/[^a-z0-9]/g, '')
    return t === [...t].reverse().join('')
  },
  generate(r) {
    const alpha = 'abcAB0129 ,.:!_-'
    const n = r.int(1, r.bool() ? 12 : 2000)
    if (r.bool()) {
      // build a palindrome core, then sprinkle case changes and punctuation
      const half = r.str(Math.ceil(n / 2), 'abcxyz019')
      const core = half + [...half].reverse().join('').slice(r.bool() ? 1 : 0)
      let out = ''
      for (const ch of core) {
        if (r.int(0, 3) === 0) out += r.pick(' ,.:!_-')
        out += r.bool() ? ch.toUpperCase() : ch
      }
      if (r.int(0, 2) === 0 && out.length > 2) {
        const i = r.int(0, out.length - 1)
        out = out.slice(0, i) + r.pick('abc9') + out.slice(i + 1)
      }
      return [out]
    }
    return [r.str(n, alpha)]
  },
  solution: {
    approach: {
      hi: 'Do pointers `i = 0`, `j = n-1`. Jab tak `i < j`: non-alphanumeric chars skip karo, phir `tolower(s[i])` aur `tolower(s[j])` compare karo; mismatch pe `false`. Extra string nahi banti. O(n) time, O(1) space.',
      en: 'Two pointers `i = 0`, `j = n-1`. While `i < j`: skip non-alphanumeric characters, then compare `tolower(s[i])` and `tolower(s[j])`; any mismatch means `false`. No extra string is built. O(n) time, O(1) space.',
    },
    cpp: `class Solution {
public:
    bool isPalindrome(string s) {
        int i = 0, j = (int)s.size() - 1;
        while (i < j) {
            if (!isalnum((unsigned char)s[i])) { i++; continue; }
            if (!isalnum((unsigned char)s[j])) { j--; continue; }
            if (tolower((unsigned char)s[i]) != tolower((unsigned char)s[j])) return false;
            i++; j--;
        }
        return true;
    }
};`,
  },
}
