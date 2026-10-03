---
title: Binary Search
order: 7
time: 20
---

# Binary Search

Binary search halves the search space every step: O(log n). Finding an element in a sorted array is the basic case; the real interview power is **binary search on the answer**, where the array is not sorted but there is a monotonic yes/no condition on the answer. The bugs are always at the boundaries, so memorise one template.

## ⭐ When to use it

- "Sorted array", "find first/last position", "insert position" → **lower_bound / upper_bound**.
- "Rotated sorted array", "peak element", "mountain" → **modified binary search** (which half is sorted / which way is the slope).
- "**Minimum** possible maximum", "**maximum** possible minimum", "smallest speed/capacity/days such that…" → **binary search on the answer**.
- Answer range is huge (1e9, 1e18) but a check runs in O(n) → BS on answer: O(n log range).
- "Sqrt / k-th root with precision" → **floating point BS**.
- Matrix with sorted rows and columns → BS or staircase search.

| Phrase in the problem | Technique |
|---|---|
| "first index ≥ x", "count of x" | lower_bound / upper_bound |
| "search in rotated sorted array" | Check which half is sorted |
| "minimum eating speed to finish in h hours" | BS on answer + feasibility check |
| "least capacity to ship within d days" | BS on answer, lo = max, hi = sum |
| "split array, minimise largest sum" | BS on answer (same as ship capacity) |
| "kth smallest in sorted matrix" | BS on value + count ≤ mid |
| "sqrt(x) to 1e-6" | Floating BS, fixed 100 iterations |

## ⭐ One template that never loops forever

**In one line:** find "the first index where `ok(i)` is true". `lo` always sits on the false side, `hi` on the true side; loop while `hi - lo > 1`.

```text
i:          -1    0    1    2    3    4    5
a:               [1,   3,   3,   5,   8]
a[i] >= 3:   F    F    T    T    T    T    T
             lo                            hi     (-1 and n are virtual)
                       ^
                       answer = first T = index 1
```

*Above: the predicate F F F T T T is monotonic; `lo` always sits on F, `hi` always on T.*

> **Example:** a = [1, 3, 3, 5, 8], first index with a[i] ≥ 3. lo=-1, hi=5. mid=2 (3 ≥ 3) → hi=2. mid=0 (1) → lo=0. mid=1 (3) → hi=1. Stop: answer 1.

```text
i:          -1    0    1    2    3    4    5
a:               [1,   3,   3,   5,   8]

Step 1:      lo             mid            hi     a[2]=3 >= 3  -> hi = 2
Step 2:      lo   mid       hi                    a[0]=1 <  3  -> lo = 0
Step 3:           lo   mid  hi                    a[1]=3 >= 3  -> hi = 1
Step 4:           lo   hi                         hi - lo = 1  -> return 1
```

*Above: every step halves the range; once lo and hi are adjacent, hi is the answer.*

```mermaid
flowchart TD
    S["lo = -1, hi = n"] --> C{"hi - lo > 1?"}
    C -->|"yes"| M["mid = lo + (hi - lo) / 2"]
    M --> P{"ok(mid)?"}
    P -->|"true"| H["hi = mid"]
    P -->|"false"| L["lo = mid"]
    H --> C
    L --> C
    C -->|"no"| R["return hi"]
    classDef hot fill:#ffffff,stroke:#ffffff,color:#000000,font-weight:bold
    classDef dim fill:none,stroke-dasharray:4 3,opacity:0.6
    class R hot
```

*Above: the template flow: one condition, two assignments, no +1/-1 anywhere.*

```cpp
#include <bits/stdc++.h>
using namespace std;

// Returns first index i in [0, n) where a[i] >= x, or n if none (= lower_bound)
int firstGE(const vector<int>& a, int x) {
    int lo = -1, hi = a.size();              // invariant: a[lo] < x, a[hi] >= x
    while (hi - lo > 1) {
        int mid = lo + (hi - lo) / 2;        // no overflow
        if (a[mid] >= x) hi = mid;
        else lo = mid;
    }
    return hi;
}

// STL equivalents
void stlDemo(vector<int>& a, int x) {
    int lb = lower_bound(a.begin(), a.end(), x) - a.begin(); // first >= x
    int ub = upper_bound(a.begin(), a.end(), x) - a.begin(); // first >  x
    int countX = ub - lb;                                    // occurrences of x
    (void)countX;
}
```

