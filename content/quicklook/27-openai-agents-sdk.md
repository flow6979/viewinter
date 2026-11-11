**Ek line:** Swarm ka chhota, production successor OpenAI se: `Agent` ek config hai (instructions, tools, handoffs, guardrails, `output_type`), aur `Runner` Responses API pe tool-calling loop chalata hai, sessions aur tracing built in (`openai-agents` 0.24 ke hisaab se).

- **Runner:** `Runner.run` (async), `run_sync` (scripts), `run_streamed` (token events); loop = model call → handoff / tools / final output; `max_turns` default 10 → `MaxTurnsExceeded`.
- **Tools:** `@function_tool` type hints + docstring se strict schema banata hai; pehla param `RunContextWrapper` model se chhupa; hosted tools (`WebSearchTool`, `FileSearchTool`, `CodeInterpreterTool`) sirf Responses API pe; MCP servers bhi judte hain.
- **Handoff vs agent-as-tool:** handoff = `transfer_to_<agent>` tool, naya agent chat own karta hai; `agent.as_tool()` = sub-run result lautata hai, caller incharge rehta hai.
- **Guardrails:** input guardrails sirf pehle agent pe, output sirf final agent pe; tripwire `InputGuardrailTripwireTriggered` raise karta hai; default parallel, kharche se pehle block ke liye `run_in_parallel=False`; tool guardrails har tool call cover karte hain.
- **Sessions:** dev ke liye `SQLiteSession`, prod me `SQLAlchemySession` / `RedisSession`, `EncryptedSession` wrapper; ya server-side `previous_response_id` / Conversations, ek run me dono kabhi nahi.
- **Context object:** `context=` user id, DB handles tools aur dynamic instructions tak le jaata hai; model ise nahi dekhta, isliye ownership tools me enforce karo.
- **`output_type`:** Pydantic schema response format ki tarah; `final_output` typed object; kharab JSON → `ModelBehaviorError`.
- **Human in the loop:** `needs_approval` (bool ya policy fn) → `result.interruptions` → `to_state()` → `approve` / `reject` → dobara run; ghanton ke liye persist karne ko `state.to_string()`.
- **Tracing:** default on, OpenAI ko; agent, generation, function, handoff, guardrail ke spans; Langfuse/OTel ke liye `add_trace_processor`; PII ke liye `trace_include_sensitive_data=False`.
- **Doosre models:** `litellm/...` ya `LitellmModel`, ya kisi compatible endpoint ke saath `OpenAIChatCompletionsModel`; hosted tools aur Responses-only features khote ho.
- **Extras:** `VoicePipeline` (STT → agent → TTS), `RealtimeAgent` (speech-to-speech), `SandboxAgent` (lambe tasks ke liye workspace).
- **Compare:** vs LangGraph (explicit graph + checkpoints), Claude Agent SDK (file/shell harness), Google ADK (Gemini-first workflow agents).

**Interview me bolo:** "Agents stateless config hain; Runner loop handoffs ko `transfer_to_` tools banata hai. Guardrails pehle agent pe ya tool guardrails ki tarah, risky tools persisted `RunState` ke saath `needs_approval` ke peeche, history SQLAlchemy session me, aur traces hamare apne backend me."

**Galti mat karna:** ise Swarm bolna; handoff se pahunche specialists pe input guardrails; refund limits sirf prompt me; load balancer ke peeche in-memory sessions; PII ke saath default tracing; LiteLLM models pe hosted tools ki ummeed.
