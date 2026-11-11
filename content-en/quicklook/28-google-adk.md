**In one line:** Google's code-first agent framework (written against `google-adk` 2.x): `LlmAgent` for LLM-driven steps, workflow agents or the 2.0 `Workflow` graph for fixed control flow, a `Runner` that turns every step into an event, and session services that persist events and state.

- **`LlmAgent` (`Agent`):** `instruction` (system prompt, reads state via `{key}` or `{key?}`), `description` (used by the parent to route), `tools`, `sub_agents`, `output_key` (saves final text to state), `output_schema`.
- **Workflow agents:** `SequentialAgent` (shared state, in order), `ParallelAgent` (unique `output_key` per branch), `LoopAgent` (`max_iterations`, stop with `exit_loop` / `escalate`). Zero LLM calls for routing.
- **ADK 2.0 (GA May 2026):** graph Workflow Runtime: `Workflow(edges=[(START, a, b)])`, routes via `Event(route=...)`, `JoinNode` fan-in, retries, HITL, resume, `@node(rerun_on_resume=True)` + `ctx.run_node`. Fixed workflow agents are superseded for new code.
- **Tools:** plain functions (schema from type hints + docstring), `ToolContext` for state, built-ins like `google_search` (keep in its own agent), `AgentTool` (call an agent like a function), `McpToolset`, `OpenAPIToolset`, tool confirmation.
- **Transfer vs `AgentTool`:** transfer hands the conversation over; `AgentTool` returns the answer to a parent that stays in control.
- **Sessions:** `InMemorySessionService` (dev), `DatabaseSessionService` (Postgres), `VertexAiSessionService`. State prefixes: none = session, `user:`, `app:`, `temp:` (not saved). Change state only via events (`state_delta`).
- **Memory:** `InMemoryMemoryService`, `VertexAiMemoryBankService`; `add_session_to_memory`, read with `load_memory` or `PreloadMemoryTool`.
- **Callbacks:** before/after agent, model, tool. Return a value from a "before" callback to skip the real step: the place for guardrails and caching.
- **Runner loop:** load session, run agent, each yielded event is committed with its `state_delta` before the agent continues; final response = text with no tool calls.
- **Models:** Gemini by name; others via `LiteLlm(model="anthropic/...")`. Gemini built-in tools do not work through LiteLLM.
- **Dev, eval, deploy:** `adk web` / `adk run` / `adk api_server --a2a`; `adk eval` scores tool trajectory and response; deploy to Cloud Run or Vertex AI Agent Engine; OTel traces; A2A via `to_a2a` and `RemoteA2aAgent`.
- **2.0 upgrade gotchas:** new event fields (`node_info`, `output`), do not append to `session.events`, no broad `except Exception` in tools (kills retries), nodes may rerun on resume so make side effects idempotent.

**Say in the interview:** "LLM for judgment, workflows for fixed steps. State moves between agents through session state as event deltas. Policies live in `before_tool_callback`, not the prompt. On Google Cloud with Gemini I pick ADK for its Dev UI, eval and Agent Engine; for provider-neutral complex flows, LangGraph."

**Avoid:** `InMemorySessionService` in production; vague sub-agent descriptions; giving every agent every tool; mixing `google_search` with function tools in one agent; editing a fetched `session.state` directly; non-idempotent refund tools in a resumable 2.0 workflow.
