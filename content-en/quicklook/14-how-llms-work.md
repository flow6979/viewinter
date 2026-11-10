**In one line:** An LLM is a transformer that predicts the next token; it reads your prompt in one parallel pass, then writes one sampled token at a time, and almost every cost, latency and quality question traces back to that loop.

- **Size:** parameters are learned numbers; 7B params × 2 bytes (FP16) = 14 GB of weights, before the KV cache.
- **Tokens:** BPE merges the most frequent pairs into a 32K–200K vocabulary; ~0.75 English words per token; Hindi often 2–4× more tokens; "strawberry" fails because the model sees `str`+`aw`+`berry`, not letters.
- **Embeddings:** each token ID becomes a learned vector; similar meaning = nearby vectors (cosine); the same idea powers semantic search.
- **Attention:** `softmax(QKᵀ/√d_k)·V`; Q and K decide how much to look, V is what is passed on; causal mask hides the future; n × n scores make it O(n²). FlashAttention fixes memory, not compute.
- **Layer:** pre-norm → multi-head attention → residual → norm → FFN (about 2/3 of params) → residual; 32 layers for 7B, 80 for 70B.
- **MHA / MQA / GQA:** KV cache per token = 2 × layers × KV heads × head size × bytes. Llama 2 7B (MHA) 512 KB, Llama 3 8B (GQA, 8 KV heads) 128 KB.
- **Positions:** RoPE rotates Q and K by position so scores depend on relative distance; position interpolation and YaRN stretch the context past training length.
- **Prefill vs decode:** prefill is compute-bound and sets TTFT; decode is memory-bound (reads all weights per token) and sets TPOT; batching is the main fix.
- **Sampling:** logits [2.0, 1.0, 0.1] give 0.66/0.24/0.10 at T = 1 and 0.86/0.12/0.02 at T = 0.5; top-p keeps the smallest set reaching p; T ≈ 0 for extraction, 0.7–1.0 for creative.
- **T = 0 nondeterminism:** batch-dependent floating-point sum order flips near ties; MoE routing and silent model updates add variance.
- **MoE:** router picks top-2 of 8 experts; Mixtral ~47B total, ~13B active; compute like 13B, VRAM like 47B.
- **Reasoning + hallucination:** RL-trained thinking tokens (o1, DeepSeek-R1 with GRPO) buy accuracy with latency and cost; hallucination comes from training for plausible text, fixed with RAG, citations, tools, "I don't know" and evals.

**Say in the interview:** "The model only ever predicts one token. Prefill reads the prompt in parallel and fills the KV cache; decode is memory-bound, so GQA, batching and quantisation are about fitting more cache and reading fewer bytes per token."

**Avoid:** saying FlashAttention makes attention linear; "8x7B = 56B params" or "MoE needs less memory"; promising determinism at temperature 0; counting context in words instead of tokens; claiming RAG removes hallucination.
