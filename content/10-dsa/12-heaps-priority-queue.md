---
title: Heaps & Priority Queue
order: 12
time: 15
---

# Heaps & Priority Queue

Heap tumhe min (ya max) element O(1) me deta hai aur insert/remove O(log n) me. Jab bhi problem baar baar poochti hai "abhi sabse chhota/bada kaun hai?" aur elements aate rehte hain, answer heap hai. C++ me ye `priority_queue` hai, aur comparator syntax wahi jagah hai jahan zyada candidates galti karte hain.

## ⭐ Kab use karein (recognition)

- **"Top K", "K largest / smallest", "K most frequent", "K closest"** → size K ka heap.
- **"Merge K sorted lists / arrays"** → har list ke current head ka min-heap.
- **"Median of a stream", "running median"** → do heaps.
- **"Hamesha agla sabse sasta / jaldi / bada uthao"** (badalte candidates ke saath greedy) → heap: task scheduling, meeting rooms, connect ropes.
- **Weights ke saath shortest path** → [Dijkstra](13-graphs.md) min-heap use karta hai.
- Agar K-th element sirf ek baar chahiye aur array modify kar sakte ho → quickselect O(n) average alternative hai; agar data static hai aur poora sorted chahiye → seedha sort karo.

| Problem phrase | Heap setup | Cost |
|---|---|---|
| K largest | size K ka **min**-heap (smallest pop) | O(n log K) |
| K smallest / K closest | size K ka **max**-heap | O(n log K) |
| merge K sorted | (value, list, index) ka min-heap | O(N log K) |
| median of stream | max-heap (low half) + min-heap (high half) | O(log n) per add |
| min meeting rooms | start se sort + end times ka min-heap | O(n log n) |

## ⭐ priority_queue syntax (max, min, custom)

**Ek line me:** `priority_queue<T>` **max**-heap hai; min-heap ke liye `greater<T>` do; custom comparator `true` return karta hai jab `a` ko `b` ke **baad** aana chahiye.

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

- `push`, `pop`: O(log n). `top`: O(1). Vector se banana: range constructor se O(n).
- Decrease-key aur arbitrary delete nahi hai: naya entry push karo aur pop pe stale wale skip karo (lazy deletion).
- Trick: ints ke min-heap ke liye max-heap me `-x` bhi push kar sakte ho.

**Interview tip:** likhne se pehle bolo "default max-heap, `greater` ise ulta karta hai"; interviewers ye dekhte hain.

**Common galti:** custom comparator me `a < b` likh ke min-heap expect karna. `priority_queue` me `<` se max-heap banta hai.

## Heap property (andar kaise kaam karta hai)

- Complete binary tree array me stored: `i` ke children `2i+1`, `2i+2`; parent `(i-1)/2`.
- Max-heap property: har parent ≥ apne children (isliye root max hai). Siblings ke beech sorted nahi.
- Insert = append + **sift up**; pop = last ko root pe + **sift down**. Dono O(log n).
- Poore array ko bottom-up heapify = O(n), O(n log n) nahi. Heap sort = O(n log n), in place, stable nahi.

## ⭐ Top-K pattern

> **Example:** `[3, 1, 5, 12, 2]` ke 2 largest, size 2 ke min-heap se: push 3 → {3}; push 1 → {1,3}; push 5 → {1,3,5} pop 1 → {3,5}; push 12 → pop 3 → {5,12}; push 2 → pop 2 → {5,12}. Answer: heap ka top = 5, yahi 2nd largest hai.

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

- O(n log K) time, O(K) space. Sort se behtar jab K ≪ n ho ya data stream ho.
- K most frequent (LC 347): `unordered_map` se count, phir `(freq, value)` ka size-K min-heap; bucket sort O(n) deta hai.

**Common galti:** saare n elements ka max-heap bana ke K baar pop karna: chalta hai, par O(n) memory aur "stream" follow-up miss ho jaata hai.

## ⭐ Two heaps: median of a stream

**Ek line me:** chhota half max-heap `lo` me aur bada half min-heap `hi` me rakho, sizes me fark zyada se zyada 1.

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

Same idea: sliding window median (LC 480), IPO (LC 502: capital se unlock hue profits ka max-heap).

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

K lists me total N elements ke liye O(N log K). Same pattern: sorted matrix me kth smallest (LC 378), K lists ko cover karne wali smallest range (LC 632).

## Heaps ke saath scheduling

- **Meeting Rooms II (LC 253):** start se sort; end times ka min-heap; agar earliest end ≤ naya start, to pop. Heap size = rooms.
- **Task Scheduler (LC 621):** remaining counts ka max-heap, `n + 1` ke cycles me process (ya formula `(maxCnt-1)*(n+1) + countOfMax`).
- **Reorganize String (LC 767):** frequency ka max-heap, har step pe top do alag chars rakho.
- **Last Stone Weight (LC 1046), Min Cost to Connect Ropes:** hamesha top ek ya do ko combine karo.

## Standard questions

| Problem | Pattern / key idea | Difficulty |
|---|---|---|
| 1046. Last Stone Weight | max-heap simulation | Easy |
| 703. Kth Largest Element in a Stream | size K ka min-heap | Easy |
| 215. Kth Largest Element in an Array | size K min-heap ya quickselect | Medium |
| 347. Top K Frequent Elements | count + heap (ya bucket sort) | Medium |
| 973. K Closest Points to Origin | distance se size K max-heap | Medium |
| 621. Task Scheduler | counts ka max-heap / formula | Medium |
| 767. Reorganize String | max-heap, ek baar me do rakho | Medium |
| 253. Meeting Rooms II | end times ka min-heap | Medium |
| 378. Kth Smallest in Sorted Matrix | rows pe K-way merge | Medium |
| 23. Merge K Sorted Lists | list heads ka min-heap | Hard |
| 295. Find Median from Data Stream | do heaps | Hard |
| 502. IPO | capital se sort + profit ka max-heap | Hard |
| 743. Network Delay Time | min-heap ke saath Dijkstra | Medium |

## Checklist

- [ ] Max-heap, min-heap aur custom-comparator `priority_queue` bina dekhe likh sakta hoon
- [ ] Sift up/down, array indexing, aur heapify O(n) kyun hai samjha sakta hoon
- [ ] Top-K problem ke liye min-heap vs max-heap chun sakta hoon aur O(n log K) bata sakta hoon
- [ ] Do heaps se median of a stream implement kar sakta hoon
- [ ] Heap se K sorted lists merge kar sakta hoon aur Meeting Rooms II solve kar sakta hoon
