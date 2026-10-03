---
title: Greedy & Intervals
order: 8
time: 20
---

# Greedy & Intervals

Greedy means take the best choice right now at every step and never go back. The code is short; the hard part is **proving** that the local best gives the global best. In interviews greedy usually shows up as **sort + one pass**, especially with intervals.

## ⭐ When to use it

- "Maximum number of non-overlapping …", "minimum arrows/rooms/removals" → **sort intervals + greedy**.
- "Merge overlapping intervals", "insert interval" → **sort by start + merge**.
- "Can you reach the end", "minimum jumps" → **greedy reach** (Jump Game).
- "Circular route, gas/cost" → **gas station** single pass.
- "Combine the cheapest two repeatedly", "connect ropes" → **min-heap greedy** (Huffman-like).
- "Assign/match to maximise count" (cookies, boats) → **sort both + two pointers**.
- If choices affect the future and you find a counter-example → **DP**, not greedy.

| Phrase in the problem | Technique |
|---|---|
| "max non-overlapping intervals / meetings" | Sort by **end**, pick earliest finishing |
| "merge all overlapping intervals" | Sort by **start**, extend last |
| "minimum meeting rooms" | Sort starts & ends / min-heap of end times |
| "minimum arrows to burst balloons" | Sort by end, count groups |
| "jump game: can reach last index?" | Track farthest reach |
| "gas station: start index" | Reset start when tank < 0 |
| "minimum cost to connect ropes" | Min-heap, combine two smallest |
| "coin change with arbitrary coins" | Greedy fails → DP |

## ⭐ How to prove a greedy (exchange argument)

**In one line:** assume an optimal solution that does not take the greedy choice; show that swapping its first choice for the greedy choice does not make it worse. So greedy is optimal too.

> **Example (activity selection):** replace the first meeting of an optimal solution with "the meeting that ends earliest". It ends no later, so it cannot clash with the remaining meetings; the count stays the same. Hence "earliest end first" is optimal.

- Sorting by **start** fails for activity selection: [1,10], [2,3], [4,5] → start-sort takes [1,10] (1 meeting), end-sort gives 2 meetings.
- Interviews do not need a formal proof; a one-line exchange argument plus a quick counter-example check is enough.

## ⭐ Interval scheduling and merging

**In one line:** "how many can you keep" → sort by end; "join/union" → sort by start.

> **Example (merge):** [[1,3],[2,6],[8,10],[15,18]] → sort by start → [1,3]+[2,6] overlap (2 ≤ 3) → [1,6]; [8,10] separate; [15,18] separate → [[1,6],[8,10],[15,18]].

```cpp
#include <bits/stdc++.h>
using namespace std;

// LC 56 Merge Intervals
vector<vector<int>> merge(vector<vector<int>>& iv) {
    sort(iv.begin(), iv.end());                       // by start
    vector<vector<int>> res;
    for (auto& cur : iv) {
        if (res.empty() || res.back()[1] < cur[0]) res.push_back(cur);
        else res.back()[1] = max(res.back()[1], cur[1]);
    }
    return res;
}

// LC 435: min removals = n - max non-overlapping (sort by end)
int eraseOverlapIntervals(vector<vector<int>>& iv) {
    sort(iv.begin(), iv.end(), [](auto& a, auto& b) { return a[1] < b[1]; });
    int kept = 0;
    long long lastEnd = LLONG_MIN;
    for (auto& x : iv)
        if (x[0] >= lastEnd) { kept++; lastEnd = x[1]; }
    return iv.size() - kept;
}
```

- Complexity: O(n log n) sort + O(n) pass.

**Interview tip:** ask "do [1,2] and [2,3] overlap?". The rule for touching endpoints depends on the problem (`<` vs `<=`).

**Common mistake:** writing `res.back()[1] = cur[1]` instead of `max` in merge; when [2,3] sits inside [1,10] the end shrinks.

## Meeting rooms (sweep line)

