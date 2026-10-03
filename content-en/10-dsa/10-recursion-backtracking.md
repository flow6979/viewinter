---
title: Recursion & Backtracking
order: 10
time: 20
---

# Recursion & Backtracking

Recursion solves a problem by solving smaller copies of it. Backtracking is recursion that builds a candidate step by step and undoes the last step when it hits a dead end. Interviewers love it because it tests whether you can define state, base case and pruning cleanly, and it is the backbone of trees, graphs and DP.

## ⭐ When to use it

- The problem says **"all possible"**, **"generate all"**, **"every combination / permutation / arrangement"**, **"print all paths"** → backtracking.
- **Small n** (n ≤ 15–20 for subsets, n ≤ 8–10 for permutations): the answer itself is exponential, so an exponential algorithm is expected.
- **Constraint satisfaction**: place items so that rules hold (N-Queens, Sudoku, word in grid).
- If it asks only for the **count** or **min/max** and subproblems repeat → it is probably [DP](15-dp.md), not backtracking.

| Problem phrase | Technique | Typical cost |
|---|---|---|
| "all subsets", "power set" | include / exclude | O(2^n · n) |
| "all permutations" | swap or `used[]` array | O(n! · n) |
| "combinations that sum to target" | pick with start index | exponential, pruned |
| "place N items with no conflict" | row-by-row + validity check | O(n!) pruned |
| "does word exist in grid" | DFS + mark visited + unmark | O(R·C·4^L) |
| "count ways / min cost", repeated states | memoized recursion → DP | polynomial |

## ⭐ Recursion basics: base case + recursion tree

**In one line:** every recursive function needs (1) a base case that stops, (2) a step that moves toward it, and (3) trust that the smaller call works.

> **Example:** `fib(4)` calls `fib(3)` and `fib(2)`; `fib(3)` calls `fib(2)` and `fib(1)`. `fib(2)` is computed twice, which is the hint that memoization (DP) helps. Recursion depth = height of the tree = stack space.

```cpp
#include <bits/stdc++.h>
using namespace std;

long long power(long long b, int e) {      // fast exponentiation
    if (e == 0) return 1;                   // base case
    long long half = power(b, e / 2);       // smaller problem
    return (e % 2) ? half * half * b : half * half;
}

int main() { cout << power(2, 10) << "\n"; } // 1024
```

- Complexity: time = number of nodes in the recursion tree × work per node; space = max depth (call stack).
- Default stack is ~1–8 MB: recursion depth around 1e5–1e6 can overflow. Go iterative for deep linear recursion.

**Interview tip:** draw the recursion tree for a tiny input before coding; it gives you the complexity for free.

**Common mistake:** a missing or wrong base case (e.g. not handling `n == 0`) causing infinite recursion and a stack overflow.

## ⭐ Backtracking template: choose, explore, unchoose

**In one line:** at each step try every valid choice, recurse, then undo the choice so the next branch starts clean.

```mermaid
flowchart TD
    A["Start: empty path"] --> B{"Is path a full answer?"}
    B -- "Yes" --> C["Record answer, return"]
    B -- "No" --> D["For each valid choice"]
    D --> E["Choose: push to path"]
    E --> F["Explore: recurse"]
    F --> G["Unchoose: pop from path"]
    G --> D
```

```cpp
#include <bits/stdc++.h>
using namespace std;

vector<vector<int>> res;
vector<int> path;

void backtrack(const vector<int>& nums, int start) {
    res.push_back(path);                    // every node is a subset
    for (int i = start; i < (int)nums.size(); i++) {
        path.push_back(nums[i]);            // choose
        backtrack(nums, i + 1);             // explore
        path.pop_back();                    // unchoose
    }
}

int main() {
    vector<int> nums = {1, 2, 3};
    backtrack(nums, 0);
    cout << res.size() << "\n";             // 8 subsets
}
```

- Pass `path` by reference and undo changes; copying vectors at each level adds an extra O(n) per call.
- Complexity: O(2^n · n) for subsets (2^n answers, each copied in O(n)).

**Interview tip:** say the three words "choose, explore, unchoose" out loud; it shows you have a template, not a guess.

**Common mistake:** forgetting `pop_back()` (or un-marking `visited`), so later branches see stale state.

## Subsets, permutations, combination sum

**Subsets with duplicates (LC 90):** sort first, then skip `nums[i] == nums[i-1]` when `i > start`.

**Permutations (LC 46):** use a `used[]` array; every position can take any unused element.

```cpp
void permute(vector<int>& nums, vector<bool>& used, vector<int>& path,
             vector<vector<int>>& res) {
    if (path.size() == nums.size()) { res.push_back(path); return; }
    for (int i = 0; i < (int)nums.size(); i++) {
        if (used[i]) continue;
        used[i] = true; path.push_back(nums[i]);
        permute(nums, used, path, res);
        used[i] = false; path.pop_back();
    }
}
```

