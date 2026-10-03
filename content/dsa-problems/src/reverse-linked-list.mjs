export default {
  id: 'reverse-linked-list',
  title: 'Reverse Linked List',
  lc: 206,
  topic: '09-stack-queue-monotonic',
  order: 2,
  difficulty: 'easy',
  tags: ['linked list'],
  statement: {
    hi: 'Singly linked list ka `head` diya hai. List ko **reverse** karo aur naya head return karo.',
    en: 'Given the `head` of a singly linked list, **reverse** the list and return the new head.',
  },
  constraints: ['0 ≤ number of nodes ≤ 5000', '-5000 ≤ Node.val ≤ 5000'],
  hints: {
    hi: ['Teen pointers: `prev`, `cur`, `next`.', 'Har node ka `next` ulta karke `prev` ki taraf point karao.'],
    en: ['Use three pointers: `prev`, `cur`, `next`.', 'Point each node’s `next` back to `prev`.'],
  },
  signature: { fn: 'reverseList', params: [{ name: 'head', type: 'ListNode*' }], ret: 'ListNode*' },
  examples: [{ args: [[1, 2, 3, 4, 5]] }, { args: [[1, 2]] }, { args: [[]] }],
  edge: [[[7]], [[-5000, 5000]], [[3, 3, 3]], [[0, 1, 0]]],
  solve(head) {
    let prev = null
    while (head) {
      const nx = head.next
      head.next = prev
      prev = head
      head = nx
    }
    return prev
  },
  generate(r) {
    const n = r.int(0, r.bool() ? 10 : 3000)
    return [r.array(n, -5000, 5000)]
  },
  solution: {
    approach: {
      hi: 'Iterative: `prev = null` se shuru karo. Har step pe `next` save karo, `cur->next = prev` karo, phir `prev` aur `cur` ko aage badhao. End me `prev` naya head hai. O(n) time, O(1) space.',
      en: 'Iterative: start with `prev = null`. At each step save `next`, set `cur->next = prev`, then advance `prev` and `cur`. At the end `prev` is the new head. O(n) time, O(1) space.',
    },
    cpp: `class Solution {
public:
    ListNode* reverseList(ListNode* head) {
        ListNode* prev = nullptr;
        while (head) {
            ListNode* nx = head->next;
            head->next = prev;
            prev = head;
            head = nx;
        }
        return prev;
    }
};`,
  },
}
