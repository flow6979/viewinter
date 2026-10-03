export default {
  id: 'course-schedule',
  title: 'Course Schedule',
  lc: 207,
  topic: '13-graphs',
  order: 4,
  difficulty: 'medium',
  tags: ['topological sort', 'cycle detection', 'bfs'],
  statement: {
    hi: '`numCourses` courses hain, `0` se `numCourses - 1` tak. `prerequisites[i] = [a, b]` ka matlab: course `a` lene se pehle course `b` complete karna zaroori hai. Kya saare courses finish karna possible hai? `true` ya `false` return karo.',
    en: 'There are `numCourses` courses labelled `0` to `numCourses - 1`. `prerequisites[i] = [a, b]` means you must take course `b` before course `a`. Return `true` if you can finish all courses, otherwise `false`.',
  },
  constraints: ['1 ≤ numCourses ≤ 2000', '0 ≤ prerequisites.length ≤ 5000', 'prerequisites[i] = [a, b], 0 ≤ a, b < numCourses', 'All pairs are unique'],
  hints: {
    hi: ['Courses ko nodes aur prerequisites ko directed edges `b → a` socho.', 'Sab finish ho sakte hain tabhi jab graph me koi cycle na ho. Kahn\'s algorithm (indegree 0 se BFS) try karo.'],
    en: ['Think of courses as nodes and each prerequisite as a directed edge `b → a`.', "All courses can be finished exactly when the graph has no cycle. Try Kahn's algorithm (BFS from indegree-0 nodes)."],
  },
  signature: { fn: 'canFinish', params: [{ name: 'numCourses', type: 'int' }, { name: 'prerequisites', type: 'vector<vector<int>>' }], ret: 'bool' },
  examples: [
    { args: [2, [[1, 0]]], explain: { hi: 'Pehle course 0, phir course 1.', en: 'Take course 0, then course 1.' } },
    { args: [2, [[1, 0], [0, 1]]], explain: { hi: '0 ke liye 1 chahiye aur 1 ke liye 0: cycle, impossible.', en: '0 needs 1 and 1 needs 0: a cycle, so it is impossible.' } },
  ],
  edge: [[1, []], [1, [[0, 0]]], [3, [[1, 0], [2, 1]]], [3, [[1, 0], [2, 1], [0, 2]]], [4, [[1, 0], [2, 0], [3, 1], [3, 2]]], [5, []]],
  solve(n, pre) {
    const adj = Array.from({ length: n }, () => [])
    const indeg = new Array(n).fill(0)
    for (const [a, b] of pre) adj[b].push(a), indeg[a]++
    const q = []
    for (let i = 0; i < n; i++) if (!indeg[i]) q.push(i)
    for (let h = 0; h < q.length; h++) for (const v of adj[q[h]]) if (--indeg[v] === 0) q.push(v)
    return q.length === n
  },
  generate(r) {
    const n = r.int(1, r.bool() ? 8 : 500)
    const m = r.int(0, Math.min(3000, n * 3))
    const order = r.shuffle([...Array(n).keys()])
    const seen = new Set(), pre = []
    for (let t = 0; t < m * 3 && pre.length < m; t++) {
      let i = r.int(0, n - 1), j = r.int(0, n - 1)
      if (i === j) continue
      if (i > j) [i, j] = [j, i]
      const a = order[j], b = order[i] // b comes earlier in the topological order
      if (!seen.has(`${a},${b}`)) seen.add(`${a},${b}`), pre.push([a, b])
    }
    if (n > 1 && r.bool()) {
      // add one backward edge, which usually creates a cycle
      let i = r.int(0, n - 1), j = r.int(0, n - 1)
      if (i !== j) {
        if (i > j) [i, j] = [j, i]
        const a = order[i], b = order[j]
        if (!seen.has(`${a},${b}`)) pre.push([a, b])
      }
    }
    return [n, r.shuffle(pre)]
  },
  solution: {
    approach: {
      hi: "Kahn's algorithm: har edge `b → a` ke liye `a` ka indegree badhao. Indegree 0 wale courses queue me daalo, unhe nikalte waqt unke neighbours ka indegree ghatao. Agar saare courses queue se nikal gaye to koi cycle nahi, answer true. O(V + E).",
      en: "Kahn's algorithm: for each edge `b → a`, increase `a`'s indegree. Push every indegree-0 course, and when you pop one, decrement its neighbours' indegrees. If every course gets popped there is no cycle, so return true. O(V + E).",
    },
    cpp: `class Solution {
public:
    bool canFinish(int numCourses, vector<vector<int>>& prerequisites) {
        vector<vector<int>> adj(numCourses);
        vector<int> indeg(numCourses, 0);
        for (auto& p : prerequisites) {
            adj[p[1]].push_back(p[0]);
            indeg[p[0]]++;
        }
        queue<int> q;
        for (int i = 0; i < numCourses; i++)
            if (indeg[i] == 0) q.push(i);
        int done = 0;
        while (!q.empty()) {
            int u = q.front(); q.pop();
            done++;
            for (int v : adj[u])
                if (--indeg[v] == 0) q.push(v);
        }
        return done == numCourses;
    }
};`,
  },
}
