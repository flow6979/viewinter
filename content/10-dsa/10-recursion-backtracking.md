---
title: Recursion & Backtracking
order: 10
time: 20
---

# Recursion & Backtracking

Recursion problem ko usi ke chhote versions solve karke solve karta hai. Backtracking wo recursion hai jo candidate step by step banata hai aur dead end aane pe last step undo karta hai. Interviewers ise pasand karte hain kyunki isme state, base case aur pruning clean define karna padta hai, aur trees, graphs, DP sab isi pe khade hain.

## ⭐ Kab use karein (recognition)

- Problem me **"all possible"**, **"generate all"**, **"every combination / permutation / arrangement"**, **"print all paths"** likha ho → backtracking.
- **Chhota n** (subsets ke liye n ≤ 15–20, permutations ke liye n ≤ 8–10): answer khud exponential hai, to exponential algorithm hi expected hai.
- **Constraint satisfaction**: items aise rakho ki rules follow hon (N-Queens, Sudoku, grid me word).
- Agar sirf **count** ya **min/max** poocha hai aur subproblems repeat ho rahe hain → ye shayad [DP](15-dp.md) hai, backtracking nahi.

| Problem phrase | Technique | Typical cost |
|---|---|---|
| "all subsets", "power set" | include / exclude | O(2^n · n) |
| "all permutations" | swap ya `used[]` array | O(n! · n) |
| "combinations that sum to target" | start index ke saath pick | exponential, pruned |
| "place N items with no conflict" | row-by-row + validity check | O(n!) pruned |
| "does word exist in grid" | DFS + visited mark + unmark | O(R·C·4^L) |
| "count ways / min cost", states repeat | memoized recursion → DP | polynomial |

## ⭐ Recursion basics: base case + recursion tree

**Ek line me:** har recursive function ko chahiye (1) ek base case jo rok de, (2) ek step jo usi taraf le jaaye, aur (3) bharosa ki chhota call sahi kaam karega.

> **Example:** `fib(4)` call karta hai `fib(3)` aur `fib(2)`; `fib(3)` call karta hai `fib(2)` aur `fib(1)`. `fib(2)` do baar compute hua, yahi hint hai ki memoization (DP) madad karega. Recursion depth = tree ki height = stack space.

```mermaid
flowchart TD
    F4["fib(4)"] --> F3["fib(3)"]
    F4 --> F2a["fib(2)"]
    F3 --> F2b["fib(2)"]
    F3 --> F1a["fib(1) = 1"]
    F2b --> F1b["fib(1) = 1"]
    F2b --> F0a["fib(0) = 0"]
    F2a --> F1c["fib(1)"]
    F2a --> F0b["fib(0)"]
    classDef hot fill:#ffffff,stroke:#ffffff,color:#000000,font-weight:bold
    classDef dim fill:none,stroke-dasharray:4 3,opacity:0.6
    class F4 hot
    class F2a,F1c,F0b dim
```

*Upar: `fib(4)` ka recursion tree. Dotted `fib(2)` subtree pehle hi left side me compute ho chuka hai; memo hota to ye call turant return karti. Har level pe calls double hoti hain → O(2^n).*

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

- Complexity: time = recursion tree ke nodes × har node ka kaam; space = max depth (call stack).
- Default stack ~1–8 MB hota hai: depth 1e5–1e6 ke aas paas overflow ho sakta hai. Deep linear recursion ko iterative bana do.

```text
call stack for power(2, 10)              (top of stack on the right)

Step 1  power(2,10)
Step 2  power(2,10) → power(2,5)
Step 3  power(2,10) → power(2,5) → power(2,2)
Step 4  power(2,10) → power(2,5) → power(2,2) → power(2,1)
Step 5  power(2,10) → power(2,5) → power(2,2) → power(2,1) → power(2,0)   base case: 1

unwind  power(2,1)  = 1·1·2  = 2
        power(2,2)  = 2·2    = 4
        power(2,5)  = 4·4·2  = 32
        power(2,10) = 32·32  = 1024

max depth = 5 frames = O(log e) stack space
```

*Upar: `power(2, 10)` ka call stack: pehle base case tak frames badhte hain, phir unwind hote hue answer upar banta hai. Depth hi space hai.*

**Interview tip:** code se pehle chhote input ka recursion tree draw karo; complexity free me mil jaati hai.

**Common galti:** base case missing ya galat (jaise `n == 0` handle nahi kiya), infinite recursion aur stack overflow.

## ⭐ Backtracking template: choose, explore, unchoose

**Ek line me:** har step pe har valid choice try karo, recurse karo, phir choice undo karo taaki agli branch clean start ho.

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

