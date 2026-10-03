**Ek line:** Array question me pehle socho: hash map (O(1) lookup), prefix sum (O(1) range sum), ya Kadane (max subarray); brute O(n²) ko O(n) banao.

- **Two Sum:** `unordered_map` value → index; check pehle, insert baad me.
- **Frequency:** chhota alphabet ho to `int cnt[26]`, map se fast.
- **Prefix sum:** `pre[i+1] = pre[i] + a[i]`, `sum(l..r) = pre[r+1] - pre[l]`.
- **Subarray sum = K:** prefix + hash map of counts, `freq[0] = 1` se start; negatives ke saath bhi chalta hai.
- **Divisible by K:** `((cur % k) + k) % k` store karo.
- **Longest with sum K:** prefix ka pehla index store karo, count nahi.
- **Difference array:** `d[l] += v; d[r+1] -= v;` phir prefix; range updates O(1).
- **Kadane:** `cur = max(x, cur + x)`; `best = a[0]` se start (all-negative case).
- **Longest consecutive:** set, sirf jahan `x-1` nahi hai wahan se count.
- **Overflow:** sums 1e9 × 1e5 → `long long`.

**Interview me bolo:** "Negatives ho sakte hain to window nahi chalega; main prefix sum + hash map lunga, O(n) time, O(n) space."

**Galti mat karna:** `map[x]` se existence check (key insert ho jaati hai) aur `freq[0] = 1` bhoolna.
