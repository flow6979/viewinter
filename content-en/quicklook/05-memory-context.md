**In one line:** The LLM is stateless; memory is your code choosing what to save, when to bring it back and when to forget, and context engineering keeps only necessary, correct, fresh tokens in the window.

- **Short-term:** state + checkpointer per `thread_id`; `PostgresSaver`/`RedisSaver` in production, `InMemorySaver` loses everything on restart.
- **Trimming:** `trim_messages` shrinks only the view sent to the LLM, not state; never split a tool_call / tool_result pair (`start_on="human"`).
- **Summarization:** running summary of old messages plus the last few turns verbatim; never drop IDs, amounts, commitments; beware summary drift; run it in the background.
- **Long-term (CoALA):** semantic = facts (profile or collection), episodic = past successful runs as few-shot, procedural = the agent's own rules/prompt.
- **Store:** cross-thread key-value + optional semantic search by `namespace` tuple; the namespace is the access boundary, so take `user_id` from trusted context.
- **Hot path vs background:** a `save_memory` tool is fresh but adds latency; debounced background extraction (idle 5–10 min) sees existing memories and decides insert/update/delete.
- **Context engineering:** write (scratchpad, offload big tool output to files), select (relevant memories, tools, docs), compress (trim, summarize, prune), isolate (sub-agent with a fresh window).
- **Context rot:** accuracy drops as tokens grow; lost-in-the-middle; also poisoning, distraction, confusion, clash. Instructions at the start, the question at the end.
- **Prompt caching:** identical prefix becomes ~10% price; order tools → system → static docs → history → latest message; timestamps or random tool order break it.
- **Privacy + staleness:** per-user namespace, never store PII, user can view/delete, TTL for volatile facts, `updated_at`, consolidate conflicts with UPDATE/DELETE/NOOP/ADD.

**Say in the interview:** "Context is a budget: every tool output has a token cap, big outputs go to files, deep research goes to sub-agents that return a summary. Memory is a cache, not a source of truth; transactional facts come from the API."

**Avoid:** "We have a 1M window, put everything in"; `InMemorySaver` in production; all users in one namespace; append-only memory full of contradictions; changing the prefix every turn and wondering why caching fails.
