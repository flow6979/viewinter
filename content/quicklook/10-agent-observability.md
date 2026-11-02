**Ek line:** Agent failures silent hote hain (HTTP 200 ke andar galat refund), isliye har LLM call, tool call aur retrieval trace karo taaki pata chale kya hua, kyun, kitna kharcha aur kitna time laga.

- **APM se fark:** APM batata hai "chal raha hai kya", LLM observability batata hai "sahi chal raha hai kya"; path runtime pe LLM decide karta hai, isliye trace hi source of truth. Dono ko trace ID se jodo.
- **Trace / span:** ek request = ek trace; andar LLM, tool, retriever, embedding, node, guardrail, evaluator ke nested spans; session/thread id se group; MCP/A2A calls me W3C `traceparent` propagate karo.
- **Kya log karna:** prompt + completion, model + params, prompt version, tokens (input, output, cached, reasoning), cost, latency + TTFT, tool args/results/errors, doc ids + scores, `finish_reason`, git sha.
- **Redact:** exporter se pehle PII aur secrets hatao (Presidio, `hide_inputs`, Langfuse masking); user id hash karo.
- **OTel GenAI:** standard `gen_ai.*` attributes (operation, provider, model, usage tokens, finish reasons, tool name); content capture opt-in; abhi "development" status, versions pin karo. OpenInference Arize ka equivalent.
- **Instrumentation:** LangSmith env vars + `@traceable`, Langfuse callback handler, plain OTel spans; background me batch, short-lived jobs me flush.
- **Tools:** LangSmith (LangGraph native), Langfuse / Phoenix (open source, self-host), Helicone (proxy), Datadog LLM Obs, W&B Weave.
- **Trace se debug:** same tool + same args baar baar = loop; pehle kabhi na dikhi ID = hallucinated arg; `finish_reason=length` = overflow; irrelevant retriever docs = retrieval bug; tokens uchhle = prompt diff dekho.
- **Monitoring:** cost, tokens, p50/p95/p99, tool failure, guardrail block, escalation rate ke dashboards; 5–10% sampled traces pe online judge, 100% pe code checks; versions se jude drift alerts.
- **Loop band karo:** feedback trace id se linked, implicit signals, annotation queues; har reviewed failure dataset example aur CI eval banta hai.
- **Sampling + retention:** tail sampling me 100% errors, slow aur low-score traces + baaki ka 5–10%; full payload 14–30 din; DPDP/RBI ke liye data residency.

**Interview me bolo:** "Debugging ka pehla sawal: pehla span kaunsa tha jahan output galat hua? Aur observability ka asli ROI tab hai jab traces eval datasets bante hain; warna wo sirf mehenge logs hain."

**Galti mat karna:** Sirf latency aur error-rate dashboard; har LLM call alag trace; har team ke apne attribute names; traces me poora customer record; 100% traffic pe LLM judge; feedback ko trace id se link na karna.
