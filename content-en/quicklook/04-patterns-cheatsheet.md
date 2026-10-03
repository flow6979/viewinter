**In one line:** read constraints for the allowed complexity and keywords for the technique before writing code.

- **n ≤ 10–12:** O(n!) permutations / backtracking.
- **n ≤ 20–25:** O(2^n) subsets, bitmask DP.
- **n ≤ 500:** O(n^3) (Floyd, interval DP). **n ≤ 5000:** O(n^2) DP.
- **n ≤ 1e5–1e6:** O(n log n) / O(n): sort, heap, two pointers, window, BFS, DSU.
- **n ≤ 1e9+:** O(log n) / math: binary search on answer, fast power.
- **Sorted / pair sum:** two pointers or binary search. **Contiguous + longest/at most K:** sliding window.
- **Subarray sum = K / range sums:** prefix sums + hashmap.
- **Top K / Kth / merge K:** heap. **Next greater / histogram:** monotonic stack.
- **Intervals / meetings:** sort + greedy or sweep.
- **All combinations / generate:** backtracking. **Count ways / min cost with choices:** DP.
- **Unweighted shortest path:** BFS. **Weighted:** Dijkstra. **Dependencies:** topo sort. **Merge groups:** DSU.

**Say in the interview:** "n is 1e5, so O(n^2) won't pass; brute force is O(n^2), and a sliding window removes the repeated sums."

**Avoid:** jumping to code without reading constraints, or naming a pattern without saying what repeated work it removes.
