**In one line:** Greedy = the local best at every step, usually sort + one pass; justify it with an exchange argument, and if you find a counter-example use DP.

- **Max non-overlapping:** sort by end, take the earliest finishing.
- **Merge:** sort by start, `back.end = max(back.end, cur.end)`.
- **Min removals:** n - max non-overlapping (LC 435).
- **Meeting rooms:** sort starts and ends separately and sweep, or a min-heap of end times.
- **Arrows / balloons:** sort by end, count groups.
- **Jump Game:** track the farthest reach; `i > reach` → false.
- **Gas Station:** total < 0 → -1; tank < 0 → start = i + 1.
- **Heap greedy:** connect ropes / Huffman, combine the two smallest.
- **Exchange argument:** swap the optimal's first choice for the greedy one; it does not get worse.
- **Greedy fails:** coins {1,3,4}, amount 6 → greedy 3 coins, optimal 2 → DP.

**Say in the interview:** "I sort by end time because the meeting that finishes first leaves the most room for the rest."

**Avoid:** Sorting by start for activity selection, and not asking how touching intervals ([1,2],[2,3]) are treated.
