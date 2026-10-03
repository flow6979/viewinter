**In one line:** a heap gives min/max in O(1) and push/pop in O(log n); use it whenever you repeatedly need the current best.

- **Recognise:** "top K", "K closest", "merge K sorted", "median of stream", "always pick cheapest next".
- **C++ default:** `priority_queue<int>` is a **max**-heap.
- **Min-heap:** `priority_queue<int, vector<int>, greater<int>>`.
- **Custom comparator:** returns true when `a` goes **after** `b`; `a > b` gives a min-heap.
- **K largest:** min-heap of size K, pop when size > K; O(n log K).
- **K smallest / closest:** max-heap of size K.
- **Median:** max-heap low half + min-heap high half, sizes differ by ≤ 1.
- **K-way merge:** min-heap of (value, list, index); O(N log K).
- **Meeting rooms:** sort by start, min-heap of end times; heap size = rooms.
- **Inside:** array tree, children `2i+1`, `2i+2`; heapify is O(n).
- **No decrease-key:** push again and skip stale entries (Dijkstra).

**Say in the interview:** "For K largest I keep a min-heap of size K, so the top is the Kth largest and it's O(n log K) with O(K) memory."

**Avoid:** Expecting `a < b` comparator to give a min-heap; using a max-heap of all n elements for top-K on a stream.
