**In one line:** An agent is LLM + tools + memory + loop, where the LLM itself decides the next step and when to stop; if your code decides, it is a workflow.

- **Control flow:** chatbot = one call; workflow = your code runs a fixed path; agent = the LLM picks steps and tools in a loop.
- **ReAct loop:** reason, act (tool call as name + JSON args), observe (result goes back into context), repeat until done.
- **Stop conditions:** reply with no tool call (`end_turn` / `stop`), `max_steps`, budget or time limit, a guardrail trigger.
- **Tool calling:** you send name + description + JSON schema; the model only requests the call, your code executes it (auth, validation, rate limits).
- **Descriptions are prompts:** say when to use, when not, arg format; tight schema with `enum` and `required`.
- **Tool errors = observations:** return a clear error (`is_error`) so the model self-corrects; cap retries. Parallel calls go back in one message.
- **Cost:** the whole history is resent every step, so cost grows roughly quadratically; trim tool output, use prompt caching.
- **Workflow vs agent:** steps known up front, strict SLA or auditable output means workflow; open-ended, unknown step count means agent. Hybrid is most common.
- **Autonomy L0–L4:** single call, router, tool agent, multi-agent, autonomous; each level up needs more guardrails, HITL, evals.
- **Failure modes:** loops, wrong tool, hallucinated args, context overflow, premature stop, injection via tool output, swallowed errors.

**Say in the interview:** "Every agent gets three hard limits: max steps, max tokens/cost, and a wall-clock timeout. I start with a workflow and move to an agent only when evals show a fixed path is not enough."

**Avoid:** Calling every LLM + tool system an agent; giving 30–50 tools at once; not matching `tool_use_id` (400 error); checking only the final answer, not the trajectory.
