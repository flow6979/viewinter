**Ek line:** Pehle prompt aur eval, knowledge ke liye RAG, behaviour ke liye fine-tune; SFT format sikhata hai, preference tuning (RLHF/DPO) "better kya hai" sikhata hai, verifiable rewards wala RL (GRPO) sahi reasoning sikhata hai, aur LoRA/QLoRA sab sasta banate hain.

- **Decision:** badalte facts, citations ya access control → RAG. Tone, format, lamba system prompt, chhote model se cost/latency → fine-tune. Training se pehle hamesha eval set banao.
- **Pipeline:** base model → SFT → preference tuning (RLHF ya DPO) → RLVR (GRPO) → optionally chhote student me distill.
- **SFT:** chat-template `messages`, loss sirf assistant tokens pe, kuch sau se das hazaaron examples, 1–3 epochs; held-out loss (overfitting) aur general skills (catastrophic forgetting; 5–20% general data mix) dekho.
- **Full FT memory:** bf16 weights 2 + grads 2 + fp32 master 4 + Adam 4 + 4 = 16 bytes/param → 7B ≈ 112 GB + activations.
- **LoRA:** W frozen, ΔW = B·A seekho, alpha/r se scale; 4096×4096 pe r=16 → 16.7M ki jagah 131k params (0.78%); saari linear layers target; zero latency ke liye merge ya per tenant adapters hot-swap.
- **QLoRA:** 4-bit NF4 base + double quantization + paged optimizers + bf16 LoRA → 7B lagbhag 8–16 GB me, 13B 24 GB card pe.
- **RLHF:** human preference pairs se reward model, 4 models ke saath PPO (policy, reference, reward, value); reference se KL penalty reward hacking rokti hai aur fluency bachati hai.
- **Reward model:** Bradley-Terry loss −log σ(r_chosen − r_rejected); sirf gap matter karta hai. ORM final answer score karta hai, PRM har step.
- **DPO:** wahi pairs, na reward model na RL loop, 2 models; β (≈0.1) KL strength hai; length drift dekho. Variants: IPO (squared loss), KTO (unpaired thumbs up/down), ORPO (SFT + odds ratio, reference nahi), SimPO (length-normalised, reference nahi).
- **GRPO / RLVR:** G answers sample karo, checker se score (tests, answer match), advantage = (r − group mean)/std, value model nahi; sab rewards same to zero signal. DeepSeek-R1: R1-Zero pure RL, R1 me cold-start SFT, distilled 1.5B–70B students.
- **Distillation + data:** soft labels ko logits aur same tokenizer chahiye; synthetic SFT data API se bhi chalta hai (licence check karo). Generate (Self-Instruct, Evol-Instruct) → rule filter → dedup (MinHash) → LLM-judge score → decontaminate (13-gram / embedding overlap). LIMA: 1,000 curated examples.
- **Evaluate:** time/intent se held-out split, strong base+prompt baseline, general aur safety regression, phir A/B. Stack: TRL + PEFT, Unsloth, Axolotl, torchtune, hosted APIs.

**Interview me bolo:** "Pehle problem ko prompting plus eval set se harane ki koshish karta hoon, knowledge ke liye RAG, aur fine-tune sirf behaviour ya cost ke liye: curated data pe QLoRA SFT, phir preference pairs hon to DPO, ya task ka answer checkable ho to GRPO. Ship tabhi jab base-plus-prompt baseline ko hara de aur general aur safety skills na giren."

**Galti mat karna:** company facts sikhane ke liye fine-tuning; eval set nahi; galat chat template; prompt tokens pe loss; "7B 14 GB hai to training 24 GB pe ho jaayegi"; bina KL lagaam ke RL; answer length check kiye bina DPO; GRPO reward me kamzor unit tests; near-duplicates ke saath random train/test split; aisi API se distill karna jiske terms mana karte hain.
