**Ek line:** LLMOps matlab launch ke baad LLM features chalana: prompt aur model changes evals aur canary ke peeche ship karna, retries aur fallbacks se provider failures jhelna, aur cost per task aur streaming latency sambhalna.

- **Alag kyun hai:** failures silent hote hain (kharab answer bhi HTTP 200), output non-deterministic, providers models badalte ya retire karte hain, aur cost tokens se badhti hai, requests se nahi.
- **Versioned config:** prompt + pinned model snapshot + params + tools = ek immutable config ID (`support_reply@v15`); har trace use log kare; rollback = `production` label move, redeploy nahi.
- **Prompt CI:** har PR pe 200–500 cases ka golden set, code checks + LLM judge, quality drop, cost rise aur p95 pe gates; 200 cases pe 88% ka noise ~±4.5 points, isliye paired flips compare karo aur 3–5 samples chalao.
- **Rollout:** offline eval → shadow (write tools off) → user ID se sticky canary (1–5%) → ramp, guardrail metrics (task success, thumbs, escalation, cost, p95) aur auto-rollback ke saath.
- **Sample size:** users per arm ≈ 16·p(1−p)/δ²; 80% → 82% ke liye ~6,400 per arm; kam thumbs data ko kahin zyada traffic chahiye.
- **Reliability:** asli limit aksar TPM; har call pe timeout; sirf 408/429/5xx/timeouts retry, full-jitter backoff ke saath; `Retry-After` maano; sirf ek layer me retry; ~50% failures pe circuit breaker.
- **Gateway se fallbacks:** logical model naam → providers ke paar chain (LiteLLM-style), har fallback ka apna tested prompt; context window, JSON/tool behaviour, tokenizer aur data rules dekho.
- **Side effects:** refunds/emails pe idempotency key `run_id:step_id` taaki retries do baar action na karein; hedge sirf read-only calls, TTFT pe, cap ke saath.
- **Cost per task:** saari calls + retries jodo (example ≈ $0.05 vs "$0.01 per call"); prompt caching (cached prefix ~10% price), easy tasks chhote models pe route, batch API (~50% sasta, sirf async).
- **Budgets aur alerts:** per request, run, user, tenant aur global limits; calls ko feature/config/tenant se tag; spend rate pe alert (pichle hafte ke same hour ka 1.5x).
- **Streaming:** total ≈ TTFT + output tokens ÷ tokens/s (0.8s + 300/60 = 5.8s); SSE pe stream, progress dikhao, parallel tool calls; averages nahi, p50/p95/p99 budget.
- **Monitoring aur migration:** health, latency, cost, quality (1–5% pe online judge), safety, feedback ke dashboards, sab config se split; drift checks; models golden set, prompt re-tune, shadow, canary se migrate, purana snapshot fallback.

**Interview me bolo:** "LLM failures silent aur statistical hote hain, isliye quality alerts wala metric hai. Har change ek versioned config hai jo CI evals, shadow aur canary se guzarta hai, aur label flip se rollback hota hai. Runtime pe gateway timeouts, jittered retries, circuit breakers aur cross-provider fallback sambhalta hai, aur cost per task log karta hai."

**Galti mat karna:** `latest` jaise floating model aliases; LLM output ke liye exact-string tests; 400s retry karna ya teen layers me retry; untested fallbacks; cost per call report karna; A/B test ko user ki jagah request se split karna; proxy me stream buffer karna.
