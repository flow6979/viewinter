**Ek line:** Greedy = har step ka local best, aksar sort + ek pass; exchange argument se justify karo, counter-example mile to DP.

- **Max non-overlapping:** end se sort, earliest finishing lo.
- **Merge:** start se sort, `back.end = max(back.end, cur.end)`.
- **Min removals:** n - max non-overlapping (LC 435).
- **Meeting rooms:** starts aur ends alag sort karke sweep, ya end times ka min-heap.
- **Arrows / balloons:** end se sort, groups count karo.
- **Jump Game:** farthest reach track karo; `i > reach` → false.
- **Gas Station:** total < 0 → -1; tank < 0 → start = i + 1.
- **Heap greedy:** connect ropes / Huffman, do sabse chhote jodo.
- **Exchange argument:** optimal ki pehli choice ko greedy choice se swap karo, kharab nahi hota.
- **Greedy fail:** coins {1,3,4}, amount 6 → greedy 3 coins, optimal 2 → DP.

**Interview me bolo:** "End time se sort karta hoon kyunki jo meeting pehle khatam hoti hai wo baaki ke liye sabse zyada jagah chhodti hai."

**Galti mat karna:** Activity selection me start se sort karna, aur touching intervals ([1,2],[2,3]) ka rule na poochhna.
