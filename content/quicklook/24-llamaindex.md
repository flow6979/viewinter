**Ek line:** LlamaIndex LLM apps ke liye data-first framework hai: RAG ke liye readers, parsing, node parsers, indexes, retrievers aur response synthesizers, aur upar event-driven Workflows aur agents.

- **Packages (0.14.x):** `llama-index-core`, `llama-index-workflows`, har LLM, embedding, vector store aur reader ka ek package; LlamaParse ke liye `llama-cloud` SDK. `Settings` ne `ServiceContext` ki jagah li.
- **Document vs Node:** Document = poora source + metadata + stable `doc_id`; Node = chunk, inherited metadata aur SOURCE/PREVIOUS/NEXT/PARENT links ke saath. Nodes hi embed aur retrieve hote hain.
- **Readers / LlamaHub / LlamaParse:** files ke liye `SimpleDirectoryReader`, Notion, Drive, SQL ke liye LlamaHub; LlamaParse (`agentic` jaise tiers) tables aur scans ko saaf markdown banata hai.
- **Node parsers:** SentenceSplitter (~512 tokens, 10% overlap), MarkdownNodeParser, SemanticSplitter, SentenceWindow, Hierarchical + AutoMergingRetriever. Chunk size hit-rate eval se chuno.
- **Indexes:** VectorStoreIndex (default), SummaryIndex, PropertyGraphIndex, DocumentSummaryIndex; `StorageContext` ya `from_vector_store` se asli vector DB lagao.
- **Retrieval:** `as_retriever(similarity_top_k=20)` → metadata filters → `QueryFusionRetriever` se hybrid → similarity cutoff → 4 tak rerank. Multi-source sawalon ke liye Router aur SubQuestion engines.
- **Engines:** query engine = ek sawal, ek jawab; chat engine (`condense_plus_context`) history jodta hai; response modes `compact` (default), `refine`, `tree_summarize`, `no_text`; citations ke liye `source_nodes`.
- **Workflows:** event type hints se routed async `@step` methods; `ctx.store` state, `send_event`/`collect_events` fan-out, `write_event_to_stream`, HITL ke liye `wait_for_event`, persist ke liye `ctx.to_dict()`.
- **Agents:** `FunctionAgent` (native tool calling), `ReActAgent`, `CodeActAgent`, `can_handoff_to` wala `AgentWorkflow`; `QueryEngineTool` RAG ko wrap karta hai; history ke liye `Context(agent)` ya `Memory`. Purane `OpenAIAgent`/`AgentRunner` hat gaye.
- **Ingestion pipeline:** transformations + cache + `UPSERTS` aur stable IDs wala docstore + vector store; 15 badli files pe 6,000 ki jagah ~45 Nodes re-embed.
- **Evaluation:** `RetrieverEvaluator` (hit rate, MRR), Faithfulness, Relevancy, Correctness, `BatchEvalRunner`, `generate_question_context_pairs` plus asli sawal.
- **LlamaCloud:** Parse, Extract, managed Index, Classify, `llamactl`/`WorkflowServer` se Workflow hosting.

**Interview me bolo:** "Main LlamaIndex tab chunta hoon jab ingestion aur retrieval quality mushkil hissa ho: achha parse, structure se chunk, hybrid plus rerank, hit rate measure. Control flow complex ho to query engine LangGraph ya LangChain agent ke andar tool ban jaata hai."

**Galti mat karna:** `ServiceContext`, `OpenAIAgent` ya `chat_mode="react"`; har start pe re-indexing; random doc IDs; ingest aur query pe alag embed models; `top_k=20` ke saath `refine`; sirf faithfulness pe bharosa; model ko `employee_id` dene dena.
