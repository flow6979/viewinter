---
title: Patterns Cheatsheet
order: 4
time: 15
---

# Patterns Cheatsheet

Zyaada tar interview problems ~15 patterns me se kisi ek ka bhes badla hua roop hain. Sahi approach tak sabse fast pahunchne ke liye code sochne se pehle do cheezein padho: **constraints** (allowed complexity batate hain) aur **keywords** (technique batate hain). Ye page dono ka lookup table hai.

## ⭐ Kab use karein (constraints → complexity)

**Ek line me:** judge lagbhag 1e8 simple operations per second karta hai; wo complexity chuno jisme n ~1 second me fit ho.

```text
n up to:     10-12      20-25     100-500     5000      1e5 - 1e6          1e9+
             |          |         |           |         |                  |
max cost:    n!         2^n       n^3         n^2       n log n  or  n     log n, sqrt n, 1

n = 1e5:   n^2     = 1e10   100x over the ~1e8/sec budget  -> TLE
           n log n ≈ 1.7e6  well inside                    -> OK
```

*Upar: n dekho, ladder pe jagah dhoondo, wahi complexity target karo.*

| n kitna tak | Max complexity | Typical techniques |
|---|---|---|
| ≤ 10–12 | O(n!), O(n · n!) | Permutations, brute-force backtracking |
| ≤ 20–25 | O(2^n), O(2^n · n) | Subsets, bitmask DP, meet in the middle (≤ 40) |
| ≤ 100–500 | O(n^3) | Floyd–Warshall, interval/partition DP, triple loops |
| ≤ 5000 | O(n^2) | 2D DP (LCS, edit distance), all pairs, O(n^2) DP |
| ≤ 1e5–1e6 | O(n log n) ya O(n) | Sorting, heap, binary search, two pointers, sliding window, prefix sums, BFS/DFS, DSU |
| ≤ 1e9 – 1e18 | O(log n) ya O(√n) ya O(1) | Binary search on answer, math, fast power, digit DP |

> **Example:** "n ≤ 1e5, sum ≤ k wala longest subarray dhoondo (positives)". O(n^2) = 1e10, bahut slow. O(n) ya O(n log n) chahiye → sliding window.

```cpp
// Quick sanity check you can do in your head or in code:
// ops ~ n * n for n = 1e5 -> 1e10 (TLE); n * log2(n) -> ~1.7e6 (fine)
#include <bits/stdc++.h>
using namespace std;
int main() {
    long long n = 100000;
    cout << n * n << " vs " << (long long)(n * log2(n)) << "\n";
}
```

**Interview tip:** constraint zor se bolo: "n 1e5 hai, to O(n^2) pass nahi hoga; main O(n log n) target kar raha hoon." Dikhata hai ki tum guess nahi kar rahe.
**Common galti:** constraints ignore karna. OA aur live rounds me constraint aksar sabse bada hint hota hai.

## ⭐ Keyword → technique

| Problem me likha / dikhe | Socho | Page |
|---|---|---|
| Sorted array, "pair with sum", "remove duplicates in place" | Two pointers / binary search | [Two Pointers](06-two-pointers-sliding-window.md) |
| "Contiguous subarray/substring" + "longest/shortest/at most K" | Sliding window | [Sliding Window](06-two-pointers-sliding-window.md) |
| "Subarray sum equals K", "range sum", bahut saari sum queries | Prefix sums (+ hashmap) | [Arrays and Hashing](05-arrays-hashing-prefix.md) |
| "Minimum X such that ...", "maximum min", answer monotonic | Binary search on answer | [Binary Search](07-binary-search.md) |
| "Top K", "K closest", "Kth largest", "merge K sorted" | Heap | [Heaps](12-heaps-priority-queue.md) |
| "Next greater/smaller", "span", "histogram" | Monotonic stack | [Stack and Queue](09-stack-queue-monotonic.md) |
| "Sliding window max/min" | Monotonic deque | [Stack and Queue](09-stack-queue-monotonic.md) |
| "Intervals", "meetings", "merge overlapping" | Start/end se sort + greedy ya sweep | [Greedy and Intervals](08-greedy-intervals.md) |
| "All combinations / subsets / permutations", "generate all" | Backtracking | [Backtracking](10-recursion-backtracking.md) |
| "Shortest path", unweighted grid/graph, "min steps" | BFS | [Graphs](13-graphs.md) |
| Weighted shortest path, non-negative | Dijkstra | [Graphs](13-graphs.md) |
| "Prerequisites", "order of tasks", dependencies | Topological sort | [Graphs](13-graphs.md) |
| "Connected components", "groups merge", "redundant edge" | DSU (union-find) | [DSU](14-dsu.md) |
| "Number of ways", "min/max cost", choices + overlapping subproblems | DP | [DP](15-dp.md) |
| Tree, "path", "depth", "ancestor" | DFS recursion / tree DP | [Trees](11-trees.md) |
| "Prefix of words", autocomplete | Trie | – |
| "Duplicate / pehle dekha / frequency" | Hash map / set | [STL](03-stl.md) |
| "XOR", "single number", chhote n ke subsets | Bit manipulation | [STL](03-stl.md) |

