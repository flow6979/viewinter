**In one line:** AutoGen coordinates agents through a shared group chat with termination conditions; it is now in maintenance mode, and Microsoft Agent Framework (GA April 2026, Python and .NET) merges AutoGen's patterns with Semantic Kernel's enterprise features and is what new projects should pick.

- **Timeline:** Semantic Kernel (2023) → AutoGen 0.2 (late 2023) → AG2 fork of 0.2 (Nov 2024) → AutoGen 0.4 rewrite (Jan 2025) → Agent Framework preview (Oct 2025), AutoGen and SK to maintenance → Agent Framework 1.0 GA (Apr 2026).
- **Packages:** `autogen-agentchat` / `autogen-core` / `autogen-ext` = Microsoft AutoGen; `autogen`, `pyautogen`, `ag2` = AG2 fork; `agent-framework` = MAF; `semantic-kernel` = SK.
- **AutoGen 0.4+ layers:** Core (async actor runtime, typed messages, topics, distributed gRPC runtime), AgentChat (agents, teams, termination), Extensions (model clients, Docker code executor, MCP workbench).
- **AssistantAgent:** model client + system message + tools; default one tool round returning raw tool output; `reflect_on_tool_use=True` or higher `max_tool_iterations`; `handoffs`, `output_content_type`, `model_context`.
- **Teams:** RoundRobin (fixed turns), Selector (LLM picks speaker, +1 call per turn, `selector_func`), Swarm (handoff tools), MagenticOne (orchestrator with ledgers), GraphFlow (`DiGraphBuilder`, conditional edges, loops).
- **Termination:** MaxMessage, TextMention, TokenUsage, Timeout, Handoff, FunctionCall, External; combine with `|` and `&`; always a semantic stop plus hard caps.
- **Code execution:** coder `AssistantAgent` + `CodeExecutorAgent` with `DockerCommandLineCodeExecutor`; never the local executor on a server.
- **AutoGen Studio:** local low-code UI for prototyping, exports JSON teams; not for production. MAF has DevUI.
- **Agent Framework:** `Agent(client=..., instructions, tools)` loops over tools by default; `create_session()` for multi-turn; `@tool(approval_mode=...)`; middleware; context providers; MCP; OpenTelemetry.
- **MAF workflows:** `WorkflowBuilder` + executors + edges (conditions, fan-out, loops), typed messages, supersteps, checkpoint storage, `request_info` for human approval; orchestrations Sequential, Concurrent, GroupChat, Handoff, Magentic.
- **Migration map:** RoundRobin → Sequential, Selector → GroupChat, Swarm → Handoff, MagenticOne → Magentic, GraphFlow → WorkflowBuilder, `save_state` → checkpoints.

**Say in the interview:** "AutoGen isn't dead but it's maintenance-only; new Microsoft-stack work goes on Agent Framework, which keeps AutoGen's multi-agent patterns and adds SK's middleware and telemetry plus checkpointed workflows. For anything with money or approvals I use a workflow with a code gate, and agents only for open steps."

**Avoid:** `pip install autogen` for a Microsoft 0.4 tutorial; calling AG2 "the new AutoGen"; keyword-only termination; local code executor on a server; preview-era MAF names (`ChatAgent`, `chat_client=`, threads); forgetting to pass a session; one team object shared across users.
