**In one line:** Assume the model can be hijacked or jailbroken; security limits what a fooled model can do, and governance proves the system is fair, overseen, traceable and legal.

- **Threat model:** assets (data, actions, money, brand) × entry points (user input, retrieved docs, tool outputs, MCP servers, memory, uploads) × attacker goals; rank by likelihood × impact.
- **Prompt injection is unsolved:** instructions and data share one token stream, so there is no "parameterized query" fix. Recap of guards and the lethal trifecta lives on the Guardrails page.
- **Design-level defences:** privilege separation, dual-LLM (quarantined reader with no tools returns a fixed schema), CaMeL-style fixed plan plus data labels checked by code, egress allowlist, human approval for side effects.
- **Jailbreaks:** role-play, obfuscation/encoding, many-shot, multi-turn escalation, adversarial suffix. Defend with input and output classifiers, conversation-level scoring, narrow scope, rate limits.
- **Red teaming:** scope and fail rules → threat model → attack library → automated (garak, PyRIT, promptfoo) + manual → severity → fix in code → CI regression suite tracked by attack success rate.
- **Permissions:** least privilege per tool, short-lived scoped tokens, OAuth on behalf of the user, secrets in a vault never in prompts, egress allowlist, budgets, sandbox for code.
- **Risk tiers:** read = auto; reversible write = auto with limits; irreversible or high value = human approval showing exact arguments.
- **Data leakage:** system prompt (treat as public), training memorisation (scrub PII before fine-tuning), cross-tenant RAG (ACL filter inside the vector DB query from the session), logs (redact, restrict, retain briefly).
- **Supply chain:** pin models by hash, prefer safetensors over pickle (`weights_only=True` if forced), allowlist and pin MCP servers, watch for changed tool descriptions, lock dependencies.
- **Governance:** counterfactual bias tests (swap names, gender, region), AI disclosure, model cards, real human oversight, audit log with model and prompt version, residency, retention, consent.
- **EU AI Act:** prohibited / high-risk (hiring, credit, education) / limited (disclose chatbots, label deepfakes) / minimal; GPAI providers have documentation and copyright duties, more for systemic-risk models.
- **India DPDP 2023 and GDPR:** consent with notice, rights to access, correction and erasure, parental consent for children, penalties up to ₹250 crore; erasure from model weights is hard, so keep personal data in deletable stores.

**Say in the interview:** "I assume the model will sometimes be fooled. So the controls that matter live in code: scoped tokens, tool allowlists, tenant filters at retrieval, egress limits and human approval for irreversible actions, with every red-team finding locked into CI."

**Avoid:** "a strong system prompt stops injection"; secrets in the prompt; one admin service account for all tools; filtering tenants after retrieval; one-off red teaming; loading untrusted pickle files; "EU law does not apply to an Indian company"; quoting exact regulatory deadlines from memory.
