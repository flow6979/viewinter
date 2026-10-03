**Ek line:** adjacency list banao, phir weights aur question algorithm chunte hain: BFS, Dijkstra, topo sort, DSU/MST.

- **Unweighted shortest path:** BFS; ek saath kai sources → multi-source BFS.
- **0/1 weights:** deque ke saath 0-1 BFS.
- **Non-negative weights:** min-heap ke saath Dijkstra, O(E log V); stale entries skip.
- **Negative weights / ≤ K edges:** Bellman-Ford, O(V·E).
- **All pairs, n ≤ 400:** Floyd–Warshall, k outer loop.
- **Dependencies / order:** topological sort (Kahn); order size < n → cycle.
- **Cycle, undirected:** visited neighbour jo parent nahi, ya DSU.
- **Cycle, directed:** teen colours (white, on stack, done).
- **MST:** Kruskal (edges sort + DSU) ya Prim (heap).
- **Bipartite:** BFS 2-colouring; odd cycle pe fail.
- **Grid:** cell = node, 4 directions; push karte waqt visited mark.

**Interview me bolo:** "Edges unweighted hain, to BFS O(V + E) me shortest path deta hai; Dijkstra bas log factor jodega."

**Galti mat karna:** Minimum steps ke liye DFS mat lo; negative edges pe Dijkstra mat chalao; directed cycle ke liye sirf visited array kaafi nahi.
