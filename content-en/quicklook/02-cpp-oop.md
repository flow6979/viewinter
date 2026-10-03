**In one line:** in coding rounds OOP means "implement this class" problems, custom comparators, and virtual-function theory.

- **Class:** private data + public methods; constructor with initializer list `: a(a), b(b)`.
- **Encapsulation:** keep state private, change it only through methods (BankAccount balance).
- **struct vs class:** only default access differs (struct public, class private).
- **`const` methods:** getters that don't modify; required on `const` objects.
- **Inheritance:** "is-a"; base constructs first, destructs last. Prefer composition for "has-a".
- **Virtual:** base pointer/reference calls the derived version at runtime via vtable.
- **Abstract class:** has a pure virtual `= 0`; can't be instantiated (Shape).
- **Virtual destructor:** needed when deleting derived through base pointer.
- **Operator overloading:** define `operator<` to use a struct in `sort`/`set`.
- **Static members:** shared by all objects; define outside the class.
- **PQ comparator:** `a.x > b.x` gives a **min**-heap; comparators must use strict `<`/`>`.

**Say in the interview:** "Each class with virtual functions has a vtable; each object has a vptr, so the call resolves at runtime."

**Avoid:** `<=` in comparators, missing virtual destructor, and object slicing (`Shape s = circle;`).