- `path` reference se pass karo aur changes undo karo; har level pe vector copy karna har call me extra O(n) jodta hai.
- Complexity: subsets ke liye O(2^n · n) (2^n answers, har ek O(n) me copy).

```mermaid
flowchart TD
    R["{ }"] -->|"take 1"| A["{1}"]
    R -->|"skip 1"| B["{ }"]
    A -->|"take 2"| C["{1,2}"]
    A -->|"skip 2"| D["{1}"]
    B -->|"take 2"| E["{2}"]
    B -->|"skip 2"| F["{ }"]
    C -->|"take 3"| G["{1,2,3}"]
    C -->|"skip 3"| H["{1,2}"]
    D -->|"take 3"| I["{1,3}"]
    D -->|"skip 3"| J["{1}"]
    E -->|"take 3"| K["{2,3}"]
    E -->|"skip 3"| L["{2}"]
    F -->|"take 3"| M["{3}"]
    F -->|"skip 3"| N["{ }"]
    classDef hot fill:#ffffff,stroke:#ffffff,color:#000000,font-weight:bold
    classDef dim fill:none,stroke-dasharray:4 3,opacity:0.6
    class G,H,I,J,K,L,M,N hot
```

*Upar: `[1, 2, 3]` ka include / exclude decision tree. Har level ek element ka faisla hai (lo ya chhodo); 3 levels ke baad 2^3 = 8 leaves = 8 subsets (bold).*

```text
backtrack(nums=[1,2,3], start)            path        res.push_back(path)
bt(0)                                     []          []
  choose 1 → bt(1)                        [1]         [1]
    choose 2 → bt(2)                      [1,2]       [1,2]
      choose 3 → bt(3)                    [1,2,3]     [1,2,3]
      unchoose 3                          [1,2]
    unchoose 2                            [1]
    choose 3 → bt(3)                      [1,3]       [1,3]
    unchoose 3                            [1]
  unchoose 1                              []
  choose 2 → bt(2)                        [2]         [2]
    choose 3 → bt(3)                      [2,3]       [2,3]
    unchoose 3                            [2]
  unchoose 2                              []
  choose 3 → bt(3)                        [3]         [3]
  unchoose 3                              []          total = 8
```

*Upar: upar wale start-index code ka trace. Ek hi `path` vector badhta aur ghatta hai; har `pop_back()` agli branch ke liye state saaf karta hai.*

**Interview tip:** "choose, explore, unchoose" bol ke likho; dikhta hai ki tumhare paas template hai, guess nahi.

**Common galti:** `pop_back()` (ya `visited` un-mark karna) bhool jaana, phir aage ki branches purana state dekhti hain.

## Subsets, permutations, combination sum

**Subsets with duplicates (LC 90):** pehle sort karo, phir `i > start` hone pe `nums[i] == nums[i-1]` skip karo.

```mermaid
flowchart TD
    R["[ ]"] --> A["[1]"]
    R --> B["[2]"]
    R --> X1["second 2 at same level: skip"]
    A --> C["[1,2]"]
    A --> X2["second 2 at same level: skip"]
    C --> D["[1,2,2]"]
    B --> E["[2,2]"]
    classDef hot fill:#ffffff,stroke:#ffffff,color:#000000,font-weight:bold
    classDef dim fill:none,stroke-dasharray:4 3,opacity:0.6
    class R,A,B,C,D,E hot
    class X1,X2 dim
```

*Upar: sorted `[1, 2, 2]` pe Subsets II. Same level pe doosra `2` wahi subtree dobara banata, isliye `i > start && nums[i] == nums[i-1]` use kaat deta hai (dotted). Bache 6 unique subsets.*

**Permutations (LC 46):** `used[]` array rakho; har position pe koi bhi unused element aa sakta hai.

```mermaid
flowchart TD
    R["[ ]"] --> A["[1]"]
    R --> B["[2]"]
    R --> C["[3]"]
    A --> A2["[1,2]"]
    A --> A3["[1,3]"]
    B --> B1["[2,1]"]
    B --> B3["[2,3]"]
    C --> C1["[3,1]"]
    C --> C2["[3,2]"]
    A2 --> P1["[1,2,3]"]
    A3 --> P2["[1,3,2]"]
    B1 --> P3["[2,1,3]"]
    B3 --> P4["[2,3,1]"]
    C1 --> P5["[3,1,2]"]
    C2 --> P6["[3,2,1]"]
    classDef hot fill:#ffffff,stroke:#ffffff,color:#000000,font-weight:bold
    classDef dim fill:none,stroke-dasharray:4 3,opacity:0.6
    class P1,P2,P3,P4,P5,P6 hot
```

