export default {
  id: 'climbing-stairs',
  title: 'Climbing Stairs',
  lc: 70,
  topic: '15-dp',
  order: 1,
  difficulty: 'easy',
  tags: ['dp', 'fibonacci'],
  statement: {
    hi: 'Tum ek staircase chadh rahe ho jisme `n` steps hain. Ek baar me tum **1 ya 2** steps chadh sakte ho. Top tak pahunchne ke kitne **alag tareeke** hain? Count return karo.',
    en: 'You are climbing a staircase with `n` steps. Each time you can climb **1 or 2** steps. In how many **distinct ways** can you reach the top? Return the count.',
  },
  constraints: ['1 ≤ n ≤ 45'],
  hints: {
    hi: ['Last move ya to 1 step tha ya 2 steps.', 'ways(n) = ways(n-1) + ways(n-2) — sirf last do values yaad rakho.'],
    en: ['The last move was either 1 step or 2 steps.', 'ways(n) = ways(n-1) + ways(n-2) — keep only the last two values.'],
  },
  signature: { fn: 'climbStairs', params: [{ name: 'n', type: 'int' }], ret: 'int' },
  examples: [
    { args: [2], explain: { hi: '1+1 ya 2 — do tareeke.', en: '1+1 or 2 — two ways.' } },
    { args: [3], explain: { hi: '1+1+1, 1+2, 2+1 — teen tareeke.', en: '1+1+1, 1+2, 2+1 — three ways.' } },
  ],
  edge: [[1], [4], [45], [44]],
  solve(n) {
    let a = 1,
      b = 1
    for (let i = 2; i <= n; i++) [a, b] = [b, a + b]
    return b
  },
  generate(r) {
    return [r.int(1, 45)]
  },
  solution: {
    approach: {
      hi: 'Step `i` pe pahunchne ke tareeke = step `i-1` se + step `i-2` se. Ye Fibonacci hai. Do variables se bottom-up chalao. O(n) time, O(1) space.',
      en: 'Ways to reach step `i` = ways from `i-1` + ways from `i-2`. That is Fibonacci. Iterate bottom-up with two variables. O(n) time, O(1) space.',
    },
    cpp: `class Solution {
public:
    int climbStairs(int n) {
        int a = 1, b = 1; // ways(i-2), ways(i-1)
        for (int i = 2; i <= n; i++) {
            int c = a + b;
            a = b;
            b = c;
        }
        return b;
    }
};`,
  },
}
