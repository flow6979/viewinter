**Ek line:** Station-based bike rental: search, reserve (hold + expiry), unlock, kisi bhi station pe dock, fare kato, aur do users ek bike na le paayein.

- **Requirements:** station pe available bikes search; 10 min reserve hold; unlock pe ride start; any station pe end, dock full ho to mana; fare + wallet debit; damage → maintenance.
- **Scale:** ek user ek ride; cycle/e-bike/scooter; min wallet balance Rs 50; paisa `long` paise me.
- **Components:** `RentalService` > `Station` > `Bike`; `BikeState`, `User`, `Reservation`, `Rental`, `PricingStrategy` + decorators, `PaymentService`, `RentalListener`.
- **State over scattered ifs:** AVAILABLE > RESERVED > IN_USE > AVAILABLE, plus MAINTENANCE; `canMoveTo` galat move ek jagah reject kare.
- **Strategy + Decorator over badi `price()`:** per-minute base, upar se e-bike surcharge, late penalty, member discount; naya rule = naya decorator.
- **Observer over direct calls:** SMS/push/analytics listeners, naya channel = zero change.
- **CAS over global lock:** `transition(AVAILABLE, RESERVED)` = `compareAndSet`; per-bike, city serialize nahi hoti.
- **Bottleneck:** expiry aur unlock ek saath; dono `reservations.remove(bikeId, r)` karte hain, ek hi jeetta hai. DB me `UPDATE ... WHERE state='AVAILABLE'`.
- **Senior signal:** idempotent `endRide` (rentalId = payment key), dock full pe meter chalu + grace, `Clock` inject, payment fail pe dues, bike hostage nahi.

**Interview me bolo:** "Pehle bike ki state machine, phir pricing Strategy + Decorator, phir reserve/unlock/endRide. Same bike pe do users ki race `compareAndSet` se, aur expiry vs unlock `remove(key, value)` se."

**Galti mat karna:** `search()` result ko guarantee samajhna (wo sirf hint hai, CAS asli guard); fare `double` me; end ride ko non-idempotent chhodna.
