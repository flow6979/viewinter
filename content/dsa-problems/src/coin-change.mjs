export default {
  id: 'coin-change',
  title: 'Coin Change',
  lc: 322,
  topic: '15-dp',
  order: 4,
  difficulty: 'medium',
  tags: ['dp', 'unbounded knapsack'],
  statement: {
    hi: 'Alag-alag denominations ke coins `coins` aur ek `amount` diya hai. Har coin unlimited baar use kar sakte ho. `amount` banane ke liye **kam se kam** kitne coins chahiye, return karo. Agar banana possible nahi to `-1` return karo.',
    en: 'You are given coins of different denominations `coins` and a total `amount`. You may use each coin any number of times. Return the **fewest** coins needed to make up `amount`, or `-1` if it cannot be made.',
  },
  constraints: ['1 ≤ coins.length ≤ 12', '1 ≤ coins[i] ≤ 2^31 - 1', '0 ≤ amount ≤ 10^4'],
  hints: {
    hi: ['Greedy (sabse bada coin pehle) hamesha sahi nahi hota.', 'dp[x] = amount `x` ke liye min coins; dp[x] = 1 + min(dp[x - c]) har coin `c` ke liye.'],
    en: ['Greedy (largest coin first) is not always correct.', 'dp[x] = min coins for amount `x`; dp[x] = 1 + min(dp[x - c]) over every coin `c`.'],
  },
  signature: { fn: 'coinChange', params: [{ name: 'coins', type: 'vector<int>' }, { name: 'amount', type: 'int' }], ret: 'int' },
  examples: [
    { args: [[1, 2, 5], 11], explain: { hi: '11 = 5 + 5 + 1', en: '11 = 5 + 5 + 1' } },
    { args: [[2], 3] },
    { args: [[1], 0] },
  ],
  edge: [[[2147483647], 2], [[1], 10000], [[2, 5, 10, 1], 27], [[186, 419, 83, 408], 6249], [[3, 7], 1], [[1, 3, 4], 6]],
  solve(coins, amount) {
    const dp = Array(amount + 1).fill(Infinity)
    dp[0] = 0
    for (let x = 1; x <= amount; x++) for (const c of coins) if (c <= x && dp[x - c] + 1 < dp[x]) dp[x] = dp[x - c] + 1
    return dp[amount] === Infinity ? -1 : dp[amount]
  },
  generate(r, i) {
    const k = r.int(1, 12)
    const hi = r.pick([10, 50, 500, 5000])
    const coins = r.distinct(Math.min(k, hi), 1, hi)
    if (r.int(0, 5) === 0) coins[0] = r.int(20000, 2147483647)
    else if (r.bool()) coins[0] = r.int(1, 9) // a small coin makes most amounts reachable
    const amount = i % 3 === 0 ? r.int(0, 60) : r.int(0, 10000)
    return [coins, amount]
  },
  solution: {
    approach: {
      hi: 'Bottom-up DP: `dp[0] = 0`, baaki infinity. Har amount `x` ke liye har coin try karo: `dp[x] = min(dp[x], dp[x - c] + 1)`. Last me `dp[amount]` infinity ho to -1. O(amount · k) time, O(amount) space.',
      en: 'Bottom-up DP: `dp[0] = 0`, everything else infinity. For each amount `x`, try every coin: `dp[x] = min(dp[x], dp[x - c] + 1)`. If `dp[amount]` is still infinity, return -1. O(amount · k) time, O(amount) space.',
    },
    cpp: `class Solution {
public:
    int coinChange(vector<int>& coins, int amount) {
        const int INF = INT_MAX;
        vector<int> dp(amount + 1, INF);
        dp[0] = 0;
        for (int x = 1; x <= amount; x++)
            for (int c : coins)
                if (c <= x && dp[x - c] != INF) dp[x] = min(dp[x], dp[x - c] + 1);
        return dp[amount] == INF ? -1 : dp[amount];
    }
};`,
  },
}
