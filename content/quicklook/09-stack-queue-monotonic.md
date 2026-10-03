**Ek line:** Matching/nesting → stack; next/previous greater/smaller → monotonic stack; window max/min → monotonic deque; sab O(n).

- **Valid parentheses:** opens push, close pe top match, end me stack empty.
- **Next greater:** decreasing stack of indices; bada aaye to pop karke answer set.
- **Variants:** smaller → condition ulta; previous → push se pehle top; circular → `2n`, `i % n`.
- **Indices rakho:** distance/width (Daily Temperatures) ke liye zaroori.
- **Histogram:** increasing stack + 0 sentinel; width = `i - left - 1`.
- **Sliding window max:** deque front = max; out-of-window front pop, chhote back pop.
- **Min Stack:** (value, current min) pairs.
- **Queue via stacks:** `out` khaali ho tabhi transfer, amortised O(1).
- **Reverse list:** prev / cur / next.
- **Merge lists:** dummy node, head special case khatam.

**Interview me bolo:** "Har index stack me ek baar push aur ek baar pop hota hai, isliye while loop ke bawajood O(n)."

**Galti mat karna:** Empty stack pe `top()` call karna, aur stack me values rakhna jab answer me distance chahiye.
