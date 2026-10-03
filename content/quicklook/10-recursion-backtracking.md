**Ek line:** recursion = base case + chhota call; backtracking = candidate step by step banao, aur choose, explore, unchoose.

- **Pehchaano:** "all possible", "generate all", "every combination/permutation", chhota n (≤ 15–20) → backtracking.
- **Base case pehle:** missing ya galat base case → infinite recursion aur stack overflow.
- **Cost:** time = recursion tree ke nodes × har node ka kaam; space = max depth.
- **Template:** choice push, recurse, choice pop; `path` reference se pass karo.
- **Subsets:** `i + 1` se recurse, har node pe record; O(2^n · n).
- **Permutations:** 0 se loop aur `used[]` array; O(n! · n).
- **Combination Sum:** reuse allowed ho to `i` se recurse, nahi to `i + 1`.
- **Duplicates:** sort karo, phir `i > start` pe `a[i] == a[i-1]` skip.
- **N-Queens:** row by row; O(1) check ke liye column aur diagonal sets (`r-c+n`, `r+c`).
- **Grid search:** recurse se pehle cell mark, baad me restore.
- **Pruning:** sort + break, recurse se pehle feasibility check, pehle solution pe return.
- **Count/min aur states repeat:** memoize karo, DP ban jaata hai.

**Interview me bolo:** "Output khud exponential hai, isliye choose-explore-unchoose se backtrack karunga aur remaining sum negative hote hi prune karunga."

**Galti mat karna:** Choice undo karna mat bhoolo (`pop_back` / visited unmark); sirf count wale problem ko backtrack mat karo jahan DP chahiye.
