**Ek line:** LLM stateless hai; memory matlab tumhara code decide kare kya save karna, kab wapas laana, kab bhoolna, aur context engineering window me sirf zaroori, sahi, fresh tokens rakhti hai.

- **Short-term:** `thread_id` pe state + checkpointer; production me `PostgresSaver`/`RedisSaver`, `InMemorySaver` restart pe sab kho deta hai.
- **Trimming:** `trim_messages` sirf LLM ko jaane wala view chhota karta hai, state nahi; tool_call / tool_result pair kabhi mat todo (`start_on="human"`).
- **Summarization:** purane messages ka running summary + last kuch turns verbatim; IDs, amounts, commitments kabhi drop nahi; summary drift se bacho; background me chalao.
- **Long-term (CoALA):** semantic = facts (profile ya collection), episodic = purane successful runs few-shot ki tarah, procedural = agent ke apne rules/prompt.
- **Store:** `namespace` tuple se cross-thread key-value + optional semantic search; namespace hi access boundary hai, `user_id` trusted context se lo.
- **Hot path vs background:** `save_memory` tool fresh par latency badhata; debounced background extraction (5–10 min idle) existing memories dekh ke insert/update/delete decide karta.
- **Context engineering:** write (scratchpad, bada tool output file me), select (relevant memories, tools, docs), compress (trim, summarize, prune), isolate (fresh window wala sub-agent).
- **Context rot:** tokens badhne pe accuracy girti hai; lost-in-the-middle; poisoning, distraction, confusion, clash bhi. Instructions shuru me, sawal end me.
- **Prompt caching:** identical prefix ~10% price pe; order tools → system → static docs → history → latest message; timestamp ya random tool order cache tod deta hai.
- **Privacy + staleness:** per-user namespace, PII kabhi store nahi, user dekh/delete kar sake, volatile facts pe TTL, `updated_at`, conflicts ko UPDATE/DELETE/NOOP/ADD se consolidate.

**Interview me bolo:** "Context ek budget hai: har tool output pe token cap, bade outputs files me, deep research sub-agents ko jo sirf summary lautayein. Memory cache hai, source of truth nahi; transactional facts API se aate hain."

**Galti mat karna:** "1M window hai, sab daal do"; production me `InMemorySaver`; saare users ek namespace me; contradictions se bhari append-only memory; har turn prefix badalna aur phir poochhna caching kyun nahi chal rahi.
