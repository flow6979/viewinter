**In one line:** pick the container by the operation you need fast, and know its cost.

- **vector:** dynamic array, O(1) index and push_back. Default choice.
- **stack / queue / deque:** LIFO (brackets, DFS), FIFO (BFS), both ends (window max, 0-1 BFS).
- **priority_queue:** max-heap by default; min-heap = `priority_queue<int, vector<int>, greater<int>>`.
- **set / map:** sorted, O(log n), `lower_bound` for floor/ceil. `multiset` keeps duplicates.
- **unordered_map / set:** O(1) average lookups and counts; O(n) worst case.
- **Algorithms:** `sort` (+ comparator), `lower_bound` (first ≥), `upper_bound` (first >), `binary_search`.
- **More:** `accumulate(..., 0LL)`, `reverse`, `min/max_element`, `iota`, `next_permutation`.
- **Dedupe:** `sort` then `v.erase(unique(v.begin(), v.end()), v.end())`.
- **Bits:** `__builtin_popcount(x)`, `popcountll` for `long long`, `bitset<N>`.
- **Traps:** `m[key]` inserts; erase with `it = m.erase(it)`; `(int)v.size() - 1`.
- **Codeforces:** anti-hash tests kill `unordered_map`; use a custom hash or `map`.

**Say in the interview:** "I need floor queries with inserts, so a set with lower_bound, O(log n) each."

**Avoid:** `std::lower_bound` on a `set` (O(n)), `accumulate` with `0` on big values, and assuming PQ is a min-heap.
