**Ek line:** coding rounds me OOP matlab "ye class implement karo" problems, custom comparators, aur virtual-function theory.

- **Class:** private data + public methods; initializer list wala constructor `: a(a), b(b)`.
- **Encapsulation:** state private rakho, sirf methods se change (BankAccount balance).
- **struct vs class:** fark sirf default access (struct public, class private).
- **`const` methods:** jo getters modify nahi karte; `const` objects pe zaroori.
- **Inheritance:** "is-a"; base pehle banta hai, last me destroy. "has-a" ho to composition.
- **Virtual:** base pointer/reference se call runtime pe vtable se derived version chalata hai.
- **Abstract class:** pure virtual `= 0`; object nahi ban sakta (Shape).
- **Virtual destructor:** base pointer se derived delete karte waqt zaroori.
- **Operator overloading:** `sort`/`set` me struct ke liye `operator<` define karo.
- **Static members:** sab objects share karte hain; class ke bahar define karo.
- **PQ comparator:** `a.x > b.x` se **min**-heap; comparators strict `<`/`>` hi use karein.

**Interview me bolo:** "Virtual functions wali har class ki vtable hoti hai; har object me vptr hota hai, isliye call runtime pe resolve hota hai."

**Galti mat karna:** comparator me `<=`, virtual destructor bhoolna, aur object slicing (`Shape s = circle;`).
