**Ek line:** Production agent ek distributed system hai: stateless API, queue, graph chalane wale workers, har step save karne wala Postgres checkpointer, aur SSE/WebSocket se wapas stream hote events.

- **Serving:** API sirf auth, validation, rate limit, run create; workers queue depth pe scale, CPU pe nahi; one-way stream ke liye SSE, client beech me cancel/interrupt bheje to WebSocket.
- **Sync vs background:** seconds wali chat sync stream; minutes-ghanton ke tasks turant `run_id` dete hain aur worker crash pe last checkpoint se resume.
- **Durable execution:** checkpointer step-level resume deta hai, exactly-once nahi; aadha-hua node dobara chalta hai, isliye side effects pe idempotency key. Durability modes: `exit`, `async` (default), `sync`.
- **Platform vs FastAPI:** LangGraph Platform assistants, threads, runs, cron, streaming aur double-texting (`reject`, `enqueue`, `interrupt`, `rollback`) deta hai; FastAPI me ye sab khud banana, per-thread lock bhi.
- **Reliability:** RPM/TPM ke liye client-side token bucket, backoff + jitter sirf 429/5xx/timeout pe, model failover (fallback ka bhi eval), timeouts, circuit breakers, human tak graceful degradation.
- **Ek retry owner:** SDK 3 × node 3 × queue 3 = 27 calls; retries sirf ek layer pe.
- **Security:** secrets vault me, prompt ya traces me kabhi nahi; user identity runtime context se tools tak, LLM args se nahi; least privilege; tenant-scoped thread IDs, memory namespaces, vector filters; code tools sandbox me.
- **Versioning:** versioned prompts, pinned model snapshots (`latest` nahi), in-flight threads ke liye backward-compatible state schema; offline eval → shadow (write tools band) → 1–5% canary → full; rollback = config flip.
- **Human handoff:** triggers (user maange, sentiment, low confidence, policy limit, step limit, tool failures); `interrupt()` + ticket + context packet (summary, actions, `thread_id`); escalation rate core metric.
- **Case studies:** coding = ReAct + test verifier (repo context, sandbox); support = router + workflow + HITL (policy, fraud); deep research = orchestrator-workers + reflection (faithfulness, cost); text-to-SQL = schema RAG + self-correction (metric semantics).

**Interview me bolo:** "Agent run ek long-running job hai, request nahi: API aur worker alag, state checkpointer me. Background run + checkpointer + idempotent nodes = crash-safe agent, aur authorization tool layer pe."

**Galti mat karna:** Request handler me graph sync chalana in-memory state ke saath; exactly-once maan lena; har layer pe retry; floating model alias; bina context ka handoff; har case study ko multi-agent supervisor bana dena.
