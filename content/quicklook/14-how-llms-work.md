**Ek line:** LLM ek transformer hai jo next token predict karta hai; tumhara prompt ek parallel pass me padhta hai, phir ek-ek sampled token likhta hai, aur lagbhag har cost, latency aur quality ka sawal isi loop pe aata hai.

- **Size:** parameters seekhe hue numbers hain; 7B params × 2 bytes (FP16) = 14 GB weights, KV cache se pehle hi.
- **Tokens:** BPE sabse frequent pairs merge karke 32K–200K ki vocabulary banata hai; ~0.75 English words per token; Hindi aksar 2–4× zyada tokens; "strawberry" fail kyunki model `str`+`aw`+`berry` dekhta hai, letters nahi.
- **Embeddings:** har token ID ek learned vector banti hai; milta-julta matlab = paas ke vectors (cosine); semantic search bhi isi idea pe chalta hai.
- **Attention:** `softmax(QKᵀ/√d_k)·V`; Q aur K tay karte hain kitna dekhna hai, V wo hai jo aage jaata hai; causal mask future chhupata hai; n × n scores se O(n²). FlashAttention memory fix karta hai, compute nahi.
- **Layer:** pre-norm → multi-head attention → residual → norm → FFN (lagbhag 2/3 params) → residual; 7B me 32 layers, 70B me 80.
- **MHA / MQA / GQA:** KV cache per token = 2 × layers × KV heads × head size × bytes. Llama 2 7B (MHA) 512 KB, Llama 3 8B (GQA, 8 KV heads) 128 KB.
- **Positions:** RoPE Q aur K ko position se ghumata hai taaki score relative distance pe depend kare; position interpolation aur YaRN context ko training length se aage kheenchte hain.
- **Prefill vs decode:** prefill compute-bound, TTFT tay karta hai; decode memory-bound (har token pe saare weights padhta hai), TPOT tay karta hai; batching main fix hai.
- **Sampling:** logits [2.0, 1.0, 0.1] T = 1 pe 0.66/0.24/0.10 aur T = 0.5 pe 0.86/0.12/0.02 dete hain; top-p p tak pahunchne wala sabse chhota set rakhta hai; extraction ke liye T ≈ 0, creative ke liye 0.7–1.0.
- **T = 0 nondeterminism:** batch pe depend floating-point sum order near ties palat deta hai; MoE routing aur silent model updates aur variance laate hain.
- **MoE:** router 8 me se top-2 experts chunta hai; Mixtral ~47B total, ~13B active; compute 13B jaisa, VRAM 47B jaisa.
- **Reasoning + hallucination:** RL-trained thinking tokens (o1, GRPO wala DeepSeek-R1) latency aur cost dekar accuracy kharidte hain; hallucination plausible text ki training se aata hai, fix: RAG, citations, tools, "pata nahi" aur evals.

**Interview me bolo:** "Model hamesha sirf ek token predict karta hai. Prefill prompt parallel padhta hai aur KV cache bharta hai; decode memory-bound hai, isliye GQA, batching aur quantisation ka matlab hai zyada cache fit karna aur har token pe kam bytes padhna."

**Galti mat karna:** kehna ki FlashAttention attention ko linear banata hai; "8x7B = 56B params" ya "MoE ko kam memory chahiye"; temperature 0 pe determinism ka promise; context words me ginna, tokens me nahi; ye claim ki RAG hallucination khatam karta hai.