*Upar: `[1, 2, 3]` ka permutations tree. Level 1 pe 3 choices, level 2 pe 2, level 3 pe 1 → 3! = 6 leaves (bold). Isliye cost O(n! · n).*

```text
step  path      used[0] used[1] used[2]   loop can pick
1     []        F       F       F         1, 2, 3
2     [1]       T       F       F         2, 3
3     [1,2]     T       T       F         3
4     [1,2,3]   T       T       T         full → record, return
5     [1,2]     T       T       F         undo 3: used[2] = F
6     [1]       T       F       F         undo 2, loop moves on to 3
7     [1,3]     T       F       T         2
8     [1,3,2]   T       T       T         full → record
```

*Upar: `used[]` array ka state har step pe. Choose pe `T`, unchoose pe wapas `F`; isi se same element ek permutation me do baar nahi aata.*

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

**Combination sum (LC 39):** reuse allowed hai, isliye `i` ke saath recurse karo (`i + 1` nahi); sort karo aur candidate remaining target se bada ho to `break`.

```mermaid
flowchart TD
    R["rem 7"] -->|"2"| A["rem 5"]
    R -->|"3"| B["rem 4"]
    R -->|"6"| C["rem 1"]
    R -->|"7"| D["rem 0: [7]"]
    A -->|"2"| A1["rem 3"]
    A -->|"3"| A2["rem 2"]
    A -->|"6"| A3["6 > 5: break"]
    A1 -->|"2"| A11["rem 1"]
    A1 -->|"3"| A12["rem 0: [2,2,3]"]
    A11 -->|"2"| A111["2 > 1: break"]
    A2 -->|"3"| A21["3 > 2: break"]
    B -->|"3"| B1["rem 1"]
    B -->|"6"| B2["6 > 4: break"]
    B1 -->|"3"| B11["3 > 1: break"]
    C -->|"6"| C1["6 > 1: break"]
    classDef hot fill:#ffffff,stroke:#ffffff,color:#000000,font-weight:bold
    classDef dim fill:none,stroke-dasharray:4 3,opacity:0.6
    class D,A12 hot
    class A3,A111,A21,B2,B11,C1 dim
```

*Upar: candidates `[2, 3, 6, 7]`, target 7. Edge pe chuna gaya number, node pe bacha target. Dotted nodes `break` se kate (sorted hai, aage sab bade hain); bold nodes answers `[7]` aur `[2,2,3]` hain.*

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

| Variant | Recurse kisse | Duplicates skip? |
|---|---|---|
| Subsets / Combinations | `i + 1` | sort + `i > start && a[i]==a[i-1]` |
| Combination Sum (reuse) | `i` | nahi (distinct input) |
| Combination Sum II (no reuse) | `i + 1` | haan |
| Permutations | 0 se loop + `used[]` | LC 47 ke liye sort + `!used[i-1]` check |

## Constraint problems: N-Queens, word search, Sudoku

**N-Queens (LC 51):** har row me ek queen; used columns aur dono diagonals (`r - c + n`, `r + c`) O(1) me track karo.

```text
n = 4, one queen per row ( Q = queen, x = attacked, . = free )

Step 1: row 0 → c=0     Step 2: row 1 → c=2     Step 3: undo, row 1 → c=3
Q . . .                 Q . . .                 Q . . .
x x . .                 . . Q .                 . . . Q
x . x .                 x x x x  ← dead end     x . x x
x . . x                 x . x x                 x x . x

Step 4: row 2 → c=1     Step 5: undo up to row 0, try c=1 → solution
Q . . .                 . Q . .
. . . Q                 . . . Q
. Q . .                 Q . . .
x x x x  ← dead end     . . Q .
```

*Upar: 4-Queens row by row. Har row me free column try karo; koi free na ho to pichli row ki queen hata ke agla column try karo (backtrack). Step 5 pehla valid board hai.*

```mermaid
flowchart TD
    R["start"] --> A["r0: c0"]
    R --> B["r0: c1"]
    A --> A1["r1: c2"]
    A --> A2["r1: c3"]
    A1 --> A1x["r2: no column, undo"]
    A2 --> A21["r2: c1"]
    A21 --> A21x["r3: no column, undo"]
    B --> B1["r1: c3"]
    B1 --> B2["r2: c0"]
    B2 --> B3["r3: c2 solution"]
    classDef hot fill:#ffffff,stroke:#ffffff,color:#000000,font-weight:bold
    classDef dim fill:none,stroke-dasharray:4 3,opacity:0.6
    class B,B1,B2,B3 hot
    class A,A1,A2,A1x,A21,A21x dim
```

*Upar: wahi search tree ke roop me. Dotted branches dead ends hain jo pruning ne jaldi kaat diye; bold path pehla solution hai.*

