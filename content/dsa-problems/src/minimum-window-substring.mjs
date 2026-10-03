export default {
  id: 'minimum-window-substring',
  title: 'Minimum Window Substring',
  lc: 76,
  topic: '06-two-pointers-sliding-window',
  order: 6,
  difficulty: 'hard',
  tags: ['sliding window', 'hash map', 'string'],
  statement: {
    hi: 'Do strings `s` aur `t` di hain. `s` ki sabse chhoti substring return karo jisme `t` ke **saare characters (duplicates ke saath)** aa jaayein. Aisi koi substring na ho to `""` return karo. Agar kai sabse chhoti windows hon to **sabse left** wali (sabse chhota start index) return karo.',
    en: 'Given strings `s` and `t`, return the shortest substring of `s` that contains **every character of `t` (including duplicates)**. If no such substring exists, return `""`. If several minimum windows exist, return the **leftmost** one (smallest start index).',
  },
  constraints: ['1 ≤ s.length, t.length ≤ 10^5', 's and t consist of uppercase and lowercase English letters'],
  hints: {
    hi: ['`t` ke characters ki count map banao, aur ek counter rakho ki abhi kitne characters "missing" hain.', 'Right pointer se window badhao jab tak sab mil na jaayein, phir left se jitna ho sake sikodo aur answer update karo.'],
    en: ['Build a count map of `t` and keep a counter of how many characters are still "missing".', 'Expand with the right pointer until everything is covered, then shrink from the left as far as possible and update the answer.'],
  },
  signature: { fn: 'minWindow', params: [{ name: 's', type: 'string' }, { name: 't', type: 'string' }], ret: 'string' },
  examples: [
    { args: ['ADOBECODEBANC', 'ABC'], explain: { hi: '"BANC" sabse chhoti window hai jisme A, B aur C teeno hain.', en: '"BANC" is the shortest window containing A, B and C.' } },
    { args: ['a', 'a'] },
    { args: ['a', 'aa'], explain: { hi: '`t` me do a chahiye, `s` me sirf ek hai — answer "".', en: '`t` needs two a\'s but `s` has only one, so the answer is "".' } },
  ],
  edge: [['ab', 'b'], ['abab', 'ab'], ['aAbB', 'AB'], ['bba', 'ab'], ['abc', 'd'], ['aaaaa', 'aa'], ['cabwefgewcwaefgcf', 'cae']],
  solve(s, t) {
    const need = new Map()
    for (const c of t) need.set(c, (need.get(c) || 0) + 1)
    let missing = t.length, l = 0, bestL = 0, bestLen = Infinity
    for (let r = 0; r < s.length; r++) {
      const c = s[r]
      if (need.has(c)) {
        if (need.get(c) > 0) missing--
        need.set(c, need.get(c) - 1)
      }
      while (missing === 0) {
        if (r - l + 1 < bestLen) { bestLen = r - l + 1; bestL = l }
        const d = s[l]
        if (need.has(d)) {
          need.set(d, need.get(d) + 1)
          if (need.get(d) > 0) missing++
        }
        l++
      }
    }
    return bestLen === Infinity ? '' : s.slice(bestL, bestL + bestLen)
  },
  generate(r) {
    const alpha = r.pick(['ab', 'abc', 'abcdef', 'aAbBcC', 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'])
    const n = r.int(1, r.bool() ? 14 : 2000)
    const s = r.str(n, alpha)
    let t
    if (r.int(0, 3) === 0) t = r.str(r.int(1, Math.min(n + 2, 8)), alpha)
    else {
      // pick characters of s so a window usually exists
      const m = r.int(1, Math.min(n, r.bool() ? 4 : 30))
      t = r.shuffle([...s]).slice(0, m).join('')
    }
    return [s, t]
  },
  solution: {
    approach: {
      hi: 'Sliding window: `need[c]` = `t` me count, `missing` = abhi kitne chars chahiye. `r` badhao; `need[s[r]] > 0` tha to `missing--`. Jab `missing == 0`, window valid hai — sirf strictly chhoti length pe answer update karo (taaki leftmost bache), phir `l` se sikodo jab tak window invalid na ho jaaye. O(|s| + |t|) time.',
      en: 'Sliding window: `need[c]` = count in `t`, `missing` = chars still required. Advance `r`; if `need[s[r]] > 0` it was useful, so `missing--`. While `missing == 0` the window is valid — update the answer only on a strictly shorter length (so the leftmost one stays), then shrink from `l` until it becomes invalid. O(|s| + |t|) time.',
    },
    cpp: `class Solution {
public:
    string minWindow(string s, string t) {
        vector<int> need(128, 0);
        for (char c : t) need[c]++;
        int missing = t.size(), l = 0, bestL = 0, bestLen = INT_MAX;
        for (int r = 0; r < (int)s.size(); r++) {
            if (need[s[r]]-- > 0) missing--;
            while (missing == 0) {
                if (r - l + 1 < bestLen) { bestLen = r - l + 1; bestL = l; }
                if (++need[s[l]] > 0) missing++;
                l++;
            }
        }
        return bestLen == INT_MAX ? "" : s.substr(bestL, bestLen);
    }
};`,
  },
}
