export default {
  id: 'max-depth-binary-tree',
  title: 'Maximum Depth of Binary Tree',
  lc: 104,
  topic: '11-trees',
  order: 1,
  difficulty: 'easy',
  tags: ['dfs', 'tree'],
  statement: {
    hi: 'Binary tree ka `root` diya hai. Uski **maximum depth** return karo: root se sabse door leaf tak ke path me kitne nodes hain.',
    en: 'Given the `root` of a binary tree, return its **maximum depth**: the number of nodes on the longest path from the root down to a leaf.',
  },
  constraints: ['0 ≤ number of nodes ≤ 10^4', '-100 ≤ Node.val ≤ 100'],
  hints: { hi: ['depth(node) = 1 + max(depth(left), depth(right))'], en: ['depth(node) = 1 + max(depth(left), depth(right))'] },
  signature: { fn: 'maxDepth', params: [{ name: 'root', type: 'TreeNode*' }], ret: 'int' },
  examples: [{ args: [[3, 9, 20, null, null, 15, 7]] }, { args: [[1, null, 2]] }],
  edge: [[[]], [[0]]],
  solve(root) {
    const d = (n) => (n ? 1 + Math.max(d(n.left), d(n.right)) : 0)
    return d(root)
  },
  generate(r) {
    return [r.tree(r.int(1, r.bool() ? 15 : 800), -100, 100)]
  },
  solution: {
    approach: { hi: 'DFS: har node ki depth = 1 + dono children me badi depth. O(n).', en: 'DFS: a node’s depth is 1 + the larger child depth. O(n).' },
    cpp: `class Solution {
public:
    int maxDepth(TreeNode* root) {
        if (!root) return 0;
        return 1 + max(maxDepth(root->left), maxDepth(root->right));
    }
};`,
  },
}
