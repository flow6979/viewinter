**In one line:** Agentic AI rounds check three things: clear concepts, end-to-end design, and trade-offs argued with numbers; for every trade-off say the default, when you would switch, and how you would measure.

- **Concepts to say crisply:** agent vs workflow (who decides the next step), ReAct, state/node/edge, checkpointer + `thread_id`, `interrupt()` + `Command(resume=...)`.
- **Patterns + memory:** 5 workflow patterns, supervisor vs swarm, short-term (checkpointer) vs long-term (namespaced store), context engineering (write, select, compress, isolate), agentic vs classic RAG.
- **Tools + safety:** task-shaped typed tools with idempotent writes; MCP = agent ↔ tools, A2A = agent ↔ agent; no single fix for injection, never combine private data + untrusted input + external action.
- **Evals + ops:** final output, trajectory, single step; calibrated judges; traces per run; cost levers (routing, caching, fewer steps); runaway stops (`recursion_limit`, token and $ caps, loop detection).
- **Production answers:** crash resume needs idempotent writes; ship via pinned models, eval gate, shadow, 1–5% canary, rollback; tenant isolation never trusts LLM args.
- **Design, support agent:** router + mostly-workflow subgraphs, idempotent `issue_refund`, policy engine in code, HITL for high value, p95 < 5s with streaming.
- **Design, deep research:** planner → parallel researchers via `Send` → cited synthesizer → critic (max 2 rounds); background run; researchers return compressed notes + URLs; set budget and stopping criteria first.
- **Design, code review:** orchestrator splits the diff to security/correctness/style reviewers, aggregator dedupes by severity; sandbox, read-only token, never auto-merge; precision over recall.
- **Trade-offs:** framework vs custom, single vs multi-agent (3–10x tokens), RAG vs long context, fine-tune vs prompt vs RAG, open vs closed (count GPU ops cost).
- **45-minute flow:** 0–5 clarify, 5–10 requirements + agent-vs-workflow, 10–20 diagram, 20–30 deep dive, 30–38 evals/observability/cost, 38–43 failures/rollout, 43–45 recap.
- **Red flags:** multi-agent or a bigger model for everything, no evals, auth in the prompt, retries without idempotency, no numbers or budgets, no pinned versions.

**Say in the interview:** "The policy engine is in code; the LLM only explains. I'd decide by measuring on the eval set and cost per task." Raise evals, budgets, idempotency and tool-layer auth before you are asked.

**Avoid:** Designing only the happy path ("what if the tool fails?" always comes); spending 20 minutes on prompts and never reaching evals; absolute claims like "fine-tuning removes hallucination".
