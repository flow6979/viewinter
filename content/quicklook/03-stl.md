**Ek line:** jo operation fast chahiye uske hisaab se container chuno, aur uski cost jaano.

- **vector:** dynamic array, O(1) index aur push_back. Default choice.
- **stack / queue / deque:** LIFO (brackets, DFS), FIFO (BFS), dono ends (window max, 0-1 BFS).
- **priority_queue:** default max-heap; min-heap = `priority_queue<int, vector<int>, greater<int>>`.
- **set / map:** sorted, O(log n), floor/ceil ke liye `lower_bound`. `multiset` duplicates rakhta hai.
- **unordered_map / set:** O(1) average lookups aur counts; worst case O(n).
- **multiset / list:** `ms.erase(x)` saari copies mitata hai, ek ke liye `ms.erase(ms.find(x))`; `list` sirf LRU cache jaise kaam ke liye (O(1) `splice`).
- **Algorithms:** `sort` (+ comparator), `lower_bound` (pehla ≥), `upper_bound` (pehla >), `binary_search`.
- **Aur:** `accumulate(..., 0LL)`, `reverse`, `min/max_element`, `iota`, `next_permutation`.
- **Dedupe:** pehle `sort`, phir `v.erase(unique(v.begin(), v.end()), v.end())`.
- **Bits:** `__builtin_popcount(x)`, `long long` ke liye `popcountll`, `bitset<N>`.
- **Traps:** `m[key]` insert kar deta hai; `it = m.erase(it)` se erase; `(int)v.size() - 1`.
- **Codeforces:** anti-hash tests `unordered_map` ko maar dete hain; custom hash ya `map` lo.

**Interview me bolo:** "Inserts ke saath floor queries chahiye, to set + lower_bound, har op O(log n)."

**Galti mat karna:** `set` pe `std::lower_bound` (O(n)), bade values pe `0` ke saath `accumulate`, aur PQ ko min-heap maan lena.
