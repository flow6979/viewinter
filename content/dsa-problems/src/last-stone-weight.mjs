export default {
  id: 'last-stone-weight',
  title: 'Last Stone Weight',
  lc: 1046,
  topic: '12-heaps-priority-queue',
  order: 1,
  difficulty: 'easy',
  tags: ['heap', 'simulation'],
  statement: {
    hi: 'Stones ke weights ka array `stones` diya hai. Har turn me do **sabse bhaari** stones `x ≤ y` ko takrao: `x == y` ho to dono khatam, warna `x` khatam aur `y` ka naya weight `y - x`. Jab tak ek ya zero stone na bache, ye repeat karo. Aakhri stone ka weight return karo (koi na bache to `0`).',
    en: 'Given an array `stones` of stone weights, each turn smash the two **heaviest** stones `x ≤ y`: if `x == y` both are destroyed, otherwise `x` is destroyed and `y` becomes `y - x`. Repeat until at most one stone is left. Return the weight of the last stone, or `0` if none remain.',
  },
  constraints: ['1 ≤ stones.length ≤ 30', '1 ≤ stones[i] ≤ 1000'],
  hints: {
    hi: ['Baar-baar do sabse bade elements chahiye — kaunsa data structure?', 'Max-heap: do pop karo, fark non-zero ho to wapas push karo.'],
    en: ['You repeatedly need the two largest elements — which data structure?', 'Max-heap: pop two, and push back the difference if it is non-zero.'],
  },
  signature: { fn: 'lastStoneWeight', params: [{ name: 'stones', type: 'vector<int>' }], ret: 'int' },
  examples: [
    { args: [[2, 7, 4, 1, 8, 1]], explain: { hi: '7,8 → 1; 2,4 → 2; 2,1 → 1; 1,1 → 0; bacha 1.', en: '7,8 → 1; 2,4 → 2; 2,1 → 1; 1,1 → 0; 1 is left.' } },
    { args: [[1]] },
  ],
  edge: [[[1000]], [[5, 5]], [[3, 7]], [[2, 2, 2]], [[1, 1, 1, 1]], [[1000, 1, 1, 1]]],
  solve(stones) {
    const a = [...stones]
    while (a.length > 1) {
      a.sort((x, y) => x - y)
      const y = a.pop()
      const x = a.pop()
      if (y !== x) a.push(y - x)
    }
    return a.length ? a[0] : 0
  },
  generate(r) {
    const n = r.int(1, r.bool() ? 6 : 30)
    return [r.array(n, 1, r.pick([3, 20, 1000]))]
  },
  solution: {
    approach: {
      hi: 'Saare stones max-heap me daalo. Jab tak heap me 2+ stones hain: do top pop karo, fark `y - x` non-zero ho to wapas push. End me heap khaali to `0`, warna top. O(n log n) time, O(n) space.',
      en: 'Put all stones in a max-heap. While it has 2+ stones, pop the top two and push back `y - x` if non-zero. At the end return `0` if the heap is empty, else its top. O(n log n) time, O(n) space.',
    },
    cpp: `class Solution {
public:
    int lastStoneWeight(vector<int>& stones) {
        priority_queue<int> pq(stones.begin(), stones.end());
        while (pq.size() > 1) {
            int y = pq.top(); pq.pop();
            int x = pq.top(); pq.pop();
            if (y != x) pq.push(y - x);
        }
        return pq.empty() ? 0 : pq.top();
    }
};`,
  },
}
