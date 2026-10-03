**Ek line:** DSU elements ko groups me rakhta hai, near-O(1) `find` (kaunsa group?) aur `unite` (do groups merge) ke saath, path compression + union by size use karke.

- **Cues:** "connected components", "groups/accounts merge", "x aur y connected hain?", edges ek-ek karke add.
- **Structure:** har set ek tree; root hi representative; `parent[x] == x` matlab root.
- **Path compression:** `parent[x] = find(parent[x])` har find pe path flat karta hai.
- **Union by size/rank:** chhota tree bade ke neeche latkao.
- **Complexity:** amortised O(α(n)) per op (practice me ≤ 4); sirf ek optimisation se O(log n).
- **Cycle check:** dono ends ka root same ho to `unite` false deta hai → wahi edge cycle banata hai (sirf undirected).
- **Kruskal:** edges weight se sort, edge tabhi lo jab `unite` succeed kare.
- **Grids:** (r, c) ko `r * cols + c` me map karo.
- **Weighted DSU:** "a / b = k" queries ke liye parent se ratio store karo (Evaluate Division).
- **DSU nahi:** distances/paths (BFS), directed cycles (DFS/Kahn), deletions (offline reverse).

**Interview me bolo:** "Edges online aa rahe hain aur sirf connectivity chahiye, isliye path compression + union by size wala DSU har edge pe lagbhag constant time deta hai."

**Galti mat karna:** Roots ki jagah original nodes link karna (`find` ke bina `parent[a] = b`), ya directed graph cycles ke liye DSU lagana.
