**In one line:** Assume the model can be tricked, so put a different check at every layer (input → model → tool → output) and keep the hard controls in code, not in the prompt.

- **Layered defense:** every guard is probabilistic; deterministic checks (limits, allowlists, schema) beat LLM checks. Fail closed for money/data, fail open for low-risk chat.
- **Blast radius:** ask "if the model is fully compromised, what is the worst case?" and shrink it with permissions.
- **Input guards:** normalize (NFKC, strip zero-width chars), then injection/jailbreak classifiers (Prompt Guard, Llama Guard), topic/scope filter, size and rate limits against "denial of wallet".
- **Indirect injection:** instructions hidden in docs, web pages, emails or tool output; unsolved, only reducible. Treat tool output and RAG docs as untrusted.
- **Lethal trifecta:** private data + untrusted content + exfiltration channel = data theft; cut at least one leg (dual-LLM, CaMeL-style plan first, spotlighting, egress allowlist, no markdown images).
- **Output guards:** Pydantic schema with 1–2 re-asks then a safe fallback, groundedness check, toxicity, PII leakage, business rules in code.
- **PII:** regex for IDs (PAN, card + Luhn), NER for names, Presidio combines both; redact before the LLM call and before logs/traces; reversible pseudonymization via a vault.
- **Action guards:** least privilege, allowlists, scoped on-behalf-of credentials, argument checks inside the tool (`merchant_id == session.merchant_id`), dry-run, spend limits, idempotency keys, HITL for high-risk.
- **As LangGraph nodes:** input guard → agent → action guard (`interrupt`) → output guard; code routes, so it is traceable and bypass-proof. No side effects before `interrupt`.
- **OWASP LLM Top 10 (2025):** for agents focus on LLM01 Prompt Injection, LLM05 Improper Output Handling, LLM06 Excessive Agency, LLM10 Unbounded Consumption.
- **Latency/cost:** run guards in parallel (or alongside the main call), small classifiers (10–50ms) first, LLM judge only on borderline scores; track each guard's false positive rate.

**Say in the interview:** "Safety lives outside the model: the authorization check is inside the tool, the LLM only proposes a request and policy code decides. I check every design against the lethal trifecta."

**Avoid:** "Never reveal secrets" in the system prompt as the guardrail; a keyword blocklist only; calling the refund API before `interrupt` (double refund on resume); chaining 4 LLM judges for 3 seconds of latency.
