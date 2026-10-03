export default {
  id: 'invert-binary-tree',
  title: 'Invert Binary Tree',
  lc: 226,
  topic: '11-trees',
  order: 2,
  difficulty: 'easy',
  tags: ['dfs', 'tree'],
  statement: {
    hi: 'Binary tree ka `root` diya hai. Tree ko **invert** karo (har node ke left aur right children swap karo — mirror image) aur uska `root` return karo.',
    en: 'Given the `root` of a binary tree, **invert** the tree (swap the left and right children of every node — its mirror image) and return its `root`.',
  },
  constraints: ['0 ≤ number of nodes ≤ 100', '-100 ≤ Node.val ≤ 100'],
  hints: {
    hi: ['Har node pe sirf uske do children swap karne hain.', 'Swap ke baad dono subtrees ko recursively invert karo.'],
    en: ['At every node you only need to swap its two children.', 'After swapping, invert both subtrees recursively.'],
  },
  signature: { fn: 'invertTree', params: [{ name: 'root', type: 'TreeNode*' }], ret: 'TreeNode*' },
  examples: [{ args: [[4, 2, 7, 1, 3, 6, 9]] }, { args: [[2, 1, 3]] }, { args: [[]] }],
  edge: [[[1]], [[1, 2]], [[1, null, 2]], [[1, 2, null, 3, null, 4]], [[5, 5, 5, 5, 5, 5, 5]]],
  solve(root) {
    const inv = (n) => {
      if (!n) return null
      ;[n.left, n.right] = [inv(n.right), inv(n.left)]
      return n
    }
    return inv(root)
  },
  generate(r) {
    return [r.tree(r.int(1, r.bool() ? 15 : 100), -100, 100)]
  },
  solution: {
    approach: {
      hi: 'DFS: node null ho to null return karo; warna `left` aur `right` swap karo aur dono ko recursively invert karo.\nHar node ek baar visit: O(n) time, O(h) recursion stack.',
      en: 'DFS: return null for a null node; otherwise swap `left` and `right` and invert both recursively.\nEach node is visited once: O(n) time, O(h) recursion stack.',
    },
    cpp: `class Solution {
public:
    TreeNode* invertTree(TreeNode* root) {
        if (!root) return nullptr;
        swap(root->left, root->right);
        invertTree(root->left);
        invertTree(root->right);
        return root;
    }
};`,
  },
}
