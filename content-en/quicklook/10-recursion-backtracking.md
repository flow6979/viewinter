**In one line:** recursion = base case + smaller call; backtracking = build a candidate step by step, and choose, explore, unchoose.

- **Recognise:** "all possible", "generate all", "every combination/permutation", small n (≤ 15–20) → backtracking.
- **Base case first:** missing or wrong base case → infinite recursion and stack overflow.
- **Cost:** time = nodes in recursion tree × work per node; space = max depth.
- **Template:** push choice, recurse, pop choice; pass `path` by reference.
- **Subsets:** recurse with `i + 1`, record at every node; O(2^n · n).
- **Permutations:** loop from 0 with a `used[]` array; O(n! · n).
- **Combination Sum:** recurse with `i` when reuse is allowed, `i + 1` when not.
- **Duplicates:** sort, then skip `a[i] == a[i-1]` when `i > start`.
- **N-Queens:** row by row; column and diagonal sets (`r-c+n`, `r+c`) for O(1) checks.
- **Grid search:** mark the cell before recursing, restore it after.
- **Pruning:** sort + break, check feasibility before recursing, return on first solution.
- **Count/min with repeated states:** memoize, it becomes DP.

**Say in the interview:** "The output itself is exponential, so I'll backtrack with choose-explore-unchoose and prune when the remaining sum goes negative."

**Avoid:** Forgetting to undo the choice (`pop_back` / unmark visited); backtracking a count-only problem that needs DP.
