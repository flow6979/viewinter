function exist(board, word) {
  const m = board.length
  const n = board[0].length
  const seen = board.map((row) => row.map(() => false))
  const dfs = (i, j, k) => {
    if (k === word.length) return true
    if (i < 0 || j < 0 || i >= m || j >= n || seen[i][j] || board[i][j] !== word[k]) return false
    seen[i][j] = true
    const ok = dfs(i + 1, j, k + 1) || dfs(i - 1, j, k + 1) || dfs(i, j + 1, k + 1) || dfs(i, j - 1, k + 1)
    seen[i][j] = false
    return ok
  }
  for (let i = 0; i < m; i++) for (let j = 0; j < n; j++) if (dfs(i, j, 0)) return true
  return false
}

const g = (rows) => rows.map((s) => [...s])

export default {
  id: 'word-search',
  title: 'Word Search',
  lc: 79,
  topic: '10-recursion-backtracking',
  order: 5,
  difficulty: 'medium',
  tags: ['backtracking', 'grid', 'dfs'],
  statement: {
    hi: 'Ek `m x n` characters ka grid `board` aur ek string `word` diya hai. Agar `word` grid me exist karta hai to `true` return karo, warna `false`.\n\nWord ko **adjacent** cells (upar/neeche/left/right) ke letters se banana hai, aur ek cell ek word me **ek se zyada baar** use nahi ho sakta.',
    en: 'Given an `m x n` grid of characters `board` and a string `word`, return `true` if `word` exists in the grid, otherwise `false`.\n\nThe word must be built from letters of **sequentially adjacent** cells (horizontally or vertically neighbouring), and the same cell may **not be used more than once**.',
  },
  constraints: ['1 ≤ m, n ≤ 6', '1 ≤ word.length ≤ 15', 'board and word consist only of English letters (upper and lower case)'],
  hints: {
    hi: ['Har cell ko starting point maan ke DFS try karo.', 'DFS me cell ko temporarily "visited" mark karo aur wapas aate waqt unmark karo (backtrack).'],
    en: ['Try a DFS starting from every cell.', 'In the DFS, mark the cell as visited temporarily and unmark it on the way back (backtrack).'],
  },
  signature: { fn: 'exist', params: [{ name: 'board', type: 'vector<vector<char>>' }, { name: 'word', type: 'string' }], ret: 'bool' },
  examples: [
    { args: [g(['ABCE', 'SFCS', 'ADEE']), 'ABCCED'] },
    { args: [g(['ABCE', 'SFCS', 'ADEE']), 'SEE'] },
    { args: [g(['ABCE', 'SFCS', 'ADEE']), 'ABCB'], explain: { hi: '"B" wala cell dobara use karna padega, jo allowed nahi.', en: 'It would need to reuse the "B" cell, which is not allowed.' } },
  ],
  edge: [
    [g(['a']), 'a'],
    [g(['a']), 'b'],
    [g(['aa']), 'aaa'],
    [g(['ab', 'cd']), 'abdc'],
    [g(['ab', 'cd']), 'abcd'],
    [g(['aA']), 'Aa'],
    [g(['aaaaaa', 'aaaaaa', 'aaaaaa', 'aaaaaa', 'aaaaaa', 'aaaaab']), 'baaaaaaaaaaaaaa'],
  ],
  solve: exist,
  generate(r) {
    const m = r.int(1, 6)
    const n = r.int(1, 6)
    const alpha = r.pick(['AB', 'ABC', 'ABCD', 'abcdeABCDE'])
    const board = Array.from({ length: m }, () => [...r.str(n, alpha)])
    const len = r.int(1, Math.min(15, m * n + 1))
    if (r.bool()) {
      // a self-avoiding path in the grid, so the answer is often true
      let i = r.int(0, m - 1)
      let j = r.int(0, n - 1)
      const used = new Set([`${i},${j}`])
      let word = board[i][j]
      while (word.length < len) {
        const nb = [[i + 1, j], [i - 1, j], [i, j + 1], [i, j - 1]].filter(([a, b]) => a >= 0 && b >= 0 && a < m && b < n && !used.has(`${a},${b}`))
        if (!nb.length) break
        ;[i, j] = r.pick(nb)
        used.add(`${i},${j}`)
        word += board[i][j]
      }
      if (r.int(0, 3) === 0) word = word.slice(0, -1) + r.pick([...alpha]) // sometimes break the last letter
      return [board, word]
    }
    return [board, r.str(Math.min(len, alpha.length === 2 ? 8 : 15), alpha)]
  },
  solution: {
    approach: {
      hi: 'Har cell `(i, j)` se `dfs(i, j, k)` chalao: agar `board[i][j] == word[k]` hai to cell ko `#` se mark karo, chaaron neighbours me `k + 1` dhoondo, phir original letter wapas rakho.\n`k == word.length` matlab poora word mil gaya.\nTime O(m · n · 3^L) (L = word length), extra space O(L) recursion.',
      en: 'From every cell `(i, j)` run `dfs(i, j, k)`: if `board[i][j] == word[k]`, mark the cell with `#`, look for `k + 1` in the four neighbours, then restore the letter.\n`k == word.length` means the whole word was matched.\nTime O(m · n · 3^L) (L = word length), extra space O(L) for recursion.',
    },
    cpp: `class Solution {
public:
    bool exist(vector<vector<char>>& board, string word) {
        for (int i = 0; i < (int)board.size(); i++)
            for (int j = 0; j < (int)board[0].size(); j++)
                if (dfs(board, word, i, j, 0)) return true;
        return false;
    }
private:
    bool dfs(vector<vector<char>>& b, const string& w, int i, int j, int k) {
        if (k == (int)w.size()) return true;
        if (i < 0 || j < 0 || i >= (int)b.size() || j >= (int)b[0].size() || b[i][j] != w[k]) return false;
        char c = b[i][j];
        b[i][j] = '#';   // mark visited
        bool ok = dfs(b, w, i + 1, j, k + 1) || dfs(b, w, i - 1, j, k + 1) ||
                  dfs(b, w, i, j + 1, k + 1) || dfs(b, w, i, j - 1, k + 1);
        b[i][j] = c;     // backtrack
        return ok;
    }
};`,
  },
}
