---
title: Two Pointers & Sliding Window
order: 6
time: 20
---

# Two Pointers & Sliding Window

Two pointers and sliding window turn an O(n²) "check every pair / every subarray" into O(n). The idea is simple: two indices move in the same direction (window) or towards each other (two ends), and no pointer ever moves back. So the total work is O(n). This is the most common medium pattern in interviews.

## ⭐ When to use it

- **Sorted array** + "pair/triplet with sum X", "remove duplicates in-place", "palindrome" → **opposite-ends two pointers**.
- "Contiguous subarray/substring" + "longest/shortest/count with condition" → **sliding window**.
- "Window of size k" given → **fixed window**.
- "At most K distinct", "without repeating", "sum ≥ target" (positives) → **variable window**.
- "Exactly K" → `atMost(K) - atMost(K-1)`.
- Linked list "cycle", "middle", "k-th from end" → **fast/slow pointers**.
- Negatives + "sum = K" → a window will not work, use [prefix sum + hash map](05-arrays-hashing-prefix.md).

| Phrase in the problem | Technique |
|---|---|
| "sorted", "two numbers sum to target" | Opposite ends: l++ / r-- |
| "longest substring without repeating characters" | Variable window + last-seen map |
| "max sum of subarray of size k" | Fixed window |
| "minimum window containing all chars of t" | Variable window, shrink while valid |
| "subarrays with exactly K distinct" | atMost(K) - atMost(K-1) |
| "container with most water" | Opposite ends, move the shorter side |
| "detect cycle in linked list" | Fast/slow (Floyd) |

```mermaid
flowchart TD
    A["Contiguous subarray or substring?"] -->|"No"| B["Sorted array, pair or triplet?"]
    B -->|"Yes"| C["Opposite-ends two pointers"]
    B -->|"Linked list cycle or middle"| D["Fast and slow pointers"]
    A -->|"Yes"| E["Window size fixed k?"]
    E -->|"Yes"| F["Fixed sliding window"]
    E -->|"No"| G["Window validity monotonic? e.g. no negatives"]
    G -->|"Yes"| H["Variable window, shrink while invalid"]
    G -->|"No"| I["Prefix sum + hash map"]
```

## ⭐ Opposite-ends two pointers

**In one line:** in a sorted array start with `l = 0, r = n-1`; if the sum is too small `l++`, too big `r--`. Each step permanently rules out one option.

> **Example:** [1, 2, 4, 7, 11], target 9. (1+11=12 > 9) r--. (1+7=8 < 9) l++. (2+7=9) found.

```cpp
#include <bits/stdc++.h>
using namespace std;

// LC 15: 3Sum -> sort, fix i, two pointers on the rest
vector<vector<int>> threeSum(vector<int>& a) {
    sort(a.begin(), a.end());
    vector<vector<int>> res;
    int n = a.size();
    for (int i = 0; i < n - 2; i++) {
        if (i > 0 && a[i] == a[i - 1]) continue;        // skip duplicate i
        int l = i + 1, r = n - 1;
        while (l < r) {
            int s = a[i] + a[l] + a[r];
            if (s < 0) l++;
            else if (s > 0) r--;
            else {
                res.push_back({a[i], a[l], a[r]});
                while (l < r && a[l] == a[l + 1]) l++;  // skip duplicates
                while (l < r && a[r] == a[r - 1]) r--;
                l++; r--;
            }
        }
    }
    return res;
}
```

- Complexity: O(n²) for 3Sum (sort O(n log n) + n × O(n)); sorted 2Sum O(n).

**Interview tip:** in Container With Most Water, explain why you move the shorter side: moving the taller side shrinks the width while the height stays capped by the shorter side, so the area can never grow.

**Common mistake:** not skipping duplicates, so 3Sum returns the same triplet several times.

## ⭐ Sliding window (fixed and variable)

**In one line:** grow the window with `r`, shrink it with `l` while it is invalid, and update the answer at every valid state.

> **Example:** "abcabcbb", longest without repeat.
>
> | r | char | action | window | best |
> |---|---|---|---|---|
> | 0–2 | a b c | add | "abc" | 3 |
> | 3 | a | 'a' repeats, l → 1 | "bca" | 3 |
> | 4 | b | l → 2 | "cab" | 3 |
> | 7 | b | l → 7 | "b" | 3 |

