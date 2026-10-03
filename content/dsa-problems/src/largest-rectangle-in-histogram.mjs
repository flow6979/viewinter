export default {
  id: 'largest-rectangle-in-histogram',
  title: 'Largest Rectangle in Histogram',
  lc: 84,
  topic: '09-stack-queue-monotonic',
  order: 6,
  difficulty: 'hard',
  tags: ['monotonic stack', 'array'],
  statement: {
    hi: 'Ek histogram ke bars ki heights `heights` array me di hain, har bar ki width `1` hai. Histogram ke andar ban sakne wale **sabse bade rectangle** ka area return karo.',
    en: 'Given an array `heights` of bar heights in a histogram where each bar has width `1`, return the area of the **largest rectangle** that fits in the histogram.',
  },
  constraints: ['1 ≤ heights.length ≤ 10^5', '0 ≤ heights[i] ≤ 10^4'],
  hints: {
    hi: ['Har bar ko rectangle ki height maano: wo left aur right me kitna fail sakta hai?', 'Har bar ke liye pehla chhota bar left aur right me — monotonic increasing stack se ek pass me.'],
    en: ['Treat each bar as the rectangle height: how far can it extend left and right?', 'For each bar find the first shorter bar on each side — an increasing stack does it in one pass.'],
  },
  signature: { fn: 'largestRectangleArea', params: [{ name: 'heights', type: 'vector<int>' }], ret: 'int' },
  examples: [
    { args: [[2, 1, 5, 6, 2, 3]], explain: { hi: 'Heights 5 aur 6 wale bars se height 5, width 2 ka rectangle: area 10.', en: 'The bars of height 5 and 6 give a rectangle of height 5 and width 2: area 10.' } },
    { args: [[2, 4]] },
  ],
  edge: [[[0]], [[7]], [[0, 0, 0]], [[3, 3, 3, 3]], [[1, 2, 3, 4, 5]], [[5, 4, 3, 2, 1]], [[2, 0, 2]], [[10000, 10000, 10000]]],
  solve(h) {
    const st = []
    let best = 0
    for (let i = 0; i <= h.length; i++) {
      const cur = i === h.length ? 0 : h[i]
      while (st.length && h[st[st.length - 1]] >= cur) {
        const height = h[st.pop()]
        const left = st.length ? st[st.length - 1] : -1
        best = Math.max(best, height * (i - left - 1))
      }
      st.push(i)
    }
    return best
  },
  generate(r) {
    const n = r.int(1, r.bool() ? 10 : 3000)
    const hi = r.pick([5, 100, 10000])
    return [r.array(n, 0, hi)]
  },
  solution: {
    approach: {
      hi: 'Increasing stack of indices. Jab current bar top se chhota (ya barabar) ho, top pop karo: uski height ka rectangle naye top ke baad se `i - 1` tak fail sakta hai, width = `i - newTop - 1`. End me height 0 ka sentinel daal ke sab pop karo. O(n) time, O(n) space.',
      en: 'Keep an increasing stack of indices. When the current bar is shorter than (or equal to) the top, pop it: a rectangle of that height spans from just after the new top to `i - 1`, width `i - newTop - 1`. A height-0 sentinel at the end flushes the stack. O(n) time, O(n) space.',
    },
    cpp: `class Solution {
public:
    int largestRectangleArea(vector<int>& heights) {
        int n = heights.size(), best = 0;
        stack<int> st;
        for (int i = 0; i <= n; i++) {
            int cur = (i == n) ? 0 : heights[i];
            while (!st.empty() && heights[st.top()] >= cur) {
                int h = heights[st.top()]; st.pop();
                int left = st.empty() ? -1 : st.top();
                best = max(best, h * (i - left - 1));
            }
            st.push(i);
        }
        return best;
    }
};`,
  },
}
