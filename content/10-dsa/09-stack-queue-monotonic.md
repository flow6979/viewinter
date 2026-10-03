---
title: Stack, Queue & Monotonic
order: 9
time: 20
---

# Stack, Queue & Monotonic

Stack (LIFO) aur queue (FIFO) simple lagte hain, par **monotonic stack** aur **monotonic deque** inse O(n²) "har element ke liye aage/peeche scan" ko O(n) bana dete hain. Saath me linked list ke 3 classic operations (reverse, cycle, merge) bhi yahin dekh lete hain, kyunki ye bhi pointer-handling ke chhote questions hain.

## ⭐ Kab use karein (recognition)

- "Valid parentheses", "nested", "undo", "evaluate expression", "decode string" → **stack**.
- "Next greater/smaller element", "previous smaller", "days until warmer", "stock span" → **monotonic stack**.
- "Largest rectangle in histogram", "maximal rectangle", "sum of subarray minimums" → **monotonic stack** (left/right boundary).
- "Max/min of every window of size k" → **monotonic deque**.
- "Level by level", "shortest steps in grid/graph", "process in arrival order" → **queue / BFS** ([Graphs](13-graphs.md)).
- "Min in O(1) along with push/pop" → stack of pairs (value, current min).

| Problem me phrase | Technique |
|---|---|
| "every opening bracket has a matching closing" | Stack of open brackets |
| "next greater element to the right" | Decreasing stack, scan left → right |
| "how many days until a warmer temperature" | Decreasing stack of indices |
| "largest rectangle in histogram" | Increasing stack, pop gives width |
| "sliding window maximum" | Deque of indices, decreasing values |
| "remove k digits to make smallest number" | Increasing stack, greedy pop |
| "reverse a linked list" | Three pointers prev / cur / next |

## Stack basics: valid parentheses

**Ek line me:** opening bracket push karo; closing aaye to top match hona chahiye; end me stack khaali.

```cpp
#include <bits/stdc++.h>
using namespace std;

bool isValid(const string& s) {
    stack<char> st;
    for (char c : s) {
        if (c == '(' || c == '[' || c == '{') st.push(c);
        else {
            if (st.empty()) return false;              // closing with nothing open
            char o = st.top(); st.pop();
            if ((c == ')' && o != '(') || (c == ']' && o != '[') || (c == '}' && o != '{'))
                return false;
        }
    }
    return st.empty();                                  // leftover opens are invalid
}
```

**Common galti:** `st.top()` empty stack pe call karna (undefined behaviour), aur end me `st.empty()` check bhool jaana ("((" ko valid bol dena).

## ⭐ Monotonic stack: next greater element

**Ek line me:** stack me sirf wo indices rakho jinka answer abhi nahi mila; naya element bada aaya to un sab ka answer wahi hai, pop karo.

> **Example:** a = [2, 1, 5, 3, 6], next greater.
>
> | i | a[i] | pops (answer = a[i]) | stack after (values) |
> |---|---|---|---|
> | 0 | 2 | - | [2] |
> | 1 | 1 | - | [2, 1] |
> | 2 | 5 | 1 → 5, 2 → 5 | [5] |
> | 3 | 3 | - | [5, 3] |
> | 4 | 6 | 3 → 6, 5 → 6 | [6] |
>
> Result: [5, 5, 6, 6, -1].

```cpp
vector<int> nextGreater(const vector<int>& a) {
    int n = a.size();
    vector<int> ans(n, -1);
    stack<int> st;                                      // indices, values decreasing
    for (int i = 0; i < n; i++) {
        while (!st.empty() && a[st.top()] < a[i]) {
            ans[st.top()] = a[i];
            st.pop();
        }
        st.push(i);
    }
    return ans;
}
```

- Complexity: O(n); har index ek baar push, ek baar pop.
- Variants: next **smaller** → condition `>`; **previous** greater → stack top hi answer hai push se pehle; **circular** (LC 503) → `2n` tak loop, index `i % n`.

**Interview tip:** decide karo: (1) next ya previous, (2) greater ya smaller, (3) stack me index rakho (distance/width ke liye zaroori).

**Common galti:** stack me values rakhna jab answer me distance chahiye (Daily Temperatures). Hamesha indices rakho.

## ⭐ Largest rectangle in histogram

**Ek line me:** har bar ke liye left aur right me pehla chhota bar = uski width ki boundary. Increasing stack se pop karte waqt dono boundaries mil jaati hain.

