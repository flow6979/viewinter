---
title: Heaps & Priority Queue
order: 12
time: 15
---

# Heaps & Priority Queue

A heap gives you the min (or max) element in O(1) and lets you insert or remove in O(log n). Whenever a problem keeps asking "what is the smallest/largest right now?" while elements keep arriving, a heap is the answer. In C++ it is `priority_queue`, and the comparator syntax is the part most candidates get wrong.

## ⭐ When to use it

- **"Top K", "K largest / smallest", "K most frequent", "K closest"** → heap of size K.
- **"Merge K sorted lists / arrays"** → min-heap of the current head of each list.
- **"Median of a stream", "running median"** → two heaps.
- **"Always pick the cheapest / earliest / largest next"** (greedy with changing candidates) → heap: task scheduling, meeting rooms, connect ropes.
- **Shortest path with weights** → [Dijkstra](13-graphs.md) uses a min-heap.
- If you only need K-th element once and can modify the array → quickselect O(n) average is an alternative; if data is static and fully needed sorted → just sort.

| Problem phrase | Heap setup | Cost |
|---|---|---|
| K largest | **min**-heap of size K (pop the smallest) | O(n log K) |
| K smallest / K closest | **max**-heap of size K | O(n log K) |
| merge K sorted | min-heap of (value, list, index) | O(N log K) |
| median of stream | max-heap (low half) + min-heap (high half) | O(log n) per add |
| min meeting rooms | sort by start + min-heap of end times | O(n log n) |

## ⭐ priority_queue syntax (max, min, custom)

