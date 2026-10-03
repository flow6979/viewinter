---
title: Trees
order: 11
time: 25
---

# Trees

Tree ek connected graph hai jisme koi cycle nahi; interviews me ye lagbhag hamesha binary tree ya BST hota hai jo `TreeNode*` ke roop me milta hai. Tree questions medium round ka sabse common topic hain kyunki almost sab ek recursive DFS me badal jaate hain jo children se kuch useful return karta hai.

```cpp
struct TreeNode { int val; TreeNode *left, *right;
    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {} };
```

## ⭐ Kab use karein (recognition)

- Input `TreeNode* root` hai → socho **"har node apne parent ko kya return kare?"** (post-order DFS).
- **"Level by level", "right side view", "minimum depth", "zigzag"** → queue ke saath BFS.
- BST pe **"sorted", "kth smallest", "validate", "range"** → inorder traversal sorted hota hai.
- **"Root se path"** → state neeche pass karo (pre-order); **"kahin bhi path / diameter"** → height upar return karo aur global answer update karo.
- **"Preorder + inorder se tree banao"** → root preorder se, inorder me uske index se split (hashmap).

| Problem phrase | Technique |
|---|---|
| height, balanced, diameter, max path sum | height/gain return karne wala post-order DFS |
| level order, right view, min depth | BFS, har level pe `q.size()` nodes process |
| validate BST, kth smallest, BST iterator | inorder (recursive ya stack) |
| LCA | found node return karne wala DFS; BST: value se chalo |
| serialize / traversals se build | preorder + nulls, ya preorder + inorder map |

## Terms jo pata hone chahiye

- **Depth** = root se node tak edges; **height** = neeche leaf tak sabse lambe path ke edges.
- **Full** (0 ya 2 children), **complete** (last level chhod ke sab full, left se right bhara: heap shape), **perfect** (saare leaves same depth pe), **balanced** (har node pe subtrees ki height ka fark ≤ 1).
- BST me **poore** subtree ke liye `left < node < right` hota hai, sirf direct children ke liye nahi.
- Balanced tree ki height O(log n); skewed tree O(n), to recursion depth n tak ja sakti hai.

## ⭐ DFS traversals: recursive aur iterative

**Ek line me:** preorder = node, left, right; inorder = left, node, right; postorder = left, right, node.

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

- Iterative preorder: root push karo; pop, visit, phir **pehle right, phir left** push. Iterative postorder: "node, right, left" karo aur result reverse kar do.
- Complexity: O(n) time, O(h) space.

**Interview tip:** kisi bhi tree question me pehle order decide karo: node se pehle children ke answers chahiye (post-order) ya children se pehle parent ka state (pre-order)?

**Common galti:** iterative inorder me andar wala `while (cur)` loop bhool jaana aur nodes miss karna.

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

- Right side view = har level ka last element. Min depth = BFS me pehla leaf jo mile.
- Complexity: O(n) time, O(w) space jahan w max width hai.

## ⭐ Height, diameter, path sums (upar return, global update)

**Ek line me:** parent ko best **single-branch** value return karo, par global answer current node se guzarne wali **two-branch** value se update karo.

```cpp
int best = 0;
int height(TreeNode* r) {                      // diameter (LC 543)
    if (!r) return 0;
    int L = height(r->left), R = height(r->right);
    best = max(best, L + R);                   // path through r (edges)
    return 1 + max(L, R);                      // single branch up
}
```

- **Max path sum (LC 124):** same shape, par negative branches hatane ke liye `gain = max(0, child)`, `best = max(best, val + gl + gr)`, return `val + max(gl, gr)`.
- **Balanced (LC 110):** O(n) rehne ke liye "unbalanced" sentinel -1 return karo.
- **Root se path sum (LC 112/113):** `remaining` neeche pass karo; leaf pe check. **Koi bhi downward path (LC 437):** DFS ke dauraan prefix sums + hashmap.

**Common galti:** parent ko `L + R` return karna; parent sirf ek branch extend kar sakta hai.

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

BST me: dono values chhoti hon to left jao, dono badi to right, warna current node hi LCA hai (O(h)).

## BST operations

```cpp
bool valid(TreeNode* r, long long lo, long long hi) {   // LC 98
    if (!r) return true;
    if (r->val <= lo || r->val >= hi) return false;
    return valid(r->left, lo, r->val) && valid(r->right, r->val, hi);
}
// call: valid(root, LLONG_MIN, LLONG_MAX)
```

- **Search / insert:** comparison se left ya right chalo, O(h).
- **Kth smallest (LC 230):** iterative inorder, kth pop pe ruk jao.
- **Delete:** leaf → hata do; ek child → splice; do children → inorder successor se replace.

## Traversals se tree banana

Preorder + inorder (LC 105): preorder ka agla element root hai; inorder me uska index (`unordered_map` se) left aur right sizes split karta hai. O(n). Postorder + inorder peeche se same tarah. Sirf preorder + postorder se unique tree nahi milta.

## Standard questions

| Problem | Pattern / key idea | Difficulty |
|---|---|---|
| 104. Maximum Depth of Binary Tree | `1 + max(L, R)` | Easy |
| 226. Invert Binary Tree | children recursively swap | Easy |
| 543. Diameter of Binary Tree | height + global `L + R` | Easy |
| 110. Balanced Binary Tree | -1 sentinel ke saath height | Easy |
| 100. Same Tree / 572. Subtree of Another Tree | parallel DFS | Easy |
| 102. Level Order Traversal | level size ke saath BFS | Medium |
| 199. Right Side View | har level ka last node | Medium |
| 98. Validate BST | (lo, hi) bounds pass karo | Medium |
| 230. Kth Smallest in BST | iterative inorder | Medium |
| 236. LCA of Binary Tree | found node return, split point | Medium |
| 105. Construct from Preorder and Inorder | root + index map | Medium |
| 437. Path Sum III | DFS me prefix sum + hashmap | Medium |
| 124. Binary Tree Max Path Sum | gain = max(0, child), global best | Hard |
| 297. Serialize and Deserialize | null markers ke saath preorder | Hard |

## Checklist

- [ ] Teeno DFS traversals recursively aur inorder iteratively likh sakta hoon
- [ ] "Level size freeze" trick ke saath BFS level order likh sakta hoon
- [ ] Height-style problems solve kar sakta hoon jahan ek branch return hoti hai par global answer dono se update hota hai
- [ ] Bounds se BST validate kar sakta hoon aur inorder se kth smallest nikal sakta hoon
- [ ] Binary tree aur BST dono me LCA nikal sakta hoon
- [ ] Preorder + inorder se O(n) me tree bana sakta hoon