**Har pattern ek nazar me:**

```text
Two pointers (sorted, target = 10)
i:     0  1  2  3  4  5
a:   [ 1, 3, 4, 6, 8, 9 ]
       L              R     1 + 9 = 10  found
sum too small -> L++,  sum too big -> R--
```

*Upar: two pointers: dono ends se andar aao, har step pe ek pointer hilao.*

```text
Sliding window (longest window with sum <= 7)
a:   [ 2, 1, 5, 1, 3, 2 ]
       L--R                 sum 3   expand R
       L-----R              sum 8   too big, shrink L
          L--R              sum 6   expand R
          L-----R           sum 7   best length 3
```

*Upar: sliding window: R se badhao, condition toote to L se chhota karo.*

```text
Prefix sums
a:        [ 3, 1, 4, 1, 5 ]
pre:   [ 0, 3, 4, 8, 9, 14 ]
sum(a[1..3]) = pre[4] - pre[1] = 9 - 3 = 6
```

*Upar: prefix sums: ek baar O(n) build, phir har range sum O(1).*

```text
Binary search on answer (is speed k enough?)
k:      1  2  3  4  5  6  7  8
ok(k):  F  F  F  T  T  T  T  T
                 ^ answer = first T
```

*Upar: binary search on answer: predicate monotonic hai, pehla `T` dhoondo.*

```text
Monotonic stack (next greater element)
a:   [ 2, 1, 5, 3 ]
see 2: stack [2]
see 1: stack [2, 1]
see 5: pop 1 (next greater = 5), pop 2 (next greater = 5), stack [5]
see 3: stack [5, 3]           left over -> no next greater (-1)
```

*Upar: monotonic stack: bada element aate hi chhote waale pop hote hain aur unka answer mil jaata hai.*

```mermaid
flowchart LR
    subgraph L0["Level 0"]
        S["S"]
    end
    subgraph L1["Level 1"]
        A["A"]
        B["B"]
    end
    subgraph L2["Level 2"]
        C["C"]
        T["T"]
    end
    S --> A
    S --> B
    A --> C
    B --> T
    class T hot
    classDef hot fill:#ffffff,stroke:#ffffff,color:#000000,font-weight:bold
    classDef dim fill:none,stroke-dasharray:4 3,opacity:0.6
```

*Upar: BFS level by level phailta hai, isliye unweighted graph me pehli baar `T` mile wahi shortest distance (2) hai.*

```mermaid
flowchart TD
    R["{ }"] -- "take 1" --> A["{1}"]
    R -- "skip 1" --> B["{ }"]
    A -- "take 2" --> C["{1,2}"]
    A -- "skip 2" --> D["{1}"]
    B -- "take 2" --> E["{2}"]
    B -- "skip 2" --> F["{ }"]
    class C,D,E,F hot
    classDef hot fill:#ffffff,stroke:#ffffff,color:#000000,font-weight:bold
    classDef dim fill:none,stroke-dasharray:4 3,opacity:0.6
```

*Upar: backtracking: har element pe take/skip; leaves saare subsets hain (2^n).*

```mermaid
flowchart LR
    A["dp i-2"] --> C["dp i"]
    B["dp i-1"] --> C
    C --> D["dp i+1"]
    class C hot
    classDef hot fill:#ffffff,stroke:#ffffff,color:#000000,font-weight:bold
    classDef dim fill:none,stroke-dasharray:4 3,opacity:0.6
```

*Upar: DP: har state chhote states se banti hai, jaise `dp[i] = dp[i-1] + dp[i-2]`; har state ek hi baar compute hoti hai.*

```mermaid
flowchart BT
    B["2"] --> A["1"]
    C["3"] --> A
    E["5"] --> D["4"]
    class A,D hot
    classDef hot fill:#ffffff,stroke:#ffffff,color:#000000,font-weight:bold
    classDef dim fill:none,stroke-dasharray:4 3,opacity:0.6
```

