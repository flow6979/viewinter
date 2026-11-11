**Ek line:** Vector search pehle usi database me shuru karo jo already chal raha hai (pgvector, Elasticsearch/OpenSearch, Redis, MongoDB Atlas); dedicated vector DB pe tabhi jao jab scale, QPS, filtering ya tenants sach me usse bade ho jaayein.

- **pgvector types:** `vector` (index ≤ 2,000 dims), `halfvec` (≤ 4,000, aadhi memory), `sparsevec` (≤ 1,000 non-zeros, HNSW), `bit` (≤ 64,000, binary quantization).
- **Indexes:** HNSW (`m` 16, `ef_construction` 64, `hnsw.ef_search` 40) default hai; IVFFlat (`lists` ≈ rows/1000, `ivfflat.probes` ≈ sqrt(lists)) jaldi banta hai par pehle data chahiye.
- **Operators:** `<->` L2, `<=>` cosine distance, `<#>` negative inner product; operator class se match hona chahiye aur `ORDER BY ... ASC LIMIT k` me use ho, `EXPLAIN` se check karo.
- **Filtered queries:** HNSW `WHERE` se pehle ~`ef_search` candidates hi deta hai, isliye k se kam rows aati hain; fix: `hnsw.iterative_scan` (0.8+), partial index, partitions, ya chhote slice pe exact scan.
- **Quantization:** `embedding::halfvec` (aadhi memory) ya `binary_quantize(embedding)::bit` (1/32) index karo, 4–10× zyada candidates lao aur full vectors se re-rank karo.
- **SQL me hybrid:** generated `tsvector` + GIN, semantic CTE aur keyword CTE dono `RANK()` ke saath, `FULL OUTER JOIN`, RRF `1/(60 + rank)`; `ts_rank_cd` BM25 nahi hai.
- **psycopg:** `CREATE EXTENSION` ke baad `register_vector(conn)`; batch insert ya `COPY`; pooler ke peeche transaction ke andar `SET LOCAL`.
- **Bada Postgres:** pgvectorscale `diskann` (SBQ, `diskann.query_rescore`, label filters), AlloyDB ScaNN, Azure DiskANN, partitions, read replicas.
- **Elasticsearch / OpenSearch:** `dense_vector` (9.x me default quantized, `bbq_hnsw`), `knn` retriever with `num_candidates` aur kNN ke andar filter, `rrf` retriever; OpenSearch `knn_vector` faiss/lucene pe, `on_disk` mode, `nmslib` deprecated.
- **Redis / Mongo / baaki:** Redis Query Engine ya Redis 8 vector sets chhote, hot data ke liye jaise semantic cache; Atlas `$vectorSearch` with `numCandidates` aur declared filter fields; sqlite-vec, ClickHouse, Oracle, SQL Server me bhi vector type hai.
- **FAISS:** library hai, DB nahi: Flat, IVF, HNSW, PQ, GPU; persistence, ID mapping, filtering, deletes aur serving tumhe khud banana hai.
- **Production:** HNSW build ko `maintenance_work_mem` chahiye aur 10M+ pe ghante lagte hain; updates pe MVCC + vacuum; re-embed: nayi column, backfill, dual write, shadow compare, flag flip.

**Interview me bolo:** "3 million chunks × 1536 × 4 bytes lagbhag 18 GB hai, to Postgres already stack me hai to pgvector HNSW, filters ke liye iterative scan aur SQL me RRF hybrid. Lagbhag 50 million vectors pe ya peak QPS pe p95 SLO miss ho to dobara sochunga."

**Galti mat karna:** memory math se pehle vector DB chun lena; L2 index pe `<=>` query karna; filtered HNSW query ke `LIMIT 10` pe bharosa; re-rank ke bina binary quantization; ek bade `UPDATE` me in-place re-embed; FAISS ko database bolna.
