**In one line:** DP needs subproblems solved before use: on trees that is post-order DFS, on DAGs topological order, on cyclic graphs Dijkstra/Bellman-Ford or a bitmask state.

- **Tree DP:** each node returns a summary to its parent; record paths that bend at the node in a global.
- **Max path sum / diameter:** return `val + max(l, r)`, record `val + l + r`.
- **Take/skip on tree:** return `{take, skip}` (House Robber III); take forces children to skip.
- **Rerooting:** two DFS passes give the answer for every root in O(n) (Sum of Distances).
- **DAG DP:** Kahn's order, relax `dp[v]` from `dp[u]`; longest path and path counts in O(V + E).
- **Implicit DAG:** strictly increasing moves in a grid → memo DFS without visited array (LC 329).
- **Count shortest paths:** Dijkstra/BFS with `ways[]`: reset on smaller dist, add on equal.
- **Bitmask on graphs:** "visit all nodes", n ≤ 20 → state (mask, node), O(2ⁿ·n²).
- **Floyd–Warshall:** DP over allowed intermediates; k must be the outer loop.
- **Bellman-Ford:** DP on "at most i edges" (K stops: copy array each round).

**Say in the interview:** "Each node returns the best single chain to its parent, and I update the global answer with both chains joined at this node."

**Avoid:** Returning a forked path (`val + l + r`) to the parent, or trying longest-path DP on a graph with cycles.
