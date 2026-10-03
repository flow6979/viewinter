export default {
  id: 'validate-bst',
  title: 'Validate Binary Search Tree',
  lc: 98,
  topic: '11-trees',
  order: 6,
  difficulty: 'medium',
  tags: ['dfs', 'bst', 'tree'],
  statement: {
    hi: 'Binary tree ka `root` diya hai. Batao ki ye ek **valid BST** hai ya nahi.\n\nValid BST: har node ke **left subtree** ki saari values node se **strictly chhoti**, **right subtree** ki saari values **strictly badi**, aur dono subtrees bhi khud valid BST hon.',
    en: 'Given the `root` of a binary tree, determine whether it is a **valid binary search tree**.\n\nA valid BST: every value in a node’s **left subtree** is **strictly less** than the node’s value, every value in its **right subtree** is **strictly greater**, and both subtrees are valid BSTs too.',
  },
  constraints: ['1 ≤ number of nodes ≤ 10^4', '-2^31 ≤ Node.val ≤ 2^31 - 1'],
  hints: {
    hi: ['Sirf parent se compare karna kaafi nahi — poore subtree ka khayal rakhna hai.', 'Har node ke liye ek allowed range `(lo, hi)` pass karo. Ya inorder traversal strictly increasing hona chahiye.', 'Values INT_MIN/INT_MAX tak ja sakti hain — bounds ke liye `long long` ya pointers use karo.'],
    en: ['Comparing with the parent alone is not enough — the whole subtree matters.', 'Pass an allowed range `(lo, hi)` down to every node. Alternatively, the inorder traversal must be strictly increasing.', 'Values can reach INT_MIN/INT_MAX — use `long long` or node pointers for the bounds.'],
  },
  signature: { fn: 'isValidBST', params: [{ name: 'root', type: 'TreeNode*' }], ret: 'bool' },
  examples: [
    { args: [[2, 1, 3]] },
    { args: [[5, 1, 4, null, null, 3, 6]], explain: { hi: 'Root 5 hai lekin right child 4 hai, jo 5 se chhota hai.', en: 'The root is 5 but its right child is 4, which is smaller.' } },
  ],
  edge: [
    [[2147483647]],
    [[-2147483648, null, 2147483647]],
    [[2, 2, 2]],
    [[1, 1]],
    [[5, 4, 6, null, null, 3, 7]],
    [[3, 1, 5, 0, 2, 4, 6, null, null, null, 3]],
    [[-2147483648, -2147483648]],
  ],
  solve(root) {
    const ok = (n, lo, hi) => !n || (n.val > lo && n.val < hi && ok(n.left, lo, n.val) && ok(n.right, n.val, hi))
    return ok(root, -Infinity, Infinity)
  },
  generate(r) {
    const big = r.int(0, 3) === 0
    const lo = big ? -2147483648 : -1000
    const hi = big ? 2147483647 : 1000
    const n = r.int(1, r.bool() ? 15 : 1000)
    const kind = r.int(0, 3)
    if (kind === 3) return [r.tree(n, lo, hi)]
    const arr = r.bst(Math.min(n, hi - lo + 1), lo, hi)
    if (kind === 0 || arr.length < 2) return [arr]
    // break the BST: change one value in the level-order array (often only slightly, so the violation is subtle)
    const idx = arr.map((v, i) => (v === null ? -1 : i)).filter((i) => i >= 0)
    const a = r.pick(idx)
    if (kind === 1) arr[a] = arr[r.pick(idx)]
    else [arr[a], arr[0]] = [arr[0], arr[a]]
    return [arr]
  },
  solution: {
    approach: {
      hi: 'DFS with bounds: `check(node, lo, hi)` — node ki value `lo < val < hi` honi chahiye; left me `(lo, val)` aur right me `(val, hi)` pass karo.\nBounds `long long` me rakho (LLONG_MIN/LLONG_MAX) taaki INT_MIN/INT_MAX values bhi sahi chalein. O(n) time, O(h) space.',
      en: 'DFS with bounds: `check(node, lo, hi)` — the value must satisfy `lo < val < hi`; pass `(lo, val)` to the left and `(val, hi)` to the right.\nKeep the bounds in `long long` (LLONG_MIN/LLONG_MAX) so INT_MIN/INT_MAX values work. O(n) time, O(h) space.',
    },
    cpp: `class Solution {
public:
    bool isValidBST(TreeNode* root) {
        return check(root, LLONG_MIN, LLONG_MAX);
    }
private:
    bool check(TreeNode* node, long long lo, long long hi) {
        if (!node) return true;
        if (node->val <= lo || node->val >= hi) return false;
        return check(node->left, lo, node->val) && check(node->right, node->val, hi);
    }
};`,
  },
}
