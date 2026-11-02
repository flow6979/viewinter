**In one line:** A workflow fixes the code path up front and the LLM only works inside each step; pick from 5 patterns before reaching for an agent.

- **Pattern picker:** steps known up front means workflow; climb single call → workflow → agent → multi-agent only when an eval number justifies it.
- **Prompt chaining:** fixed sequential steps with a programmatic gate (schema, regex, length) between them; gate fails = early exit or retry.
- **Routing:** a classifier with structured output (`Literal` enum) sends input to a specialized branch with its own prompt, model and tools; also used for cost routing.
- **Router evals:** treat it as a classifier: per-class precision/recall, confusion matrix, confidence threshold, an `other` bucket.
- **Sectioning:** independent subtasks in parallel to cut latency (3×2s sequential becomes about 2s).
- **Voting:** same task N times, aggregate (any-yes for safety, majority for balance); N times the cost, vary prompts or models to avoid correlated errors.
- **Fan-in + reducer:** parallel nodes writing one key need `operator.add`, else `InvalidUpdateError`; do not rely on result order.
- **Map-reduce with `Send`:** when N is known only at runtime, each `Send(node, payload)` gets its own private input; cap with `max_concurrency`.
- **Orchestrator-worker:** the LLM plans subtasks at runtime (capped, structured), workers get only their slice, a synthesizer joins; plan made once, no loop.
- **Evaluator-optimizer:** generate, grade against criteria, retry with feedback; deterministic checks first, a different judge model, explicit max-iterations plus fallback.
- **Combining:** patterns nest (routing on top, a gated chain in a branch, an evaluator at the end); make each a subgraph.

**Say in the interview:** "Two questions pick the pattern: are the steps known up front, and how will I check the output? A workflow is far easier to debug, eval and cost-cap than an agent."

**Avoid:** A ReAct agent for every problem; free-text router output checked with string `in`; sending full history to every worker; relying only on `recursion_limit` for a reflection loop.
