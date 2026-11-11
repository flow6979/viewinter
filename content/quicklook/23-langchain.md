**Ek line:** LangChain 1.x chat models, messages aur tools ke liye provider-neutral layer hai, plus `create_agent`, ek prebuilt tool-calling agent jo LangGraph pe chalta hai aur middleware se customise hota hai.

- **Products:** LangChain = integrations + `create_agent`; LangGraph = runtime (state, checkpoints, interrupts); LangSmith = tracing, evals, deployment; Deep Agents = upar planning, virtual files, subagents.
- **Package split:** `langchain-core` (interfaces, Runnables), `langchain` (agents, messages, tools, `init_chat_model`), partner packages (`langchain-openai`, `langchain-anthropic`), `langchain-text-splitters`, purani chains ke liye `langchain-classic`. Python 3.10+.
- **1.0 me kya badla (Oct 2025):** chains aur `AgentExecutor` ki jagah `create_agent`; hooks middleware bane; standard `content_blocks`; `.text` property hai; legacy code `langchain-classic` me.
- **Chat models:** `init_chat_model("openai:gpt-5.5")`; har provider ke liye same `invoke`, `stream`, `batch`, `bind_tools`, `with_structured_output`; tokens ke liye `usage_metadata`.
- **Tools:** `@tool` hints aur docstring se schema banata hai; `ToolRuntime` `context`, `state`, `store` tak chhupa access deta hai (`InjectedState` ki jagah). `user_id` kabhi model args se mat lo.
- **`create_agent`:** compiled LangGraph graph lautata hai (loop me model node + tools node); checkpointer, `thread_id`, streaming, interrupts, `context_schema` support.
- **Middleware:** `before_agent`, `before_model`, `after_model`, `after_agent`, `wrap_model_call`, `wrap_tool_call`, `@dynamic_prompt`. Built-ins: Summarization, HumanInTheLoop, ModelCallLimit, ToolCallLimit, ModelFallback, ToolRetry, PII, LLMToolSelector.
- **Structured output:** `response_format=Schema`; support ho to `ProviderStrategy` (native), warna validation retry ke saath `ToolStrategy`; `structured_response` padho.
- **RAG:** loaders → `RecursiveCharacterTextSplitter` → vector store → `as_retriever`; 2-step chain (1 call) vs tool ki tarah retriever (agentic, 2–4 calls).
- **LCEL:** Runnables ab bhi core interface; chhoti seedhi chains ke liye `prompt | model | parser` theek; loops, approvals aur agents `create_agent` ya LangGraph me.
- **Production:** `PostgresSaver`, `stream_mode="messages"`/`"updates"` (node name ab `model`, `agent` nahi), `LANGSMITH_TRACING=true`, CI me evals, call limits, pinned versions.

**Interview me bolo:** "1.x me agent LangGraph pe ek function hai, middleware se customise hota hai, aur legacy chains bahar hain. Main ise integrations aur loop ke liye use karta hoon, tools plain functions rakhta hoon, aur custom control flow chahiye to LangGraph pe utarta hoon."

**Galti mat karna:** `LLMChain` ya `initialize_agent` jaise 2023 imports; production me `InMemorySaver` ya `InMemoryVectorStore`; bina checkpointer HITL middleware; model ko `user_id` dene dena; LCEL me branching logic; LangChain aur LangGraph ko competitors bolna.
