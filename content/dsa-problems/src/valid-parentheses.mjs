export default {
  id: 'valid-parentheses',
  title: 'Valid Parentheses',
  lc: 20,
  topic: '09-stack-queue-monotonic',
  order: 1,
  difficulty: 'easy',
  tags: ['stack', 'string'],
  statement: {
    hi: 'Ek string `s` di hai jisme sirf `(`, `)`, `{`, `}`, `[`, `]` hain. Check karo ki string **valid** hai: har opening bracket usi type ke closing bracket se band ho, aur sahi order me band ho.',
    en: 'Given a string `s` containing only `(`, `)`, `{`, `}`, `[` and `]`, determine whether it is **valid**: every opening bracket must be closed by the same type of bracket, and in the correct order.',
  },
  constraints: ['1 ≤ s.length ≤ 10^4', 's consists only of the characters ()[]{}'],
  hints: {
    hi: ['Sabse recent khula bracket sabse pehle band hona chahiye — kaunsa data structure?', 'Closing bracket aaye to stack ka top match karo; aakhir me stack khaali hona chahiye.'],
    en: ['The most recently opened bracket must close first — which data structure fits?', 'On a closing bracket, match it against the stack top; the stack must be empty at the end.'],
  },
  signature: { fn: 'isValid', params: [{ name: 's', type: 'string' }], ret: 'bool' },
  examples: [{ args: ['()'] }, { args: ['()[]{}'] }, { args: ['(]'] }, { args: ['([])'] }],
  edge: [['('], [')'], ['([)]'], ['{[]}'], ['(('], ['))(('], ['[{()}]{}']],
  solve(s) {
    const st = []
    const m = { ')': '(', ']': '[', '}': '{' }
    for (const c of s) {
      if (c in m) {
        if (st.pop() !== m[c]) return false
      } else st.push(c)
    }
    return st.length === 0
  },
  generate(r) {
    const n = r.int(1, r.bool() ? 5 : 1000)
    const pairs = ['()', '[]', '{}']
    // build a valid string by random push/pop
    const st = []
    let s = ''
    while (s.length + st.length < 2 * n) {
      if (st.length && (r.bool() || s.length + st.length >= 2 * n - st.length)) s += st.pop()
      else {
        const p = r.pick(pairs)
        s += p[0]
        st.push(p[1])
      }
    }
    while (st.length) s += st.pop()
    const a = s.split('')
    const mode = r.int(0, 3)
    if (mode === 1) a[r.int(0, a.length - 1)] = r.pick('()[]{}'.split(''))
    else if (mode === 2) {
      const i = r.int(0, a.length - 1)
      const j = r.int(0, a.length - 1)
      ;[a[i], a[j]] = [a[j], a[i]]
    } else if (mode === 3 && a.length > 1) a.splice(r.int(0, a.length - 1), 1)
    return [a.join('')]
  },
  solution: {
    approach: {
      hi: 'Stack use karo: opening bracket push karo; closing aaye to stack khaali nahi hona chahiye aur top uska matching opening hona chahiye, phir pop. Aakhir me stack khaali ho to valid. O(n) time, O(n) space.',
      en: 'Use a stack: push opening brackets; on a closing bracket the stack must be non-empty and its top must be the matching opener, then pop. The string is valid if the stack ends empty. O(n) time, O(n) space.',
    },
    cpp: `class Solution {
public:
    bool isValid(string s) {
        stack<char> st;
        for (char c : s) {
            if (c == '(' || c == '[' || c == '{') { st.push(c); continue; }
            if (st.empty()) return false;
            char o = st.top(); st.pop();
            if ((c == ')' && o != '(') || (c == ']' && o != '[') || (c == '}' && o != '{')) return false;
        }
        return st.empty();
    }
};`,
  },
}
