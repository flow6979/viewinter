**In one line:** Matching/nesting → stack; next/previous greater/smaller → monotonic stack; window max/min → monotonic deque; all O(n).

- **Valid parentheses:** push opens, on close the top must match, stack empty at the end.
- **Next greater:** decreasing stack of indices; when a bigger one arrives, pop and set answers.
- **Variants:** smaller → flip the condition; previous → top before pushing; circular → `2n`, `i % n`.
- **Store indices:** needed for distance/width (Daily Temperatures).
- **Histogram:** increasing stack + 0 sentinel; width = `i - left - 1`.
- **Sliding window max:** deque front = max; pop stale front, pop smaller from back.
- **Min Stack:** (value, current min) pairs.
- **Queue via stacks:** transfer only when `out` is empty, amortised O(1).
- **Reverse list:** prev / cur / next.
- **Merge lists:** dummy node removes the head special case.

**Say in the interview:** "Each index is pushed once and popped once, so despite the while loop it is O(n)."

**Avoid:** Calling `top()` on an empty stack, and storing values in the stack when the answer needs a distance.
