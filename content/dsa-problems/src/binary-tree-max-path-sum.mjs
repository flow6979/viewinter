export default {
  id: 'binary-tree-max-path-sum',
  title: 'Binary Tree Maximum Path Sum',
  lc: 124,
  topic: '11-trees',
  order: 9,
  difficulty: 'hard',
  tags: ['dfs', 'tree'],
  statement: {
    hi: 'Binary tree ka `root` diya hai. **Path** = nodes ka sequence jisme har adjacent pair ke beech edge ho; ek node path me ek hi baar aa sakta hai, aur path ka root se guzarna zaroori nahi. Path me kam se kam ek node hona chahiye.\n\nKisi bhi non-empty path ka **maximum path sum** (nodes ki values ka sum) return karo.',
    en: 'Given the `root` of a binary tree: a **path** is a sequence of nodes where each adjacent pair is joined by an edge; a node appears at most once, and the path need not pass through the root. A path has at least one node.\n\nReturn the **maximum path sum** (sum of node values) of any non-empty path.',
  },
  constraints: ['1 ≤ number of nodes ≤ 3 · 10^4', '-1000 ≤ Node.val ≤ 1000'],
  hints: {
    hi: ['Har node ke liye do cheezein socho: (1) is node se neeche jaane wala best "single branch" sum, (2) is node pe mudne wala best path.', 'Negative branch lene ka koi fayda nahi — `max(0, gain)` lo.', 'Saari values negative ho sakti hain; answer ko `INT_MIN` / root ki value se initialise karo.'],
    en: ['For each node, think of two things: (1) the best single downward branch starting there, (2) the best path that turns at that node.', 'A negative branch never helps — use `max(0, gain)`.', 'All values may be negative; initialise the answer to `INT_MIN` / the root value.'],
  },
  signature: { fn: 'maxPathSum', params: [{ name: 'root', type: 'TreeNode*' }], ret: 'int' },
  examples: [
    { args: [[1, 2, 3]], explain: { hi: 'Path 2 → 1 → 3, sum = 6.', en: 'Path 2 → 1 → 3, sum = 6.' } },
    { args: [[-10, 9, 20, null, null, 15, 7]], explain: { hi: 'Path 15 → 20 → 7, sum = 42.', en: 'Path 15 → 20 → 7, sum = 42.' } },
  ],
  edge: [[[-3]], [[-2, -1]], [[-1000, -1000, -1000]], [[2, -1]], [[1, -2, 3]], [[5, 4, 8, 11, null, 13, 4, 7, 2, null, null, null, 1]], [[1000, 1000, 1000, 1000, 1000, 1000, 1000]]],
  solve(root) {
    let best = -Infinity
    const gain = (n) => {
      if (!n) return 0
      const l = Math.max(0, gain(n.left))
      const r = Math.max(0, gain(n.right))
      best = Math.max(best, n.val + l + r)
      return n.val + Math.max(l, r)
    }
    gain(root)
    return best
  },
  generate(r) {
    const n = r.int(1, r.bool() ? 15 : 1000)
    const kind = r.int(0, 3)
    if (kind === 0) return [r.tree(n, -1000, -1)] // all negative
    if (kind === 1) return [r.tree(n, -1000, 300)] // mostly negative
    return [r.tree(n, -1000, 1000)]
  },
  solution: {
    approach: {
      hi: '`gain(node)` = node se neeche jaane wali best single branch ka sum = `val + max(0, gain(left), gain(right))` (negative branch chhod do).\nUsi DFS me, node pe mudne wala path `val + max(0, gainL) + max(0, gainR)` hai — isse global `best` update karo.\nHar node ek baar: O(n) time, O(h) stack.',
      en: '`gain(node)` = the best single downward branch from the node = `val + max(0, gain(left), gain(right))` (drop negative branches).\nIn the same DFS, the path turning at the node is `val + max(0, gainL) + max(0, gainR)` — update a global `best` with it.\nEach node once: O(n) time, O(h) stack.',
    },
    cpp: `class Solution {
public:
    int maxPathSum(TreeNode* root) {
        best = INT_MIN;
        gain(root);
        return best;
    }
private:
    int best;
    int gain(TreeNode* node) {
        if (!node) return 0;
        int l = max(0, gain(node->left));
        int r = max(0, gain(node->right));
        best = max(best, node->val + l + r);   // path turning at this node
        return node->val + max(l, r);          // branch continuing upward
    }
};`,
  },
}
