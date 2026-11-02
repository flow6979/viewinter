**In one line:** A production agent is a distributed system: stateless API, queue, workers running the graph, a Postgres checkpointer saving every step, and events streamed back over SSE/WebSocket.

- **Serving:** API does auth, validation, rate limit, create run; workers scale on queue depth, not CPU; SSE for one-way streams, WebSocket when the client sends cancel/interrupt mid-run.
- **Sync vs background:** seconds-long chats stream sync; minutes-to-hours tasks return a `run_id` and resume from the last checkpoint after a worker crash.
- **Durable execution:** the checkpointer gives step-level resume, not exactly-once; the half-done node re-runs, so side effects need idempotency keys. Durability modes: `exit`, `async` (default), `sync`.
- **Platform vs FastAPI:** LangGraph Platform gives assistants, threads, runs, cron, streaming and double-texting (`reject`, `enqueue`, `interrupt`, `rollback`); FastAPI means building these yourself, including a per-thread lock.
- **Reliability:** client-side token bucket for RPM/TPM, backoff + jitter only on 429/5xx/timeout, model failover (eval the fallback too), timeouts, circuit breakers, graceful degradation to a human.
- **Single retry owner:** SDK 3 × node 3 × queue 3 = 27 calls; one layer owns retries.
- **Security:** secrets in a vault, never in prompts or traces; user identity reaches tools via runtime context, not LLM args; least privilege; tenant-scoped thread IDs, memory namespaces, vector filters; sandboxed code tools.
- **Versioning:** versioned prompts, pinned model snapshots (no `latest`), backward-compatible state schema for in-flight threads; offline eval → shadow (write tools off) → 1–5% canary → full; rollback as a config flip.
- **Human handoff:** triggers (user asks, sentiment, low confidence, policy limit, step limit, tool failures); `interrupt()` + ticket + context packet (summary, actions, `thread_id`); escalation rate is a core metric.
- **Case studies:** coding = ReAct + test verifier (repo context, sandbox); support = router + workflow + HITL (policy, fraud); deep research = orchestrator-workers + reflection (faithfulness, cost); text-to-SQL = schema RAG + self-correction (metric semantics).

**Say in the interview:** "An agent run is a long-running job, not a request: I separate API from worker and keep state in the checkpointer. Background run + checkpointer + idempotent nodes = crash-safe agent, and authorization lives at the tool layer."

**Avoid:** Running the graph synchronously in the request handler with in-memory state; assuming exactly-once; retries at every layer; a floating model alias; a handoff with no context; making every case study a multi-agent supervisor.
