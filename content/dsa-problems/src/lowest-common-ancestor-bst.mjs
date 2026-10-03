export default {
  id: 'lowest-common-ancestor-bst',
  title: 'Lowest Common Ancestor of a Binary Search Tree',
  lc: 235,
  topic: '11-trees',
  order: 8,
  difficulty: 'medium',
  tags: ['bst', 'tree'],
  statement: {
    hi: 'Ek BST ka `root` aur do values `p` aur `q` di hain (dono tree me exist karti hain). Un dono nodes ka **lowest common ancestor (LCA)** dhoondo aur uski **value** return karo.\n\nLCA = sabse neeche wala node jiske subtree me dono nodes hon (ek node apna khud ka ancestor bhi maana jaata hai).',
    en: 'Given the `root` of a BST and two values `p` and `q` (both exist in the tree), find the **lowest common ancestor (LCA)** of the two nodes and return its **value**.\n\nThe LCA is the lowest node that has both nodes in its subtree (a node counts as a descendant of itself).',
  },
  constraints: ['2 ≤ number of nodes ≤ 10^5', '-10^9 ≤ Node.val ≤ 10^9', 'All Node.val are unique', 'p != q', 'p and q exist in the BST'],
  hints: {
    hi: ['BST property use karo: dono values current node se chhoti hain to LCA left me hai.', 'Dono badi hain to right me. Warna (split ho gaye ya ek barabar hai) current node hi LCA hai.'],
    en: ['Use the BST property: if both values are smaller than the current node, the LCA is on the left.', 'If both are larger, go right. Otherwise (they split, or one equals the node) the current node is the LCA.'],
  },
  signature: { fn: 'lowestCommonAncestor', params: [{ name: 'root', type: 'TreeNode*' }, { name: 'p', type: 'int' }, { name: 'q', type: 'int' }], ret: 'int' },
  examples: [
    { args: [[6, 2, 8, 0, 4, 7, 9, null, null, 3, 5], 2, 8], explain: { hi: '2 aur 8 ka LCA 6 hai.', en: 'The LCA of 2 and 8 is 6.' } },
    { args: [[6, 2, 8, 0, 4, 7, 9, null, null, 3, 5], 2, 4], explain: { hi: '2 khud 4 ka ancestor hai, to LCA 2 hai.', en: '2 is an ancestor of 4 itself, so the LCA is 2.' } },
    { args: [[2, 1], 2, 1] },
  ],
  edge: [[[1, null, 2, null, 3, null, 4], 3, 4], [[4, 3, null, 2, null, 1], 1, 2], [[-1000000000, null, 1000000000], 1000000000, -1000000000], [[5, 3, 8, 1, 4, 7, 9], 1, 9]],
  solve(root, p, q) {
    let n = root
    for (;;) {
      if (p < n.val && q < n.val) n = n.left
      else if (p > n.val && q > n.val) n = n.right
      else return n.val
    }
  },
  generate(r) {
    const size = r.int(2, r.bool() ? 15 : 1000)
    const arr = r.bst(size, -1000000000, 1000000000)
    const vals = arr.filter((v) => v !== null)
    const [p, q] = r.shuffle(vals).slice(0, 2)
    return [arr, p, q]
  },
  solution: {
    approach: {
      hi: 'Root se neeche chalo: agar `p` aur `q` dono `node->val` se chhote hain to left jao, dono bade hain to right jao; warna yahi node split point hai = LCA.\nSirf ek path follow hota hai: O(h) time, O(1) extra space (iterative).',
      en: 'Walk down from the root: if both `p` and `q` are smaller than `node->val`, go left; if both are larger, go right; otherwise this node is the split point = the LCA.\nOnly one path is followed: O(h) time, O(1) extra space (iterative).',
    },
    cpp: `class Solution {
public:
    int lowestCommonAncestor(TreeNode* root, int p, int q) {
        TreeNode* node = root;
        while (node) {
            if (p < node->val && q < node->val) node = node->left;
            else if (p > node->val && q > node->val) node = node->right;
            else return node->val;
        }
        return -1; // unreachable: p and q exist
    }
};`,
  },
}
