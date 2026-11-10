**In one line:** Serving is a fight against two limits, GPU memory (weights + KV cache must fit) and memory bandwidth (decode re-reads all weights per token); every trick saves memory or gets more tokens per weight read.

- **Prefill vs decode:** prefill reads the whole prompt in parallel and is compute-bound (sets TTFT). Decode makes one token per step, reads all weights each step, and is memory-bound (sets TPOT). 8B BF16 = 16 GB read per step ≈ 5 ms on H100, so ~200 tok/s for one user.
- **Metrics:** TTFT, TPOT/ITL, end-to-end = TTFT + TPOT × tokens, throughput (total tok/s), goodput (requests/s within SLO). Bigger batch = more throughput, worse TPOT.
- **KV cache:** `2 × layers × kv_heads × head_dim × bytes` per token. Llama-3-8B-like (32, 8, 128, FP16) = 128 KB/token, 8k context ≈ 1 GB/request. 70B-like = 320 KB/token. GQA cuts it 4× vs 32 KV heads.
- **Prefix caching:** reuse KV of identical prefixes (system prompt, tools, docs); cuts TTFT and cost. vLLM block hashes, SGLang radix tree.
- **PagedAttention:** KV in 16-token blocks + per-request block table, like OS paging. Waste drops from ~60–80% to a few percent; shared prefix blocks with ref counts and copy-on-write.
- **Continuous batching:** schedule every token step; finished requests leave, waiting ones join. Chunked prefill splits long prompts so decode doesn't stall.
- **Speculative decoding:** draft k tokens, target verifies in one pass. Lossless: accept with min(1, p/q), resample from residual. α = 0.8, k = 4 → ~3.4 tokens per target step; real 2–3×. Variants: draft model, Medusa, EAGLE, n-gram/prompt lookup.
- **Quantization:** bytes/param FP32 4, BF16 2, FP8/INT8 1, INT4 ~0.5. Weight-only (W4A16) helps decode; W8A8/FP8 also speeds prefill (native on H100). GPTQ, AWQ for GPU; GGUF Q4_K_M for llama.cpp. FP8 KV cache halves KV memory. Always re-run evals.
- **Sizing:** memory = weights + KV + overhead. 70B BF16 = 140 GB, no single H100; FP8 on 2× H100 or INT4 (~35–40 GB) on one. TP inside a server (NVLink), PP across servers, replicas for throughput.
- **Engines:** vLLM default; SGLang for shared-prefix and agent workloads; TensorRT-LLM for max NVIDIA perf; llama.cpp/Ollama for laptop and edge. Multi-LoRA: one base, many adapters, mixed batches.
- **Cost levers:** router or cascade (small model first, escalate on low confidence), exact + semantic cache, self-host only at high steady volume (cost per M tokens = $/hr ÷ real tok/s × 3,600 / 1M).

**Say in the interview:** "Decode is memory-bound, so I maximize tokens per weight read: continuous batching and paged KV for big batches, speculative decoding at low batch, FP8 or INT4 to shrink bytes. I size GPUs as weights plus KV for target concurrency and benchmark TTFT, TPOT and goodput on real traffic."

**Avoid:** saying the GPU is "too weak" for decode; sizing only for weights; counting query heads instead of KV heads; claiming speculative decoding changes output quality; Ollama for high-traffic production; self-host cost math at 100% utilization.
