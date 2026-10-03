**In one line:** build an adjacency list, then let the weights and the question pick the algorithm: BFS, Dijkstra, topo sort, DSU/MST.

- **Unweighted shortest path:** BFS; many sources at once → multi-source BFS.
- **0/1 weights:** 0-1 BFS with a deque.
- **Non-negative weights:** Dijkstra with a min-heap, O(E log V); skip stale entries.
- **Negative weights / ≤ K edges:** Bellman-Ford, O(V·E).
- **All pairs, n ≤ 400:** Floyd–Warshall, k as the outer loop.
- **Dependencies / order:** topological sort (Kahn); order size < n → cycle.
- **Cycle, undirected:** visited neighbour that is not parent, or DSU.
- **Cycle, directed:** three colours (white, on stack, done).
- **MST:** Kruskal (sort edges + DSU) or Prim (heap).
- **Bipartite:** BFS 2-colouring; fails on an odd cycle.
- **Grid:** cell = node, 4 directions; mark visited when pushing.

**Say in the interview:** "Edges are unweighted, so BFS gives the shortest path in O(V + E); Dijkstra would only add a log factor."

**Avoid:** Using DFS for minimum steps; running Dijkstra with negative edges; plain visited array for directed cycle detection.
