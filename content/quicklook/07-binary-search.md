**Ek line:** Jahan bhi monotonic yes/no predicate ho (F F F T T T), pehla T binary search se O(log n) me dhoondho; sorted array zaroori nahi.

- **Template:** `lo` false side, `hi` true side, `while (hi - lo > 1)`, return `hi`.
- **mid:** `lo + (hi - lo) / 2`, overflow se bachav.
- **STL:** `lower_bound` = first ≥ x, `upper_bound` = first > x, count = ub - lb.
- **Rotated array:** ek half hamesha sorted; target us half me hai ya nahi.
- **Min in rotated:** `a[m] > a[r]` → right me, warna `r = m`.
- **BS on answer:** "minimise the max / maximise the min / smallest speed/capacity".
- **3 cheezein:** answer range, `feasible(mid)`, monotonic kyun.
- **Ship / split array:** lo = max element, hi = total sum, greedy count check.
- **Ceil:** `(p + k - 1) / k`, floats nahi.
- **Floating BS:** 100 fixed iterations, epsilon loop nahi.

**Interview me bolo:** "Speed badhane se hours kabhi nahi badhte, isliye feasible monotonic hai; main 1..max pe binary search karunga, O(n log max)."

**Galti mat karna:** `while (lo < hi)` ke saath `lo = mid` (infinite loop) aur feasibility me `int` overflow.
