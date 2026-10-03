---
title: STL Containers and Algorithms
order: 3
time: 25
---

# STL Containers and Algorithms

Coding rounds me C++ fast likhne ki wajah STL hai: heap, balanced BST aur hash map sab ek-ek line ke hain. Interviewer expect karta hai ki tum sahi container chuno, uski complexity jaano, aur classic traps (iterator invalidation, unsigned `size()`, hacked `unordered_map`) se bacho.

## ⭐ Kab use karein (kaunsa container kab)

| Chahiye | Use karo | Key ops cost |
|---|---|---|
| Dynamic array, index access | `vector` | push_back O(1)*, [] O(1) |
| Fixed size, compile time pe pata | `array<int, N>` | [] O(1) |
| LIFO (undo, parentheses, DFS) | `stack` | push/pop/top O(1) |
| FIFO (BFS) | `queue` | push/pop/front O(1) |
| Dono ends pe push/pop (sliding window max, 0-1 BFS) | `deque` | dono ends O(1) |
| Baar baar min/max, top K, Dijkstra | `priority_queue` | push/pop O(log n), top O(1) |
| Sorted unique keys, floor/ceil queries | `set` | insert/erase/find O(log n) |
| Sorted with duplicates | `multiset` | O(log n) |
| Key → value, ordered / range queries | `map` | O(log n) |
| Key → value, sirf lookups (counting) | `unordered_map` | O(1) avg, O(n) worst |
| Sirf membership test | `unordered_set` | O(1) avg |
| Fixed-size bit flags, fast AND/OR | `bitset<N>` | O(N/64) per op |

\* amortised.

- **"x se bada ya barabar sabse chhota element"** chahiye → `set`/`map` ka `lower_bound`, `unordered_*` nahi.
- Sirf **frequencies count** karni hain → `unordered_map<int,int>` (ya keys chhoti hon, jaise 26 letters, to `vector<int>`).

## ⭐ Core containers ek snippet me

