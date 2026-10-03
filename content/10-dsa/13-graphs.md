---
title: Graphs
order: 13
time: 30
---

# Graphs

Graph matlab nodes plus edges, aur bahut saare problems chhupe hue graphs hote hain: grids, dependencies, word ladders, flights, friend circles. Interview ye test karta hai ki tum graph bana sakte ho, constraints se sahi traversal ya shortest-path algorithm chun sakte ho, aur BFS/DFS bina bugs ke likh sakte ho.

## ⭐ Kab use karein (kaunsa algorithm?)

- **Cells ka grid / islands / "connected"** → grid pe DFS ya BFS (4 directions).
- **"Minimum steps / moves", unweighted** → BFS. Ek saath kai starting points ("rotting oranges", "nearest 0 tak distance") → multi-source BFS.
- **"Prerequisites", "tasks ka order", "build order", "can finish?"** → topological sort (cycle bhi detect karta hai).
- **Weighted shortest path, weights ≥ 0** → Dijkstra. **Negative weights ya "at most K edges"** → Bellman-Ford. **All pairs, n ≤ 400** → Floyd–Warshall.
- **"Sabko minimum cost me connect karo"** → MST (Kruskal + [DSU](14-dsu.md), ya Prim).
- **"Do groups me baanto", "two colours"** → bipartite check (BFS colouring).

| Question | Weights | Algorithm | Time |
|---|---|---|---|
| shortest path, single source | none / sab equal | BFS | O(V + E) |
| shortest path | sirf 0 aur 1 | 0-1 BFS (deque) | O(V + E) |
| shortest path | non-negative | Dijkstra (min-heap) | O(E log V) |
| shortest path | negative allowed / ≤ K edges | Bellman-Ford | O(V · E) |
| all-pairs shortest path | koi bhi (negative cycle nahi) | Floyd–Warshall | O(V^3) |
| DAG pe shortest path | koi bhi | topo order + relax | O(V + E) |
| dependencies ke saath ordering | – | Kahn's BFS / DFS topo | O(V + E) |
| minimum spanning tree | undirected | Kruskal / Prim | O(E log E) |
| components, cycle (undirected) | – | DFS/BFS ya DSU | O(V + E) |

```mermaid
flowchart TD
    A["Shortest path?"] -- "No" --> B["Order or dependencies? Topo sort. Groups? DFS or DSU"]
    A -- "Yes" --> C{"All pairs and n small?"}
    C -- "Yes" --> D["Floyd-Warshall"]
    C -- "No" --> E{"Edge weights?"}
    E -- "None" --> F["BFS"]
    E -- "0 or 1" --> G["0-1 BFS"]
    E -- "Non-negative" --> H["Dijkstra"]
    E -- "Negative" --> I["Bellman-Ford"]
```

## Representations

- **Adjacency list** `vector<vector<int>> adj(n)` (weighted: `vector<vector<pair<int,int>>>`): O(V + E) memory, default choice.
- **Adjacency matrix** `vector<vector<int>> m(n, vector<int>(n))`: O(V^2), sirf dense graphs ya Floyd–Warshall ke liye.
- **Edge list** `vector<array<int,3>>`: Kruskal aur Bellman-Ford ke liye.
- **Grid**: cell `(r, c)` ek node hai; neighbours `dr[] = {1,-1,0,0}, dc[] = {0,0,1,-1}` se; id = `r * C + c`.

## ⭐ BFS: unweighted graphs me shortest path

**Ek line me:** BFS nodes ko badhti distance ke order me visit karta hai, isliye kisi node pe pehli baar pahunchna hi shortest path hai.

```cpp
#include <bits/stdc++.h>
using namespace std;

vector<int> bfs(int n, vector<vector<int>>& adj, vector<int> sources) {
    vector<int> dist(n, -1);
    queue<int> q;
    for (int s : sources) { dist[s] = 0; q.push(s); }  // multi-source
    while (!q.empty()) {
        int u = q.front(); q.pop();
        for (int v : adj[u])
            if (dist[v] == -1) {                        // mark when pushing
                dist[v] = dist[u] + 1;
                q.push(v);
            }
    }
    return dist;
}
```

- O(V + E) time aur space. Visited **push karte waqt** mark karo, pop pe nahi, warna nodes kai baar queue me jaate hain.
- **0-1 BFS:** `deque` use karo; weight-0 edge → `push_front`, weight-1 → `push_back`.

**Common galti:** "minimum steps" ke liye DFS use karna; DFS ek path deta hai, shortest nahi.

## ⭐ DFS: components aur cycle detection

```cpp
// undirected: count components; cycle if we see a visited node != parent
void dfs(int u, vector<vector<int>>& adj, vector<bool>& vis) {
    vis[u] = true;
    for (int v : adj[u]) if (!vis[v]) dfs(v, adj, vis);
}

// directed cycle: 0 = white, 1 = on stack (gray), 2 = done (black)
bool hasCycle(int u, vector<vector<int>>& adj, vector<int>& color) {
    color[u] = 1;
    for (int v : adj[u]) {
        if (color[v] == 1) return true;                 // back edge
        if (color[v] == 0 && hasCycle(v, adj, color)) return true;
    }
    color[u] = 2;
    return false;
}
```

