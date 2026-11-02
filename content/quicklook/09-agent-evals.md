**Ek line:** Agent evals teen sawal numbers me naapte hain (jawab sahi hai, path theek tha, kitne cost/latency me), kyunki agent non-deterministic hai aur ek goal ke kai valid paths hote hain.

- **Mushkil kyun:** har case 3–5 baar chalao (pass@k / pass^k); har step 95% sahi to 10 steps baad lagbhag 60%; side effects ke liye sandboxed ya mocked tools.
- **Teen levels:** final response (user quality), single step / per-node (sasta, unit test jaisa, jaise router accuracy), trajectory (tool sequence aur args).
- **Trajectory match modes:** compliance order ke liye strict, parallel lookups ke liye unordered, "forbidden tool nahi" ke liye subset, "zaroori tools call hue" ke liye superset, flexible tasks ke liye LLM-judged. Args alag check karo.
- **Metrics:** task success (north star), correctness, faithfulness, tool-call aur argument accuracy, steps, cost per task, p50/p95 latency, safety; intent, language, tier se slice karo.
- **Pehle programmatic checks:** "refund row bani kya?" judge se sasta aur reliable.
- **LLM-as-judge:** specific rubric, 1–10 ki jagah pass/fail, verdict se pehle reasoning; reference-free, reference-guided ya pairwise.
- **Judge biases:** position, verbosity, self-preference, leniency; 100–200 human labels pe ~85–90%+ agreement tak calibrate (kappa, TPR/TNR); judge ko bhi version karo.
- **Datasets:** real prod traces (thumbs-down, escalations), edge cases, adversarial, reviewed synthetic; 20–50 se shuru, 200–500 tak; versioned; eval examples few-shots me nahi.
- **Offline vs online:** offline golden set ship ka gate; online = sampled traces pe reference-free judges, business metrics pe 5–10% A/B, implicit feedback signals.
- **CI gates:** har PR pe fast 50-example per-node suite, full suite nightly; threshold baseline ke relative (jaise 2% se zyada drop nahi).
- **Simulation:** persona, goal, hidden info wala LLM user; final check state-based (τ-bench style). Eval-driven loop: traces padho, failures categorize karo, top category fix, full suite dobara.

**Interview me bolo:** "LLM judge bhi ek model hai jise evaluate karna padta hai: pehle human-labeled set pe uska agreement naapta hoon. Aur generic metrics se shuru nahi karta; 100 traces padh ke failure modes dhoondta hoon, phir unke evals likhta hoon."

**Galti mat karna:** 5 examples dekh ke "chal raha hai"; sirf final answer check; har jagah strict trajectory mode; generator aur judge same model; synthetic happy paths pe 95% dekh ke ship; har PR pe 1,000 examples full judge ke saath.