```cpp
// LC 84
int largestRectangleArea(vector<int>& h) {
    h.push_back(0);                                     // sentinel flushes the stack
    stack<int> st;
    int best = 0;
    for (int i = 0; i < (int)h.size(); i++) {
        while (!st.empty() && h[st.top()] >= h[i]) {
            int height = h[st.top()]; st.pop();
            int left = st.empty() ? -1 : st.top();      // previous smaller
            best = max(best, height * (i - left - 1));  // i is next smaller
        }
        st.push(i);
    }
    h.pop_back();
    return best;
}
```

- Maximal Rectangle (LC 85): har row tak heights banao, har row pe ye function chalao.

## ⭐ Monotonic deque: sliding window maximum

**Ek line me:** deque me indices, values decreasing; front = window ka max. Front window se bahar ho to pop_front, naya element bada ho to back se pop.

```cpp
// LC 239
vector<int> maxSlidingWindow(const vector<int>& a, int k) {
    deque<int> dq;                                      // indices, a[] decreasing
    vector<int> res;
    for (int i = 0; i < (int)a.size(); i++) {
        if (!dq.empty() && dq.front() <= i - k) dq.pop_front();  // out of window
        while (!dq.empty() && a[dq.back()] <= a[i]) dq.pop_back(); // useless now
        dq.push_back(i);
        if (i >= k - 1) res.push_back(a[dq.front()]);
    }
    return res;
}
```

- Complexity: O(n). Heap se O(n log n) bhi chalega, par deque expected answer hai.

## Queue aur BFS

- `queue<T>`: push back, pop front. BFS = queue + visited; har level ek "step" ([Graphs](13-graphs.md)).
- Stack se queue (LC 232): do stacks, `out` khaali ho tabhi `in` ko `out` me ulto → amortised O(1).

## Linked list basics

```cpp
struct ListNode { int val; ListNode* next; ListNode(int v) : val(v), next(nullptr) {} };

ListNode* reverseList(ListNode* head) {               // LC 206
    ListNode *prev = nullptr, *cur = head;
    while (cur) {
        ListNode* nxt = cur->next;
        cur->next = prev;
        prev = cur;
        cur = nxt;
    }
    return prev;
}

ListNode* mergeTwo(ListNode* a, ListNode* b) {        // LC 21
    ListNode dummy(0), *t = &dummy;                     // dummy avoids head special case
    while (a && b) {
        if (a->val <= b->val) { t->next = a; a = a->next; }
        else { t->next = b; b = b->next; }
        t = t->next;
    }
    t->next = a ? a : b;
    return dummy.next;
}
```

- Cycle detect: Floyd fast/slow ([Two Pointers](06-two-pointers-sliding-window.md)). K-th from end: fast ko k aage bhejo.

## Standard questions

| Problem | Pattern / key idea | Difficulty |
|---|---|---|
| Valid Parentheses (LC 20) | Stack of opens | Easy |
| Min Stack (LC 155) | Stack of (val, min) | Medium |
| Evaluate Reverse Polish Notation (LC 150) | Stack of operands | Medium |
| Decode String (LC 394) | Stack of (count, string) | Medium |
| Implement Queue using Stacks (LC 232) | Two stacks, lazy transfer | Easy |
| Next Greater Element II (LC 503) | Monotonic stack, circular 2n | Medium |
| Daily Temperatures (LC 739) | Decreasing stack of indices | Medium |
| Online Stock Span (LC 901) | Stack of (price, span) | Medium |
| Largest Rectangle in Histogram (LC 84) | Increasing stack + sentinel | Hard |
| Sum of Subarray Minimums (LC 907) | Prev/next smaller, contribution | Medium |
| Remove K Digits (LC 402) | Increasing stack, greedy pop | Medium |
| Sliding Window Maximum (LC 239) | Monotonic deque | Hard |
| Reverse Linked List (LC 206) | prev / cur / next | Easy |
| Merge Two Sorted Lists (LC 21) | Dummy node | Easy |
| Linked List Cycle (LC 141) | Floyd fast/slow | Easy |

## Checklist

- [ ] "Next/previous greater/smaller" dekh ke monotonic stack pehchaan sakta hoon
- [ ] Next greater aur Daily Temperatures indices ke saath likh sakta hoon
- [ ] Histogram me width `i - left - 1` kyun hai samjha sakta hoon
- [ ] Sliding window max deque se O(n) me likh sakta hoon
- [ ] Linked list reverse aur merge (dummy node) bina dekhe likh sakta hoon
