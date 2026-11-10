**In one line:** Outside the agent rounds, an LLM engineer loop tests fundamentals, serving numbers, fine-tuning choices, applied RAG and evals, ML system design, small coding tasks and a measured project story.

- **Rounds:** screen, LLM fundamentals, ML/LLM system design, coding, project deep-dive, behavioural; every strong answer carries one number.
- **Fundamentals:** attention = softmax(Q·Kᵀ/√d)·V with a causal mask; GQA shrinks the KV cache; MoE compute follows active params but memory holds all; temperature 0 is not guaranteed deterministic.
- **Decode is memory-bound:** every token reads all weights; an 8B FP16 model on one H100 caps near 200 tokens/s per request, so batching is the main lever.
- **KV cache per token:** 2 × layers × KV heads × head dim × bytes; Llama 3 8B ≈ 128 KB, 70B ≈ 320 KB, so an 8K request on 70B ≈ 2.6 GB.
- **Serving tricks:** continuous batching, PagedAttention, prefix caching, chunked prefill, FP8/INT4 quantization (rerun evals), speculative decoding (lossless, best at low batch), multi-LoRA on one base.
- **Tuning choice:** prompt first, RAG for knowledge, fine-tune for behaviour and format; LoRA trains <1% of params; QLoRA = 4-bit frozen base; full FT ≈ 16 bytes per param.
- **Preference and RL:** RLHF = reward model + PPO + KL; DPO = pairs, no reward model; GRPO = group-relative advantage, no critic, great with verifiable rewards.
- **Applied:** debug RAG as retrieval vs generation; constrained decoding guarantees parse, not correctness; DSPy optimises prompts against a metric; voice = streaming cascade with barge-in.
- **Security and LLMOps:** injection is solved by architecture (least privilege, approvals), not prompts; pin model versions, gate prompt changes per slice in CI, sample production with a calibrated judge.
- **Coding:** be able to write causal attention and top-p sampling in NumPy from memory, plus retry-with-backoff, a cosine retriever and an agent loop.
- **Project story:** situation, task, baseline, eval, 3–4 iterations with numbers, one honest failure, business result.

**Say in the interview:** "I start with a small eval set and a plain baseline, size GPUs by KV cache not weights, put knowledge in retrieval and behaviour in fine-tuning, and gate every prompt or model change per slice."

**Avoid:** "just fine-tune it" for facts; sizing GPUs from weights only; claiming temperature 0 is deterministic; designs with no eval; project stories with no numbers or failures.
