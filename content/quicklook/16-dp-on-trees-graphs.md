**Ek line:** DP ko subproblems pehle solve chahiye: trees pe post-order DFS, DAG pe topological order, cyclic graphs pe Dijkstra/Bellman-Ford ya bitmask state.

- **Tree DP:** har node parent ko summary return kare; node pe mudne wale paths global me record karo.
- **Max path sum / diameter:** return `val + max(l, r)`, record `val + l + r`.
- **Tree pe take/skip:** `{take, skip}` return karo (House Robber III); take liya to children skip.
- **Rerooting:** do DFS passes se har root ka answer O(n) me (Sum of Distances).
- **DAG DP:** Kahn ka order, `dp[u]` se `dp[v]` relax; longest path aur path counts O(V + E) me.
- **Implicit DAG:** grid me strictly increasing moves → visited array ke bina memo DFS (LC 329).
- **Shortest paths count:** Dijkstra/BFS ke saath `ways[]`: chhota dist mile to reset, barabar mile to add.
- **Graphs pe bitmask:** "saare nodes visit", n ≤ 20 → state (mask, node), O(2ⁿ·n²).
- **Floyd–Warshall:** allowed intermediates pe DP; k outer loop hi hona chahiye.
- **Bellman-Ford:** "at most i edges" pe DP (K stops: har round array copy).

**Interview me bolo:** "Har node parent ko best single chain return karta hai, aur main is node pe dono chains jodke global answer update karta hoon."

**Galti mat karna:** Parent ko forked path (`val + l + r`) return karna, ya cycles wale graph pe longest-path DP lagana.
