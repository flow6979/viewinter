**Ek line:** Workflow me code path pehle se fixed hota hai aur LLM sirf har step ke andar kaam karta hai; agent se pehle in 5 patterns me se chuno.

- **Pattern picker:** steps pehle se pata = workflow; single call → workflow → agent → multi-agent tabhi badho jab eval number justify kare.
- **Prompt chaining:** fixed sequential steps, beech me programmatic gate (schema, regex, length); gate fail = early exit ya retry.
- **Routing:** structured output (`Literal` enum) wala classifier input ko specialized branch bhejta hai, jiska apna prompt, model, tools; cost routing bhi yahi hai.
- **Router evals:** classifier ki tarah naapo: per-class precision/recall, confusion matrix, confidence threshold, `other` bucket.
- **Sectioning:** independent subtasks parallel, latency kam (3×2s sequential se lagbhag 2s).
- **Voting:** same kaam N baar, aggregate (safety ke liye any-yes, balance ke liye majority); N guna cost, correlated errors se bachne ko prompts/models badlo.
- **Fan-in + reducer:** parallel nodes ek key likhein to `operator.add` chahiye, warna `InvalidUpdateError`; result order pe bharosa mat karo.
- **`Send` se map-reduce:** N runtime pe pata chale to har `Send(node, payload)` ko apna private input; `max_concurrency` se cap.
- **Orchestrator-worker:** LLM runtime pe subtasks plan karta hai (capped, structured), worker ko sirf apna slice, synthesizer jodta hai; plan ek baar, loop nahi.
- **Evaluator-optimizer:** generate, criteria pe grade, feedback ke saath retry; pehle deterministic checks, alag judge model, explicit max-iterations + fallback.
- **Combining:** patterns nest hote hain (upar routing, branch me gated chain, end me evaluator); har ek ko subgraph banao.

**Interview me bolo:** "Do sawal pattern chun lete hain: steps pehle se pata hain kya, aur output check kaise karunga? Workflow ko debug, eval aur cost-cap karna agent se kahin aasaan hai."

**Galti mat karna:** Har problem pe ReAct agent; router ka free-text output string `in` se check karna; har worker ko poori history bhejna; reflection loop me sirf `recursion_limit` pe bharosa.
