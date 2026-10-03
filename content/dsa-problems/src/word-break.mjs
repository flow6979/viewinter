export default {
  id: 'word-break',
  title: 'Word Break',
  lc: 139,
  topic: '15-dp',
  order: 5,
  difficulty: 'medium',
  tags: ['dp', 'string', 'hash set'],
  statement: {
    hi: 'Ek string `s` aur words ki list `wordDict` di hai. Agar `s` ko dictionary ke ek ya zyada words ki sequence me tod sakte ho (space se alag karke) to `true` return karo, warna `false`. Ek word kitni bhi baar use ho sakta hai.',
    en: 'Given a string `s` and a dictionary `wordDict`, return `true` if `s` can be split into a space-separated sequence of one or more dictionary words, otherwise `false`. A word may be reused any number of times.',
  },
  constraints: ['1 ≤ s.length ≤ 300', '1 ≤ wordDict.length ≤ 1000', '1 ≤ wordDict[i].length ≤ 20', 's and wordDict[i] are lowercase English letters', 'All words in wordDict are unique'],
  hints: {
    hi: ['ok[i] = kya prefix `s[0..i)` todha ja sakta hai?', 'ok[i] true hai agar koi `j < i` ho jahan ok[j] true aur `s[j..i)` dictionary me ho.'],
    en: ['ok[i] = can the prefix `s[0..i)` be segmented?', 'ok[i] is true if some `j < i` has ok[j] true and `s[j..i)` in the dictionary.'],
  },
  signature: { fn: 'wordBreak', params: [{ name: 's', type: 'string' }, { name: 'wordDict', type: 'vector<string>' }], ret: 'bool' },
  examples: [
    { args: ['leetcode', ['leet', 'code']], explain: { hi: '"leet code"', en: '"leet code"' } },
    { args: ['applepenapple', ['apple', 'pen']], explain: { hi: '"apple pen apple" — apple dobara use hua.', en: '"apple pen apple" — apple is reused.' } },
    { args: ['catsandog', ['cats', 'dog', 'sand', 'and', 'cat']] },
  ],
  edge: [
    ['a', ['a']],
    ['a', ['b']],
    ['aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaab', ['a', 'aa', 'aaa', 'aaaa', 'aaaaa', 'aaaaaaaaaa']],
    ['cars', ['car', 'ca', 'rs']],
    ['aaaaaaa', ['aaaa', 'aaa']],
    ['goalspecial', ['go', 'goal', 'goals', 'special']],
  ],
  solve(s, wordDict) {
    const dict = new Set(wordDict)
    const ok = Array(s.length + 1).fill(false)
    ok[0] = true
    for (let i = 1; i <= s.length; i++)
      for (let j = Math.max(0, i - 20); j < i && !ok[i]; j++) if (ok[j] && dict.has(s.slice(j, i))) ok[i] = true
    return ok[s.length]
  },
  generate(r, i) {
    const alpha = r.pick(['ab', 'abc', 'abcd', 'abcdefghij'])
    const k = i % 3 === 0 ? r.int(1, 6) : r.int(2, 40)
    const words = new Set()
    for (let t = 0; t < k * 3 && words.size < k; t++) words.add(r.str(r.int(1, r.pick([3, 6, 20])), alpha))
    const dict = [...words]
    const maxLen = i % 3 === 0 ? 20 : 300
    let s = ''
    while (s.length < maxLen) {
      const w = r.pick(dict)
      if (s.length + w.length > maxLen) break
      s += w
      if (r.int(0, 8) === 0) break
    }
    if (!s) s = dict[0].slice(0, maxLen)
    // sometimes break it with a random change so false answers show up too
    if (r.bool()) {
      const p = r.int(0, s.length - 1)
      s = s.slice(0, p) + r.str(1, alpha + 'z') + s.slice(p + 1)
    }
    return [s, r.shuffle(dict)]
  },
  solution: {
    approach: {
      hi: 'DP on prefixes: `ok[0] = true`. Har `i` ke liye pichhle positions `j` dekho (max 20 peeche, kyunki word length ≤ 20): agar `ok[j]` aur `s.substr(j, i-j)` set me hai to `ok[i] = true`. O(n · L · L) time with hash set, O(n) space.',
      en: 'DP over prefixes: `ok[0] = true`. For each `i`, look back at positions `j` (at most 20 back, since words are ≤ 20 long): if `ok[j]` and `s.substr(j, i-j)` is in the set, `ok[i] = true`. O(n · L · L) time with a hash set, O(n) space.',
    },
    cpp: `class Solution {
public:
    bool wordBreak(string& s, vector<string>& wordDict) {
        unordered_set<string> dict(wordDict.begin(), wordDict.end());
        int n = s.size();
        vector<bool> ok(n + 1, false);
        ok[0] = true;
        for (int i = 1; i <= n; i++)
            for (int j = max(0, i - 20); j < i && !ok[i]; j++)
                if (ok[j] && dict.count(s.substr(j, i - j))) ok[i] = true;
        return ok[n];
    }
};`,
  },
}
