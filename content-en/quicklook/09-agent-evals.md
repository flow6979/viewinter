**In one line:** Agent evals measure quality with numbers on three questions (is the answer right, was the path sound, at what cost/latency), because agents are non-deterministic and have many valid paths.

- **Why hard:** run each case 3–5 times (pass@k / pass^k); 95% per step over 10 steps is about 60%; side effects need sandboxed or mocked tools.
- **Three levels:** final response (user quality), single step / per-node (cheap, like unit tests, e.g. router accuracy), trajectory (tool sequence and args).
- **Trajectory match modes:** strict for compliance order, unordered for parallel lookups, subset for "no forbidden tool", superset for "required tools called", LLM-judged for flexible tasks. Check args separately.
- **Metrics:** task success (north star), correctness, faithfulness, tool-call and argument accuracy, steps, cost per task, p50/p95 latency, safety; slice by intent, language, tier.
- **Programmatic checks first:** "was a refund row created?" beats a judge on cost and reliability.
- **LLM-as-judge:** specific rubric, pass/fail over 1–10, reasoning before verdict; reference-free, reference-guided or pairwise.
- **Judge biases:** position, verbosity, self-preference, leniency; calibrate on 100–200 human labels to ~85–90%+ agreement (kappa, TPR/TNR); version the judge.
- **Datasets:** real prod traces (thumbs-down, escalations), edge cases, adversarial, reviewed synthetic; start 20–50, grow to 200–500; versioned; no eval examples in few-shots.
- **Offline vs online:** offline golden set gates the ship; online = reference-free judges on sampled traces, 5–10% A/B on business metrics, implicit feedback signals.
- **CI gates:** fast 50-example per-node suite on every PR, full suite nightly; thresholds relative to baseline (e.g. no more than 2% drop).
- **Simulation:** LLM user with persona, goal, hidden info; state-based final check (τ-bench style). Eval-driven loop: read traces, categorize failures, fix the top category, re-run the full suite.

**Say in the interview:** "An LLM judge is also a model to evaluate: I measure its agreement on a human-labeled set first. And I don't start with generic metrics; I read 100 traces, find the failure modes, then write evals for them."

**Avoid:** Vibe-checking 5 examples; checking only the final answer; strict trajectory mode everywhere; same model as generator and judge; shipping on 95% from synthetic happy paths; 1,000-example full-judge suites on every PR.
