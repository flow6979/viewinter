**In one line:** When steps are unknown, hand control flow to the LLM (ReAct, plan-and-execute, Reflexion), and go multi-agent only when context isolation or parallel breadth pays for the extra tokens.

- **ReAct:** model → `tool_calls`? → tools → model, until no tool call; fits 3–15 tools and input-dependent paths. In LangChain 1.0 use `create_agent` (middleware), not the deprecated `create_react_agent`.
- **Plan-and-execute:** planner writes the plan, executor runs steps, replanner updates or finishes; big planner + small executor saves cost. The replanner is what separates it from orchestrator-worker.
- **ReWOO:** plan once with variables (`#E1`, `#E2`), about 2 LLM calls, saves tokens but cannot replan.
- **LLMCompiler:** tasks as a DAG run in parallel as dependencies resolve; saves latency, less adaptive.
- **Reflexion:** attempt, reflect on an external signal (tests, errors), save the reflection to memory, retry; useless without a grounded signal.
- **Supervisor:** central LLM with `transfer_to_<agent>` tools returning `Command(goto=..., graph=Command.PARENT)`; workers return to it. The default, since control flow is observable in one place.
- **Hierarchical / swarm / network:** supervisors of team subgraphs (3–6 agents per level); swarm = active agent hands off itself, checkpointer remembers who is active; network is rare and hard to debug.
- **Cost reality:** Anthropic's multi-agent research beat a single agent by ~90% but used ~15x chat tokens; Cognition argues single-threaded is better for write-heavy work like coding.
- **When to split:** 30+ tools across domains, or breadth research; under 10–15 tools, tightly coupled edits or high-volume FAQs stay single agent.
- **Handoff state:** shared history (full context, grows) vs private scratchpad (cheap, may lose info); hybrid shares only user turns and final answers. Handoff = structured brief.
- **Multi-agent failures:** ping-pong, role confusion, lost context, conflicting outputs, supervisor doing the work, cost blow-up, silent failure; fix with a handoff counter, scoped tools, structured status.

**Say in the interview:** "I start multi-agent from the token budget: if one agent's context overflows from tools and history, or I need parallel breadth, I split. Otherwise a single agent. Most multi-agent bugs are coordination bugs, not model bugs."

**Avoid:** Turning the org chart into an agent chart; forgetting `graph=Command.PARENT`; skipping the replanner; merging a subagent's full 30k-token transcript into the parent; evaluating only the final answer.
