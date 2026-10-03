---
title: Trees
order: 11
time: 25
---

# Trees

A tree is a connected graph with no cycles; in interviews it is almost always a binary tree or a BST given as `TreeNode*`. Tree questions are the most common medium round topic because nearly all of them reduce to one recursive DFS that returns something useful from the children.

```cpp
struct TreeNode { int val; TreeNode *left, *right;
    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {} };
```

## ⭐ When to use it

- Input is `TreeNode* root` → think **"what should each node return to its parent?"** (post-order DFS).
- **"Level by level", "right side view", "minimum depth", "zigzag"** → BFS with a queue.
- **"Sorted", "kth smallest", "validate", "range"** on a BST → inorder traversal is sorted.
- **"Path from root"** → pass state down (pre-order); **"path anywhere / diameter"** → return height up and update a global answer.
- **"Build tree from preorder + inorder"** → root from preorder, split by its index in inorder (hashmap).

| Problem phrase | Technique |
|---|---|
| height, balanced, diameter, max path sum | post-order DFS returning height/gain |
| level order, right view, min depth | BFS, process `q.size()` nodes per level |
| validate BST, kth smallest, BST iterator | inorder (recursive or stack) |
| LCA | DFS returning node found; BST: walk by value |
| serialize / build from traversals | preorder + nulls, or preorder + inorder map |

## Terms you must know

- **Depth** = edges from root to node; **height** = edges on the longest path down to a leaf.
- **Full** (0 or 2 children), **complete** (all levels full except last, filled left to right: heap shape), **perfect** (all leaves at same depth), **balanced** (height difference of subtrees ≤ 1 at every node).
- A BST has `left < node < right` for the **whole** subtree, not just the direct children.
- Height of a balanced tree is O(log n); a skewed tree is O(n), so recursion depth can hit n.

## ⭐ DFS traversals: recursive and iterative

**In one line:** preorder = node, left, right; inorder = left, node, right; postorder = left, right, node.

> **Example:** tree `1 (2 (4, 5), 3)` → preorder `1 2 4 5 3`, inorder `4 2 5 1 3`, postorder `4 5 2 3 1`, level order `1 | 2 3 | 4 5`.

```cpp
void inorder(TreeNode* r, vector<int>& out) {
    if (!r) return;
    inorder(r->left, out); out.push_back(r->val); inorder(r->right, out);
}

vector<int> inorderIter(TreeNode* root) {      // explicit stack
    vector<int> out; stack<TreeNode*> st; TreeNode* cur = root;
    while (cur || !st.empty()) {
        while (cur) { st.push(cur); cur = cur->left; }  // go far left
        cur = st.top(); st.pop();
        out.push_back(cur->val);
        cur = cur->right;
    }
    return out;
}
```

- Iterative preorder: push root; pop, visit, push **right then left**. Iterative postorder: do "node, right, left" and reverse the result.
- Complexity: O(n) time, O(h) space.

**Interview tip:** for any tree question, first decide the order: do you need children's answers before the node (post-order) or the parent's state before the children (pre-order)?

**Common mistake:** writing iterative inorder without the inner `while (cur)` loop and losing nodes.

## ⭐ BFS level order

```cpp
vector<vector<int>> levelOrder(TreeNode* root) {
    vector<vector<int>> res; if (!root) return res;
    queue<TreeNode*> q; q.push(root);
    while (!q.empty()) {
        int sz = q.size(); vector<int> level;      // freeze level size
        for (int i = 0; i < sz; i++) {
            TreeNode* n = q.front(); q.pop();
            level.push_back(n->val);
            if (n->left) q.push(n->left);
            if (n->right) q.push(n->right);
        }
        res.push_back(level);
    }
    return res;
}
```

- Right side view = last element of each level. Min depth = first leaf reached by BFS.
- Complexity: O(n) time, O(w) space where w is max width.

## ⭐ Height, diameter, path sums (return up, update global)

**In one line:** return the best **single-branch** value to the parent, but update the global answer with the **two-branch** value through the current node.

```cpp
int best = 0;
int height(TreeNode* r) {                      // diameter (LC 543)
    if (!r) return 0;
    int L = height(r->left), R = height(r->right);
    best = max(best, L + R);                   // path through r (edges)
    return 1 + max(L, R);                      // single branch up
}
```

- **Max path sum (LC 124):** same shape, but `gain = max(0, child)` to drop negative branches, `best = max(best, val + gl + gr)`, return `val + max(gl, gr)`.
- **Balanced (LC 110):** return -1 as "unbalanced" sentinel to stay O(n).
- **Path sum from root (LC 112/113):** pass `remaining` down; check at a leaf. **Any downward path (LC 437):** prefix sums + hashmap during DFS.

**Common mistake:** returning `L + R` to the parent; a parent can only extend one branch.

## LCA (lowest common ancestor)

```cpp
TreeNode* lca(TreeNode* r, TreeNode* p, TreeNode* q) {
    if (!r || r == p || r == q) return r;
    TreeNode* L = lca(r->left, p, q);
    TreeNode* R = lca(r->right, p, q);
    if (L && R) return r;                      // split point
    return L ? L : R;
}
```

In a BST: if both values are smaller go left, both larger go right, otherwise the current node is the LCA (O(h)).

## BST operations

```cpp
bool valid(TreeNode* r, long long lo, long long hi) {   // LC 98
    if (!r) return true;
    if (r->val <= lo || r->val >= hi) return false;
    return valid(r->left, lo, r->val) && valid(r->right, r->val, hi);
}
// call: valid(root, LLONG_MIN, LLONG_MAX)
```

- **Search / insert:** walk left or right by comparison, O(h).
- **Kth smallest (LC 230):** iterative inorder, stop at the kth pop.
- **Delete:** leaf → remove; one child → splice; two children → replace with inorder successor.

## Building trees from traversals

Preorder + inorder (LC 105): preorder's next element is the root; its index in inorder (from an `unordered_map`) splits left and right sizes. O(n). Postorder + inorder works the same from the back. Preorder + postorder alone does not give a unique tree.

## Standard questions

| Problem | Pattern / key idea | Difficulty |
|---|---|---|
| 104. Maximum Depth of Binary Tree | `1 + max(L, R)` | Easy |
| 226. Invert Binary Tree | swap children recursively | Easy |
| 543. Diameter of Binary Tree | height + global `L + R` | Easy |
| 110. Balanced Binary Tree | height with -1 sentinel | Easy |
| 100. Same Tree / 572. Subtree of Another Tree | parallel DFS | Easy |
| 102. Level Order Traversal | BFS with level size | Medium |
| 199. Right Side View | last node per level | Medium |
| 98. Validate BST | pass (lo, hi) bounds | Medium |
| 230. Kth Smallest in BST | iterative inorder | Medium |
| 236. LCA of Binary Tree | return found node, split point | Medium |
| 105. Construct from Preorder and Inorder | root + index map | Medium |
| 437. Path Sum III | prefix sum + hashmap in DFS | Medium |
| 124. Binary Tree Max Path Sum | gain = max(0, child), global best | Hard |
| 297. Serialize and Deserialize | preorder with null markers | Hard |

## Checklist

- [ ] I can write all three DFS traversals recursively and inorder iteratively
- [ ] I can write BFS level order with the "freeze level size" trick
- [ ] I can solve height-style problems where I return one branch but update a global answer with both
- [ ] I can validate a BST with bounds and find the kth smallest with inorder
- [ ] I can find the LCA in a binary tree and in a BST
- [ ] I can build a tree from preorder + inorder in O(n)
