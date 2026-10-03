const validStarts = (gas, cost) => {
  const n = gas.length
  const out = []
  for (let s = 0; s < n; s++) {
    let tank = 0
    let ok = true
    for (let k = 0; k < n && ok; k++) {
      const i = (s + k) % n
      tank += gas[i] - cost[i]
      if (tank < 0) ok = false
    }
    if (ok) out.push(s)
  }
  return out
}

export default {
  id: 'gas-station',
  title: 'Gas Station',
  lc: 134,
  topic: '08-greedy-intervals',
  order: 4,
  difficulty: 'medium',
  tags: ['greedy', 'array'],
  statement: {
    hi: 'Ek circular route pe `n` gas stations hain. Station `i` pe `gas[i]` fuel milta hai aur `i` se `i+1` jaane me `cost[i]` fuel lagta hai. Tank khaali se shuru karke, wo starting station ka index return karo jahan se poora circle clockwise ek baar ghoom sako; possible na ho to `-1`. Agar answer hai to wo **unique** hai.',
    en: 'There are `n` gas stations on a circular route. Station `i` gives `gas[i]` fuel, and travelling from `i` to `i+1` costs `cost[i]` fuel. Starting with an empty tank, return the index of the starting station from which you can travel around the circuit once clockwise, or `-1` if it is impossible. If a solution exists, it is **unique**.',
  },
  constraints: ['1 ≤ n ≤ 10^5', 'gas.length == cost.length == n', '0 ≤ gas[i], cost[i] ≤ 10^4', 'If a solution exists, it is unique'],
  hints: {
    hi: ['Agar `sum(gas) < sum(cost)` hai to answer `-1` hi hai.', 'Agar `s` se chal ke `i` pe tank negative ho gaya, to `s..i` me se koi bhi start nahi ho sakta. Agla start `i+1`.'],
    en: ['If `sum(gas) < sum(cost)`, the answer is `-1`.', 'If starting at `s` the tank goes negative at `i`, no station in `s..i` can be the start. Try `i+1` next.'],
  },
  signature: { fn: 'canCompleteCircuit', params: [{ name: 'gas', type: 'vector<int>' }, { name: 'cost', type: 'vector<int>' }], ret: 'int' },
  examples: [
    { args: [[1, 2, 3, 4, 5], [3, 4, 5, 1, 2]], explain: { hi: 'Station 3 se shuru karo: tank 4 → 8 → 7 → 6 → 5 aur wapas station 3.', en: 'Start at station 3: tank goes 4 → 8 → 7 → 6 → 5 and you are back at station 3.' } },
    { args: [[2, 3, 4], [3, 4, 3]], explain: { hi: 'Total gas 9 < total cost 10, isliye -1.', en: 'Total gas 9 < total cost 10, so -1.' } },
  ],
  edge: [[[5], [4]], [[3], [4]], [[0], [0]], [[1, 0], [0, 1]], [[0, 0, 5], [1, 1, 3]], [[4, 0, 0], [0, 2, 3]]],
  solve(gas, cost) {
    let total = 0
    let tank = 0
    let start = 0
    for (let i = 0; i < gas.length; i++) {
      total += gas[i] - cost[i]
      tank += gas[i] - cost[i]
      if (tank < 0) {
        start = i + 1
        tank = 0
      }
    }
    return total < 0 ? -1 : start
  },
  // Keep only inputs with no valid start or exactly one valid start (checked by brute force)
  generate(r) {
    for (;;) {
      const n = r.int(1, r.bool() ? 10 : 1200)
      const hi = r.pick([5, 100, 10000])
      const gas = r.array(n, 0, hi)
      const cost = r.array(n, 0, hi)
      if (r.bool()) {
        // nudge totals towards balanced so a start often exists
        let diff = gas.reduce((a, b) => a + b, 0) - cost.reduce((a, b) => a + b, 0)
        for (let t = 0; t < 4 * n && diff < 0; t++) {
          const i = r.int(0, n - 1)
          const d = Math.min(-diff, cost[i])
          cost[i] -= d
          diff += d
        }
      }
      if (validStarts(gas, cost).length <= 1) return [gas, cost]
    }
  },
  solution: {
    approach: {
      hi: 'Agar total gas < total cost to `-1`. Warna ek pass me tank chalao; jahan tank negative ho, us tak ke saare stations start nahi ho sakte, to `start = i + 1` aur tank 0 karo. Total ≥ 0 hone par aakhri `start` hi answer hai. O(n) time, O(1) space.',
      en: 'If total gas < total cost, return `-1`. Otherwise run the tank in one pass; whenever it goes negative, no station up to `i` can be the start, so set `start = i + 1` and reset the tank. With total ≥ 0, the final `start` is the answer. O(n) time, O(1) space.',
    },
    cpp: `class Solution {
public:
    int canCompleteCircuit(vector<int>& gas, vector<int>& cost) {
        long long total = 0, tank = 0;
        int start = 0;
        for (int i = 0; i < (int)gas.size(); i++) {
            total += gas[i] - cost[i];
            tank += gas[i] - cost[i];
            if (tank < 0) { start = i + 1; tank = 0; }
        }
        return total < 0 ? -1 : start;
    }
};`,
  },
}
