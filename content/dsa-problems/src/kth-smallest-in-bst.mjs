export default {
  id: 'kth-smallest-in-bst',
  title: 'Kth Smallest Element in a BST',
  lc: 230,
  topic: '11-trees',
  order: 7,
  difficulty: 'medium',
  tags: ['bst', 'inorder', 'tree'],
  statement: {
    hi: 'Ek BST ka `root` aur integer `k` diya hai. Tree ki saari values me se **k-th sabse chhoti** value return karo (1-indexed).',
    en: 'Given the `root` of a BST and an integer `k`, return the **k-th smallest** value among all the node values (1-indexed).',
  },
  constraints: ['1 ≤ k ≤ n ≤ 10^4', '0 ≤ Node.val ≤ 10^4'],
  hints: {
    hi: ['BST ka inorder traversal sorted order deta hai.', 'Inorder chalate hue counter rakho; `k`-th node pe ruk jao.'],
    en: ['An inorder traversal of a BST visits values in sorted order.', 'Keep a counter during the inorder walk and stop at the `k`-th node.'],
  },
  signature: { fn: 'kthSmallest', params: [{ name: 'root', type: 'TreeNode*' }, { name: 'k', type: 'int' }], ret: 'int' },
  examples: [{ args: [[3, 1, 4, null, 2], 1] }, { args: [[5, 3, 6, 2, 4, null, null, 1], 3] }],
  edge: [[[0], 1], [[1, null, 2, null, 3, null, 4], 4], [[4, 3, null, 2, null, 1], 1], [[10000, 0], 2]],
  solve(root, k) {
    const vals = []
    const walk = (n) => n && (walk(n.left), vals.push(n.val), walk(n.right))
    walk(root)
    return vals[k - 1]
  },
  generate(r) {
    const n = r.int(1, r.bool() ? 15 : 1000)
    return [r.bst(n, 0, 10000), r.int(1, n)]
  },
  solution: {
    approach: {
      hi: 'Iterative inorder with stack: left-most tak push karo, pop karo (ye agla sabse chhota hai), `k` ghatao; `k == 0` pe value return. Phir right subtree me jao.\nO(h + k) time, O(h) space.',
      en: 'Iterative inorder with a stack: push down to the left-most node, pop (that is the next smallest), decrement `k`; return when `k == 0`. Then move to the right subtree.\nO(h + k) time, O(h) space.',
    },
    cpp: `class Solution {
public:
    int kthSmallest(TreeNode* root, int k) {
        stack<TreeNode*> st;
        TreeNode* cur = root;
        while (cur || !st.empty()) {
            while (cur) { st.push(cur); cur = cur->left; }
            cur = st.top(); st.pop();
            if (--k == 0) return cur->val;
            cur = cur->right;
        }
        return -1; // unreachable: 1 <= k <= n
    }
};`,
  },
}
