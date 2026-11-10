**In one line:** Guarantee the *shape* of LLM output with schemas and constrained decoding, check the *meaning* with validators, and improve the *content* with an eval set, one change at a time or with an optimizer like DSPy.

- **Why:** "please reply in JSON" fails with extra prose, markdown fences, trailing commas, missing fields, invented enum values and truncation; 1% failure at 100k calls/day is 1,000 bugs.
- **Levels:** prompt-only (no guarantee) → JSON mode (valid JSON only) → schema-enforced structured outputs (matches schema) → tool calling as structured output (forced tool, strictness varies).
- **Constrained decoding:** schema → grammar → automaton (FSM, or pushdown for nested JSON); each step sets logits of invalid tokens to −∞, so only valid tokens can be sampled.
- **Engines:** Outlines, XGrammar (default in recent vLLM/SGLang), llguidance; compiled grammars are cached; per-step overhead is small; `max_tokens` can still truncate JSON.
- **Quality cost:** forcing format can hurt reasoning; put `reasoning` before `answer`, or reason in free text then format in a second call; always add an `unknown` / null escape.
- **Pydantic as source of truth:** `Literal` → enum, `X | None` for optional in strict mode; OpenAI `client.chat.completions.parse(response_format=Model)` → `message.parsed`, check `message.refusal`; Anthropic: forced tool with `input_schema`.
- **Repair loop:** `model_validate_json` → on `ValidationError` send the exact error back → max 2–3 retries → fallback to human/default; Instructor and Pydantic AI package this.
- **Prompt anatomy:** role, task, context, constraints, output format, examples; data in XML tags; long docs first, question last; balanced, diverse few-shot; CoT only where it helps.
- **Prompts as code:** eval set first (50–300 cases + held-out) → baseline → change one thing → re-measure with per-case diffs → CI gate with a regression threshold; log prompt version per request.
- **DSPy:** signature (typed I/O) + module (`Predict`, `ChainOfThought`) + metric + optimizer (`BootstrapFewShot` picks demos from passing traces, `MIPROv2` also searches instructions); optimizes prompts, not weights.
- **Auto prompt optimization (APE/OPRO):** LLM proposes prompts, eval scores, best seed the next round; overfits small eval sets, so decide on held-out data and read the winner.
- **Injection:** narrow schemas shrink the blast radius but don't stop injection; validate every field against server-side truth (see 08-guardrails).

**Say in the interview:** "Shape comes from constrained decoding, correctness from Pydantic validation plus a bounded repair loop, and quality from an eval set in CI. I put reasoning before the answer field and treat prompts like versioned code."

**Avoid:** trusting JSON mode for fields; `answer` before `reasoning`; no `unknown` enum value; unbounded retries; changing prompt, model and temperature at once; reporting optimizer scores on the set it searched over.
