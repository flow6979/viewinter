**In one line:** For array questions first think: hash map (O(1) lookup), prefix sum (O(1) range sum), or Kadane (max subarray); turn the O(n²) brute force into O(n).

- **Two Sum:** `unordered_map` value → index; check first, insert after.
- **Frequency:** for a small alphabet use `int cnt[26]`, faster than a map.
- **Prefix sum:** `pre[i+1] = pre[i] + a[i]`, `sum(l..r) = pre[r+1] - pre[l]`.
- **Subarray sum = K:** prefix + hash map of counts, start with `freq[0] = 1`; works with negatives.
- **Divisible by K:** store `((cur % k) + k) % k`.
- **Longest with sum K:** store the first index of each prefix, not a count.
- **Difference array:** `d[l] += v; d[r+1] -= v;` then prefix; range updates in O(1).
- **Kadane:** `cur = max(x, cur + x)`; start with `best = a[0]` (all-negative case).
- **Longest consecutive:** set, count only from x where `x-1` is absent.
- **Overflow:** sums of 1e9 × 1e5 → `long long`.

**Say in the interview:** "Since there can be negatives a window will not work; I will use prefix sum + hash map, O(n) time, O(n) space."

**Avoid:** Checking existence with `map[x]` (it inserts the key) and forgetting `freq[0] = 1`.
