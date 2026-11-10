**In one line:** A framework is the agent loop plus production plumbing (state, persistence, streaming, tools, tracing, handoffs); start with a raw loop and adopt one only when you need what it gives, because you pay in abstraction, lock-in and churn.

- **Raw loop:** ~30 lines: call model, if `stop_reason == "tool_use"` run the tool, send `tool_result`, repeat with a step cap. Nothing saved on restart.
- **Adopt a framework when** you need 2+ of: durable state, resume after crash, human approval, streaming, multi-agent routing.
- **LangGraph:** graph of nodes over typed state, checkpointer per `thread_id`, `interrupt` for approvals, time travel. Best for long, branching production flows.
- **Claude Agent SDK:** Claude Code's harness as a library: built-in file/shell/search tools, context compaction, subagents, MCP, hooks and permissions. Best for coding and file agents on Claude.
- **OpenAI Agents SDK:** Agent, Runner, handoffs, input/output guardrails, sessions, tracing on by default. Best for OpenAI-centric triage-and-specialist bots.
- **Pydantic AI:** typed `output_type` with validate-and-retry, dependency injection via `RunContext`, model-agnostic. Best when output feeds other code.
- **CrewAI:** role/goal/backstory agents, tasks, sequential or hierarchical crews, Flows for control. Fast demos, less control, more LLM calls.
- **LlamaIndex:** data-first: connectors, parsing, indexes, query engines, event-driven Workflows. Best when retrieval is the hard part.
- **AutoGen/AG2:** agents in group chat; Microsoft Agent Framework is the newer direction. **Google ADK:** code-first agents plus workflow agents, Gemini and Google Cloud, A2A.
- **Observability/evals:** Langfuse or Phoenix (open source, self-host), LangSmith (LangGraph teams), Braintrust (evals-first), W&B Weave, promptfoo (CI tests). OTel GenAI conventions (`gen_ai.request.model`, `gen_ai.usage.input_tokens`) are the neutral layer.
- **Gateway:** LiteLLM, OpenRouter or a cloud gateway for one API, central keys, budgets, retries, fallbacks, cost per team.
- **Avoid lock-in:** one adapter module imports the framework; own prompts, MCP tools, eval datasets and OTel traces.

**Say in the interview:** "I start with a raw loop and an eval set. When I need durable state, approvals or branching, I move to LangGraph. Tools are MCP servers, tracing is OpenTelemetry, model calls go through a gateway, so the framework is the easiest part to replace."

**Avoid:** picking by GitHub stars; a big graph for a one-tool bot; four role-play agents where one agent with four tools works; `InMemorySaver` in production; claiming deep experience with a framework you only read about.
