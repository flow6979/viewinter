export default {
  id: 'binary-tree-right-side-view',
  title: 'Binary Tree Right Side View',
  lc: 199,
  topic: '11-trees',
  order: 5,
  difficulty: 'medium',
  tags: ['bfs', 'dfs', 'tree'],
  statement: {
    hi: 'Binary tree ka `root` diya hai. Socho tum tree ke **right side** khade ho — jo nodes dikhte hain unki values **upar se neeche** order me return karo.',
    en: 'Given the `root` of a binary tree, imagine standing on its **right side**. Return the values of the nodes you can see, ordered **from top to bottom**.',
  },
  constraints: ['0 ≤ number of nodes ≤ 100', '-100 ≤ Node.val ≤ 100'],
  hints: {
    hi: ['Har level ka sabse right wala node dikhta hai.', 'BFS me har level ka last node lo — ya DFS (right pehle) me har depth pe pehla node.'],
    en: ['On each level, the right-most node is the one you see.', 'Take the last node of each BFS level — or, in a right-first DFS, the first node reached at each depth.'],
  },
  signature: { fn: 'rightSideView', params: [{ name: 'root', type: 'TreeNode*' }], ret: 'vector<int>' },
  examples: [
    { args: [[1, 2, 3, null, 5, null, 4]] },
    { args: [[1, 2, 3, 4, null, null, null, 5]], explain: { hi: 'Level 3 pe sirf 5 hai, jo left side ki taraf hai, phir bhi wahi dikhta hai.', en: 'Level 3 only has 5, on the left side, yet it is still visible.' } },
    { args: [[1, null, 3]] },
  ],
  edge: [[[]], [[7]], [[1, 2, null, 3, null, 4]], [[1, 2, 3, 4, 5, 6, 7]]],
  solve(root) {
    const out = []
    let level = root ? [root] : []
    while (level.length) {
      out.push(level[level.length - 1].val)
      level = level.flatMap((n) => [n.left, n.right].filter(Boolean))
    }
    return out
  },
  generate(r) {
    return [r.tree(r.int(1, r.bool() ? 15 : 100), -100, 100)]
  },
  solution: {
    approach: {
      hi: 'DFS jo pehle right child visit kare, saath me `depth` pass karo. Jab `depth == ans.size()` ho, matlab is depth pe pehli baar aaye — wahi node right se dikhta hai, use push karo.\nO(n) time, O(h) space.',
      en: 'A DFS that visits the right child first and carries the `depth`. When `depth == ans.size()`, this is the first node reached at that depth — it is the one visible from the right, so push it.\nO(n) time, O(h) space.',
    },
    cpp: `class Solution {
public:
    vector<int> rightSideView(TreeNode* root) {
        vector<int> ans;
        dfs(root, 0, ans);
        return ans;
    }
private:
    void dfs(TreeNode* node, int depth, vector<int>& ans) {
        if (!node) return;
        if (depth == (int)ans.size()) ans.push_back(node->val);
        dfs(node->right, depth + 1, ans);
        dfs(node->left, depth + 1, ans);
    }
};`,
  },
}
