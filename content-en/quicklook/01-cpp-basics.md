**In one line:** most C++ coding-round bugs are overflow, slow I/O and accidental copies, not the algorithm.

- **Ranges:** `int` ~±2.1e9, `long long` ~±9.2e18. Sums/products of values up to 1e9 need `long long`.
- **Cast early:** `1LL * a * b`, not `long long c = a * b;` (overflow happens first).
- **Modulo:** `1LL * a * b % MOD` after every multiply; `MOD = 1e9 + 7`.
- **Fast I/O:** `ios::sync_with_stdio(false); cin.tie(nullptr);` and `"\n"` instead of `endl`.
- **Input patterns:** `int T; while (T--)`, `while (cin >> x)` for EOF, `cin.ignore()` before `getline`.
- **Pass big things by `const &`:** by value copies O(n) every call, deadly in recursion.
- **Reference vs pointer:** reference is an alias that can't be null; pointer holds an address and can be null.
- **Range-for:** `auto &` to modify, `const auto &` to read big objects without copying.
- **Lambdas:** `[&]` capture by reference; recursive lambdas need `function<>`.
- **Unsigned trap:** `v.size() - 1` on empty vector wraps to a huge number; cast to `int`.
- **Big arrays:** global or `vector`, never `int a[1e6]` inside `main`.

**Say in the interview:** "Values go up to 1e9 and I'm summing n of them, so I'll use long long."

**Avoid:** `endl` in loops, `int` for sums/products, and passing vectors by value into DFS.
