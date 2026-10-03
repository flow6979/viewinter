function count(n, col) {
  const cols = new Set([col])
  const d1 = new Set([0 - col])
  const d2 = new Set([0 + col])
  const place = (row) => {
    if (row === n) return 1
    let total = 0
    for (let c = 0; c < n; c++) {
      if (cols.has(c) || d1.has(row - c) || d2.has(row + c)) continue
      cols.add(c), d1.add(row - c), d2.add(row + c)
      total += place(row + 1)
      cols.delete(c), d1.delete(row - c), d2.delete(row + c)
    }
    return total
  }
  return place(1)
}

export default {
  id: 'n-queens-ii',
  title: 'N-Queens II',
  lc: 52,
  topic: '10-recursion-backtracking',
  order: 6,
  difficulty: 'hard',
  tags: ['backtracking'],
  statement: {
    hi: '`n x n` chessboard pe `n` queens aise rakhni hain ki koi do queens ek dusre ko attack na karein (same row, column ya diagonal nahi).\n\nIs version me **row 0 ki queen column `col` (0-indexed) pe fixed hai**. Aise kitne distinct arrangements possible hain, wo count return karo. (Saare `col` ka sum original N-Queens II ka answer hai.)',
    en: 'Place `n` queens on an `n x n` chessboard so that no two queens attack each other (no shared row, column or diagonal).\n\nIn this version **the queen in row 0 is fixed at column `col` (0-indexed)**. Return the number of distinct arrangements. (Summing over every `col` gives the original N-Queens II answer.)',
  },
  constraints: ['1 ≤ n ≤ 10', '0 ≤ col < n'],
  hints: {
    hi: ['Har row me exactly ek queen hogi, to row-by-row queen rakho.', 'Used columns, `row - c` diagonals aur `row + c` anti-diagonals ko sets/arrays me track karo taaki check O(1) ho.'],
    en: ['Every row holds exactly one queen, so place queens row by row.', 'Track used columns, `row - c` diagonals and `row + c` anti-diagonals in sets/arrays so each check is O(1).'],
  },
  signature: { fn: 'totalNQueens', params: [{ name: 'n', type: 'int' }, { name: 'col', type: 'int' }], ret: 'int' },
  examples: [
    { args: [4, 1], explain: { hi: 'n = 4 ke 2 solutions hain; unme se ek me row 0 ki queen column 1 pe hai.', en: 'n = 4 has 2 solutions; in one of them the row-0 queen is in column 1.' } },
    { args: [4, 0], explain: { hi: 'Corner pe queen rakhne se n = 4 ka koi solution nahi banta.', en: 'With the queen in a corner, n = 4 has no solution.' } },
    { args: [1, 0] },
  ],
  edge: [[2, 0], [3, 1], [8, 0], [10, 4], [10, 9], [5, 2]],
  solve: count,
  generate(r) {
    const n = r.int(1, 10)
    return [n, r.int(0, n - 1)]
  },
  solution: {
    approach: {
      hi: 'Row 0 me queen ko `col` pe rakho aur uska column + dono diagonals mark karo. Phir row 1 se backtracking: har row me har safe column try karo, recurse, undo. Row `n` tak pahunche to 1 count karo.\nTeen boolean arrays (`cols`, `row - c + n`, `row + c`) se safe check O(1). Time ≈ O(n!).',
      en: 'Put the row-0 queen at `col` and mark its column and both diagonals. Then backtrack from row 1: in each row try every safe column, recurse, undo. Reaching row `n` counts as 1.\nThree boolean arrays (`cols`, `row - c + n`, `row + c`) make the safety check O(1). Time ≈ O(n!).',
    },
    cpp: `class Solution {
public:
    int totalNQueens(int n, int col) {
        N = n;
        cols.assign(n, false);
        d1.assign(2 * n, false);
        d2.assign(2 * n, false);
        set(0, col, true);
        return place(1);
    }
private:
    int N;
    vector<bool> cols, d1, d2;
    void set(int r, int c, bool v) { cols[c] = d1[r - c + N] = d2[r + c] = v; }
    int place(int r) {
        if (r == N) return 1;
        int total = 0;
        for (int c = 0; c < N; c++) {
            if (cols[c] || d1[r - c + N] || d2[r + c]) continue;
            set(r, c, true);
            total += place(r + 1);
            set(r, c, false);
        }
        return total;
    }
};`,
  },
}
