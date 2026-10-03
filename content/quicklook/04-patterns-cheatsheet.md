**Ek line:** code se pehle constraints se allowed complexity aur keywords se technique padho.

- **n ≤ 10–12:** O(n!) permutations / backtracking.
- **n ≤ 20–25:** O(2^n) subsets, bitmask DP.
- **n ≤ 500:** O(n^3) (Floyd, interval DP). **n ≤ 5000:** O(n^2) DP.
- **n ≤ 1e5–1e6:** O(n log n) / O(n): sort, heap, two pointers, window, BFS, DSU.
- **n ≤ 1e9+:** O(log n) / math: binary search on answer, fast power.
- **Sorted / pair sum:** two pointers ya binary search. **Contiguous + longest/at most K:** sliding window.
- **Subarray sum = K / range sums:** prefix sums + hashmap.
- **Top K / Kth / merge K:** heap. **Next greater / histogram:** monotonic stack.
- **Intervals / meetings:** sort + greedy ya sweep.
- **All combinations / generate:** backtracking. **Count ways / choices ke saath min cost:** DP.
- **Unweighted shortest path:** BFS. **Weighted:** Dijkstra. **Dependencies:** topo sort. **Groups merge:** DSU.

**Interview me bolo:** "n 1e5 hai, to O(n^2) pass nahi hoga; brute force O(n^2) hai, sliding window repeated sums hata deta hai."

**Galti mat karna:** constraints padhe bina code pe kood jaana, ya pattern ka naam lena bina bataye ki wo kaunsa repeated kaam hatata hai.
