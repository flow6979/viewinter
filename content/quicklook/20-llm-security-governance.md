**Ek line:** Maan ke chalo model hijack ya jailbreak ho sakta hai; security limit karti hai ki fool hua model kya kar sake, aur governance prove karti hai ki system fair, nigraani me, traceable aur legal hai.

- **Threat model:** assets (data, actions, paisa, brand) × entry points (user input, retrieved docs, tool outputs, MCP servers, memory, uploads) × attacker goals; likelihood × impact se rank karo.
- **Prompt injection unsolved hai:** instructions aur data ek token stream share karte hain, to "parameterized query" jaisa fix nahi. Guards aur lethal trifecta ka recap Guardrails page pe.
- **Design-level defences:** privilege separation, dual-LLM (bina tools wala quarantined reader fixed schema lautata hai), CaMeL-style fixed plan plus code se check hone wale data labels, egress allowlist, side effects pe human approval.
- **Jailbreaks:** role-play, obfuscation/encoding, many-shot, multi-turn escalation, adversarial suffix. Input aur output classifiers, conversation-level scoring, narrow scope, rate limits se bachao.
- **Red teaming:** scope aur fail rules → threat model → attack library → automated (garak, PyRIT, promptfoo) + manual → severity → code me fix → CI regression suite jo attack success rate track kare.
- **Permissions:** har tool pe least privilege, short-lived scoped tokens, user ki taraf se OAuth, secrets vault me kabhi prompt me nahi, egress allowlist, budgets, code ke liye sandbox.
- **Risk tiers:** read = auto; reversible write = limits ke saath auto; irreversible ya high value = exact arguments dikha ke human approval.
- **Data leakage:** system prompt (public maano), training memorisation (fine-tuning se pehle PII scrub), cross-tenant RAG (session se vector DB query ke andar ACL filter), logs (redact, restrict, kam din retain).
- **Supply chain:** models hash se pin, pickle ki jagah safetensors (majboori me `weights_only=True`), MCP servers allowlist aur pin, badle hue tool descriptions pe nazar, dependencies lock.
- **Governance:** counterfactual bias tests (naam, gender, region swap), AI disclosure, model cards, asli human oversight, model aur prompt version ke saath audit log, residency, retention, consent.
- **EU AI Act:** prohibited / high-risk (hiring, credit, education) / limited (chatbot disclose, deepfake label) / minimal; GPAI providers pe documentation aur copyright duties, systemic-risk models pe zyada.
- **India DPDP 2023 aur GDPR:** notice ke saath consent, access, correction aur erasure ke haq, bachchon ke liye parental consent, ₹250 crore tak penalty; model weights se erasure mushkil, isliye personal data deletable stores me rakho.

**Interview me bolo:** "Main maan ke chalta hoon ki model kabhi na kabhi fool hoga. Isliye asli controls code me hain: scoped tokens, tool allowlists, retrieval pe tenant filters, egress limits aur irreversible actions pe human approval, aur har red-team finding CI me lock."

**Galti mat karna:** "strong system prompt injection rok dega"; prompt me secrets; saare tools ke liye ek admin service account; retrieval ke baad tenant filter; ek baar wali red teaming; untrusted pickle files load karna; "Indian company pe EU law nahi lagta"; yaad se exact regulatory deadlines bolna.
