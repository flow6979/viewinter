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

```text
s = "{[()]}"

read '{'      read '['      read '('      read ')'      read ']'      read '}'
                            |  (  |
              |  [  |       |  [  |       |  [  |
|  {  |       |  {  |       |  {  |       |  {  |       |  {  |
+-----+       +-----+       +-----+       +-----+       +-----+       +-----+
push          push          push          pop '('       pop '['       pop '{'

end: stack empty -> valid
```

*Upar: har closing bracket top se match hota hai; end me stack khaali to valid.*

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

```text
a = [2, 1, 5, 3, 6], stack holds values (indices in code)

i=1 (a=1)       i=2 (a=5)                                       i=3 (a=3)       i=4 (a=6)
|  1  |                                                         |  3  |
|  2  |         |  2  |                         |  5  |         |  5  |         |  6  |
+-----+         +-----+         +-----+         +-----+         +-----+         +-----+
push 1          pop 1: ans=5    pop 2: ans=5    push 5          push 3          pop 3,5; push 6
```

*Upar: stack values hamesha decreasing; bada element aate hi chhote wale pop hote hain aur unka answer milta hai.*

```mermaid
flowchart LR
    A["2"] -->|"next greater"| C["5"]
    B["1"] --> C
    D["3"] --> E["6"]
    C --> E
    E --> N["-1"]
    classDef hot fill:#ffffff,stroke:#ffffff,color:#000000,font-weight:bold
    classDef dim fill:none,stroke-dasharray:4 3,opacity:0.6
    class C,E hot
    class N dim
```

*Upar: har element ka arrow uske next greater pe; 6 ka koi nahi, isliye -1.*

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

```text
h = [2, 1, 5, 6, 2, 3]

          #
       X  X
       X  X
       X  X     #
 #     X  X  #  #
 #  #  X  X  #  #
 2  1  5  6  2  3     <- height
 0  1  2  3  4  5     <- index

At i=4 (h=2), stack = [1, 2, 3] (heights 1, 5, 6):
  pop 3 (h=6): left = 2, width = 4 - 2 - 1 = 1, area 6
  pop 2 (h=5): left = 1, width = 4 - 1 - 1 = 2, area 10  <- best (X)
  h[1]=1 < 2, stop, push 4
```

*Upar: pop ke time bar ki height fix hai; current i right boundary, naya stack top left boundary.*

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

```text
a = [1, 3, -1, -3, 5, 3, 6, 7], k = 3      deque shows values, front on the left

i   a[i]   action                          deque          max
0   1      push                            [1]            -
1   3      pop back 1                      [3]            -
2   -1     push                            [3, -1]        3
3   -3     push                            [3, -1, -3]    3
4   5      pop front 3 (old), pop -3, -1   [5]            5
5   3      push                            [5, 3]         5
6   6      pop back 3, 5                   [6]            6
7   7      pop back 6                      [7]            7
```

*Upar: deque decreasing rehta hai: front hamesha window ka max, bekaar elements back se nikal jaate hain.*

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

```text
op        in (top ->)    out (top ->)    returns
push 1    [1]            []
push 2    [1, 2]         []
push 3    [1, 2, 3]      []
pop       []             [3, 2, 1]       out was empty: move all, pop -> 1
pop       []             [3, 2]          pop -> 2
push 4    [4]            [3]
pop       [4]            []              pop -> 3 (out still had one)
```

*Upar: do stacks se queue: `in` ko `out` me tabhi ulto jab `out` khaali ho, isliye amortised O(1).*

- `queue<T>`: push back, pop front. BFS = queue + visited; har level ek "step" ([Graphs](13-graphs.md)).
- Stack se queue (LC 232): do stacks, `out` khaali ho tabhi `in` ko `out` me ulto → amortised O(1).

## Linked list basics

```mermaid
flowchart LR
    P["prev = null"]
    A["1"] --> B["2"] --> C["3"] --> N["null"]
    H["cur = head"] -.-> A
    classDef hot fill:#ffffff,stroke:#ffffff,color:#000000,font-weight:bold
    classDef dim fill:none,stroke-dasharray:4 3,opacity:0.6
    class A hot
```

*Upar: reverse se pehle: prev null, cur head pe.*

```mermaid
flowchart LR
    B["2"] --> A["1"] --> N0["null"]
    C["3"] --> N1["null"]
    P["prev"] -.-> B
    Q["cur"] -.-> C
    classDef hot fill:#ffffff,stroke:#ffffff,color:#000000,font-weight:bold
    classDef dim fill:none,stroke-dasharray:4 3,opacity:0.6
    class B,C hot
```

*Upar: do iterations ke baad: 1 aur 2 ulte ho gaye, 3 abhi baaki; `nxt` save na karte to 3 kho jaata.*

```mermaid
flowchart LR
    C["3"] --> B["2"] --> A["1"] --> N["null"]
    H["return prev"] -.-> C
    classDef hot fill:#ffffff,stroke:#ffffff,color:#000000,font-weight:bold
    classDef dim fill:none,stroke-dasharray:4 3,opacity:0.6
    class C hot
```

*Upar: reverse ke baad: cur null pe, prev naya head.*

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

```text
a:  1 -> 3 -> 5
b:  2 -> 4

dummy -> 1 -> 2 -> 3 -> 4 -> 5
         a    b    a    b    a (rest of a attached)
```

*Upar: merge: har step chhota node `t->next` pe lagao; dummy head ka special case hata deta hai.*

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
