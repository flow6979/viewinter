**In one line:** almost every tree problem is one DFS where each node returns something to its parent; level questions use BFS.

- **Traversals:** pre = node, L, R; in = L, node, R; post = L, R, node.
- **BST inorder is sorted:** use it for validate, kth smallest, iterator.
- **Post-order:** height, balanced, diameter, max path sum (children first).
- **Pre-order:** pass state down (root-to-leaf path sum, bounds).
- **Global answer trick:** return one branch up, update global with both branches (diameter, LC 124).
- **BFS level order:** freeze `q.size()` per level; right view = last of each level.
- **Iterative inorder:** push all lefts, pop, visit, go right.
- **Validate BST:** pass `(lo, hi)` bounds with `long long`, not just parent checks.
- **LCA:** return node if found; if both sides non-null, current node is LCA. BST: walk by value.
- **Build tree:** preorder gives root, inorder index (hashmap) splits; O(n).
- **Complexity:** O(n) time, O(h) space; skewed tree means h = n.

**Say in the interview:** "Each node returns its height; I update the global diameter with left + right at every node, so it's O(n)."

**Avoid:** Returning `L + R` to the parent; validating a BST by comparing only with direct children.
