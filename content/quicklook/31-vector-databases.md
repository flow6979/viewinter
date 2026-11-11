**Ek line:** Har vector DB id + vector + metadata ko tenant ke hisaab se bante collections me rakhta hai; scale, tenancy ka shape, ops ki himmat aur cost model se chuno, aur DB ko source of truth nahi, dobara ban sakne wala index maano.

- **Do families:** cluster, RAM/SSD-first (Qdrant, Weaviate, Milvus classic) = steady kam latency, nodes ka paisa 24x7; object-storage-first (Pinecone serverless, turbopuffer, Chroma Cloud, S3 pe LanceDB) = idle data sasta, cold queries slow.
- **Pinecone:** managed, closed source; har tenant ka namespace (query cost namespace size ke saath badhti hai); pods legacy; SDK v10 schema-based document indexes aur full-text laata hai; integrated embedding + rerank; dedicated read nodes, BYOC; eventually consistent.
- **Qdrant:** Rust, open source; filter fields pe payload indexes banao; filterable HNSW + planner (+ ACORN); rescoring ke saath int8/binary/PQ quantization; `is_tenant` field aur tiered multitenancy; ids int ya UUID hi.
- **Weaviate:** Go, typed schema, vectorizer modules tumhare liye embed karte hain; `alpha` ke saath native BM25 hybrid; har tenant ka shard, idle tenants S3 pe offload; HNSW, flat, dynamic, HFresh; 1.33 se 8-bit RQ default.
- **Milvus / Zilliz:** distributed, storage/compute alag (S3 ke upar streaming, query, data nodes); sabse zyada indexes, DiskANN, GPU CAGRA, RaBitQ samet; tenants ke liye partition key; consistency Strong/Bounded/Session; ~50M vectors se neeche chalana bhaari.
- **Chroma:** embedded aur dev-first, serverless Chroma Cloud tak same API; sirf documents bhejo to default 384-dim embedding model se bacho.
- **LanceDB:** Lance columnar format pe embedded library, local ya S3; versioned tables; IVF_PQ / IVF_HNSW_SQ + scalar + FTS indexes; writes batch karo aur `optimize()` chalao.
- **turbopuffer:** object-storage-first, SPFresh centroid index, millions of saste namespaces, default strong consistency; warm ~das-bees ms, cold ~1 s tak.
- **Sizing:** 10M × 1024 × 4 B ≈ 41 GB raw + ~1.5 GB HNSW + headroom ≈ har replica 53 GB; rescoring ke saath int8 ≈ 10 GB, binary/PQ ≈ 1.3 GB.
- **Re-embedding:** har model version ka blue-green index, dual-write, canonical store se backfill, eval, alias switch.
- **Production:** upsert aur delete ke liye deterministic ids (`doc7#c3`); tenant auth se, request body se kabhi nahi; jahan UX ko chahiye wahan read-your-writes; exact search ke against nightly recall@10.

**Interview me bolo:** "Pehle scale, QPS, tenant count, filters, ops team aur budget poochhta hoon. Postgres me ~10M se kam vectors hon to pgvector pe rehta hoon; infra team nahi to Pinecone ya turbopuffer; self-host karna hai to Qdrant, billions pe Milvus. Vector DB ek derived index hai jo hamare chunk store se dobara banta hai."

**Galti mat karna:** public benchmark se chunna; sirf warm ya bina filters benchmark; client ke bheje tenant ke saath ek shared namespace; ek index me do embedding models mix karna; 2M vectors ke liye distributed Milvus; RAM math me replicas aur headroom bhoolna.
