export default {
  id: 'diameter-of-binary-tree',
  title: 'Diameter of Binary Tree',
  lc: 543,
  topic: '11-trees',
  order: 3,
  difficulty: 'easy',
  tags: ['dfs', 'tree'],
  statement: {
    hi: 'Binary tree ka `root` diya hai. Tree ka **diameter** return karo: kisi bhi do nodes ke beech ke sabse lambe path ki length.\n\nLength = path me **edges** ki sankhya. Ye path root se guzre, ye zaroori nahi.',
    en: 'Given the `root` of a binary tree, return the **diameter** of the tree: the length of the longest path between any two nodes.\n\nLength = the number of **edges** on the path. The path may or may not pass through the root.',
  },
  constraints: ['1 ≤ number of nodes ≤ 10^4', '-100 ≤ Node.val ≤ 100'],
  hints: {
    hi: ['Har node pe "best path jo is node se mudta hai" = left height + right height.', 'Ek DFS me height return karo aur saath me global answer update karte raho.'],
    en: ['At each node, the best path that turns there = left height + right height.', 'Return the height from one DFS and update a global answer along the way.'],
  },
  signature: { fn: 'diameterOfBinaryTree', params: [{ name: 'root', type: 'TreeNode*' }], ret: 'int' },
  examples: [
    { args: [[1, 2, 3, 4, 5]], explain: { hi: 'Path [4,2,1,3] ya [5,2,1,3] — 3 edges.', en: 'Path [4,2,1,3] or [5,2,1,3] — 3 edges.' } },
    { args: [[1, 2]] },
  ],
  edge: [[[1]], [[1, 2, null, 3, null, 4, null, 5]], [[1, 2, null, 3, 4, 5, null, null, 6, 7, null, null, 8]], [[1, 2, 3, 4, 5, 6, 7]]],
  solve(root) {
    let best = 0
    const h = (n) => {
      if (!n) return 0
      const a = h(n.left)
      const b = h(n.right)
      best = Math.max(best, a + b)
      return 1 + Math.max(a, b)
    }
    h(root)
    return best
  },
  generate(r) {
    return [r.tree(r.int(1, r.bool() ? 15 : 1000), -100, 100)]
  },
  solution: {
    approach: {
      hi: 'Post-order DFS jo height return kare. Har node pe `left + right` (dono subtrees ki heights) us node se mudne wale path ki edges hain — global `best` me max rakho.\nHar node ek baar: O(n) time, O(h) stack.',
      en: 'Post-order DFS that returns the height. At each node, `left + right` (the two subtree heights) is the edge count of the path turning there — keep the max in a global `best`.\nEach node once: O(n) time, O(h) stack.',
    },
    cpp: `class Solution {
public:
    int diameterOfBinaryTree(TreeNode* root) {
        best = 0;
        height(root);
        return best;
    }
private:
    int best;
    int height(TreeNode* node) {
        if (!node) return 0;
        int l = height(node->left), r = height(node->right);
        best = max(best, l + r);
        return 1 + max(l, r);
    }
};`,
  },
}
