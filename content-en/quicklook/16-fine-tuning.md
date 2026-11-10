**In one line:** Prompt and eval first, RAG for knowledge, fine-tune for behaviour; SFT teaches format, preference tuning (RLHF/DPO) teaches "better", RL with verifiable rewards (GRPO) teaches correct reasoning, and LoRA/QLoRA make it all cheap.

- **Decision:** facts that change, need citations or access control → RAG. Tone, format, long system prompt, cost/latency via a small model → fine-tune. Always build an eval set before training.
- **Pipeline:** base model → SFT → preference tuning (RLHF or DPO) → RLVR (GRPO) → optionally distill to a small student.
- **SFT:** chat-template `messages`, loss only on assistant tokens, hundreds to tens of thousands of examples, 1–3 epochs; watch held-out loss (overfitting) and general skills (catastrophic forgetting; mix 5–20% general data).
- **Full FT memory:** bf16 weights 2 + grads 2 + fp32 master 4 + Adam 4 + 4 = 16 bytes/param → 7B ≈ 112 GB + activations.
- **LoRA:** W frozen, learn ΔW = B·A scaled by alpha/r; 4096×4096 at r=16 → 131k vs 16.7M params (0.78%); target all linear layers; merge for zero latency or hot-swap adapters per tenant.
- **QLoRA:** 4-bit NF4 base + double quantization + paged optimizers + bf16 LoRA → 7B in about 8–16 GB, 13B on a 24 GB card.
- **RLHF:** reward model from human preference pairs, PPO with 4 models (policy, reference, reward, value); KL penalty to the reference stops reward hacking and keeps fluency.
- **Reward model:** Bradley-Terry loss −log σ(r_chosen − r_rejected); only the gap matters. ORM scores the final answer, PRM scores each step.
- **DPO:** same pairs, no reward model, no RL loop, 2 models; β (≈0.1) is the KL strength; watch length drift. Variants: IPO (squared loss), KTO (unpaired thumbs up/down), ORPO (SFT + odds ratio, no reference), SimPO (length-normalised, no reference).
- **GRPO / RLVR:** sample G answers, score with a checker (tests, answer match), advantage = (r − group mean)/std, no value model; all-same rewards give zero signal. DeepSeek-R1: R1-Zero pure RL, R1 adds cold-start SFT, distilled 1.5B–70B students.
- **Distillation + data:** soft labels need logits and same tokenizer; synthetic SFT data works via API (check licence). Generate (Self-Instruct, Evol-Instruct) → rule filter → dedup (MinHash) → LLM-judge score → decontaminate (13-gram / embedding overlap). LIMA: 1,000 curated examples.
- **Evaluate:** held-out split by time/intent, strong base+prompt baseline, general and safety regression, then A/B. Stack: TRL + PEFT, Unsloth, Axolotl, torchtune, hosted APIs.

**Say in the interview:** "I first beat the problem with prompting plus an eval set, use RAG for knowledge, and fine-tune only for behaviour or cost: QLoRA SFT on curated data, then DPO if I have preference pairs, or GRPO if the task has a checkable answer. I ship only if it beats the base-plus-prompt baseline without regressing general and safety skills."

**Avoid:** fine-tuning to teach company facts; no eval set; wrong chat template; loss on prompt tokens; "7B is 14 GB so training fits on 24 GB"; RL without a KL leash; DPO without checking answer length; weak unit tests as GRPO rewards; random train/test split with near-duplicates; distilling from an API whose terms forbid it.