**In one line:** `priority_queue<T>` is a **max**-heap; pass `greater<T>` for a min-heap; a custom comparator returns `true` when `a` should come **after** `b`.

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    priority_queue<int> mx;                              // max-heap
    priority_queue<int, vector<int>, greater<int>> mn;   // min-heap
    for (int x : {5, 1, 8, 3}) { mx.push(x); mn.push(x); }
    cout << mx.top() << " " << mn.top() << "\n";         // 8 1

    // pairs compare by first, then second
    priority_queue<pair<int,int>, vector<pair<int,int>>, greater<>> pq;
    pq.push({2, 7}); pq.push({1, 9});
    cout << pq.top().first << "\n";                      // 1

    // custom: min-heap by distance (comparator says "a after b")
    auto cmp = [](const array<int,2>& a, const array<int,2>& b) {
        return a[0] > b[0];
    };
    priority_queue<array<int,2>, vector<array<int,2>>, decltype(cmp)> h(cmp);
    h.push({4, 0}); h.push({2, 1});
    cout << h.top()[0] << "\n";                          // 2
}
```

- `push`, `pop`: O(log n). `top`: O(1). Building from a vector: O(n) via the range constructor.
- No decrease-key and no arbitrary delete: push a new entry and skip stale ones on pop (lazy deletion).
- Trick: for a min-heap of ints you can also push `-x` into a max-heap.

**Interview tip:** say "max-heap by default, `greater` flips it" before writing; interviewers watch for this.

**Common mistake:** writing `a < b` in a custom comparator and expecting a min-heap. In `priority_queue`, `<` gives a max-heap.

## Heap property (how it works inside)

- Complete binary tree stored in an array: children of `i` are `2i+1`, `2i+2`; parent is `(i-1)/2`.
- Max-heap property: every parent ≥ its children (so the root is the max). Not sorted between siblings.
- Insert = append + **sift up**; pop = move last to root + **sift down**. Both O(log n).
- Heapify a whole array bottom-up = O(n), not O(n log n). Heap sort = O(n log n), in place, not stable.

## ⭐ Top-K pattern

> **Example:** K = 2 largest of `[3, 1, 5, 12, 2]` with a min-heap of size 2: push 3 → {3}; push 1 → {1,3}; push 5 → {1,3,5} pop 1 → {3,5}; push 12 → pop 3 → {5,12}; push 2 → pop 2 → {5,12}. Answer: top of heap = 5 is the 2nd largest.

```cpp
int findKthLargest(vector<int>& nums, int k) {            // LC 215
    priority_queue<int, vector<int>, greater<int>> pq;    // min-heap
    for (int x : nums) {
        pq.push(x);
        if ((int)pq.size() > k) pq.pop();                 // drop smallest
    }
    return pq.top();
}
```

- O(n log K) time, O(K) space. Better than sorting when K ≪ n or the data is a stream.
- K most frequent (LC 347): count with `unordered_map`, then size-K min-heap of `(freq, value)`; bucket sort gives O(n).

**Common mistake:** using a max-heap of all n elements and popping K times: works, but O(n + K log n) memory and misses the "stream" follow-up.

## ⭐ Two heaps: median of a stream

**In one line:** keep the smaller half in a max-heap `lo` and the larger half in a min-heap `hi`, sizes differ by at most 1.

```cpp
class MedianFinder {                                     // LC 295
    priority_queue<int> lo;                              // max-heap
    priority_queue<int, vector<int>, greater<int>> hi;   // min-heap
public:
    void addNum(int x) {
        lo.push(x);
        hi.push(lo.top()); lo.pop();                     // balance values
        if (hi.size() > lo.size()) { lo.push(hi.top()); hi.pop(); }
    }
    double findMedian() {
        if (lo.size() > hi.size()) return lo.top();
        return (lo.top() + (double)hi.top()) / 2.0;
    }
};
```

Same idea: sliding window median (LC 480), IPO (LC 502: max-heap of profits unlocked by capital).

## K-way merge

```cpp
// merge k sorted vectors
vector<int> mergeK(vector<vector<int>>& a) {
    using T = array<int,3>;                              // {value, list, idx}
    priority_queue<T, vector<T>, greater<T>> pq;
    for (int i = 0; i < (int)a.size(); i++)
        if (!a[i].empty()) pq.push({a[i][0], i, 0});
    vector<int> out;
    while (!pq.empty()) {
        auto [v, i, j] = pq.top(); pq.pop();
        out.push_back(v);
        if (j + 1 < (int)a[i].size()) pq.push({a[i][j + 1], i, j + 1});
    }
    return out;
}
```

O(N log K) for N total elements across K lists. Same pattern: Kth smallest in sorted matrix (LC 378), smallest range covering K lists (LC 632).

## Scheduling with heaps

- **Meeting Rooms II (LC 253):** sort by start; min-heap of end times; if earliest end ≤ new start, pop. Heap size = rooms.
- **Task Scheduler (LC 621):** max-heap of remaining counts, process in cycles of `n + 1` (or the formula `(maxCnt-1)*(n+1) + countOfMax`).
- **Reorganize String (LC 767):** max-heap by frequency, place the top two different chars each step.
- **Last Stone Weight (LC 1046), Min Cost to Connect Ropes:** always combine the top one or two.

## Standard questions

| Problem | Pattern / key idea | Difficulty |
|---|---|---|
| 1046. Last Stone Weight | max-heap simulation | Easy |
| 703. Kth Largest Element in a Stream | min-heap of size K | Easy |
| 215. Kth Largest Element in an Array | min-heap size K or quickselect | Medium |
| 347. Top K Frequent Elements | count + heap (or bucket sort) | Medium |
| 973. K Closest Points to Origin | max-heap of size K by distance | Medium |
| 621. Task Scheduler | max-heap of counts / formula | Medium |
| 767. Reorganize String | max-heap, place two at a time | Medium |
| 253. Meeting Rooms II | min-heap of end times | Medium |
| 378. Kth Smallest in Sorted Matrix | K-way merge on rows | Medium |
| 23. Merge K Sorted Lists | min-heap of list heads | Hard |
| 295. Find Median from Data Stream | two heaps | Hard |
| 502. IPO | sort by capital + max-heap of profit | Hard |
| 743. Network Delay Time | Dijkstra with min-heap | Medium |

## Checklist

- [ ] I can write max-heap, min-heap and custom-comparator `priority_queue` without looking
- [ ] I can explain sift up/down, array indexing, and why heapify is O(n)
- [ ] I can pick min-heap vs max-heap for a top-K problem and state O(n log K)
- [ ] I can implement median of a stream with two heaps
- [ ] I can merge K sorted lists with a heap and solve Meeting Rooms II
