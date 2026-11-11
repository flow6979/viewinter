**Ek line:** DSPy (3.x) prompts compile karta hai: modules me typed signatures declare karo, metric aur examples do, aur optimizer instructions aur demos seekhta hai. Pydantic AI (2.x) agents ko typed banata hai: injected deps, retry ke saath validated `output_type`, testable tools.

- **DSPy mental model:** "programming, not prompting". Modules PyTorch layers jaise; prompt ek learned artifact jise model badalne pe dobara compile karte ho.
- **Signatures:** `"ticket -> category"` ya `dspy.Signature` class; docstring = instruction; typed fields (`Literal`, `bool`, Pydantic models); adapter prompt banata aur reply parse karta hai.
- **Modules:** `Predict` (1 call), `ChainOfThought` (`reasoning` jodta), `ReAct` (tools, `max_iters`, auto `finish`), `forward()` wala custom `dspy.Module`. `Refine` / `BestOfN` ne `Assert` / `Suggest` ki jagah li.
- **Optimizers:** `BootstrapFewShot` (pass hone wale traces demos, sasta), `MIPROv2` (instructions + demos, Bayesian search, `auto="light|medium|heavy"`), `GEPA` (3.0+, metric score + feedback text lautata, reflection LM instructions evolve karta, Pareto set), `BootstrapFinetune` (weights).
- **Workflow:** `dspy.Example(...).with_inputs(...)`, train/dev split, `dspy.Evaluate` baseline, `compile`, dobara evaluate, `save("x.json")`, startup pe `load`; `dspy.inspect_history` se debug.
- **DSPy kab faayda:** score hone layak task, 30+ examples, bada volume ya model swaps. One-off prompts, unscoreable tasks ya durable agent orchestration ke liye nahi.
- **Pydantic AI core:** `Agent("provider:model", deps_type=..., output_type=..., instructions=...)`; `@agent.tool` ko `RunContext` (`ctx.deps`) milta, `@agent.tool_plain` ko nahi; `run_sync`, `run`, `run_stream`.
- **Validate aur retry:** schema errors aur `ModelRetry` retry prompts banke model ko wapas; `@agent.output_validator` business rules jodta; har retry paid call.
- **Testing:** `agent.override(model=TestModel())` ya `FunctionModel`, fake deps, `models.ALLOW_MODEL_REQUESTS = False`.
- **Production:** Logfire / OTel (`logfire.instrument_pydantic_ai()`), `UsageLimits`, `FallbackModel`, `pydantic_evals`, durable execution (Temporal, DBOS, Prefect), typed state machines ke liye pydantic-graph.
- **Pydantic AI 2.0 changes:** capabilities, `MCPToolset` + `toolsets=`, bare model names error, `openai:` = Responses API, `result.usage` property hai, `pydantic_graph.beta` top level pe.
- **Baaki naam:** Haystack (deepset, RAG aur agents ke liye component pipelines), Smolagents (Hugging Face, `CodeAgent` Python actions likhta, sandbox karo), Instructor (sirf typed extraction).

**Interview me bolo:** "DSPy metric ke against optimize karke behtar karta hai ki model se kya poochhta hoon; Pydantic AI typed deps aur validated outputs se call safe banata hai; LangGraph lambe stateful flows orchestrate karta hai. Main inhe jodta hoon: typed agent ke andar DSPy-compiled classifier, orchestrated workflow ke andar."

**Galti mat karna:** same examples pe optimize aur evaluate karna; kabhi check na kiya judge metric; bina re-compile model swap; bade output schemas jo retries karwayein; `ctx.deps` ki jagah model ko `user_id` pass karne dena; sirf real LLM se test karna.