```text
d1 index = r - c + n                  d2 index = r + c
        c=0  c=1  c=2  c=3                    c=0  c=1  c=2  c=3
r=0      4    3    2    1             r=0      0    1    2    3
r=1      5    4    3    2             r=1      1    2    3    4
r=2      6    5    4    3             r=2      2    3    4    5
r=3      7    6    5    4             r=3      3    4    5    6
```

*Upar: n = 4 ke liye diagonal ids. Ek `↘` diagonal pe `r - c + n` same rehta hai, ek `↙` diagonal pe `r + c` same; isliye ek bool array se O(1) check ho jaata hai.*

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

**Word search (LC 79):** har cell se DFS; recurse se pehle cell mark karo (jaise `board[r][c] = '#'`) aur baad me restore.

```text
board            word = "ABCCED"
A B C E
S F C S          path: A(0,0) → B(0,1) → C(0,2) → C(1,2) → E(2,2) → D(2,1)
A D E E

while looking for k = 4 ('E')        after the DFS returns (unmark)
# # # E                              A B C E
S F # S                              S F C S
A D E E                              A D E E
'#' = on the current path, cannot be reused
```

*Upar: Word Search me mark / unmark. Current path ke cells `#` ban jaate hain taaki dobara use na hon; return pe restore hote hain taaki doosre start points ko original board mile.*

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

**Sudoku (LC 37):** agla empty cell dhundo, 1–9 me se wo digits try karo jo row/column/box me valid hon (teen `bool[9][10]` tables rakho), board full hote hi `true` return karo.

## Pruning: exponential ko fast enough banana

- **Sort + break** jab remaining budget negative ho jaaye (combination sum).
- **Recurse se pehle feasibility check** (N-Queens column/diagonal sets), leaf pe validate karne ke bajaye.
- **Early return** pehle solution pe jab sirf existence poocha ho (`return true` upar tak).
- **Memoize** jab same `(index, remaining)` state repeat ho: tab ye DP ban jaata hai.

```mermaid
flowchart TD
    R["empty"] -->|"("| A["("]
    R -->|")"| X1[") : close > open, cut"]
    A -->|"("| B["(("]
    A -->|")"| C["()"]
    B -->|"("| X2["((( : open > n, cut"]
    B -->|")"| D["(()"]
    D --> E["(())"]
    C -->|"("| F["()("]
    C -->|")"| X3["()) : close > open, cut"]
    F --> G["()()"]
    classDef hot fill:#ffffff,stroke:#ffffff,color:#000000,font-weight:bold
    classDef dim fill:none,stroke-dasharray:4 3,opacity:0.6
    class E,G hot
    class X1,X2,X3 dim
```

*Upar: Generate Parentheses, n = 2. Rules (`open < n`, `close < open`) galat branch ko banne se pehle hi kaat dete hain (dotted); sirf 2 valid strings (bold) tak pahunchte hain.*

## Standard questions

| Problem | Pattern / key idea | Difficulty |
|---|---|---|
| 78. Subsets | include/exclude ya start-index loop | Medium |
| 90. Subsets II | sort + same level pe dups skip | Medium |
| 46. Permutations | `used[]` array | Medium |
| 47. Permutations II | sort + `!used[i-1]` ho to skip | Medium |
| 39. Combination Sum | `i` ke saath recurse, sort + break | Medium |
| 40. Combination Sum II | `i+1` ke saath recurse, dups skip | Medium |
| 77. Combinations | start index, size k pe ruko | Medium |
| 17. Letter Combinations of a Phone Number | har level pe ek digit | Medium |
| 22. Generate Parentheses | `(` agar open < n, `)` agar close < open | Medium |
| 131. Palindrome Partitioning | har palindromic prefix pe cut | Medium |
| 79. Word Search | grid DFS + mark/unmark | Medium |
| 51. N-Queens | row by row, column + diagonal sets | Hard |
| 37. Sudoku Solver | agla empty cell, 1–9 try | Hard |
| 212. Word Search II | backtracking + Trie | Hard |

## Checklist

- [ ] Base case likh sakta hoon aur recursion tree draw karke time aur stack space nikal sakta hoon
- [ ] "all possible / generate" aur chhote n se backtracking pehchaan sakta hoon
- [ ] Subsets, permutations aur combination sum ka choose-explore-unchoose template yaad se likh sakta hoon
- [ ] Duplicates sahi se skip kar sakta hoon (sort + same-level check)
- [ ] N-Queens aur Word Search O(1) validity checks aur sahi unmarking ke saath solve kar sakta hoon
- [ ] Bata sakta hoon kab plain backtracking ki jagah pruning ya memoization (DP) chahiye
