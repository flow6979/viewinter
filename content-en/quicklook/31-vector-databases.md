**In one line:** Every vector DB stores id + vector + metadata in collections split by tenant; pick by scale, tenancy shape, ops appetite and cost model, and treat the DB as a rebuildable index, not the source of truth.

- **Two families:** cluster, RAM/SSD-first (Qdrant, Weaviate, Milvus classic) = steady low latency, pay for nodes 24x7; object-storage-first (Pinecone serverless, turbopuffer, Chroma Cloud, LanceDB on S3) = cheap idle data, slow cold queries.
- **Pinecone:** managed, closed source; namespaces per tenant (query cost grows with namespace size); pods are legacy; SDK v10 adds schema-based document indexes and full-text; integrated embedding + rerank; dedicated read nodes, BYOC; eventually consistent.
- **Qdrant:** Rust, open source; create payload indexes on filter fields; filterable HNSW + planner (+ ACORN); int8/binary/PQ quantization with rescoring; `is_tenant` field and tiered multitenancy; ids must be int or UUID.
- **Weaviate:** Go, typed schema, vectorizer modules embed for you; native BM25 hybrid with `alpha`; one shard per tenant, idle tenants offloaded to S3; HNSW, flat, dynamic, HFresh; 8-bit RQ default since 1.33.
- **Milvus / Zilliz:** distributed, storage/compute split (streaming, query, data nodes over S3); widest indexes incl. DiskANN, GPU CAGRA, RaBitQ; partition key for tenants; consistency Strong/Bounded/Session; heavy to run below ~50M vectors.
- **Chroma:** embedded and dev-first, same API up to serverless Chroma Cloud; beware the default 384-dim embedding model if you pass only documents.
- **LanceDB:** embedded library on the Lance columnar format, local or S3; versioned tables; IVF_PQ / IVF_HNSW_SQ + scalar + FTS indexes; batch writes and run `optimize()`.
- **turbopuffer:** object-storage-first, SPFresh centroid index, millions of cheap namespaces, strong consistency by default; warm ~tens of ms, cold up to ~1 s.
- **Sizing:** 10M × 1024 × 4 B ≈ 41 GB raw + ~1.5 GB HNSW + headroom ≈ 53 GB per replica; int8 ≈ 10 GB, binary/PQ ≈ 1.3 GB with rescoring.
- **Re-embedding:** blue-green index per model version, dual-write, backfill from canonical store, eval, switch alias.
- **Production:** deterministic ids (`doc7#c3`) for upsert and delete; tenant from auth, never request body; read-your-writes where UX needs it; nightly recall@10 vs exact search.

**Say in the interview:** "First I ask scale, QPS, tenant count, filters, ops team and budget. Under ~10M vectors in Postgres I stay on pgvector; no infra team means Pinecone or turbopuffer; self-hosting means Qdrant, or Milvus at billions. The vector DB is a derived index rebuilt from our chunk store."

**Avoid:** choosing from a public benchmark; benchmarking warm-only or without filters; one shared namespace with a client-supplied tenant; mixing two embedding models in one index; distributed Milvus for 2M vectors; forgetting replicas and headroom in RAM math.