```text
x = 3
i:              0    1    2    3    4    5
a:            [ 1,   3,   3,   3,   5,   8 ]
                     ^              ^
             lower_bound = 1    upper_bound = 4
             (first >= 3)       (first > 3)

count of 3 = 4 - 1 = 3
```

*Above: all copies of x sit between lower_bound and upper_bound.*

- Complexity: O(log n) time, O(1) space.

**Interview tip:** first state "what the predicate is and why it is monotonic, F F F T T T". After that the template is mechanical. Last index with a[i] ≤ x = `firstGT(x) - 1`.

**Common mistake:** `mid = (lo + hi) / 2` overflowing on large ints, and writing `while (lo < hi)` with `lo = mid`; when `lo + 1 == hi`, mid equals lo and the loop never ends.

## Rotated sorted array

**In one line:** one side of mid is always sorted; check whether the target lies in that sorted half.

```text
i:      0   1   2   3   4   5   6
a:    [ 4,  5,  6,  7,  0,  1,  2 ]       target = 0
        |--sorted---|   |-sorted|

Step 1: l           m           r   a[l]=4 <= a[m]=7: left sorted, 0 not in [4,7) -> l = 4
Step 2:                 l   m   r   a[l]=0 <= a[m]=1: left sorted, 0 in [0,1)     -> r = 4
Step 3:                 lmr         a[4] = 0 -> found at 4
```

*Above: a rotated array is two sorted runs; one half around mid is always sorted.*

```mermaid
flowchart TD
    M{"a[m] == t?"} -->|"yes"| F["return m"]
    M -->|"no"| S{"a[l] <= a[m]?"}
    S -->|"yes: left half sorted"| L{"a[l] <= t < a[m]?"}
    S -->|"no: right half sorted"| R{"a[m] < t <= a[r]?"}
    L -->|"yes"| L1["r = m - 1"]
    L -->|"no"| L2["l = m + 1"]
    R -->|"yes"| R1["l = m + 1"]
    R -->|"no"| R2["r = m - 1"]
    classDef hot fill:#ffffff,stroke:#ffffff,color:#000000,font-weight:bold
    classDef dim fill:none,stroke-dasharray:4 3,opacity:0.6
    class F hot
```

*Above: first identify the sorted half, then check whether the target lies in its range.*

```cpp
// LC 33: distinct values
int searchRotated(const vector<int>& a, int t) {
    int l = 0, r = a.size() - 1;
    while (l <= r) {
        int m = l + (r - l) / 2;
        if (a[m] == t) return m;
        if (a[l] <= a[m]) {                          // left half sorted
            if (a[l] <= t && t < a[m]) r = m - 1;
            else l = m + 1;
        } else {                                     // right half sorted
            if (a[m] < t && t <= a[r]) l = m + 1;
            else r = m - 1;
        }
    }
    return -1;
}
```

- Minimum in rotated array (LC 153): if `a[m] > a[r]` the min is on the right (`l = m+1`), else `r = m`.
- Duplicates (LC 81/154): when `a[l] == a[m] == a[r]` just do `l++, r--`; worst case O(n).

## ⭐ Binary search on the answer

**In one line:** take the answer range [lo, hi], write a monotonic `feasible(mid)` (always true after some point), then find the first true.

> **Example (Koko, LC 875):** piles = [3, 6, 7, 11], h = 8. At speed k, hours = Σ ceil(p/k). k=4 → 1+2+2+3 = 8 ≤ 8 true. k=3 → 1+2+3+4 = 10 false. Answer 4.

```text
speed k:      1    2    3    4    5    6   ...   11
hours:       27   15   10    8    8    6   ...    4
hours <= 8?   F    F    F    T    T    T   ...    T
                             ^
                             answer = 4 (first T)
```

