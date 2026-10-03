export default {
  id: 'house-robber-iii',
  title: 'House Robber III',
  lc: 337,
  topic: '16-dp-on-trees-graphs',
  order: 1,
  difficulty: 'medium',
  tags: ['dp', 'tree', 'dfs'],
  statement: {
    hi: 'Ghar ek binary tree ki shape me hain, `root` se shuru. Har node ki value us ghar ka paisa hai. Agar do **directly connected** ghar (parent-child) ek hi raat loote to alarm baj jaata hai. Bina alarm ke maximum loot return karo.',
    en: 'Houses form a binary tree starting at `root`; each node’s value is the money in that house. Robbing two **directly linked** houses (parent and child) on the same night triggers the alarm. Return the maximum amount you can rob without triggering it.',
  },
  constraints: ['1 ≤ number of nodes ≤ 10^4', '0 ≤ Node.val ≤ 10^4'],
  hints: {
    hi: ['Har node se do values return karo: is node ko lootne pe best, aur na lootne pe best.', 'Loota → children nahi loot sakte. Nahi loota → har child ke dono options ka max.'],
    en: ['Return two values from each node: the best if it is robbed and the best if it is not.', 'Robbed → its children cannot be robbed. Not robbed → take the max of both options for each child.'],
  },
  signature: { fn: 'rob', params: [{ name: 'root', type: 'TreeNode*' }], ret: 'int' },
  examples: [
    { args: [[3, 2, 3, null, 3, null, 1]], explain: { hi: '3 + 3 + 1 = 7.', en: '3 + 3 + 1 = 7.' } },
    { args: [[3, 4, 5, 1, 3, null, 1]], explain: { hi: '4 + 5 = 9.', en: '4 + 5 = 9.' } },
  ],
  edge: [[[5]], [[0]], [[1, 2, 3]], [[4, 1, null, 2, null, 3]], [[2, 1, 3, null, 4]]],
  solve(root) {
    const go = (n) => {
      if (!n) return [0, 0]
      const [lt, ln] = go(n.left)
      const [rt, rn] = go(n.right)
      return [n.val + ln + rn, Math.max(lt, ln) + Math.max(rt, rn)]
    }
    return Math.max(...go(root))
  },
  generate(r, i) {
    const n = i % 3 === 0 ? r.int(1, 12) : r.int(1, 1000)
    return [r.tree(n, 0, r.pick([10, 10000]))]
  },
  solution: {
    approach: {
      hi: 'Post-order DFS jo har node ke liye pair `{take, skip}` return kare. `take = val + left.skip + right.skip`, `skip = max(left) + max(right)`. Root pe dono ka max. Har node ek baar — O(n) time, O(h) stack.',
      en: 'Post-order DFS returning a pair `{take, skip}` for every node. `take = val + left.skip + right.skip`, `skip = max(left) + max(right)`. Answer is the max of the pair at the root. Each node once — O(n) time, O(h) stack.',
    },
    cpp: `class Solution {
    // {best if node robbed, best if node skipped}
    pair<int, int> go(TreeNode* n) {
        if (!n) return {0, 0};
        auto [lt, ls] = go(n->left);
        auto [rt, rs] = go(n->right);
        return {n->val + ls + rs, max(lt, ls) + max(rt, rs)};
    }
public:
    int rob(TreeNode* root) {
        auto [t, s] = go(root);
        return max(t, s);
    }
};`,
  },
}
