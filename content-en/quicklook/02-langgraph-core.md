**In one line:** LangGraph builds agents as graph + typed shared state + cycles + persistence, with HITL and time-travel built in; chains are DAGs with no loop and no saved state.

- **Execution model:** Pregel-style supersteps; active nodes run in parallel, reducers merge updates, then a checkpoint is saved.
- **State + reducers:** a node returns only changed keys; no reducer = overwrite, `operator.add` = concat lists (needed for fan-out), `add_messages` = append, replace by `id`, delete via `RemoveMessage`.
- **Edges:** normal edge always runs next; conditional edge routes on state; `Command(goto, update)` routes and updates from inside a node (multi-agent handoff).
- **Compile:** `compile()` attaches checkpointer, store and interrupts; run with `invoke`/`ainvoke`/`stream`/`astream`; recompile after changing the builder.
- **Checkpointer:** saves a `StateSnapshot` per superstep per `thread_id`; gives memory across turns, pause/resume, fault tolerance. `InMemorySaver` for tests, `PostgresSaver` for production.
- **Time-travel:** `get_state_history` then `invoke(None, old_config)` = replay; `update_state` on an old config = fork.
- **Human-in-the-loop:** `interrupt(payload)` pauses; `Command(resume=value)` re-runs the node from the start, so side effects before it must be idempotent.
- **Streaming modes:** `values` (full state), `updates` (diff), `messages` (LLM tokens), `custom` (`get_stream_writer`), `debug`.
- **Error handling:** `recursion_limit` (one ReAct round = 2 supersteps) raises `GraphRecursionError`; `RetryPolicy` for transient errors; fallback models; timeouts.
- **Store:** cross-thread key-value memory by namespace tuple (optional semantic search); checkpointer = thread memory, Store = user memory.
- **Hand-built agent:** `MessagesState` + LLM node + `ToolNode` + `tools_condition` + edge from tools back to agent; `create_agent` is the one-liner.

**Say in the interview:** "LangGraph is an orchestration runtime, not an LLM wrapper. I pick it for durable execution, HITL and cycles: checkpointer for thread memory, Store for cross-thread memory, and an approval gate right before irreversible tools."

**Avoid:** Mutating state in place; `InMemorySaver` or a random `thread_id` per request in production; wrapping `interrupt()` in `try/except`; raising `recursion_limit` to 1000 instead of fixing the loop.
