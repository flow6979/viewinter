**In one line:** A station-based bike rental: search, reserve (hold + expiry), unlock, dock at any station, charge the fare, and never let two users take the same bike.

- **Requirements:** search available bikes at a station; 10 min reserve hold; unlock starts the ride; end at any station, refuse if the dock is full; fare + wallet debit; damage → maintenance.
- **Scale:** one ride per user; cycle/e-bike/scooter; minimum wallet balance Rs 50; money as `long` paise.
- **Components:** `RentalService` > `Station` > `Bike`; `BikeState`, `User`, `Reservation`, `Rental`, `PricingStrategy` + decorators, `PaymentService`, `RentalListener`.
- **State over scattered ifs:** AVAILABLE > RESERVED > IN_USE > AVAILABLE, plus MAINTENANCE; `canMoveTo` rejects a wrong move in one place.
- **Strategy + Decorator over one big `price()`:** per-minute base, wrapped by e-bike surcharge, late penalty, member discount; a new rule is a new decorator.
- **Observer over direct calls:** SMS/push/analytics listeners, a new channel needs zero change.
- **CAS over global lock:** `transition(AVAILABLE, RESERVED)` = `compareAndSet`; per bike, so the city is not serialized.
- **Bottleneck:** expiry and unlock at the same moment; both call `reservations.remove(bikeId, r)`, only one wins. In a DB: `UPDATE ... WHERE state='AVAILABLE'`.
- **Senior signal:** idempotent `endRide` (rentalId = payment key), meter keeps running + grace when the dock is full, inject `Clock`, record dues on payment failure instead of holding the bike hostage.

**Say in the interview:** "Bike state machine first, then pricing with Strategy + Decorator, then reserve/unlock/endRide. The two-users-same-bike race is a `compareAndSet`, and expiry vs unlock is a `remove(key, value)`."

**Avoid:** treating the `search()` result as a guarantee (it is a hint, CAS is the guard); fares in `double`; leaving end ride non-idempotent.
