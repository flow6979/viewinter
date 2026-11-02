**In one line:** Agent failures are silent (a wrong refund inside an HTTP 200), so trace every LLM call, tool call and retrieval to know what happened, why, what it cost and how long it took.

- **vs APM:** APM says "is it running"; LLM observability says "is it correct"; the LLM decides the path at runtime, so the trace is the source of truth. Join both by trace ID.
- **Trace / span:** one request = one trace; nested spans for LLM, tool, retriever, embedding, node, guardrail, evaluator; group by session/thread id; propagate W3C `traceparent` to MCP/A2A calls.
- **What to log:** prompt + completion, model + params, prompt version, tokens (input, output, cached, reasoning), cost, latency + TTFT, tool args/results/errors, doc ids + scores, `finish_reason`, git sha.
- **Redact:** PII and secrets before the exporter (Presidio, `hide_inputs`, Langfuse masking); hash the user id.
- **OTel GenAI:** standard `gen_ai.*` attributes (operation, provider, model, usage tokens, finish reasons, tool name); content capture is opt-in; still "development" status, so pin versions. OpenInference is Arize's equivalent.
- **Instrumentation:** LangSmith env vars + `@traceable`, Langfuse callback handler, plain OTel spans; batch in the background and flush in short-lived jobs.
- **Tools:** LangSmith (LangGraph native), Langfuse / Phoenix (open source, self-host), Helicone (proxy), Datadog LLM Obs, W&B Weave.
- **Debug from traces:** repeated same tool + args = loop; ID never seen before = hallucinated arg; `finish_reason=length` = overflow; irrelevant retriever docs = retrieval bug; token jump = check the prompt diff.
- **Monitoring:** dashboards for cost, tokens, p50/p95/p99, tool failure, guardrail block, escalation rate; online judge on 5–10% sampled traces, code checks on 100%; drift alerts tied to versions.
- **Close the loop:** feedback linked to trace id, implicit signals, annotation queues; every reviewed failure becomes a dataset example and a CI eval.
- **Sampling + retention:** tail sampling keeps 100% of errors, slow and low-score traces plus 5–10% of the rest; full payloads 14–30 days; data residency for DPDP/RBI.

**Say in the interview:** "The first debugging question is: which was the first span where the output went wrong? And the real ROI of observability is when traces become eval datasets; otherwise they are just expensive logs."

**Avoid:** Only latency and error-rate dashboards; every LLM call as its own trace; custom attribute names per team; full customer records in traces; an LLM judge on 100% of traffic; feedback not linked to trace id.
