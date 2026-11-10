**In one line:** LLMOps is running LLM features after launch: ship prompt and model changes behind evals and canaries, survive provider failures with retries and fallbacks, and manage cost per task and streaming latency.

- **Why it is different:** failures are silent (bad answers still return HTTP 200), output is non-deterministic, providers change or retire models, and cost scales with tokens, not requests.
- **Versioned config:** prompt + pinned model snapshot + params + tools = one immutable config ID (`support_reply@v15`); every trace logs it; rollback = move the `production` label, not a redeploy.
- **Prompt CI:** golden set of 200–500 cases on every PR, code checks + LLM judge, gates on quality drop, cost rise and p95; noise on 200 cases at 88% is about ±4.5 points, so compare paired flips and run 3–5 samples.
- **Rollout:** offline eval → shadow (write tools off) → sticky canary by user ID (1–5%) → ramp, with guardrail metrics (task success, thumbs, escalation, cost, p95) and auto-rollback.
- **Sample size:** users per arm ≈ 16·p(1−p)/δ²; 80% → 82% needs ~6,400 per arm; sparse thumbs need far more traffic.
- **Reliability:** TPM is usually the real limit; timeout every call; retry only 408/429/5xx/timeouts with full-jitter backoff; honour `Retry-After`; retry in one layer only; circuit breaker after ~50% failures.
- **Fallbacks via gateway:** logical model name → chain across providers (LiteLLM-style), each fallback with its own tested prompt; watch context window, JSON/tool behaviour, tokenizer and data rules.
- **Side effects:** idempotency key `run_id:step_id` on refunds/emails so retries cannot act twice; hedge only read-only calls, on TTFT, and capped.
- **Cost per task:** sum all calls + retries (example ≈ $0.05 vs "$0.01 per call"); prompt caching (~10% price on cached prefix), routing easy tasks to small models, batch API (~50% off, async only).
- **Budgets and alerts:** limits per request, run, user, tenant and globally; tag calls by feature/config/tenant; alert on spend rate (1.5x last week's hour).
- **Streaming:** total ≈ TTFT + output tokens ÷ tokens/s (0.8s + 300/60 = 5.8s); stream over SSE, show progress, parallel tool calls; budget p50/p95/p99, not averages.
- **Monitoring and migration:** dashboards for health, latency, cost, quality (online judge on 1–5%), safety, feedback, all split by config; drift checks; migrate models with golden set, prompt re-tune, shadow, canary, old snapshot as fallback.

**Say in the interview:** "LLM failures are silent and statistical, so quality is a metric with alerts. Every change is a versioned config that goes through CI evals, shadow and canary, and rolls back with a label flip. At runtime a gateway handles timeouts, jittered retries, circuit breakers and cross-provider fallback, and logs cost per task."

**Avoid:** floating model aliases like `latest`; exact-string tests for LLM output; retrying 400s or retrying in three layers; untested fallbacks; reporting cost per call; splitting A/B tests by request instead of user; buffering a stream in a proxy.
