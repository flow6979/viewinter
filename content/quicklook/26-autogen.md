**Ek line:** AutoGen agents ko termination conditions wale shared group chat se coordinate karta hai; ye ab maintenance mode me hai, aur Microsoft Agent Framework (April 2026 me GA, Python aur .NET) AutoGen ke patterns ko Semantic Kernel ke enterprise features ke saath merge karta hai aur naye projects ko yahi chunna chahiye.

- **Timeline:** Semantic Kernel (2023) → AutoGen 0.2 (late 2023) → 0.2 ka AG2 fork (Nov 2024) → AutoGen 0.4 rewrite (Jan 2025) → Agent Framework preview (Oct 2025), AutoGen aur SK maintenance me → Agent Framework 1.0 GA (Apr 2026).
- **Packages:** `autogen-agentchat` / `autogen-core` / `autogen-ext` = Microsoft AutoGen; `autogen`, `pyautogen`, `ag2` = AG2 fork; `agent-framework` = MAF; `semantic-kernel` = SK.
- **AutoGen 0.4+ layers:** Core (async actor runtime, typed messages, topics, distributed gRPC runtime), AgentChat (agents, teams, termination), Extensions (model clients, Docker code executor, MCP workbench).
- **AssistantAgent:** model client + system message + tools; default ek tool round jo raw tool output lautata hai; `reflect_on_tool_use=True` ya zyada `max_tool_iterations`; `handoffs`, `output_content_type`, `model_context`.
- **Teams:** RoundRobin (fixed turns), Selector (LLM speaker chunta hai, har turn +1 call, `selector_func`), Swarm (handoff tools), MagenticOne (ledgers wala orchestrator), GraphFlow (`DiGraphBuilder`, conditional edges, loops).
- **Termination:** MaxMessage, TextMention, TokenUsage, Timeout, Handoff, FunctionCall, External; `|` aur `&` se combine; hamesha semantic stop plus hard caps.
- **Code execution:** coder `AssistantAgent` + `DockerCommandLineCodeExecutor` wala `CodeExecutorAgent`; server pe local executor kabhi nahi.
- **AutoGen Studio:** prototyping ke liye local low-code UI, JSON teams export karta hai; production ke liye nahi. MAF me DevUI hai.
- **Agent Framework:** `Agent(client=..., instructions, tools)` default se tools pe loop karta hai; multi-turn ke liye `create_session()`; `@tool(approval_mode=...)`; middleware; context providers; MCP; OpenTelemetry.
- **MAF workflows:** `WorkflowBuilder` + executors + edges (conditions, fan-out, loops), typed messages, supersteps, checkpoint storage, human approval ke liye `request_info`; orchestrations Sequential, Concurrent, GroupChat, Handoff, Magentic.
- **Migration map:** RoundRobin → Sequential, Selector → GroupChat, Swarm → Handoff, MagenticOne → Magentic, GraphFlow → WorkflowBuilder, `save_state` → checkpoints.

**Interview me bolo:** "AutoGen dead nahi par sirf maintenance me hai; naya Microsoft-stack kaam Agent Framework pe jaata hai, jo AutoGen ke multi-agent patterns rakhta hai aur SK ka middleware aur telemetry plus checkpointed workflows jodta hai. Paise ya approvals wali cheez ke liye main code gate wala workflow use karta hoon, aur agents sirf open steps ke liye."

**Galti mat karna:** Microsoft 0.4 tutorial ke liye `pip install autogen`; AG2 ko "naya AutoGen" bolna; sirf keyword termination; server pe local code executor; preview-era MAF naam (`ChatAgent`, `chat_client=`, threads); session pass karna bhoolna; users ke beech ek team object share karna.
