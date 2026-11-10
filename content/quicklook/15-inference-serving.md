**Ek line:** Serving do limits se ladai hai, GPU memory (weights + KV cache fit hone chahiye) aur memory bandwidth (decode har token pe saare weights dobara padhta hai); har trick ya memory bachati hai ya har weight read se zyada tokens nikaalti hai.

- **Prefill vs decode:** prefill poora prompt parallel padhta hai, compute-bound hai (TTFT set karta hai). Decode har step ek token, har step saare weights padhta hai, memory-bound hai (TPOT set karta hai). 8B BF16 = har step 16 GB read ≈ H100 pe 5 ms, to ek user ko ~200 tok/s.
- **Metrics:** TTFT, TPOT/ITL, end-to-end = TTFT + TPOT × tokens, throughput (total tok/s), goodput (SLO ke andar requests/s). Bada batch = zyada throughput, bura TPOT.
- **KV cache:** per token `2 × layers × kv_heads × head_dim × bytes`. Llama-3-8B jaisa (32, 8, 128, FP16) = 128 KB/token, 8k context ≈ 1 GB/request. 70B jaisa = 320 KB/token. GQA 32 KV heads ke muqable 4 guna kam.
- **Prefix caching:** identical prefixes (system prompt, tools, docs) ka KV reuse; TTFT aur cost ghatata hai. vLLM block hashes, SGLang radix tree.
- **PagedAttention:** KV 16-token blocks me + har request ki block table, OS paging jaisa. Waste ~60–80% se kuch percent; shared prefix blocks ref counts aur copy-on-write ke saath.
- **Continuous batching:** har token step pe schedule; khatam requests nikalti, waiting judti. Chunked prefill lambe prompts todta hai taaki decode na ruke.
- **Speculative decoding:** k tokens draft, target ek pass me verify. Lossless: min(1, p/q) se accept, residual se resample. α = 0.8, k = 4 → har target step ~3.4 tokens; asli 2–3 guna. Variants: draft model, Medusa, EAGLE, n-gram/prompt lookup.
- **Quantization:** bytes/param FP32 4, BF16 2, FP8/INT8 1, INT4 ~0.5. Weight-only (W4A16) decode me help; W8A8/FP8 prefill bhi tez (H100 pe native). GPU ke liye GPTQ, AWQ; llama.cpp ke liye GGUF Q4_K_M. FP8 KV cache KV memory aadhi. Evals hamesha dobara chalao.
- **Sizing:** memory = weights + KV + overhead. 70B BF16 = 140 GB, ek H100 pe nahi; 2× H100 pe FP8 ya ek pe INT4 (~35–40 GB). TP server ke andar (NVLink), PP servers ke paar, throughput ke liye replicas.
- **Engines:** vLLM default; shared-prefix aur agent workloads ke liye SGLang; max NVIDIA perf ke liye TensorRT-LLM; laptop aur edge ke liye llama.cpp/Ollama. Multi-LoRA: ek base, bahut adapters, mixed batches.
- **Cost levers:** router ya cascade (pehle chhota model, low confidence pe escalate), exact + semantic cache, self-host sirf high steady volume pe (cost per M tokens = $/hr ÷ asli tok/s × 3,600 / 1M).

**Interview me bolo:** "Decode memory-bound hai, to main har weight read se max tokens nikaalta hoon: bade batches ke liye continuous batching aur paged KV, low batch pe speculative decoding, bytes ghatane ke liye FP8 ya INT4. GPUs ko weights plus target concurrency ke KV se size karta hoon aur asli traffic pe TTFT, TPOT aur goodput benchmark karta hoon."

**Galti mat karna:** decode ke liye GPU ko "weak" kehna; sirf weights ke liye sizing; KV heads ki jagah query heads ginna; kehna ki speculative decoding output quality badalta hai; high-traffic production me Ollama; 100% utilization pe self-host cost ka hisaab.