```cpp
// LC 253: minimum rooms = max overlapping meetings at any time
int minMeetingRooms(vector<vector<int>>& iv) {
    vector<int> s, e;
    for (auto& x : iv) { s.push_back(x[0]); e.push_back(x[1]); }
    sort(s.begin(), s.end()); sort(e.begin(), e.end());
    int rooms = 0, best = 0, j = 0;
    for (int i = 0; i < (int)s.size(); i++) {
        while (j < (int)e.size() && e[j] <= s[i]) { j++; rooms--; } // free rooms
        rooms++;
        best = max(best, rooms);
    }
    return best;
}
```

- Alternative: sort by start, keep end times in a min-heap; pop while the top ≤ start. Heap size = rooms ([Heaps](12-heaps-priority-queue.md)).

## Jump Game and Gas Station

```cpp
// LC 55: can we reach the last index?
bool canJump(const vector<int>& a) {
    int reach = 0;
    for (int i = 0; i < (int)a.size(); i++) {
        if (i > reach) return false;          // stuck before i
        reach = max(reach, i + a[i]);
    }
    return true;
}

// LC 134: if total gas >= total cost, the answer exists and is unique
int canCompleteCircuit(vector<int>& gas, vector<int>& cost) {
    int total = 0, tank = 0, start = 0;
    for (int i = 0; i < (int)gas.size(); i++) {
        total += gas[i] - cost[i];
        tank += gas[i] - cost[i];
        if (tank < 0) { start = i + 1; tank = 0; }   // no start in [start..i] works
    }
    return total < 0 ? -1 : start;
}
```

- Jump Game II (LC 45): like BFS levels: when you hit the current level's `end`, `jumps++` and `end = farthest`.

## Heap-based greedy (Huffman-like)

```cpp
// Connect ropes: always combine the two cheapest
long long connectRopes(vector<int>& r) {
    priority_queue<long long, vector<long long>, greater<long long>> pq(r.begin(), r.end());
    long long cost = 0;
    while (pq.size() > 1) {
        long long a = pq.top(); pq.pop();
        long long b = pq.top(); pq.pop();
        cost += a + b;
        pq.push(a + b);
    }
    return cost;
}
```

## When greedy fails → DP

- **Coin change**, coins = {1, 3, 4}, amount 6: greedy 4+1+1 = 3 coins; optimal 3+3 = 2 coins. Greedy works for "canonical" systems like Indian currency, not arbitrary ones → [DP](15-dp.md).
- **0/1 knapsack**: value/weight ratio greedy fails; for fractional knapsack greedy is correct.
- Rule of thumb: spend 2 minutes looking for a small counter-example. If you find one, use DP.

## Standard questions

| Problem | Pattern / key idea | Difficulty |
|---|---|---|
| Assign Cookies (LC 455) | Sort both, two pointers | Easy |
| Merge Intervals (LC 56) | Sort by start, extend | Medium |
| Insert Interval (LC 57) | Before / overlap / after | Medium |
| Non-overlapping Intervals (LC 435) | Sort by end, keep max | Medium |
| Minimum Arrows to Burst Balloons (LC 452) | Sort by end, count groups | Medium |
| Meeting Rooms II (LC 253) | Sweep starts/ends or min-heap | Medium |
| Jump Game (LC 55) | Farthest reach | Medium |
| Jump Game II (LC 45) | Level-wise reach | Medium |
| Gas Station (LC 134) | Reset start when tank < 0 | Medium |
| Partition Labels (LC 763) | Last occurrence, extend end | Medium |
| Task Scheduler (LC 621) | Most frequent task decides idle slots | Medium |
| Boats to Save People (LC 881) | Sort + heaviest with lightest | Medium |
| Candy (LC 135) | Two passes, left and right | Hard |
| Minimum Platforms (classic) | Sweep arrivals/departures | Medium |
| Minimum Cost to Connect Sticks (LC 1167) | Min-heap combine | Medium |

## Checklist

- [ ] I remember: sort by end for "max non-overlapping", by start for "merge"
- [ ] I can state the exchange argument in one line
- [ ] I can write Merge Intervals, Meeting Rooms and Jump Game without looking
- [ ] I can explain why "reset start when tank < 0" is correct in Gas Station
- [ ] I can give the coin change counter-example and say when DP is needed
