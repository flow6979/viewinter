**In one line:** LangChain 1.x is a provider-neutral layer for chat models, messages and tools, plus `create_agent`, a prebuilt tool-calling agent that runs on LangGraph and is customised with middleware.

- **Products:** LangChain = integrations + `create_agent`; LangGraph = runtime (state, checkpoints, interrupts); LangSmith = tracing, evals, deployment; Deep Agents = planning, virtual files, subagents on top.
- **Package split:** `langchain-core` (interfaces, Runnables), `langchain` (agents, messages, tools, `init_chat_model`), partner packages (`langchain-openai`, `langchain-anthropic`), `langchain-text-splitters`, `langchain-classic` for old chains. Python 3.10+.
- **What changed in 1.0 (Oct 2025):** chains and `AgentExecutor` replaced by `create_agent`; hooks became middleware; standard `content_blocks`; `.text` is a property; legacy code in `langchain-classic`.
- **Chat models:** `init_chat_model("openai:gpt-5.5")`; same `invoke`, `stream`, `batch`, `bind_tools`, `with_structured_output` for every provider; `usage_metadata` for tokens.
- **Tools:** `@tool` builds the schema from hints and docstring; `ToolRuntime` gives hidden access to `context`, `state`, `store` (replaces `InjectedState`). Never take `user_id` from model args.
- **`create_agent`:** returns a compiled LangGraph graph (model node + tools node in a loop); supports checkpointer, `thread_id`, streaming, interrupts, `context_schema`.
- **Middleware:** `before_agent`, `before_model`, `after_model`, `after_agent`, `wrap_model_call`, `wrap_tool_call`, `@dynamic_prompt`. Built-ins: Summarization, HumanInTheLoop, ModelCallLimit, ToolCallLimit, ModelFallback, ToolRetry, PII, LLMToolSelector.
- **Structured output:** `response_format=Schema`; `ProviderStrategy` (native) when supported, else `ToolStrategy` with validation retry; read `structured_response`.
- **RAG:** loaders → `RecursiveCharacterTextSplitter` → vector store → `as_retriever`; 2-step chain (1 call) vs retriever as a tool (agentic, 2–4 calls).
- **LCEL:** Runnables are still the core interface; `prompt | model | parser` fine for short linear chains; loops, approvals and agents belong in `create_agent` or LangGraph.
- **Production:** `PostgresSaver`, `stream_mode="messages"`/`"updates"` (node name now `model`, not `agent`), `LANGSMITH_TRACING=true`, evals in CI, call limits, pinned versions.

**Say in the interview:** "In 1.x the agent is one function on LangGraph, customised with middleware, with legacy chains moved out. I use it for integrations and the loop, keep tools as plain functions, and drop to LangGraph when I need custom control flow."

**Avoid:** 2023 imports like `LLMChain` or `initialize_agent`; `InMemorySaver` or `InMemoryVectorStore` in production; HITL middleware without a checkpointer; letting the model pass `user_id`; branching logic built in LCEL; calling LangChain and LangGraph competitors.
