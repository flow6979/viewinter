**Ek line:** Agentic AI round teen cheezein check karta hai: concepts clear, end-to-end design, aur numbers ke saath trade-offs; har trade-off me default, kab switch karoge, aur kaise naapoge, teeno bolo.

- **Crisp concepts:** agent vs workflow (agla step kaun decide karta), ReAct, state/node/edge, checkpointer + `thread_id`, `interrupt()` + `Command(resume=...)`.
- **Patterns + memory:** 5 workflow patterns, supervisor vs swarm, short-term (checkpointer) vs long-term (namespaced store), context engineering (write, select, compress, isolate), agentic vs classic RAG.
- **Tools + safety:** task-shaped typed tools, idempotent writes; MCP = agent ↔ tools, A2A = agent ↔ agent; injection ka ek fix nahi, private data + untrusted input + external action kabhi ek jagah nahi.
- **Evals + ops:** final output, trajectory, single step; calibrated judges; har run ka trace; cost levers (routing, caching, kam steps); runaway rokna (`recursion_limit`, token aur $ caps, loop detection).
- **Production jawab:** crash resume ke liye idempotent writes; ship = pinned models, eval gate, shadow, 1–5% canary, rollback; tenant isolation me LLM args pe bharosa nahi.
- **Design, support agent:** router + mostly-workflow subgraphs, idempotent `issue_refund`, policy engine code me, high value pe HITL, streaming ke saath p95 < 5s.
- **Design, deep research:** planner → `Send` se parallel researchers → citations wala synthesizer → critic (max 2 rounds); background run; researchers compressed notes + URLs lautayein; pehle budget aur stopping criteria.
- **Design, code review:** orchestrator diff ko security/correctness/style reviewers me baantta, aggregator severity se dedupe; sandbox, read-only token, auto-merge kabhi nahi; recall se zyada precision.
- **Trade-offs:** framework vs custom, single vs multi-agent (3–10x tokens), RAG vs long context, fine-tune vs prompt vs RAG, open vs closed (GPU ops cost bhi gino).
- **45-minute flow:** 0–5 clarify, 5–10 requirements + agent-vs-workflow, 10–20 diagram, 20–30 deep dive, 30–38 evals/observability/cost, 38–43 failures/rollout, 43–45 recap.
- **Red flags:** har cheez ka jawab multi-agent ya bada model, evals nahi, auth prompt me, idempotency ke bina retries, numbers ya budgets nahi, pinned versions nahi.

**Interview me bolo:** "Policy engine code me hai, LLM sirf samjhata hai. Decision eval set aur cost per task naap ke lunga." Evals, budgets, idempotency aur tool-layer auth bina poochhe khud bolo.

**Galti mat karna:** Sirf happy path design karna ("tool fail ho to?" hamesha aata hai); 20 minute prompts likhne me aur evals tak pahunchna hi nahi; "fine-tuning se hallucination khatam" jaise absolute claims.
