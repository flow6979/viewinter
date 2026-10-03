**Ek line:** lagbhag har tree problem ek DFS hai jisme har node parent ko kuch return karta hai; level wale questions BFS se.

- **Traversals:** pre = node, L, R; in = L, node, R; post = L, R, node.
- **BST inorder sorted hai:** validate, kth smallest, iterator ke liye use karo.
- **Post-order:** height, balanced, diameter, max path sum (children pehle).
- **Pre-order:** state neeche pass karo (root-to-leaf path sum, bounds).
- **Global answer trick:** upar ek branch return, global dono branches se update (diameter, LC 124).
- **BFS level order:** har level pe `q.size()` freeze; right view = har level ka last.
- **Iterative inorder:** saare left push, pop, visit, right jao.
- **Validate BST:** `long long` me `(lo, hi)` bounds pass karo, sirf parent check nahi.
- **LCA:** mile to node return; dono sides non-null to current node LCA. BST: value se chalo.
- **Build tree:** preorder root deta hai, inorder index (hashmap) split karta hai; O(n).
- **Complexity:** O(n) time, O(h) space; skewed tree me h = n.

**Interview me bolo:** "Har node apni height return karta hai; har node pe left + right se global diameter update karta hoon, to O(n)."

**Galti mat karna:** Parent ko `L + R` return mat karo; BST sirf direct children se compare karke validate mat karo.
