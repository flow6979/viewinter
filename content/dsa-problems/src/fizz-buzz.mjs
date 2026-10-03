export default {
  id: 'fizz-buzz',
  title: 'Fizz Buzz',
  lc: 412,
  topic: '01-cpp-basics',
  order: 3,
  difficulty: 'easy',
  tags: ['math', 'string'],
  statement: {
    hi: 'Ek integer `n` diya hai. 1 se `n` tak har `i` ke liye ek string wala array `answer` return karo (`answer[i-1]`):\n- `"FizzBuzz"` agar `i` 3 aur 5 dono se divisible ho,\n- `"Fizz"` agar sirf 3 se, `"Buzz"` agar sirf 5 se,\n- warna `i` khud string ke roop me.',
    en: 'Given an integer `n`, return a string array `answer` (1-indexed as `answer[i-1]`) where for each `i` from 1 to `n`:\n- `"FizzBuzz"` if `i` is divisible by both 3 and 5,\n- `"Fizz"` if divisible by 3 only, `"Buzz"` if divisible by 5 only,\n- otherwise `i` as a string.',
  },
  constraints: ['1 ≤ n ≤ 10^4'],
  hints: {
    hi: ['Pehle 15 wala case check karo, warna 3 ya 5 wala pehle match ho jayega.', 'C++ me number ko string banane ke liye `to_string(i)`.'],
    en: ['Check the "divisible by 15" case first, otherwise the 3 or 5 case matches first.', 'In C++, `to_string(i)` turns a number into a string.'],
  },
  signature: { fn: 'fizzBuzz', params: [{ name: 'n', type: 'int' }], ret: 'vector<string>' },
  examples: [{ args: [3] }, { args: [5] }, { args: [15] }],
  edge: [[1], [2], [30], [100]],
  solve(n) {
    const out = []
    for (let i = 1; i <= n; i++) out.push(i % 15 === 0 ? 'FizzBuzz' : i % 3 === 0 ? 'Fizz' : i % 5 === 0 ? 'Buzz' : String(i))
    return out
  },
  generate(r) {
    return [r.bool() ? r.int(1, 60) : r.int(61, 2000)]
  },
  solution: {
    approach: {
      hi: '1 se n tak loop chalao. Pehle `i % 15`, phir `i % 3`, phir `i % 5` check karo, warna `to_string(i)`. O(n) time.',
      en: 'Loop from 1 to n. Check `i % 15` first, then `i % 3`, then `i % 5`, else `to_string(i)`. O(n) time.',
    },
    cpp: `class Solution {
public:
    vector<string> fizzBuzz(int n) {
        vector<string> ans;
        for (int i = 1; i <= n; i++) {
            if (i % 15 == 0) ans.push_back("FizzBuzz");
            else if (i % 3 == 0) ans.push_back("Fizz");
            else if (i % 5 == 0) ans.push_back("Buzz");
            else ans.push_back(to_string(i));
        }
        return ans;
    }
};`,
  },
}
