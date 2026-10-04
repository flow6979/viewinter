**Ek line:** Vehicles IoT devices hain: MQTT se telemetry Kafka me, last-known location Redis GEO me, reserve/unlock Postgres conditional update se ek vehicle ek user, unlock command cmdId + ack se idempotent.

- **Requirements:** nearby vehicles, 10 min reserve, QR unlock, pause/end in parking zone, per-minute fare, ops rebalancing.
- **Scale:** 100K vehicles x ping 10–60 sec = ~4–10K writes/sec; ~860M points/day (~50 GB); rides ~12/sec avg, ~150 peak.
- **Components:** MQTT broker, Command service, Kafka, Redis GEO (city keys), Postgres rides/vehicles, Time-series DB, Geofence, Wallet, Ops dashboard.
- **MQTT over HTTP polling:** 100K persistent conns, cloud → device push, unlock < 3 sec, kam battery/data.
- **Conditional update over sirf Redis lock:** `WHERE status='available'` + partial unique index; Redis failover pe lock loss ka risk nahi.
- **Reserve hold:** `available → reserved`, `expires_at` 10 min, scheduler expiry + lazy check on unlock.
- **Unlock:** QoS 1 + cmdId, 8 sec ack timeout, same cmdId retry, device dedupe; fail → no charge.
- **State machine:** available, reserved, in_ride, low_battery, maintenance, lost; har transition conditional.
- **End ride:** H3 geofence lookup, NO_PARKING penalty, fare = unlock + per-min + pause; `payments(ride_id UNIQUE)`.
- **Failure:** lock offline → ride mat banao, Bluetooth fallback; phone offline → device lock event se auto-end.
- **Senior signal:** billing ka source of truth device lock events; desired-state device shadow; demand heatmap se rebalancing.

**Interview me bolo:** "Booking QPS chhota hai, asli kaam IoT side pe hai. Telemetry MQTT → Kafka → Redis GEO + TSDB, aur unlock conditional update + idempotent command se ek vehicle ek ride."

**Galti mat karna:** Har ping pe Postgres row update mat karo; unlock ko synchronous fire-and-forget mat samjho, ack/timeout/retry bolo.
