**Ek line:** Agentic RAG me retriever ek tool hai aur agent decide karta hai retrieve karna hai ya nahi, kya, kahan se, kitni baar; mehenge bugs data side pe hote hain: galat, stale ya unauthorized chunks.

- **Agentic vs classic RAG:** classic raw query se ek baar retrieve; agentic vector, SQL, API, web pe 0–N calls, query rewriting aur multi-hop decomposition ke saath. Calls cap karo (jaise 4), "kuch nahi mila" explicit result do.
- **CRAG:** docs ko correct / ambiguous / incorrect grade; incorrect pe web search fallback, knowledge strips me refine.
- **Self-RAG:** retrieve karun? relevant? supported? useful? (paper me trained reflection tokens, LangGraph me LLM grader nodes).
- **Adaptive RAG:** pehle route: no retrieval, single-shot ya multi-step; simple queries pe grader cost bachta hai. Har loop pe retry counter zaroori.
- **GraphRAG:** LLM entities/relations nikalta, Leiden communities, summaries; entity sawal ke liye local search, corpus themes ke liye global map-reduce. Indexing bahut mehenga, update mushkil.
- **Text-to-SQL:** top 5–10 relevant tables retrieve, read-only role + row-level security, sqlglot se parse (ek `SELECT`), `LIMIT` inject, `EXPLAIN`, timeout, result summarize; semantic layer ya API ho to wo better.
- **Ingestion:** achha parsing (tables markdown me), rich metadata (`tenant_id`, `acl_groups`, `updated_at`), content-hash se incremental re-index, freshness SLA, idempotent chunk IDs.
- **Deletes:** source se delete = vector, BM25, cache sab se delete, warna stale aur confidential docs jawab dete rahenge.
- **Retrieval time pe ACL:** authenticated user ke groups se pre-filter; identity session se, tool args se kabhi nahi; post-filtering recall girata aur leak karta hai.
- **PII:** ingestion pe detect + mask (Presidio), logs me mask, third-party APIs ko kya ja raha aur data residency check karo.
- **Synthetic data:** LLM se Q/A/context triples (simple, multi-hop, unanswerable), critique filter, 10–20% human review; real queries ke saath mix.

**Interview me bolo:** "Authorization LLM ka kaam nahi: retrieval user ke ACL se pre-filter karta hai, model ko wo chunk milta hi nahi jo user nahi dekh sakta. Text-to-SQL me defense in depth: read-only replica + RLS, parser validation, LIMIT aur timeout."

**Galti mat karna:** Har query ko agentic banana (3x latency, fayda zero); bina allow-list ka web fallback; agent ko primary DB connection; ek shared index aur prompt me "doosre customers ka data mat batana"; updates aur deletes ignore karna.
