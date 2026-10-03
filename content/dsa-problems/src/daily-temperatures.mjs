export default {
  id: 'daily-temperatures',
  title: 'Daily Temperatures',
  lc: 739,
  topic: '09-stack-queue-monotonic',
  order: 4,
  difficulty: 'medium',
  tags: ['monotonic stack', 'array'],
  statement: {
    hi: 'Roz ke temperatures ka array `temperatures` diya hai. Ek array `answer` return karo jahan `answer[i]` = din `i` ke baad kitne din wait karna padega jab tak **zyada garam** din aaye. Aisa din na ho to `answer[i] = 0`.',
    en: 'Given an array `temperatures` of daily temperatures, return an array `answer` where `answer[i]` is the number of days you have to wait after day `i` to get a **warmer** temperature. If there is no such day, `answer[i] = 0`.',
  },
  constraints: ['1 ≤ temperatures.length ≤ 10^5', '30 ≤ temperatures[i] ≤ 100'],
  hints: {
    hi: ['Un dino ke indices ek stack me rakho jinka garam din abhi tak nahi mila.', 'Stack ko temperatures ke hisaab se decreasing rakho; naya garam din aaye to pop karke answer bharo.'],
    en: ['Keep a stack of indices of days still waiting for a warmer day.', 'Keep the stack decreasing by temperature; when a warmer day arrives, pop and fill in answers.'],
  },
  signature: { fn: 'dailyTemperatures', params: [{ name: 'temperatures', type: 'vector<int>' }], ret: 'vector<int>' },
  examples: [{ args: [[73, 74, 75, 71, 69, 72, 76, 73]] }, { args: [[30, 40, 50, 60]] }, { args: [[30, 60, 90]] }],
  edge: [[[50]], [[100, 90, 80, 70]], [[70, 70, 70, 70]], [[30, 100]], [[100, 30, 30, 30, 31]]],
  solve(t) {
    const ans = new Array(t.length).fill(0)
    const st = []
    for (let i = 0; i < t.length; i++) {
      while (st.length && t[st[st.length - 1]] < t[i]) {
        const j = st.pop()
        ans[j] = i - j
      }
      st.push(i)
    }
    return ans
  },
  generate(r) {
    const n = r.int(1, r.bool() ? 10 : 3000)
    const lo = r.pick([30, 60, 95])
    return [r.array(n, lo, 100)]
  },
  solution: {
    approach: {
      hi: 'Monotonic stack: indices ka stack jisme temperatures decreasing hain. Din `i` pe jab tak top wala din `i` se thanda hai, use pop karo aur `answer[top] = i - top` likho. Phir `i` push karo. Har index ek baar push/pop, O(n) time.',
      en: 'Monotonic stack of indices with decreasing temperatures. At day `i`, while the top day is colder than day `i`, pop it and set `answer[top] = i - top`; then push `i`. Each index is pushed and popped once, so O(n) time.',
    },
    cpp: `class Solution {
public:
    vector<int> dailyTemperatures(vector<int>& temperatures) {
        int n = temperatures.size();
        vector<int> ans(n, 0);
        stack<int> st;
        for (int i = 0; i < n; i++) {
            while (!st.empty() && temperatures[st.top()] < temperatures[i]) {
                ans[st.top()] = i - st.top();
                st.pop();
            }
            st.push(i);
        }
        return ans;
    }
};`,
  },
}
