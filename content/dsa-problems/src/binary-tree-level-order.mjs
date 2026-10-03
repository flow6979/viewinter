export default {
  id: 'binary-tree-level-order',
  title: 'Binary Tree Level Order Traversal',
  lc: 102,
  topic: '11-trees',
  order: 4,
  difficulty: 'medium',
  tags: ['bfs', 'tree'],
  statement: {
    hi: 'Binary tree ka `root` diya hai. Uske nodes ki values ka **level order traversal** return karo: level by level, har level me left se right.',
    en: 'Given the `root` of a binary tree, return the **level order traversal** of its nodes’ values: level by level, left to right within each level.',
  },
  constraints: ['0 ≤ number of nodes ≤ 2000', '-1000 ≤ Node.val ≤ 1000'],
  hints: {
    hi: ['Queue use karo (BFS).', 'Har level shuru hone pe queue ka size note karo — utne hi nodes is level ke hain.'],
    en: ['Use a queue (BFS).', 'At the start of each level, note the queue size — exactly that many nodes belong to this level.'],
  },
  signature: { fn: 'levelOrder', params: [{ name: 'root', type: 'TreeNode*' }], ret: 'vector<vector<int>>' },
  examples: [{ args: [[3, 9, 20, null, null, 15, 7]] }, { args: [[1]] }, { args: [[]] }],
  edge: [[[1, 2, null, 3, null, 4]], [[1, null, 2, null, 3]], [[-1000, 1000, -1000]], [[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]]],
  solve(root) {
    const out = []
    let level = root ? [root] : []
    while (level.length) {
      out.push(level.map((n) => n.val))
      level = level.flatMap((n) => [n.left, n.right].filter(Boolean))
    }
    return out
  },
  generate(r) {
    return [r.tree(r.int(1, r.bool() ? 15 : 1000), -1000, 1000)]
  },
  solution: {
    approach: {
      hi: 'BFS with queue: jab tak queue khaali nahi, uska current size `sz` lo, `sz` nodes pop karke unki values ek level me daalo aur unke children push karo.\nHar node ek baar: O(n) time, O(width) space.',
      en: 'BFS with a queue: while it is not empty, take its current size `sz`, pop `sz` nodes into one level and push their children.\nEach node once: O(n) time, O(width) space.',
    },
    cpp: `class Solution {
public:
    vector<vector<int>> levelOrder(TreeNode* root) {
        vector<vector<int>> res;
        if (!root) return res;
        queue<TreeNode*> q;
        q.push(root);
        while (!q.empty()) {
            int sz = q.size();
            vector<int> level;
            while (sz--) {
                TreeNode* node = q.front(); q.pop();
                level.push_back(node->val);
                if (node->left) q.push(node->left);
                if (node->right) q.push(node->right);
            }
            res.push_back(level);
        }
        return res;
    }
};`,
  },
}
