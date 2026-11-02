**Ek line:** LangGraph agents ko graph + typed shared state + cycles + persistence ki tarah banata hai, HITL aur time-travel built-in; chains DAG hain, na loop na saved state.

- **Execution model:** Pregel-style supersteps; active nodes parallel chalte hain, reducers updates merge karte hain, phir checkpoint save.
- **State + reducers:** node sirf badle hue keys return kare; reducer nahi = overwrite, `operator.add` = lists concat (fan-out ke liye zaroori), `add_messages` = append, same `id` pe replace, `RemoveMessage` se delete.
- **Edges:** normal edge = hamesha next; conditional edge state dekh ke route; `Command(goto, update)` node ke andar se route + update (multi-agent handoff).
- **Compile:** `compile()` pe checkpointer, store, interrupts lagte hain; `invoke`/`ainvoke`/`stream`/`astream` se chalao; builder badla to dobara compile.
- **Checkpointer:** har superstep pe `thread_id` ke against `StateSnapshot`; turns ke beech memory, pause/resume, fault tolerance. Tests me `InMemorySaver`, production me `PostgresSaver`.
- **Time-travel:** `get_state_history` se purana checkpoint, `invoke(None, old_config)` = replay; purane config pe `update_state` = fork.
- **Human-in-the-loop:** `interrupt(payload)` graph rokta hai; `Command(resume=value)` pe node shuru se dobara chalta hai, isliye usse pehle ke side effects idempotent rakho.
- **Streaming modes:** `values` (poora state), `updates` (diff), `messages` (LLM tokens), `custom` (`get_stream_writer`), `debug`.
- **Error handling:** `recursion_limit` (ek ReAct round = 2 supersteps) pe `GraphRecursionError`; transient errors pe `RetryPolicy`; fallback model; timeouts.
- **Store:** namespace tuple se cross-thread key-value memory (optional semantic search); checkpointer = thread memory, Store = user memory.
- **Hand-built agent:** `MessagesState` + LLM node + `ToolNode` + `tools_condition` + tools se wapas agent ka edge; `create_agent` iska one-liner.

**Interview me bolo:** "LangGraph orchestration runtime hai, LLM wrapper nahi. Durable execution, HITL aur cycles ke liye leta hoon: thread memory ke liye checkpointer, cross-thread ke liye Store, aur irreversible tool se theek pehle approval gate."

**Galti mat karna:** State ko in-place mutate karna; production me `InMemorySaver` ya har request pe naya random `thread_id`; `interrupt()` ko `try/except` me lapetna; loop fix karne ki jagah `recursion_limit` 1000 kar dena.
