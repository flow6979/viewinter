**In one line:** LlamaIndex is a data-first framework for LLM apps: readers, parsing, node parsers, indexes, retrievers and response synthesizers for RAG, with event-driven Workflows and agents on top.

- **Packages (0.14.x):** `llama-index-core`, `llama-index-workflows`, one package per LLM, embedding, vector store and reader; `llama-cloud` SDK for LlamaParse. `Settings` replaced `ServiceContext`.
- **Document vs Node:** Document = whole source + metadata + stable `doc_id`; Node = chunk with inherited metadata and SOURCE/PREVIOUS/NEXT/PARENT links. Nodes are embedded and retrieved.
- **Readers / LlamaHub / LlamaParse:** `SimpleDirectoryReader` for files, LlamaHub for Notion, Drive, SQL; LlamaParse (tiers like `agentic`) turns tables and scans into clean markdown.
- **Node parsers:** SentenceSplitter (~512 tokens, 10% overlap), MarkdownNodeParser, SemanticSplitter, SentenceWindow, Hierarchical + AutoMergingRetriever. Pick chunk size with a hit-rate eval.
- **Indexes:** VectorStoreIndex (default), SummaryIndex, PropertyGraphIndex, DocumentSummaryIndex; plug a real vector DB via `StorageContext` or `from_vector_store`.
- **Retrieval:** `as_retriever(similarity_top_k=20)` → metadata filters → hybrid with `QueryFusionRetriever` → similarity cutoff → rerank to 4. Router and SubQuestion engines for multi-source questions.
- **Engines:** query engine = one Q, one A; chat engine (`condense_plus_context`) adds history; response modes `compact` (default), `refine`, `tree_summarize`, `no_text`; `source_nodes` for citations.
- **Workflows:** async `@step` methods routed by event type hints; `ctx.store` state, `send_event`/`collect_events` fan-out, `write_event_to_stream`, `wait_for_event` for HITL, `ctx.to_dict()` to persist.
- **Agents:** `FunctionAgent` (native tool calling), `ReActAgent`, `CodeActAgent`, `AgentWorkflow` with `can_handoff_to`; `QueryEngineTool` wraps RAG; `Context(agent)` or `Memory` for history. Old `OpenAIAgent`/`AgentRunner` removed.
- **Ingestion pipeline:** transformations + cache + docstore with `UPSERTS` and stable IDs + vector store; 15 changed files re-embed ~45 Nodes instead of 6,000.
- **Evaluation:** `RetrieverEvaluator` (hit rate, MRR), Faithfulness, Relevancy, Correctness, `BatchEvalRunner`, `generate_question_context_pairs` plus real questions.
- **LlamaCloud:** Parse, Extract, managed Index, Classify, Workflow hosting via `llamactl`/`WorkflowServer`.

**Say in the interview:** "I pick LlamaIndex when ingestion and retrieval quality are the hard part: parse well, chunk by structure, hybrid plus rerank, measure hit rate. If control flow gets complex, the query engine becomes a tool inside a LangGraph or LangChain agent."

**Avoid:** `ServiceContext`, `OpenAIAgent` or `chat_mode="react"`; re-indexing on every start; random doc IDs; different embed models at ingest and query; `refine` with `top_k=20`; trusting faithfulness alone; letting the model pass `employee_id`.
