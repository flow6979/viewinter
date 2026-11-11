**Ek line:** Google ka code-first agent framework (`google-adk` 2.x ke hisaab se): LLM-driven steps ke liye `LlmAgent`, fixed control flow ke liye workflow agents ya 2.0 ka `Workflow` graph, `Runner` jo har step ko event banata hai, aur session services jo events aur state persist karti hain.

- **`LlmAgent` (`Agent`):** `instruction` (system prompt, `{key}` ya `{key?}` se state padhta), `description` (parent routing ke liye padhta), `tools`, `sub_agents`, `output_key` (final text state me save), `output_schema`.
- **Workflow agents:** `SequentialAgent` (shared state, order me), `ParallelAgent` (har branch ka unique `output_key`), `LoopAgent` (`max_iterations`, `exit_loop` / `escalate` se roko). Routing pe zero LLM calls.
- **ADK 2.0 (GA May 2026):** graph Workflow Runtime: `Workflow(edges=[(START, a, b)])`, `Event(route=...)` se routes, `JoinNode` fan-in, retries, HITL, resume, `@node(rerun_on_resume=True)` + `ctx.run_node`. Naye code ke liye fixed workflow agents superseded.
- **Tools:** plain functions (type hints + docstring se schema), state ke liye `ToolContext`, `google_search` jaise built-ins (alag agent me rakho), `AgentTool` (agent ko function ki tarah call), `McpToolset`, `OpenAPIToolset`, tool confirmation.
- **Transfer vs `AgentTool`:** transfer conversation saunp deta hai; `AgentTool` jawab parent ko lautata hai jo control me rehta hai.
- **Sessions:** `InMemorySessionService` (dev), `DatabaseSessionService` (Postgres), `VertexAiSessionService`. State prefixes: none = session, `user:`, `app:`, `temp:` (save nahi). State sirf events (`state_delta`) se badlo.
- **Memory:** `InMemoryMemoryService`, `VertexAiMemoryBankService`; `add_session_to_memory`, padhne ke liye `load_memory` ya `PreloadMemoryTool`.
- **Callbacks:** agent, model, tool ke before/after. "Before" callback se value lautao to asli step skip: guardrails aur caching ki jagah.
- **Runner loop:** session load, agent run, har yield hua event apne `state_delta` ke saath commit hota hai, phir agent aage; final response = bina tool calls ka text.
- **Models:** Gemini naam se; baaki `LiteLlm(model="anthropic/...")` se. Gemini built-in tools LiteLLM ke through nahi chalte.
- **Dev, eval, deploy:** `adk web` / `adk run` / `adk api_server --a2a`; `adk eval` tool trajectory aur response score karta hai; Cloud Run ya Vertex AI Agent Engine pe deploy; OTel traces; `to_a2a` aur `RemoteA2aAgent` se A2A.
- **2.0 upgrade gotchas:** naye event fields (`node_info`, `output`), `session.events` me khud append mat karo, tools me broad `except Exception` nahi (retries band), resume pe nodes dobara chal sakte hain to side effects idempotent rakho.

**Interview me bolo:** "Judgment ke liye LLM, fixed steps ke liye workflows. Agents ke beech state session state me event deltas ki tarah jaati hai. Policies `before_tool_callback` me, prompt me nahi. Google Cloud aur Gemini pe main ADK chunta hoon uske Dev UI, eval aur Agent Engine ke liye; provider-neutral complex flows ke liye LangGraph."

**Galti mat karna:** production me `InMemorySessionService`; vague sub-agent descriptions; har agent ko har tool; ek agent me `google_search` aur function tools mix; fetch kiye `session.state` ko seedha edit karna; resumable 2.0 workflow me non-idempotent refund tools.
