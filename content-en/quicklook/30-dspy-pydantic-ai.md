**In one line:** DSPy (3.x) compiles prompts: you declare typed signatures in modules, give a metric and examples, and an optimizer learns instructions and demos. Pydantic AI (2.x) makes agents typed: injected deps, validated `output_type` with retry, testable tools.

- **DSPy mental model:** "programming, not prompting". Modules are like PyTorch layers; the prompt is a learned artifact you re-compile when the model changes.
- **Signatures:** `"ticket -> category"` or a `dspy.Signature` class; docstring = instruction; typed fields (`Literal`, `bool`, Pydantic models); the adapter builds the prompt and parses the reply.
- **Modules:** `Predict` (1 call), `ChainOfThought` (adds `reasoning`), `ReAct` (tools, `max_iters`, auto `finish`), custom `dspy.Module` with `forward()`. `Refine` / `BestOfN` replaced `Assert` / `Suggest`.
- **Optimizers:** `BootstrapFewShot` (passing traces become demos, cheap), `MIPROv2` (instructions + demos, Bayesian search, `auto="light|medium|heavy"`), `GEPA` (3.0+, metric returns score + feedback text, reflection LM evolves instructions, Pareto set), `BootstrapFinetune` (weights).
- **Workflow:** `dspy.Example(...).with_inputs(...)`, train/dev split, `dspy.Evaluate` baseline, `compile`, re-evaluate, `save("x.json")`, `load` at startup; debug with `dspy.inspect_history`.
- **When DSPy pays off:** scoreable task, 30+ examples, high volume or model swaps. Not for one-off prompts, unscoreable tasks or durable agent orchestration.
- **Pydantic AI core:** `Agent("provider:model", deps_type=..., output_type=..., instructions=...)`; `@agent.tool` gets `RunContext` (`ctx.deps`), `@agent.tool_plain` does not; `run_sync`, `run`, `run_stream`.
- **Validate and retry:** schema errors and `ModelRetry` go back to the model as retry prompts; `@agent.output_validator` adds business rules; each retry is a paid call.
- **Testing:** `agent.override(model=TestModel())` or `FunctionModel`, fake deps, `models.ALLOW_MODEL_REQUESTS = False`.
- **Production:** Logfire / OTel (`logfire.instrument_pydantic_ai()`), `UsageLimits`, `FallbackModel`, `pydantic_evals`, durable execution (Temporal, DBOS, Prefect), pydantic-graph for typed state machines.
- **Pydantic AI 2.0 changes:** capabilities, `MCPToolset` + `toolsets=`, bare model names error, `openai:` = Responses API, `result.usage` is a property, `pydantic_graph.beta` moved to top level.
- **Other names:** Haystack (deepset, component pipelines for RAG and agents), Smolagents (Hugging Face, `CodeAgent` writes Python actions, sandbox it), Instructor (typed extraction only).

**Say in the interview:** "DSPy improves what I ask the model by optimizing against a metric; Pydantic AI makes the call safe with typed deps and validated outputs; LangGraph orchestrates long stateful flows. I combine them: a DSPy-compiled classifier inside a typed agent inside an orchestrated workflow."

**Avoid:** optimizing and evaluating on the same examples; a judge metric you never checked; swapping models without re-compiling; giant output schemas that cause retries; letting the model pass `user_id` instead of using `ctx.deps`; testing only against a real LLM.
