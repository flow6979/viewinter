**In one line:** CrewAI runs a team of role-based agents (role, goal, backstory) on tasks with a clear expected output, and wraps them in Flows (`@start`, `@listen`, `@router`, typed state) for the deterministic glue; written against CrewAI 1.15.x.

- **Agent:** `role`, `goal`, `backstory`, `llm` (model string like `openai/gpt-4.1-mini`), `tools`, `allow_delegation` (adds "delegate work" and "ask question" coworker tools), limits `max_iter`, `max_execution_time`, `max_rpm`.
- **Task:** `description` + `expected_output` + `agent`; `context=[task]` for explicit data flow; `output_pydantic` for typed output; `guardrail` returns `(True, value)` or `(False, feedback)` and retries (default 3); `human_input`, `async_execution`.
- **Crew + Process:** sequential (list order, predictable, cheap) vs hierarchical (`manager_llm` creates a manager that delegates; adds 2–6 calls, harder to debug). `kickoff(inputs)` returns `CrewOutput` with `.raw`, `.pydantic`, `.token_usage`.
- **Flows:** `Flow[State]` with Pydantic state; `@start` entry, `@listen(step)` after a step, `@router(step)` returns a label, `or_` / `and_`; `@persist` to resume by `id`; `flow.plot()`.
- **Flows vs Crews:** if a step can be code, it is code; a crew goes inside one Flow step only where autonomy helps. Most production apps are Flow-first.
- **Inside a task:** prompt = "You are {role}. {backstory}. Your goal: {goal}" + tools + task + expected output + context; tool loop until final answer or `max_iter`; then Pydantic parse and guardrail.
- **Memory and knowledge:** 1.x has one unified `Memory` (LLM-scored scope and importance, LanceDB, shallow or deep recall); knowledge sources (string, PDF) are RAG attached to an agent or crew. Scope memory per user.
- **Project layout:** `crewai create crew` is now JSON-first (`agents/*.jsonc`, `crew.jsonc`); `--classic` gives `agents.yaml`, `tasks.yaml`, `@CrewBase`; `crewai create flow` for Flow projects.
- **Production:** tracing (`crewai traces enable`, OpenTelemetry tools), `token_usage` per run, caps, `crewai eval`, async job API, deploy own service or AMP.
- **Cost:** persona and tool schemas are resent on every call; a crew is roughly 2–4× the tokens of one agent with tools.
- **Recent changes:** no LangChain dependency, 1.0 in late 2025, unified memory, JSON scaffold, deprecated `function_calling_llm` and `allow_code_execution`.

**Say in the interview:** "Flow is the backbone with typed state and persistence; small sequential crews only where judgement is needed; `output_pydantic` plus code guardrails on anything with money. Hierarchical only when the split of work is unknown. Against LangGraph: CrewAI is faster to build, LangGraph gives finer control and checkpoints."

**Avoid:** four role-play agents where one agent with four tools works; hierarchical for a known pipeline; `allow_delegation=True` everywhere; vague `expected_output`; unscoped `memory=True` in a multi-user app; `kickoff()` inside a synchronous HTTP request.