*Above: BS on answer: the answer space also looks like F F F T T T, so the same template works.*

```text
Step 1: lo=0   hi=11   mid=5   hours 8  <= 8  T  -> hi = 5
Step 2: lo=0   hi=5    mid=2   hours 15 >  8  F  -> lo = 2
Step 3: lo=2   hi=5    mid=3   hours 10 >  8  F  -> lo = 3
Step 4: lo=3   hi=5    mid=4   hours 8  <= 8  T  -> hi = 4
Stop:   lo=3   hi=4    hi - lo = 1               -> answer 4
```

*Above: Koko: only 4 feasible() calls out of 11 possible speeds.*

```cpp
// LC 875 Koko Eating Bananas
int minEatingSpeed(vector<int>& piles, int h) {
    auto feasible = [&](long long k) {
        long long hours = 0;
        for (int p : piles) hours += (p + k - 1) / k;   // ceil without floats
        return hours <= h;
    };
    long long lo = 0, hi = *max_element(piles.begin(), piles.end());
    // invariant: feasible(lo) false (speed 0), feasible(hi) true
    while (hi - lo > 1) {
        long long mid = lo + (hi - lo) / 2;
        if (feasible(mid)) hi = mid; else lo = mid;
    }
    return hi;
}

// LC 1011 / 410: least capacity so that we need <= d groups
bool canShip(const vector<int>& w, int d, long long cap) {
    int days = 1; long long load = 0;
    for (int x : w) {
        if (load + x > cap) { days++; load = 0; }
        load += x;
    }
    return days <= d;            // call with cap >= max(w); lo = max-1, hi = sum
}
```

- Complexity: O(n log(range)).

**Interview tip:** say three things: (1) the answer range, (2) the feasible function, (3) why it is monotonic ("a higher speed can only reduce hours").

**Common mistake:** a wrong `lo` (for ship capacity, a cap below the max weight breaks the check) and letting hours overflow an `int`.

## Floating point binary search

```cpp
double cubeRoot(double x) {                  // x >= 0
    double lo = 0, hi = max(1.0, x);
    for (int it = 0; it < 100; it++) {       // fixed iterations, no epsilon loop
        double mid = (lo + hi) / 2;
        if (mid * mid * mid < x) lo = mid; else hi = mid;
    }
    return lo;
}
```

- `while (hi - lo > 1e-9)` can get stuck due to precision; 100 iterations is safe (2^-100).

## Standard questions

| Problem | Pattern / key idea | Difficulty |
|---|---|---|
| Binary Search (LC 704) | Classic | Easy |
| Search Insert Position (LC 35) | lower_bound | Easy |
| First and Last Position (LC 34) | lower_bound + upper_bound - 1 | Medium |
| Sqrt(x) (LC 69) | Last k with k*k ≤ x (use long long) | Easy |
| Search in Rotated Sorted Array (LC 33) | Which half is sorted | Medium |
| Find Minimum in Rotated Sorted Array (LC 153) | Compare mid with right | Medium |
| Find Peak Element (LC 162) | Move towards rising slope | Medium |
| Search a 2D Matrix (LC 74) | Treat as 1D array of m·n | Medium |
| Koko Eating Bananas (LC 875) | BS on speed | Medium |
| Capacity To Ship Packages (LC 1011) | BS on capacity, greedy check | Medium |
| Minimum Days for Bouquets (LC 1482) | BS on days | Medium |
| Split Array Largest Sum (LC 410) | BS on max sum | Hard |
| Kth Smallest in Sorted Matrix (LC 378) | BS on value + count | Medium |
| Median of Two Sorted Arrays (LC 4) | BS on partition | Hard |
| Aggressive Cows (classic) | BS on min distance, maximise | Medium |

## Checklist

- [ ] I can spot a monotonic predicate (F F F T T T) and state it
- [ ] I can write the lo/hi invariant template without infinite loops
- [ ] I can get first/last/count with lower_bound/upper_bound
- [ ] I can write the sorted-half logic for a rotated array
- [ ] I can turn "minimise the maximum" into BS on answer + greedy check
