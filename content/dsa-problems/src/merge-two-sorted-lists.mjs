export default {
  id: 'merge-two-sorted-lists',
  title: 'Merge Two Sorted Lists',
  lc: 21,
  topic: '09-stack-queue-monotonic',
  order: 3,
  difficulty: 'easy',
  tags: ['linked list', 'two pointers'],
  statement: {
    hi: 'Do **sorted** (non-decreasing) linked lists ke heads `list1` aur `list2` diye hain. Inhe ek sorted list me merge karo (dono lists ke nodes ko jod ke) aur merged list ka head return karo.',
    en: 'Given the heads of two **sorted** (non-decreasing) linked lists `list1` and `list2`, merge them into one sorted list by splicing their nodes together, and return the head of the merged list.',
  },
  constraints: ['0 ≤ number of nodes in each list ≤ 50', '-100 ≤ Node.val ≤ 100', 'Both lists are sorted in non-decreasing order'],
  hints: {
    hi: ['Ek dummy node se shuru karo taaki head ka special case na ho.', 'Dono heads me chhota wala jodo aur us list me aage badho.'],
    en: ['Start from a dummy node so the head is not a special case.', 'Attach the smaller of the two heads and advance in that list.'],
  },
  signature: { fn: 'mergeTwoLists', params: [{ name: 'list1', type: 'ListNode*' }, { name: 'list2', type: 'ListNode*' }], ret: 'ListNode*' },
  examples: [{ args: [[1, 2, 4], [1, 3, 4]] }, { args: [[], []] }, { args: [[], [0]] }],
  edge: [[[5], []], [[1, 1, 1], [1, 1]], [[1, 2, 3], [4, 5, 6]], [[4, 5, 6], [1, 2, 3]], [[-100], [100]]],
  solve(a, b) {
    const dummy = { next: null }
    let t = dummy
    while (a && b) {
      if (a.val <= b.val) (t.next = a), (a = a.next)
      else (t.next = b), (b = b.next)
      t = t.next
    }
    t.next = a || b
    return dummy.next
  },
  generate(r) {
    const big = r.bool()
    const mk = () => r.array(r.int(0, big ? 50 : 6), big ? -100 : -5, big ? 100 : 5).sort((x, y) => x - y)
    return [mk(), mk()]
  },
  solution: {
    approach: {
      hi: 'Dummy node + tail pointer. Jab tak dono lists bachi hain, chhota head tail ke baad jodo aur us list me aage badho. Ek khatam ho jaaye to doosri ka bacha hissa seedha jod do. O(n + m) time, O(1) extra space.',
      en: 'Use a dummy node and a tail pointer. While both lists remain, attach the smaller head after the tail and advance that list. When one runs out, attach the rest of the other. O(n + m) time, O(1) extra space.',
    },
    cpp: `class Solution {
public:
    ListNode* mergeTwoLists(ListNode* list1, ListNode* list2) {
        ListNode dummy(0);
        ListNode* t = &dummy;
        while (list1 && list2) {
            if (list1->val <= list2->val) { t->next = list1; list1 = list1->next; }
            else { t->next = list2; list2 = list2->next; }
            t = t->next;
        }
        t->next = list1 ? list1 : list2;
        return dummy.next;
    }
};`,
  },
}
