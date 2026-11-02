**In one line:** An agent resends its growing context every step, so cost grows faster than linearly; control it per task with three levers: fewer steps, fewer tokens per step, cheaper tokens.

- **Token economics:** output often ~3–5x input price and slow; reasoning tokens bill at the output rate; tool schemas ride every call (30 tools ≈ 4.5k tokens). Input is 10–20x the volume in agents.
- **Worked example:** 6 steps ≈ 49.5k input + 2.2k output ≈ $0.18 per task, ~7.5x a single call; caching the static prefix brings it to ~$0.128.
- **Routing + cascading:** a cheap classifier picks the model, or the small model answers and a check escalates; 40–70% saving; complex-sent-to-simple costs more, so bias the threshold.
- **Prompt caching:** exact prefix only; static first (system, tools in fixed order, few-shot), dynamic last; a timestamp at the top kills the hit rate.
- **Semantic cache:** similarity ≥ ~0.95 returns an old answer; never for personalized or time-sensitive data unless `user_id` is in the key; TTL + invalidation.
- **Tool-result cache:** read-only deterministic tools keyed on `(tool, normalized_args)` with TTL; never cache write tools (use idempotency).
- **Fewer steps:** task-shaped tools, parallel tool calls, clear stop instructions, workflows where steps are known, plan once and execute with a small model.
- **Latency:** TTFT and total latency; stream tokens and progress, parallel nodes, speculative read-only prefetch, small models for sub-steps, shorter output. Watch p95/p99 with step count.
- **Batch API:** ~50% cheaper for evals, bulk tagging, backfills; results in hours; map by `custom_id`, never on the online path.
- **Context control:** trim (never split tool_call / tool result), summarize with key facts kept as state fields, compact tool output, retrieval over stuffing a 1M window.
- **Budgets:** per call (`max_tokens`, timeout), per run (`recursion_limit`, token budget), per user/tenant (daily $ cap); exit gracefully. Distill/fine-tune only for high-volume, narrow, stable steps with an eval set.

**Say in the interview:** "I talk about cost per task, not per call: write the formula, then name the levers. And a latency budget in numbers: p95 6s = classify 300ms, parallel tools 1.2s, synthesis TTFT 800ms, then streaming."

**Avoid:** Looking only at output price; a big model as router; dynamic data at the start of the prompt; relying only on `recursion_limit` with no spend cap; average latency only; fine-tuning to teach facts.
