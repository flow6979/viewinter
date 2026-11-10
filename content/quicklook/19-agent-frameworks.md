**Ek line:** Framework = agent loop + production plumbing (state, persistence, streaming, tools, tracing, handoffs); raw loop se shuru karo aur framework tabhi lao jab uski cheez chahiye, kyunki keemat abstraction, lock-in aur churn me chukaate ho.

- **Raw loop:** ~30 lines: model call, `stop_reason == "tool_use"` ho to tool chalao, `tool_result` bhejo, step cap ke saath repeat. Restart pe kuch save nahi.
- **Framework tab lao** jab inme se 2+ chahiye: durable state, crash ke baad resume, human approval, streaming, multi-agent routing.
- **LangGraph:** typed state pe nodes ka graph, `thread_id` pe checkpointer, approvals ke liye `interrupt`, time travel. Lambe, branching production flows ke liye best.
- **Claude Agent SDK:** Claude Code ka harness library ki tarah: built-in file/shell/search tools, context compaction, subagents, MCP, hooks aur permissions. Claude pe coding aur file agents ke liye best.
- **OpenAI Agents SDK:** Agent, Runner, handoffs, input/output guardrails, sessions, default tracing. OpenAI-centric triage-and-specialist bots ke liye best.
- **Pydantic AI:** typed `output_type` with validate-and-retry, `RunContext` se dependency injection, model-agnostic. Jab output doosre code ko jaata hai tab best.
- **CrewAI:** role/goal/backstory agents, tasks, sequential ya hierarchical crews, control ke liye Flows. Fast demos, kam control, zyada LLM calls.
- **LlamaIndex:** data-first: connectors, parsing, indexes, query engines, event-driven Workflows. Jab retrieval mushkil hissa ho tab best.
- **AutoGen/AG2:** group chat me agents; Microsoft Agent Framework nayi direction. **Google ADK:** code-first agents plus workflow agents, Gemini aur Google Cloud, A2A.
- **Observability/evals:** Langfuse ya Phoenix (open source, self-host), LangSmith (LangGraph teams), Braintrust (evals-first), W&B Weave, promptfoo (CI tests). OTel GenAI conventions (`gen_ai.request.model`, `gen_ai.usage.input_tokens`) neutral layer hain.
- **Gateway:** LiteLLM, OpenRouter ya cloud gateway: ek API, central keys, budgets, retries, fallbacks, per-team cost.
- **Lock-in se bacho:** sirf ek adapter module framework import kare; prompts, MCP tools, eval datasets aur OTel traces tumhare.

**Interview me bolo:** "Main raw loop aur eval set se shuru karta hoon. Durable state, approvals ya branching chahiye to LangGraph pe jaata hoon. Tools MCP servers hain, tracing OpenTelemetry, model calls gateway se, to framework sabse aasaani se badalne wala hissa hai."

**Galti mat karna:** GitHub stars dekh ke chunna; one-tool bot ke liye bada graph; chaar role-play agents jahan chaar tools wala ek agent kaafi; production me `InMemorySaver`; jis framework ke baare me sirf padha uska deep experience claim karna.
