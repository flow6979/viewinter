**Ek line:** LLM output ki *shape* schemas aur constrained decoding se guarantee karo, *meaning* validators se check karo, aur *content* eval set ke saath ek-ek change karke ya DSPy jaise optimizer se sudhaaro.

- **Kyun:** "please reply in JSON" extra prose, markdown fences, trailing commas, missing fields, banaye hue enum values aur truncation se fail hota hai; 1,00,000 calls/day pe 1% failure = 1,000 bugs.
- **Levels:** prompt-only (koi guarantee nahi) → JSON mode (sirf valid JSON) → schema-enforced structured outputs (schema match) → tool calling as structured output (forced tool, strictness alag-alag).
- **Constrained decoding:** schema → grammar → automaton (FSM, ya nested JSON ke liye pushdown); har step pe invalid tokens ke logits −∞, to sirf valid tokens sample ho sakte hain.
- **Engines:** Outlines, XGrammar (recent vLLM/SGLang me default), llguidance; compiled grammars cache hote hain; per-step overhead chhota; `max_tokens` ab bhi JSON kaat sakta hai.
- **Quality cost:** format force karne se reasoning gir sakti hai; `reasoning` ko `answer` se pehle rakho, ya free text me reason karke dusri call me format; hamesha `unknown` / null escape do.
- **Pydantic source of truth:** `Literal` → enum, strict mode me optional ke liye `X | None`; OpenAI `client.chat.completions.parse(response_format=Model)` → `message.parsed`, `message.refusal` check karo; Anthropic: `input_schema` wala forced tool.
- **Repair loop:** `model_validate_json` → `ValidationError` pe exact error wapas bhejo → max 2–3 retries → human/default pe fallback; Instructor aur Pydantic AI ye package karte hain.
- **Prompt anatomy:** role, task, context, constraints, output format, examples; data XML tags me; lambe docs pehle, sawal last; balanced, diverse few-shot; CoT sirf jahan madad kare.
- **Prompts as code:** pehle eval set (50–300 cases + held-out) → baseline → ek cheez badlo → per-case diffs ke saath dobara measure → regression threshold wala CI gate; har request pe prompt version log.
- **DSPy:** signature (typed I/O) + module (`Predict`, `ChainOfThought`) + metric + optimizer (`BootstrapFewShot` pass hone wale traces se demos, `MIPROv2` instructions bhi search karta); prompts optimize karta hai, weights nahi.
- **Auto prompt optimization (APE/OPRO):** LLM prompts propose kare, eval score kare, best agle round ke beej; chhote eval sets pe overfit hota hai, to held-out pe decide karo aur winner khud padho.
- **Injection:** narrow schemas blast radius ghatate hain par injection nahi rokte; har field server-side truth se validate karo (dekho 08-guardrails).

**Interview me bolo:** "Shape constrained decoding se, correctness Pydantic validation aur bounded repair loop se, aur quality CI me chalne wale eval set se. Main reasoning ko answer field se pehle rakhta hoon aur prompts ko versioned code ki tarah treat karta hoon."

**Galti mat karna:** fields ke liye JSON mode pe bharosa; `answer` ko `reasoning` se pehle rakhna; `unknown` enum value na dena; unbounded retries; prompt, model aur temperature ek saath badalna; optimizer ka score usi set pe report karna jispe search hua.
