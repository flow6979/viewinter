**Ek line:** Maan ke chalo model trick ho sakta hai, isliye har layer (input → model → tool → output) pe alag check lagao aur hard controls code me rakho, prompt me nahi.

- **Layered defense:** har guard probabilistic hai; deterministic checks (limits, allowlist, schema) LLM checks se better. Paise/data pe fail closed, low-risk chat pe fail open.
- **Blast radius:** poocho "model poora compromise ho jaye to worst case kya?" aur permissions se use chhota karo.
- **Input guards:** pehle normalize (NFKC, zero-width chars hatao), phir injection/jailbreak classifiers (Prompt Guard, Llama Guard), topic/scope filter, size aur rate limits ("denial of wallet" ke against).
- **Indirect injection:** instructions docs, web pages, emails ya tool output me chhupi hoti hain; unsolved, sirf risk kam kar sakte ho. Tool output aur RAG docs untrusted maano.
- **Lethal trifecta:** private data + untrusted content + exfiltration channel = data chori; kam se kam ek leg kaato (dual-LLM, CaMeL-style plan pehle, spotlighting, egress allowlist, markdown images band).
- **Output guards:** Pydantic schema, 1–2 re-ask phir safe fallback, groundedness check, toxicity, PII leakage, business rules code me.
- **PII:** IDs ke liye regex (PAN, card + Luhn), naam ke liye NER, Presidio dono jodta hai; LLM call aur logs/traces se pehle redact; vault ke saath reversible pseudonymization.
- **Action guards:** least privilege, allowlists, scoped on-behalf-of credentials, tool ke andar argument check (`merchant_id == session.merchant_id`), dry-run, spend limits, idempotency keys, high-risk pe HITL.
- **LangGraph nodes ki tarah:** input guard → agent → action guard (`interrupt`) → output guard; routing code karta hai, isliye traceable aur bypass-proof. `interrupt` se pehle side effect nahi.
- **OWASP LLM Top 10 (2025):** agents ke liye LLM01 Prompt Injection, LLM05 Improper Output Handling, LLM06 Excessive Agency, LLM10 Unbounded Consumption.
- **Latency/cost:** guards parallel chalao (ya main call ke saath), pehle chhote classifiers (10–50ms), LLM judge sirf borderline scores pe; har guard ka false positive rate track karo.

**Interview me bolo:** "Safety model ke bahar rehti hai: authorization check tool ke andar hai, LLM sirf request propose karta hai aur policy code decide karta hai. Har design ko lethal trifecta pe check karta hoon."

**Galti mat karna:** System prompt me "secrets mat batana" ko guardrail bolna; sirf keyword blocklist; `interrupt` se pehle refund API call (resume pe double refund); 4 LLM judges chain karke 3 second latency.
