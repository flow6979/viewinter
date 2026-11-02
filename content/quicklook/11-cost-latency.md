**Ek line:** Agent har step pe badhta hua context dobara bhejta hai, isliye cost linear se tez badhta hai; per task teen levers se control karo: kam steps, har step me kam tokens, saste tokens.

- **Token economics:** output aksar input se ~3–5x mehenga aur slow; reasoning tokens output rate pe; tool schemas har call me jaate hain (30 tools ≈ 4.5k tokens). Agents me input volume 10–20x hota hai.
- **Worked example:** 6 steps ≈ 49.5k input + 2.2k output ≈ $0.18 per task, single call ka ~7.5x; static prefix cache karo to ~$0.128.
- **Routing + cascading:** sasta classifier model chunta hai, ya chhota model jawab de aur check fail pe escalate; 40–70% bachat; complex ko simple pe bhejna zyada mehenga, threshold usi taraf bias karo.
- **Prompt caching:** sirf exact prefix; static pehle (system, fixed order me tools, few-shot), dynamic baad me; top pe timestamp = hit rate zero.
- **Semantic cache:** similarity ≥ ~0.95 pe purana jawab; personalized ya time-sensitive data pe kabhi nahi, jab tak key me `user_id` na ho; TTL + invalidation.
- **Tool-result cache:** read-only deterministic tools, key `(tool, normalized_args)`, TTL ke saath; write tools kabhi cache nahi (idempotency use karo).
- **Kam steps:** task-shaped tools, parallel tool calls, clear stop instruction, steps pata ho to workflow, plan ek baar aur chhote model se execute.
- **Latency:** TTFT aur total latency; tokens aur progress stream karo, parallel nodes, speculative read-only prefetch, sub-steps pe chhote models, chhota output. Step count ke saath p95/p99 dekho.
- **Batch API:** evals, bulk tagging, backfills ke liye ~50% sasta; results ghanton me; `custom_id` se map karo, online path pe kabhi nahi.
- **Context control:** trim (tool_call / tool result pair mat todo), summarize aur key facts state fields me, tool output compact, 1M window bharne ki jagah retrieval.
- **Budgets:** per call (`max_tokens`, timeout), per run (`recursion_limit`, token budget), per user/tenant (daily $ cap); graceful exit. Distill/fine-tune sirf high-volume, narrow, stable step pe, eval set ke saath.

**Interview me bolo:** "Cost per task ki baat karta hoon, per call nahi: formula likho, phir levers batao. Aur latency budget numbers me: p95 6s = classify 300ms, parallel tools 1.2s, synthesis TTFT 800ms, phir streaming."

**Galti mat karna:** Sirf output price dekhna; router me bada model; prompt ke shuru me dynamic data; spend cap ke bina sirf `recursion_limit` pe bharosa; sirf average latency; facts sikhane ke liye fine-tuning.
