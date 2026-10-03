**In one line:** Sorted + pair → opposite-ends pointers; contiguous + condition → sliding window; no pointer ever moves back, so it is O(n).

- **Opposite ends:** sum too small → `l++`, too big → `r--` (sorted array).
- **3Sum:** sort, fix one, two pointers on the rest, skip duplicates; O(n²).
- **Container water:** move the shorter side.
- **Fixed window:** add `a[r]`, remove `a[r-k]` once `r >= k`.
- **Variable window:** expand → shrink while invalid → update.
- **Longest vs shortest:** for longest update after shrinking, for shortest inside the shrink loop.
- **Exactly K:** `atMost(K) - atMost(K-1)`; in atMost do `res += r - l + 1`.
- **Negatives + sum = K:** window fails, use prefix + hash map.
- **Fast/slow:** cycle detection, middle node, find duplicate (LC 287).
- **Cycle start:** after meeting, reset one pointer to head, move both 1 step.

**Say in the interview:** "Each element enters the window once and leaves once, so despite the nested while it is O(n) total."

**Avoid:** Using a sum window on arrays with negatives, and not removing duplicate triplets in 3Sum.