**Combination sum (LC 39):** reuse allowed, so recurse with `i` (not `i + 1`); sort and `break` once the candidate exceeds the remaining target.

```cpp
void comb(vector<int>& c, int start, int rem, vector<int>& path,
          vector<vector<int>>& res) {
    if (rem == 0) { res.push_back(path); return; }
    for (int i = start; i < (int)c.size(); i++) {
        if (c[i] > rem) break;              // pruning (c is sorted)
        path.push_back(c[i]);
        comb(c, i, rem - c[i], path, res);  // i: same element reusable
        path.pop_back();
    }
}
```

| Variant | Recurse with | Skip duplicates? |
|---|---|---|
| Subsets / Combinations | `i + 1` | sort + `i > start && a[i]==a[i-1]` |
| Combination Sum (reuse) | `i` | no (distinct input) |
| Combination Sum II (no reuse) | `i + 1` | yes |
| Permutations | loop from 0 + `used[]` | sort + `!used[i-1]` check for LC 47 |

## Constraint problems: N-Queens, word search, Sudoku

**N-Queens (LC 51):** place one queen per row; track used columns and both diagonals (`r - c + n`, `r + c`) in O(1).

```cpp
int n, cnt = 0;
vector<bool> col, d1, d2;                   // sizes n, 2n, 2n

void solve(int r) {
    if (r == n) { cnt++; return; }
    for (int c = 0; c < n; c++) {
        if (col[c] || d1[r - c + n] || d2[r + c]) continue;   // prune
        col[c] = d1[r - c + n] = d2[r + c] = true;
        solve(r + 1);
        col[c] = d1[r - c + n] = d2[r + c] = false;
    }
}
```

**Word search (LC 79):** DFS from each cell; mark the cell (e.g. `board[r][c] = '#'`) before recursing and restore it after.

```cpp
bool dfs(vector<vector<char>>& b, const string& w, int r, int c, int k) {
    if (k == (int)w.size()) return true;
    if (r < 0 || c < 0 || r >= (int)b.size() || c >= (int)b[0].size()
        || b[r][c] != w[k]) return false;
    char tmp = b[r][c]; b[r][c] = '#';      // mark
    bool ok = dfs(b, w, r + 1, c, k + 1) || dfs(b, w, r - 1, c, k + 1)
           || dfs(b, w, r, c + 1, k + 1) || dfs(b, w, r, c - 1, k + 1);
    b[r][c] = tmp;                           // unmark
    return ok;
}
```

**Sudoku (LC 37):** find the next empty cell, try digits 1–9 that are valid in row/column/box (keep three `bool[9][10]` tables), return `true` as soon as the board is full.

## Pruning: making exponential fast enough

- **Sort + break** when the remaining budget goes negative (combination sum).
- **Feasibility check before recursing** (N-Queens column/diagonal sets) instead of validating at the leaf.
- **Early return** on the first solution when only existence is asked (`return true` up the chain).
- **Memoize** when the same `(index, remaining)` state repeats: that turns it into DP.

## Standard questions

| Problem | Pattern / key idea | Difficulty |
|---|---|---|
| 78. Subsets | include/exclude or start-index loop | Medium |
| 90. Subsets II | sort + skip duplicates at same level | Medium |
| 46. Permutations | `used[]` array | Medium |
| 47. Permutations II | sort + skip if `!used[i-1]` | Medium |
| 39. Combination Sum | recurse with `i`, sort + break | Medium |
| 40. Combination Sum II | recurse with `i+1`, skip dups | Medium |
| 77. Combinations | start index, stop at size k | Medium |
| 17. Letter Combinations of a Phone Number | one digit per level | Medium |
| 22. Generate Parentheses | add `(` if open < n, `)` if close < open | Medium |
| 131. Palindrome Partitioning | cut at every palindromic prefix | Medium |
| 79. Word Search | grid DFS + mark/unmark | Medium |
| 51. N-Queens | row by row, column + diagonal sets | Hard |
| 37. Sudoku Solver | next empty cell, try 1–9 | Hard |
| 212. Word Search II | backtracking + Trie | Hard |

## Checklist

- [ ] I can write a base case and draw the recursion tree to get time and stack space
- [ ] I can recognise backtracking from "all possible / generate" and small n
- [ ] I can write the choose-explore-unchoose template for subsets, permutations and combination sum from memory
- [ ] I can skip duplicates correctly (sort + same-level check)
- [ ] I can solve N-Queens and Word Search with O(1) validity checks and proper unmarking
- [ ] I can explain when pruning or memoization (DP) is needed instead of plain backtracking
