**Ek line:** C++ coding round ke zyaada bugs overflow, slow I/O aur galti se hui copies hain, algorithm nahi.

- **Ranges:** `int` ~±2.1e9, `long long` ~±9.2e18. 1e9 tak ki values ka sum/product `long long` me.
- **Cast pehle:** `1LL * a * b`, `long long c = a * b;` nahi (overflow pehle ho jaata hai).
- **Modulo:** har multiply ke baad `1LL * a * b % MOD`; `MOD = 1e9 + 7`.
- **Fast I/O:** `ios::sync_with_stdio(false); cin.tie(nullptr);` aur `endl` ki jagah `"\n"`.
- **Input patterns:** `int T; while (T--)`, EOF ke liye `while (cin >> x)`, `getline` se pehle `cin.ignore()`.
- **Badi cheezein `const &` se:** by value har call pe O(n) copy, recursion me jaanleva.
- **Reference vs pointer:** reference alias hai, null nahi ho sakta; pointer address rakhta hai, null ho sakta hai.
- **Range-for:** modify ke liye `auto &`, bade objects padhne ke liye `const auto &`.
- **Lambdas:** `[&]` reference capture; recursive lambda ke liye `function<>`.
- **Unsigned trap:** empty vector pe `v.size() - 1` bahut bada number; `int` me cast karo.
- **Bade arrays:** global ya `vector`, `main` ke andar `int a[1e6]` kabhi nahi.

**Interview me bolo:** "Values 1e9 tak hain aur main n values sum kar raha hoon, isliye long long lunga."

**Galti mat karna:** loops me `endl`, sums/products ke liye `int`, aur DFS me vectors by value pass karna.