```cpp
// Fixed window: max sum of any subarray of size k
long long maxSumK(const vector<int>& a, int k) {
    long long cur = 0, best = LLONG_MIN;
    for (int r = 0; r < (int)a.size(); r++) {
        cur += a[r];
        if (r >= k) cur -= a[r - k];                    // drop element leaving window
        if (r >= k - 1) best = max(best, cur);
    }
    return best;
}

// Variable window template: LC 3 longest substring without repeating chars
int lengthOfLongestSubstring(const string& s) {
    vector<int> cnt(256, 0);
    int l = 0, best = 0;
    for (int r = 0; r < (int)s.size(); r++) {
        cnt[(unsigned char)s[r]]++;                     // 1. expand
        while (cnt[(unsigned char)s[r]] > 1)            // 2. shrink while invalid
            cnt[(unsigned char)s[l++]]--;
        best = max(best, r - l + 1);                    // 3. update answer
    }
    return best;
}
```

- Complexity: O(n) time (each element enters once and leaves once), O(alphabet) space.

**Interview tip:** say the 3 template steps (expand, shrink while invalid, update) as you write. For "longest", update **after** shrinking; for "shortest" (Min Window Substring, Min Size Subarray Sum), update **inside** the shrink loop.

**Common mistake:** using a sum window on an array with negatives. A window only works when validity is monotonic: growing the window can only increase the sum.

## At-most-K trick (exactly K)

**In one line:** counting "exactly K" directly with a window is hard; use `exactly(K) = atMost(K) - atMost(K-1)`. In `atMost`, each r adds `r - l + 1` subarrays.

```cpp
// LC 992: subarrays with exactly k distinct integers
int atMost(vector<int>& a, int k) {
    unordered_map<int, int> cnt;
    int l = 0, res = 0;
    for (int r = 0; r < (int)a.size(); r++) {
        if (cnt[a[r]]++ == 0) k--;
        while (k < 0)
            if (--cnt[a[l++]] == 0) k++;
        res += r - l + 1;                               // all subarrays ending at r
    }
    return res;
}
int subarraysWithKDistinct(vector<int>& a, int k) {
    return atMost(a, k) - atMost(a, k - 1);
}
```

- Same trick: Binary Subarrays With Sum (LC 930), Count Nice Subarrays (LC 1248).

## Fast/slow pointers

**In one line:** slow moves 1 step, fast moves 2. If there is a cycle they meet; when fast reaches the end, slow is at the middle.

```cpp
struct ListNode { int val; ListNode* next; };

bool hasCycle(ListNode* head) {
    ListNode *slow = head, *fast = head;
    while (fast && fast->next) {
        slow = slow->next;
        fast = fast->next->next;
        if (slow == fast) return true;
    }
    return false;
}
```

- Cycle start (LC 142): after they meet, put one pointer back at head and move both 1 step at a time; where they meet is the start.
- Works on arrays too: Find the Duplicate Number (LC 287), Happy Number (LC 202). Linked list details: [Stack, Queue & Monotonic](09-stack-queue-monotonic.md).

## Standard questions

| Problem | Pattern / key idea | Difficulty |
|---|---|---|
| Valid Palindrome (LC 125) | Opposite ends, skip non-alnum | Easy |
| Two Sum II (LC 167) | Sorted, opposite ends | Medium |
| 3Sum (LC 15) | Sort + fix one + two pointers | Medium |
| Container With Most Water (LC 11) | Move the shorter side | Medium |
| Trapping Rain Water (LC 42) | Two pointers with leftMax/rightMax | Hard |
| Remove Duplicates from Sorted Array (LC 26) | Slow writer, fast reader | Easy |
| Best Time to Buy and Sell Stock (LC 121) | Running min (window of 2 ends) | Easy |
| Longest Substring Without Repeating (LC 3) | Variable window | Medium |
| Longest Repeating Character Replacement (LC 424) | Window valid if len - maxFreq ≤ k | Medium |
| Permutation in String (LC 567) | Fixed window + count match | Medium |
| Minimum Size Subarray Sum (LC 209) | Shortest window, update inside shrink | Medium |
| Minimum Window Substring (LC 76) | Variable window + need counter | Hard |
| Sliding Window Maximum (LC 239) | Fixed window + monotonic deque | Hard |
| Subarrays with K Different Integers (LC 992) | atMost(K) - atMost(K-1) | Hard |
| Linked List Cycle II (LC 142) | Floyd fast/slow | Medium |

## Checklist

- [ ] I can spot "sorted + pair" vs "contiguous + condition" and pick the right pointer pattern
- [ ] I can write 3Sum with duplicate skipping
- [ ] I can write the variable window template (expand, shrink while invalid, update) without looking
- [ ] I can explain why a window fails with negatives
- [ ] I can solve exactly K with atMost(K) - atMost(K-1)
- [ ] I can do Floyd cycle detection and find the cycle start
