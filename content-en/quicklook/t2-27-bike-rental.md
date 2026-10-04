**In one line:** Vehicles are IoT devices: telemetry goes over MQTT into Kafka, last-known location in Redis GEO, reserve/unlock via a Postgres conditional update so one vehicle goes to one user, and the unlock command is idempotent with cmdId + ack.

- **Requirements:** nearby vehicles, 10 min reserve, QR unlock, pause/end in a parking zone, per-minute fare, ops rebalancing.
- **Scale:** 100K vehicles x ping every 10–60 sec = ~4–10K writes/sec; ~860M points/day (~50 GB); rides ~12/sec avg, ~150 peak.
- **Components:** MQTT broker, Command service, Kafka, Redis GEO (city keys), Postgres rides/vehicles, Time-series DB, Geofence, Wallet, Ops dashboard.
- **MQTT over HTTP polling:** 100K persistent conns, cloud → device push, unlock < 3 sec, less battery/data.
- **Conditional update over a Redis lock alone:** `WHERE status='available'` + partial unique index; no risk of lock loss on Redis failover.
- **Reserve hold:** `available → reserved`, `expires_at` 10 min, scheduler expiry + lazy check on unlock.
- **Unlock:** QoS 1 + cmdId, 8 sec ack timeout, retry with the same cmdId, device dedupe; failure → no charge.
- **State machine:** available, reserved, in_ride, low_battery, maintenance, lost; every transition is conditional.
- **End ride:** H3 geofence lookup, NO_PARKING penalty, fare = unlock + per-min + pause; `payments(ride_id UNIQUE)`.
- **Failure:** lock offline → do not create the ride, Bluetooth fallback; phone offline → auto-end from the device lock event.
- **Senior signal:** device lock events are the source of truth for billing; desired-state device shadow; rebalancing from demand heatmaps.

**Say in the interview:** "Booking QPS is small; the real work is on the IoT side. Telemetry goes MQTT → Kafka → Redis GEO + TSDB, and a conditional update plus an idempotent command gives one vehicle, one ride."

**Avoid:** Updating a Postgres row on every ping; treating unlock as synchronous fire-and-forget instead of talking about ack/timeout/retry.
