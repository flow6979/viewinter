**In one line:** OpenAI's small, production successor to Swarm: an `Agent` is a config (instructions, tools, handoffs, guardrails, `output_type`), and `Runner` runs the tool-calling loop on the Responses API with sessions and tracing built in (written against `openai-agents` 0.24).

- **Runner:** `Runner.run` (async), `run_sync` (scripts), `run_streamed` (token events); loop = model call → handoff / tools / final output; `max_turns` default 10 → `MaxTurnsExceeded`.
- **Tools:** `@function_tool` builds a strict schema from type hints + docstring; first param `RunContextWrapper` is hidden from the model; hosted tools (`WebSearchTool`, `FileSearchTool`, `CodeInterpreterTool`) work only on the Responses API; MCP servers plug in too.
- **Handoff vs agent-as-tool:** handoff = `transfer_to_<agent>` tool, new agent owns the chat; `agent.as_tool()` = sub-run returns a result, caller stays in charge.
- **Guardrails:** input guardrails only on the first agent, output only on the final agent; tripwire raises `InputGuardrailTripwireTriggered`; parallel by default, `run_in_parallel=False` to block before spend; tool guardrails cover every tool call.
- **Sessions:** `SQLiteSession` for dev, `SQLAlchemySession` / `RedisSession` in prod, `EncryptedSession` wrapper; or server-side `previous_response_id` / Conversations, never both in one run.
- **Context object:** `context=` carries user id, DB handles to tools and dynamic instructions; the model never sees it, so enforce ownership in tools.
- **`output_type`:** Pydantic schema as response format; `final_output` is a typed object; bad JSON → `ModelBehaviorError`.
- **Human in the loop:** `needs_approval` (bool or policy fn) → `result.interruptions` → `to_state()` → `approve` / `reject` → run again; `state.to_string()` to persist for hours.
- **Tracing:** on by default to OpenAI; spans for agent, generation, function, handoff, guardrail; `add_trace_processor` for Langfuse/OTel; `trace_include_sensitive_data=False` for PII.
- **Other models:** `litellm/...` or `LitellmModel`, or `OpenAIChatCompletionsModel` with any compatible endpoint; you lose hosted tools and Responses-only features.
- **Extras:** `VoicePipeline` (STT → agent → TTS), `RealtimeAgent` (speech-to-speech), `SandboxAgent` (workspace for long tasks).
- **Compare:** vs LangGraph (explicit graph + checkpoints), Claude Agent SDK (file/shell harness), Google ADK (Gemini-first workflow agents).

**Say in the interview:** "Agents are stateless config; the Runner loop turns handoffs into `transfer_to_` tools. I put guardrails on the first agent or as tool guardrails, risky tools behind `needs_approval` with persisted `RunState`, history in a SQLAlchemy session, and traces in our own backend."

**Avoid:** calling it Swarm; input guardrails on specialists reached by handoff; refund limits only in the prompt; in-memory sessions behind a load balancer; default tracing with PII; expecting hosted tools on LiteLLM models.
