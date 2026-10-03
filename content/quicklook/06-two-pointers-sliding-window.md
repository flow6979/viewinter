**Ek line:** Sorted + pair → opposite-ends pointers; contiguous + condition → sliding window; koi pointer peeche nahi jaata, isliye O(n).

- **Opposite ends:** sum chhota → `l++`, bada → `r--` (sorted array).
- **3Sum:** sort, ek fix, baaki pe two pointers, duplicates skip; O(n²).
- **Container water:** chhoti height wali side move karo.
- **Fixed window:** add `a[r]`, `r >= k` pe `a[r-k]` hatao.
- **Variable window:** expand → shrink while invalid → update.
- **Longest vs shortest:** longest me update shrink ke baad, shortest me shrink loop ke andar.
- **Exactly K:** `atMost(K) - atMost(K-1)`; atMost me `res += r - l + 1`.
- **Negatives + sum = K:** window fail, prefix + hash map lo.
- **Fast/slow:** cycle detect, middle node, find duplicate (LC 287).
- **Cycle start:** milne ke baad ek pointer head pe, dono 1-1 step.

**Interview me bolo:** "Har element window me ek baar aata aur ek baar jaata hai, to nested while ke bawajood total O(n) hai."

**Galti mat karna:** Negative numbers wale array pe sum-window lagana, aur 3Sum me duplicate triplets na hatana.
