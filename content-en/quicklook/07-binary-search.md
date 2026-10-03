**In one line:** Wherever there is a monotonic yes/no predicate (F F F T T T), find the first T with binary search in O(log n); a sorted array is not required.

- **Template:** `lo` on the false side, `hi` on the true side, `while (hi - lo > 1)`, return `hi`.
- **mid:** `lo + (hi - lo) / 2` to avoid overflow.
- **STL:** `lower_bound` = first ≥ x, `upper_bound` = first > x, count = ub - lb.
- **Rotated array:** one half is always sorted; check whether the target is in it.
- **Min in rotated:** `a[m] > a[r]` → go right, else `r = m`.
- **BS on answer:** "minimise the max / maximise the min / smallest speed/capacity".
- **3 things:** answer range, `feasible(mid)`, why it is monotonic.
- **Ship / split array:** lo = max element, hi = total sum, greedy count check.
- **Ceil:** `(p + k - 1) / k`, no floats.
- **Floating BS:** 100 fixed iterations, no epsilon loop.

**Say in the interview:** "A higher speed never increases the hours, so feasible is monotonic; I will binary search on 1..max, O(n log max)."

**Avoid:** `while (lo < hi)` with `lo = mid` (infinite loop) and `int` overflow inside the feasibility check.
