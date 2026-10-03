export default {
  id: 'container-with-most-water',
  title: 'Container With Most Water',
  lc: 11,
  topic: '06-two-pointers-sliding-window',
  order: 3,
  difficulty: 'medium',
  tags: ['two pointers', 'greedy'],
  statement: {
    hi: '`height` array me `n` vertical lines hain; line `i` ke end points `(i, 0)` aur `(i, height[i])` hain. Do lines chuno jo x-axis ke saath mil kar ek container banayein jisme sabse zyada paani aaye. Woh maximum paani (area) return karo. Container ko tilt nahi kar sakte.',
    en: 'The array `height` describes `n` vertical lines; line `i` has endpoints `(i, 0)` and `(i, height[i])`. Pick two lines that, together with the x-axis, form a container holding the most water. Return that maximum amount of water (area). You may not tilt the container.',
  },
  constraints: ['2 ≤ n ≤ 10^5', '0 ≤ height[i] ≤ 10^4'],
  hints: {
    hi: ['Area = (j - i) * min(height[i], height[j]). Sabse chaudi pair se shuru karo.', 'Chhoti line ko andar le jaane se hi area badh sakta hai — badi wali ko hilaane ka fayda nahi.'],
    en: ['Area = (j - i) * min(height[i], height[j]). Start with the widest pair.', 'Only moving the shorter line inward can ever increase the area — moving the taller one cannot help.'],
  },
  signature: { fn: 'maxArea', params: [{ name: 'height', type: 'vector<int>' }], ret: 'int' },
  examples: [
    { args: [[1, 8, 6, 2, 5, 4, 8, 3, 7]], explain: { hi: 'Index 1 (8) aur index 8 (7): min(8,7) * 7 = 49.', en: 'Index 1 (8) and index 8 (7): min(8,7) * 7 = 49.' } },
    { args: [[1, 1]] },
  ],
  edge: [[[0, 0]], [[10000, 10000]], [[1, 2, 3, 4, 5]], [[5, 4, 3, 2, 1]], [[0, 10000, 0]], [[2, 2, 2, 2, 2, 2]]],
  solve(h) {
    let i = 0, j = h.length - 1, best = 0
    while (i < j) {
      best = Math.max(best, (j - i) * Math.min(h[i], h[j]))
      if (h[i] < h[j]) i++
      else j--
    }
    return best
  },
  generate(r) {
    const n = r.int(2, r.bool() ? 12 : 3000)
    return [r.array(n, 0, r.bool() ? 20 : 10000)]
  },
  solution: {
    approach: {
      hi: 'Do pointers dono ends pe. Har step pe area update karo, phir chhoti line wala pointer andar le jao — kyunki width ghat rahi hai, area sirf tab badh sakta hai jab chhoti height badle. O(n) time, O(1) space.',
      en: 'Two pointers at both ends. At each step update the area, then move the pointer at the shorter line inward — width only shrinks, so the area can only grow if the shorter height changes. O(n) time, O(1) space.',
    },
    cpp: `class Solution {
public:
    int maxArea(vector<int>& height) {
        int i = 0, j = (int)height.size() - 1, best = 0;
        while (i < j) {
            best = max(best, (j - i) * min(height[i], height[j]));
            if (height[i] < height[j]) i++;
            else j--;
        }
        return best;
    }
};`,
  },
}
