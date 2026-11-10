**Ek line:** Agent rounds ke alawa LLM engineer loop fundamentals, serving numbers, fine-tuning choices, applied RAG aur evals, ML system design, chhote coding tasks aur ek measured project story test karta hai.

- **Rounds:** screen, LLM fundamentals, ML/LLM system design, coding, project deep-dive, behavioural; har strong jawab me ek number hota hai.
- **Fundamentals:** attention = causal mask ke saath softmax(Q·Kᵀ/√d)·V; GQA KV cache chhota karta hai; MoE ka compute active params pe, memory me saare; temperature 0 guaranteed deterministic nahi.
- **Decode memory-bound hai:** har token saare weights padhta hai; ek H100 pe 8B FP16 model per request ~200 tokens/s pe rukta hai, isliye batching main lever hai.
- **Per token KV cache:** 2 × layers × KV heads × head dim × bytes; Llama 3 8B ≈ 128 KB, 70B ≈ 320 KB, yaani 70B pe 8K request ≈ 2.6 GB.
- **Serving tricks:** continuous batching, PagedAttention, prefix caching, chunked prefill, FP8/INT4 quantization (evals dobara chalao), speculative decoding (lossless, low batch pe best), ek base pe multi-LoRA.
- **Tuning choice:** pehle prompt, knowledge ke liye RAG, behaviour aur format ke liye fine-tune; LoRA <1% params train karta hai; QLoRA = 4-bit frozen base; full FT ≈ 16 bytes per param.
- **Preference aur RL:** RLHF = reward model + PPO + KL; DPO = pairs, reward model nahi; GRPO = group-relative advantage, critic nahi, verifiable rewards ke saath badhiya.
- **Applied:** RAG ko retrieval vs generation me tod ke debug karo; constrained decoding parse guarantee karta hai, correctness nahi; DSPy metric ke against prompts optimise karta hai; voice = barge-in ke saath streaming cascade.
- **Security aur LLMOps:** injection architecture se rukta hai (least privilege, approvals), prompts se nahi; model versions pin karo, CI me har prompt change per slice gate karo, calibrated judge se production sample karo.
- **Coding:** NumPy me causal attention aur top-p sampling yaad se likh pao, saath me retry-with-backoff, cosine retriever aur agent loop.
- **Project story:** situation, task, baseline, eval, numbers ke saath 3–4 iterations, ek sachcha failure, business result.

**Interview me bolo:** "Main chhote eval set aur plain baseline se shuru karta hoon, GPUs ko weights nahi KV cache se size karta hoon, knowledge retrieval me aur behaviour fine-tuning me rakhta hoon, aur har prompt ya model change ko per slice gate karta hoon."

**Galti mat karna:** facts ke liye "bas fine-tune kar do"; sirf weights se GPU sizing; temperature 0 ko deterministic bolna; bina eval ke designs; bina numbers ya failures wali project stories.
