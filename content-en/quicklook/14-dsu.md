**In one line:** DSU keeps elements in groups with near-O(1) `find` (which group?) and `unite` (merge two groups), using path compression + union by size.

- **Cues:** "connected components", "merge groups/accounts", "are x and y connected", edges added one by one.
- **Structure:** each set is a tree; the root is the representative; `parent[x] == x` means root.
- **Path compression:** `parent[x] = find(parent[x])` flattens the path on every find.
- **Union by size/rank:** hang the smaller tree under the bigger one.
- **Complexity:** amortised O(α(n)) per op (≤ 4 in practice); one optimisation alone gives O(log n).
- **Cycle check:** `unite` returns false when both ends share a root → that edge closes a cycle (undirected only).
- **Kruskal:** sort edges by weight, keep an edge only if `unite` succeeds.
- **Grids:** map (r, c) to `r * cols + c`.
- **Weighted DSU:** store ratio to parent for "a / b = k" queries (Evaluate Division).
- **Not DSU:** distances/paths (BFS), directed cycles (DFS/Kahn), deletions (reverse offline).

**Say in the interview:** "Edges arrive online and I only need connectivity, so DSU with path compression and union by size gives near-constant time per edge."

**Avoid:** Linking original nodes instead of their roots (`parent[a] = b` without `find`), or using DSU for directed-graph cycles.
