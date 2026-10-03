export default {
  id: 'palindrome-number',
  title: 'Palindrome Number',
  lc: 9,
  topic: '01-cpp-basics',
  order: 2,
  difficulty: 'easy',
  tags: ['math'],
  statement: {
    hi: 'Ek integer `x` diya hai. Agar `x` **palindrome** hai (ulta padhne pe bhi same) to `true` return karo, warna `false`. Negative numbers palindrome nahi hote (`-121` ulta `121-` hai).',
    en: 'Given an integer `x`, return `true` if `x` is a **palindrome** (reads the same backward as forward), otherwise `false`. Negative numbers are not palindromes (`-121` reversed is `121-`).',
  },
  constraints: ['-2^31 ≤ x ≤ 2^31 - 1'],
  hints: {
    hi: ['`x % 10` aakhri digit deta hai, `x / 10` use hata deta hai.', 'Number ko ulta banao (overflow se bachne ke liye `long long` me) aur original se compare karo.'],
    en: ['`x % 10` gives the last digit and `x / 10` removes it.', 'Build the reversed number (in a `long long` to avoid overflow) and compare it with the original.'],
  },
  signature: { fn: 'isPalindrome', params: [{ name: 'x', type: 'int' }], ret: 'bool' },
  examples: [
    { args: [121], explain: { hi: 'Ulta bhi 121 hai.', en: '121 reversed is still 121.' } },
    { args: [-121], explain: { hi: 'Ulta "121-" hai, isliye palindrome nahi.', en: 'Reversed it is "121-", so not a palindrome.' } },
    { args: [10], explain: { hi: 'Ulta "01" hai.', en: 'Reversed it is "01".' } },
  ],
  edge: [[0], [7], [-1], [2147483647], [-2147483648], [1000000001], [1234567899], [11]],
  solve(x) {
    if (x < 0) return false
    const s = String(x)
    return s === [...s].reverse().join('')
  },
  generate(r) {
    const kind = r.int(0, 3)
    if (kind === 0) return [r.int(-2147483648, 2147483647)]
    if (kind === 1) return [r.int(-1000, 1000)]
    // build a palindrome (sometimes negated or with one digit changed)
    const len = r.int(1, 9)
    const half = r.str(Math.ceil(len / 2), '0123456789').replace(/^0/, String(r.int(1, 9)))
    const s = half + [...half.slice(0, Math.floor(len / 2))].reverse().join('')
    let v = Number(s)
    if (kind === 3 && v > 10) v += r.int(1, 9)
    return [r.bool() && kind === 3 ? -v : v]
  },
  solution: {
    approach: {
      hi: 'Negative ho to seedha `false`. Warna digits nikaal ke reversed number banao (`rev = rev * 10 + x % 10`) `long long` me, aur original se compare karo. O(log x) time, O(1) space.',
      en: 'If negative, return `false`. Otherwise peel off digits to build the reversed number (`rev = rev * 10 + x % 10`) in a `long long`, then compare with the original. O(log x) time, O(1) space.',
    },
    cpp: `class Solution {
public:
    bool isPalindrome(int x) {
        if (x < 0) return false;
        long long rev = 0;
        int t = x;
        while (t > 0) {
            rev = rev * 10 + t % 10;
            t /= 10;
        }
        return rev == x;
    }
};`,
  },
}