- Undirected cycle: DFS me koi visited neighbour jo parent nahi hai matlab cycle (ya DSU use karo).
- Directed cycle: sirf `visited` array **kaafi nahi**; "current path pe hai" wala state chahiye.
- 1e6 cells ke grid pe DFS stack overflow kar sakta hai; BFS ya explicit stack use karo.

## ⭐ Topological sort (Kahn's algorithm)

```cpp
vector<int> topo(int n, vector<vector<int>>& adj) {
    vector<int> indeg(n, 0), order;
    for (int u = 0; u < n; u++) for (int v : adj[u]) indeg[v]++;
    queue<int> q;
    for (int u = 0; u < n; u++) if (indeg[u] == 0) q.push(u);
    while (!q.empty()) {
        int u = q.front(); q.pop(); order.push_back(u);
        for (int v : adj[u]) if (--indeg[v] == 0) q.push(v);
    }
    return order;              // size < n  =>  cycle exists
}
```

DFS version: node ke saare children khatam hone ke baad use list me daalo, phir reverse. Sirf DAG pe chalta hai.

## Dijkstra

```cpp
vector<long long> dijkstra(int n, vector<vector<pair<int,int>>>& adj, int s) {
    vector<long long> d(n, LLONG_MAX); d[s] = 0;
    priority_queue<pair<long long,int>, vector<pair<long long,int>>,
                   greater<>> pq;
    pq.push({0, s});
    while (!pq.empty()) {
        auto [du, u] = pq.top(); pq.pop();
        if (du > d[u]) continue;                        // stale entry
        for (auto [v, w] : adj[u])
            if (d[u] + w < d[v]) { d[v] = d[u] + w; pq.push({d[v], v}); }
    }
    return d;
}
```

O(E log V). Negative edges pe toot jaata hai kyunki pop hua node final maana jaata hai.

## Bellman-Ford aur Floyd–Warshall

- **Bellman-Ford:** saare edges V−1 baar relax karo; agar V-th pass me bhi relax ho to negative cycle hai. "Cheapest flights within K stops" (LC 787) = K+1 passes, har pass me `dist` copy karke.
- **Floyd–Warshall:** `for k, for i, for j: d[i][j] = min(d[i][j], d[i][k] + d[k][j])`. **k outer loop hi hona chahiye.** Baad me `d[i][i] < 0` → negative cycle.

## MST: Kruskal aur Prim

- **Kruskal:** edges ko weight se sort karo; edge tab add karo jab endpoints alag DSU sets me hon. O(E log E). Edge list ke saath best.
- **Prim:** Dijkstra jaisa, par key edge weight hai, source se distance nahi. Dense graphs / adjacency lists ke liye accha.

## Bipartite check

Har uncoloured node se BFS, neighbours ko ulta colour do; same colour wala neighbour → bipartite nahi. Equivalent: koi odd-length cycle nahi. (LC 785, 886.)

## Standard questions

| Problem | Pattern / key idea | Difficulty |
|---|---|---|
| 200. Number of Islands | grid DFS/BFS, starts gino | Medium |
| 695. Max Area of Island | size return karne wala grid DFS | Medium |
| 133. Clone Graph | DFS + old→new hashmap | Medium |
| 994. Rotting Oranges | multi-source BFS | Medium |
| 542. 01 Matrix | saare 0s se multi-source BFS | Medium |
| 417. Pacific Atlantic Water Flow | dono oceans se reverse BFS | Medium |
| 207. / 210. Course Schedule I / II | Kahn's topo sort, cycle check | Medium |
| 785. Is Graph Bipartite? | BFS 2-colouring | Medium |
| 743. Network Delay Time | Dijkstra | Medium |
| 787. Cheapest Flights Within K Stops | Bellman-Ford K+1 passes | Medium |
| 1584. Min Cost to Connect All Points | Prim / Kruskal | Medium |
| 1631. Path With Minimum Effort | grid pe Dijkstra (max edge) | Medium |
| 127. Word Ladder | word states pe BFS | Hard |
| 269. Alien Dictionary | edges banao + topo sort | Hard |

## Checklist

- [ ] Weights aur question dekh ke BFS / 0-1 BFS / Dijkstra / Bellman-Ford / Floyd chun sakta hoon
- [ ] BFS (multi-source bhi) aur grid traversal bina bugs ke likh sakta hoon
- [ ] Undirected aur directed graphs me cycle detect kar sakta hoon aur fark samjha sakta hoon
- [ ] Kahn's topological sort likh sakta hoon aur usse cycle detect kar sakta hoon
- [ ] Min-heap ke saath Dijkstra likh sakta hoon aur bata sakta hoon negative edges use kyun todte hain
- [ ] Kruskal + DSU se MST bana sakta hoon aur bipartite check kar sakta hoon
