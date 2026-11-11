**In one line:** Start vector search inside the database you already run (pgvector, Elasticsearch/OpenSearch, Redis, MongoDB Atlas); move to a dedicated vector DB only when scale, QPS, filtering or tenants measurably outgrow it.

- **pgvector types:** `vector` (index ≤ 2,000 dims), `halfvec` (≤ 4,000, half memory), `sparsevec` (≤ 1,000 non-zeros, HNSW), `bit` (≤ 64,000, binary quantization).
- **Indexes:** HNSW (`m` 16, `ef_construction` 64, `hnsw.ef_search` 40) is the default; IVFFlat (`lists` ≈ rows/1000, `ivfflat.probes` ≈ sqrt(lists)) builds fast but needs data first.
- **Operators:** `<->` L2, `<=>` cosine distance, `<#>` negative inner product; must match the operator class and be used as `ORDER BY ... ASC LIMIT k`, check with `EXPLAIN`.
- **Filtered queries:** HNSW returns ~`ef_search` candidates before `WHERE`, so you get fewer than k; fix with `hnsw.iterative_scan` (0.8+), partial indexes, partitions, or exact scan for tiny slices.
- **Quantization:** index `embedding::halfvec` (half memory) or `binary_quantize(embedding)::bit` (1/32), over-fetch 4–10× and re-rank with full vectors.
- **Hybrid in SQL:** generated `tsvector` + GIN, a semantic CTE and a keyword CTE with `RANK()`, `FULL OUTER JOIN`, RRF `1/(60 + rank)`; `ts_rank_cd` is not BM25.
- **psycopg:** `register_vector(conn)` after `CREATE EXTENSION`; batch inserts or `COPY`; `SET LOCAL` inside a transaction behind poolers.
- **Bigger Postgres:** pgvectorscale `diskann` (SBQ, `diskann.query_rescore`, label filters), AlloyDB ScaNN, Azure DiskANN, partitions, read replicas.
- **Elasticsearch / OpenSearch:** `dense_vector` (quantized by default in 9.x, `bbq_hnsw`), `knn` retriever with `num_candidates` and in-kNN filters, `rrf` retriever; OpenSearch `knn_vector` on faiss/lucene, `on_disk` mode, `nmslib` deprecated.
- **Redis / Mongo / others:** Redis Query Engine or Redis 8 vector sets for hot, small data like semantic caches; Atlas `$vectorSearch` with `numCandidates` and declared filter fields; sqlite-vec, ClickHouse, Oracle, SQL Server have vector types too.
- **FAISS:** a library, not a DB: Flat, IVF, HNSW, PQ, GPU; you build persistence, ID mapping, filtering, deletes and serving.
- **Production:** HNSW builds need `maintenance_work_mem` and hours at 10M+; MVCC + vacuum on updates; re-embed via new column, backfill, dual write, shadow compare, flag flip.

**Say in the interview:** "3 million chunks × 1536 × 4 bytes is about 18 GB, so with Postgres already in the stack I use pgvector HNSW with iterative scans for filters and RRF hybrid in SQL. I'd revisit around 50 million vectors or if p95 at peak QPS misses the SLO."

**Avoid:** picking a vector DB before doing the memory math; querying `<=>` on an L2 index; trusting `LIMIT 10` on a filtered HNSW query; binary quantization without re-rank; re-embedding in place in one giant `UPDATE`; calling FAISS a database.
