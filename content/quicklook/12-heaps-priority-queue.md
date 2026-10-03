**Ek line:** heap min/max O(1) me aur push/pop O(log n) me deta hai; jab baar baar current best chahiye, heap lo.

- **Pehchaano:** "top K", "K closest", "merge K sorted", "median of stream", "hamesha agla sasta uthao".
- **C++ default:** `priority_queue<int>` **max**-heap hai.
- **Min-heap:** `priority_queue<int, vector<int>, greater<int>>`.
- **Custom comparator:** true return jab `a` ko `b` ke **baad** aana ho; `a > b` se min-heap.
- **K largest:** size K ka min-heap, size > K pe pop; O(n log K).
- **K smallest / closest:** size K ka max-heap.
- **Median:** low half max-heap + high half min-heap, sizes me fark ≤ 1.
- **K-way merge:** (value, list, index) ka min-heap; O(N log K).
- **Meeting rooms:** start se sort, end times ka min-heap; heap size = rooms.
- **Andar:** array tree, children `2i+1`, `2i+2`; heapify O(n).
- **Decrease-key nahi:** dobara push karo aur stale entries skip (Dijkstra).

**Interview me bolo:** "K largest ke liye size K ka min-heap rakhta hoon, top hi Kth largest hai, O(n log K) time aur O(K) memory."

**Galti mat karna:** `a < b` comparator se min-heap expect mat karo; stream pe top-K ke liye saare n elements ka max-heap mat banao.