*Upar: DSU: har group ek tree hai jiska root representative hai; yahan do groups {1,2,3} aur {4,5}.*

## ⭐ Decision flow

```mermaid
flowchart TD
    A["Read constraints and keywords"] --> B{"Input is a graph, grid or tree?"}
    B -- "Yes" --> C{"Shortest path?"}
    C -- "Unweighted" --> C1["BFS"]
    C -- "Weighted" --> C2["Dijkstra"]
    C -- "No, groups or order" --> C3["DFS, DSU or topo sort"]
    B -- "No" --> D{"Need all combinations?"}
    D -- "Yes, small n" --> D1["Backtracking"]
    D -- "No" --> E{"Count ways or best value with choices?"}
    E -- "Yes" --> E1["DP"]
    E -- "No" --> F{"Sorted or monotonic?"}
    F -- "Yes" --> F1["Binary search or two pointers"]
    F -- "No" --> G{"Contiguous subarray?"}
    G -- "Yes" --> G1["Sliding window or prefix sums"]
    G -- "No" --> H["Hash map, heap, stack or sort plus greedy"]
```

## Kaunsa data structure kis operation ke liye

| Fast chahiye ye operation | Data structure | Cost |
|---|---|---|
| Lookup / "pehle dekha?" | `unordered_set` / `unordered_map` | O(1) avg |
| Inserts ke saath baar baar min ya max | `priority_queue` | O(log n) |
| Min/max + kisi bhi item ka delete | `multiset` | O(log n) |
| Floor / ceiling / predecessor | `set` / `map` + `lower_bound` | O(log n) |
| Range sum, updates nahi | Prefix sum array | O(1) query |
| Range sum + point updates | Fenwick tree / segment tree | O(log n) |
| Last-in first-out, brackets matching | `stack` | O(1) |
| Level by level / FIFO | `queue` | O(1) |
| Dono ends / window max | `deque` | O(1) |
| Groups merge, "same component?" | DSU | ~O(1) |
| Strings pe prefix search | Trie | O(length) |

## Brute force → optimise moves

| Brute force kya karta hai | Optimise karo |
|---|---|
| Pair dhoondhne ke liye nested loop | Hash map ya sort + two pointers |
| Har subarray ka sum dobara compute | Prefix sums / sliding window |
| Har answer value try karna | Binary search on answer |
| Same subproblem baar baar | Memoisation → DP |
| Har step pe max ke liye scan | Heap ya monotonic deque |
| Next bigger ke liye left/right scan | Monotonic stack |

**Interview tip:** pehle hamesha brute force uski complexity ke saath bolo, phir batao pattern kaunsa repeated kaam hata raha hai. Interviewer exactly yahi story sunna chahta hai.

## Standard questions

| Problem | Pattern / key idea | Difficulty |
|---|---|---|
| Two Sum II (LC 167) | Sorted → two pointers | Medium |
| Longest Substring Without Repeating (LC 3) | Sliding window + set | Medium |
| Subarray Sum Equals K (LC 560) | Prefix sum + hashmap | Medium |
| Koko Eating Bananas (LC 875) | Binary search on answer | Medium |
| Top K Frequent Elements (LC 347) | Heap / bucket | Medium |
| Daily Temperatures (LC 739) | Monotonic stack | Medium |
| Merge Intervals (LC 56) | Sort + greedy | Medium |
| Subsets (LC 78) | Backtracking / bitmask (n ≤ 10) | Medium |
| Rotting Oranges (LC 994) | Multi-source BFS | Medium |
| Course Schedule (LC 207) | Topological sort | Medium |
| Number of Provinces (LC 547) | DSU / DFS | Medium |
| Coin Change (LC 322) | Unbounded knapsack DP | Medium |
| Network Delay Time (LC 743) | Dijkstra | Medium |
| Partition to K Equal Sum Subsets (LC 698) | n ≤ 16 → bitmask DP / backtracking | Medium |

## Checklist

- [ ] n ko allowed complexity se map kar sakta hoon (10, 20, 500, 5000, 1e5, 1e9)
- [ ] Common keywords ko bina table dekhe technique se map kar sakta hoon
- [ ] Naye problem ke liye decision flow bol ke walk kar sakta hoon
- [ ] Zaroori operation ke liye data structure chun sakta hoon (floor, top K, range sum, merge groups)
- [ ] Brute force bol ke, repeated kaam aur use hatane wala pattern bata sakta hoon