**Ek line me:** wo 10–12 calls seekh lo jo roz use honge; baaki dekh lena.

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    vector<int> v = {5, 2, 8};
    v.push_back(1); v.pop_back(); v.back();          // 8
    vector<vector<int>> grid(3, vector<int>(4, 0));  // 3x4 zeros

    string s = "hello";
    s += '!'; s.substr(1, 3);                        // "ell"
    s.find("ll");                                    // 2, or string::npos

    pair<int,string> p = {1, "a"};
    auto [id, name] = p;                             // C++17
    tuple<int,int,int> t = {1, 2, 3};
    int z = get<2>(t);                               // 3

    stack<int> st; st.push(1); st.top(); st.pop();
    queue<int> q;  q.push(1);  q.front(); q.pop();
    deque<int> dq; dq.push_front(1); dq.push_back(2); dq.pop_front();

    set<int> se = {4, 1, 7};
    auto it = se.lower_bound(5);                     // points to 7
    se.erase(1); se.count(4);                        // 1

    map<string,int> m; m["apple"]++;                 // creates key with 0, then ++
    for (auto &[k, val] : m) cout << k << val;       // sorted by key

    unordered_map<int,int> freq; freq[3]++;
    bitset<8> b(5);                                  // 00000101
    cout << b.count() << z << id << name << *it;     // 2 set bits
}
```

## priority_queue: max-heap vs min-heap

**Ek line me:** default `priority_queue<int>` **max**-heap hai; min-heap ke liye `greater<int>` pass karo.

```cpp
void heaps() {
    priority_queue<int> maxh;                              // top = largest
    priority_queue<int, vector<int>, greater<int>> minh;   // top = smallest
    for (int x : {5, 1, 9}) { maxh.push(x); minh.push(x); }
    cout << maxh.top() << " " << minh.top() << "\n";       // 9 1

    // min-heap of (dist, node) for Dijkstra: pairs compare by first, then second
    priority_queue<pair<int,int>, vector<pair<int,int>>, greater<>> pq;
    pq.push({0, 1});
    auto [d, u] = pq.top(); pq.pop();
    (void)d; (void)u;
}
```

- Trick: max-heap me `-x` push karke min-heap simulate karo (ints ke liye theek, `INT_MIN` ka dhyan).
- `decrease-key` nahi hai; nayi entry push karo aur pop hone pe stale wali skip karo.

## Complexity table

| Container | Access | Search | Insert | Erase |
|---|---|---|---|---|
| `vector` | O(1) | O(n) | end O(1), middle O(n) | end O(1), middle O(n) |
| `deque` | O(1) | O(n) | ends O(1) | ends O(1) |
| `set` / `map` (red-black tree) | – | O(log n) | O(log n) | O(log n) |
| `unordered_set` / `unordered_map` | – | O(1) avg | O(1) avg | O(1) avg |
| `priority_queue` | top O(1) | – | O(log n) | pop O(log n) |
| `stack` / `queue` | top/front O(1) | – | O(1) | O(1) |

## ⭐ Har round me lagne wale algorithms

```cpp
void algos() {
    vector<int> a = {4, 2, 2, 9, 1};
    sort(a.begin(), a.end());                         // 1 2 2 4 9
    sort(a.rbegin(), a.rend());                       // descending
    sort(a.begin(), a.end(), greater<int>());         // descending too
    sort(a.begin(), a.end());

    auto lb = lower_bound(a.begin(), a.end(), 2) - a.begin(); // first >= 2 -> 1
    auto ub = upper_bound(a.begin(), a.end(), 2) - a.begin(); // first > 2  -> 3
    bool has = binary_search(a.begin(), a.end(), 4);          // true (needs sorted)
    long long sum = accumulate(a.begin(), a.end(), 0LL);      // 0LL, not 0!

    reverse(a.begin(), a.end());
    int mx = *max_element(a.begin(), a.end());
    int mn = *min_element(a.begin(), a.end());

    sort(a.begin(), a.end());
    a.erase(unique(a.begin(), a.end()), a.end());     // dedupe: 1 2 4 9

    vector<int> idx(5); iota(idx.begin(), idx.end(), 0);  // 0 1 2 3 4
    do { /* use idx */ } while (next_permutation(idx.begin(), idx.begin() + 3));

    int bits = __builtin_popcount(13);                // 3 (1101)
    int bitsLL = __builtin_popcountll(1LL << 40);     // 1
    cout << lb << ub << has << sum << mx << mn << bits << bitsLL << "\n";
}
```

- Sorted array me `upper_bound - lower_bound` = us value ka count.
- `set` pe member `se.lower_bound(x)` use karo (O(log n)); `std::lower_bound(se.begin(), se.end(), x)` O(n) hai.
- Saare permutations ke liye `next_permutation` se pehle range sort honi chahiye.

## ⭐ Pitfalls

| Pitfall | Kya hota hai | Fix |
|---|---|---|
| Empty pe `v.size() - 1` | Unsigned wrap hoke ~1.8e19 | Cast: `(int)v.size() - 1` |
| Sirf check ke liye `m[key]` | Key 0 ke saath insert ho jaati hai | `m.count(key)` ya `m.find(key)` |
| Iterate karte hue erase | Iterator invalid, crash | `it = m.erase(it);` |
| Reference/iterator pakad ke `push_back` | Reallocation use invalid kar deta hai | Reserve karo ya indices use karo |
| Codeforces pe `unordered_map` | Anti-hash tests → har op O(n) → TLE | Custom hash (splitmix64) ya `map` |
| Bade values pe `accumulate(..., 0)` | Sum `int` me, overflow | `0LL` pass karo |
| `unordered_map` me `pair` key | Compile error, hash nahi | `map` lo ya `a*N+b` encode karo |

```cpp
struct SafeHash {                                     // anti-hack hash
    static uint64_t splitmix64(uint64_t x) {
        x += 0x9e3779b97f4a7c15; x = (x ^ (x >> 30)) * 0xbf58476d1ce4e5b9;
        x = (x ^ (x >> 27)) * 0x94d049bb133111eb; return x ^ (x >> 31);
    }
    size_t operator()(uint64_t x) const {
        static const uint64_t R = chrono::steady_clock::now().time_since_epoch().count();
        return splitmix64(x + R);
    }
};
unordered_map<long long, int, SafeHash> safeMap;
```

**Interview tip:** LeetCode pe `unordered_map` theek hai; worst case O(n) aur anti-hash tabhi bolo jab guarantees ke baare me poocha jaaye.

## Standard questions

| Problem | Pattern / key idea | Difficulty |
|---|---|---|
| Two Sum (LC 1) | `unordered_map` value → index | Easy |
| Contains Duplicate (LC 217) | `unordered_set` | Easy |
| Valid Anagram (LC 242) | `array<int,26>` counts | Easy |
| Group Anagrams (LC 49) | `unordered_map<string, vector<string>>`, sorted key | Medium |
| Top K Frequent Elements (LC 347) | count map + size k min-heap | Medium |
| Kth Largest Element in an Array (LC 215) | size k min-heap / `nth_element` | Medium |
| Valid Parentheses (LC 20) | `stack<char>` | Easy |
| Sliding Window Maximum (LC 239) | indices ka `deque` | Hard |
| Contains Duplicate III (LC 220) | `set` + `lower_bound` window | Hard |
| My Calendar I (LC 729) | overlap ke liye `map` + `lower_bound` | Medium |
| Permutations (LC 46) | `next_permutation` ya backtracking | Medium |
| Counting Bits (LC 338) | `__builtin_popcount` / DP | Easy |
| Find First and Last Position (LC 34) | `lower_bound` / `upper_bound` | Medium |

## Checklist

- [ ] "Kaunsa container kab" table se problem ke liye sahi container chun sakta hoon
- [ ] vector, set/map, unordered_map, priority_queue ke insert/find/erase ki complexity bata sakta hoon
- [ ] Min-heap aur max-heap `priority_queue` declarations yaad se likh sakta hoon
- [ ] Comparator ke saath sort, lower/upper_bound, unique+erase, accumulate, next_permutation use kar sakta hoon
- [ ] Unsigned `size()`, `m[key]` insertion, iterator invalidation aur anti-hash TLE se bach sakta hoon
