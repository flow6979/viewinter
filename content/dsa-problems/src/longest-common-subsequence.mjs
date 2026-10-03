export default {
  id: 'longest-common-subsequence',
  title: 'Longest Common Subsequence',
  lc: 1143,
  topic: '15-dp',
  order: 7,
  difficulty: 'medium',
  tags: ['dp', 'string'],
  statement: {
    hi: 'Do strings `text1` aur `text2` di hain. Unki **longest common subsequence** ki length return karo. Agar koi common subsequence nahi hai to `0` return karo.',
    en: 'Given two strings `text1` and `text2`, return the length of their **longest common subsequence**. If there is no common subsequence, return `0`.',
  },
  constraints: ['1 ≤ text1.length, text2.length ≤ 1000', 'Both strings contain only lowercase English letters'],
  hints: {
    hi: ['dp[i][j] = `text1` ke pehle i aur `text2` ke pehle j characters ka LCS.', 'Characters match ho to dp[i-1][j-1] + 1, warna max(dp[i-1][j], dp[i][j-1]).'],
    en: ['dp[i][j] = LCS of the first i chars of `text1` and the first j chars of `text2`.', 'If the characters match, dp[i-1][j-1] + 1; otherwise max(dp[i-1][j], dp[i][j-1]).'],
  },
  signature: { fn: 'longestCommonSubsequence', params: [{ name: 'text1', type: 'string' }, { name: 'text2', type: 'string' }], ret: 'int' },
  examples: [
    { args: ['abcde', 'ace'], explain: { hi: 'LCS "ace" hai, length 3.', en: 'The LCS is "ace", length 3.' } },
    { args: ['abc', 'abc'] },
    { args: ['abc', 'def'] },
  ],
  edge: [['a', 'a'], ['a', 'b'], ['aaaa', 'aa'], ['abcba', 'abcbcba'], ['bsbininm', 'jmjkbkjkv']],
  solve(a, b) {
    const m = b.length
    let prev = Array(m + 1).fill(0)
    for (let i = 1; i <= a.length; i++) {
      const cur = Array(m + 1).fill(0)
      for (let j = 1; j <= m; j++) cur[j] = a[i - 1] === b[j - 1] ? prev[j - 1] + 1 : Math.max(prev[j], cur[j - 1])
      prev = cur
    }
    return prev[m]
  },
  generate(r, i) {
    const alpha = r.pick(['ab', 'abc', 'abcdef', 'abcdefghijklmnopqrstuvwxyz'])
    const big = i % 3 !== 0
    return [r.str(r.int(1, big ? 1000 : 10), alpha), r.str(r.int(1, big ? 1000 : 10), alpha)]
  },
  solution: {
    approach: {
      hi: '2D DP: `dp[i][j]` = pehle i aur pehle j characters ka LCS. Last characters equal hon to diagonal + 1, warna upar/left ka max. Sirf pichhli row chahiye. O(m·n) time, O(n) space.',
      en: '2D DP: `dp[i][j]` = LCS of the first i and first j characters. If the last characters are equal, take the diagonal + 1, else the max of top/left. Only the previous row is needed. O(m·n) time, O(n) space.',
    },
    cpp: `class Solution {
public:
    int longestCommonSubsequence(string& text1, string& text2) {
        int n = text1.size(), m = text2.size();
        vector<int> prev(m + 1, 0), cur(m + 1, 0);
        for (int i = 1; i <= n; i++) {
            for (int j = 1; j <= m; j++)
                cur[j] = text1[i - 1] == text2[j - 1] ? prev[j - 1] + 1 : max(prev[j], cur[j - 1]);
            swap(prev, cur);
        }
        return prev[m];
    }
};`,
  },
}
