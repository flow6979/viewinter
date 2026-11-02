**In one line:** In agentic RAG the retriever is a tool and the agent decides whether, what, where and how often to retrieve; the expensive bugs are on the data side: wrong, stale or unauthorized chunks.

- **Agentic vs classic RAG:** classic retrieves once with the raw query; agentic does 0–N calls across vector, SQL, API and web, with query rewriting and multi-hop decomposition. Cap calls (e.g. 4) and make "nothing found" explicit.
- **CRAG:** grade docs correct / ambiguous / incorrect; incorrect falls back to web search, refine into knowledge strips.
- **Self-RAG:** retrieve? relevant? supported? useful? (trained reflection tokens in the paper, LLM grader nodes in LangGraph).
- **Adaptive RAG:** route first: no retrieval, single-shot or multi-step; saves grader cost on simple queries. Every loop needs a retry counter.
- **GraphRAG:** LLM extracts entities/relations, Leiden communities, summaries; local search for entity questions, global map-reduce for corpus themes. Indexing is very expensive, updates are hard.
- **Text-to-SQL:** retrieve top 5–10 relevant tables, read-only role + row-level security, parse with sqlglot (one `SELECT`), inject `LIMIT`, `EXPLAIN`, timeout, summarize results; prefer a semantic layer or an API.
- **Ingestion:** good parsing (tables as markdown), rich metadata (`tenant_id`, `acl_groups`, `updated_at`), content-hash incremental re-index, freshness SLA, idempotent chunk IDs.
- **Deletes:** deleted at source must leave vector, BM25 and cache, or stale and confidential docs keep answering.
- **ACL at retrieval time:** pre-filter by the authenticated user's groups; identity comes from the session, never tool args; post-filtering hurts recall and leaks.
- **PII:** detect and mask at ingestion (Presidio), mask in logs, check what goes to third-party APIs and data residency.
- **Synthetic data:** LLM-generated Q/A/context triples (simple, multi-hop, unanswerable), critique filter, 10–20% human review; mix with real queries.

**Say in the interview:** "Authorization is not the LLM's job: retrieval pre-filters by the user's ACL so the model never sees a chunk the user can't. For text-to-SQL it is defense in depth: read-only replica + RLS, parser validation, LIMIT and timeout."

**Avoid:** Making every query agentic (3x latency for nothing); a web fallback without allow-list; a primary-DB connection for the agent; one shared index with "don't reveal other customers' data" in the prompt; ignoring updates and deletes.
