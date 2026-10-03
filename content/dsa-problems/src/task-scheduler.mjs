export default {
  id: 'task-scheduler',
  title: 'Task Scheduler',
  lc: 621,
  topic: '12-heaps-priority-queue',
  order: 4,
  difficulty: 'medium',
  tags: ['greedy', 'heap', 'counting'],
  statement: {
    hi: 'CPU tasks ka array `tasks` diya hai (har task ek capital letter `A`–`Z`) aur integer `n`. Har interval me CPU ek task karta hai ya idle rehta hai. **Same** letter ke do tasks ke beech kam se kam `n` intervals ka gap hona chahiye. Saare tasks khatam karne ke liye **minimum** kitne intervals lagenge?',
    en: 'Given an array `tasks` of CPU tasks (each a capital letter `A`–`Z`) and an integer `n`, each interval the CPU either runs one task or idles. Two tasks with the **same** letter must be at least `n` intervals apart. Return the **minimum** number of intervals needed to finish all tasks.',
  },
  constraints: ['1 ≤ tasks.length ≤ 10^4', "tasks[i] is an uppercase English letter", '0 ≤ n ≤ 100'],
  hints: {
    hi: ['Sabse zyada baar aane wala task hi frame banata hai: `maxFreq - 1` blocks, har block `n + 1` lamba.', 'Jitne tasks ki frequency `maxFreq` hai wo aakhri row me aate hain; answer kabhi `tasks.length` se kam nahi.'],
    en: ['The most frequent task shapes the schedule: `maxFreq - 1` blocks, each `n + 1` long.', 'Tasks that tie at `maxFreq` fill the last row; the answer is never below `tasks.length`.'],
  },
  signature: { fn: 'leastInterval', params: [{ name: 'tasks', type: 'vector<char>' }, { name: 'n', type: 'int' }], ret: 'int' },
  examples: [
    { args: [['A', 'A', 'A', 'B', 'B', 'B'], 2], explain: { hi: 'A → B → idle → A → B → idle → A → B: 8 intervals.', en: 'A → B → idle → A → B → idle → A → B: 8 intervals.' } },
    { args: [['A', 'C', 'A', 'B', 'D', 'B'], 1] },
    { args: [['A', 'A', 'A', 'B', 'B', 'B'], 3] },
  ],
  edge: [[['A'], 0], [['A'], 100], [['A', 'A', 'A'], 0], [['A', 'A', 'A'], 5], [['A', 'B', 'C', 'D', 'E', 'F'], 2], [['A', 'A', 'B', 'B', 'C', 'C', 'D', 'D'], 1]],
  solve(tasks, n) {
    const cnt = new Array(26).fill(0)
    for (const t of tasks) cnt[t.charCodeAt(0) - 65]++
    const mx = Math.max(...cnt)
    const tie = cnt.filter((c) => c === mx).length
    return Math.max(tasks.length, (mx - 1) * (n + 1) + tie)
  },
  generate(r) {
    const len = r.int(1, r.bool() ? 12 : 3000)
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.slice(0, r.pick([1, 3, 8, 26]))
    return [Array.from({ length: len }, () => r.pick(letters)), r.pick([0, 1, 2, r.int(0, 100)])]
  },
  solution: {
    approach: {
      hi: 'Counting/greedy: `maxFreq` wala task har `n + 1` slots me ek baar chalega, to `(maxFreq - 1)` poore blocks + aakhri row me utne slots jitne tasks ki frequency `maxFreq` hai. Agar tasks itne hain ki idle bachta hi nahi, to answer `tasks.length`. Isliye `max(len, (maxFreq-1)*(n+1) + tie)`. O(len) time. (Max-heap simulation bhi chalta hai.)',
      en: 'Counting/greedy: the most frequent task runs once per `n + 1` slots, giving `(maxFreq - 1)` full blocks plus a last row with one slot per task that ties at `maxFreq`. If there are enough tasks to leave no idle time, the answer is `tasks.length`. So `max(len, (maxFreq-1)*(n+1) + tie)`. O(len) time. (A max-heap simulation also works.)',
    },
    cpp: `class Solution {
public:
    int leastInterval(vector<char>& tasks, int n) {
        int cnt[26] = {0};
        for (char c : tasks) cnt[c - 'A']++;
        int mx = *max_element(cnt, cnt + 26);
        int tie = count(cnt, cnt + 26, mx);
        return max((int)tasks.size(), (mx - 1) * (n + 1) + tie);
    }
};`,
  },
}
