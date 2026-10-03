export default {
  id: 'group-anagrams',
  title: 'Group Anagrams',
  lc: 49,
  topic: '05-arrays-hashing-prefix',
  order: 4,
  difficulty: 'medium',
  tags: ['hash map', 'string', 'sorting'],
  statement: {
    hi: 'Strings ka ek array `strs` diya hai. **Anagrams** ko ek saath group karo aur groups ki list return karo. Groups ka order aur har group ke andar strings ka order kuch bhi ho sakta hai.',
    en: 'Given an array of strings `strs`, group the **anagrams** together and return the list of groups. The groups, and the strings inside each group, may be in any order.',
  },
  constraints: ['1 ≤ strs.length ≤ 10^4', '0 ≤ strs[i].length ≤ 100', '`strs[i]` me sirf lowercase English letters / `strs[i]` contains only lowercase English letters'],
  hints: {
    hi: ['Do anagrams ka koi aisa "signature" socho jo dono ke liye same ho.', 'Sorted string ko key bana ke `unordered_map<string, vector<string>>` me daalo.'],
    en: ['Think of a "signature" that is the same for two anagrams.', 'Use the sorted string as the key of an `unordered_map<string, vector<string>>`.'],
  },
  signature: { fn: 'groupAnagrams', params: [{ name: 'strs', type: 'vector<string>' }], ret: 'vector<vector<string>>' },
  compare: 'unordered-nested',
  examples: [
    { args: [['eat', 'tea', 'tan', 'ate', 'nat', 'bat']] },
    { args: [['']] },
    { args: [['a']] },
  ],
  edge: [[['', '']], [['abc', 'abc', 'cba']], [['a', 'b', 'c']], [['ab', 'ba', 'abc', 'cab', '', 'z']]],
  solve(strs) {
    const m = new Map()
    for (const s of strs) {
      const k = [...s].sort().join('')
      if (!m.has(k)) m.set(k, [])
      m.get(k).push(s)
    }
    return [...m.values()]
  },
  generate(r) {
    const n = r.int(1, r.bool() ? 10 : 1500)
    const alpha = r.pick(['abc', 'abcde', 'abcdefghijklmnopqrstuvwxyz'])
    const bases = Array.from({ length: Math.max(1, Math.floor(n / r.int(1, 4))) }, () => r.str(r.int(0, r.bool() ? 4 : 12), alpha))
    return [Array.from({ length: n }, () => r.shuffle([...r.pick(bases)]).join(''))]
  },
  solution: {
    approach: {
      hi: 'Har string ki sorted copy uski key hai: anagrams ki key same hoti hai. `unordered_map<string, vector<string>>` me key ke hisaab se push karo, phir saare groups return karo. O(n · k log k) time (k = string length).',
      en: 'The sorted copy of each string is its key: anagrams share the same key. Push each string into an `unordered_map<string, vector<string>>` by key, then return all groups. O(n · k log k) time (k = string length).',
    },
    cpp: `class Solution {
public:
    vector<vector<string>> groupAnagrams(vector<string>& strs) {
        unordered_map<string, vector<string>> groups;
        for (const string& s : strs) {
            string key = s;
            sort(key.begin(), key.end());
            groups[key].push_back(s);
        }
        vector<vector<string>> res;
        for (auto& [key, g] : groups) res.push_back(g);
        return res;
    }
};`,
  },
}
