**Ek line:** Agent = LLM + tools + memory + loop, jahan LLM khud agla step aur kab rukna hai decide karta hai; agar tumhara code decide kare to wo workflow hai.

- **Control flow:** chatbot = ek call; workflow = tumhara code fixed path chalata hai; agent = LLM loop me steps aur tools choose karta hai.
- **ReAct loop:** reason, act (tool call = name + JSON args), observe (result wapas context me), done hone tak repeat.
- **Stop conditions:** bina tool call ka reply (`end_turn` / `stop`), `max_steps`, budget/time limit, guardrail trigger.
- **Tool calling:** name + description + JSON schema do; model sirf call request karta hai, execute tumhara code karta hai (auth, validation, rate limit).
- **Description = prompt:** kab use karna, kab nahi, arg format likho; schema tight rakho (`enum`, `required`).
- **Tool error = observation:** clear error (`is_error`) wapas bhejo taaki model khud sudhare; retries limit karo. Parallel calls ke results ek hi message me.
- **Cost:** har step pe poori history dobara jaati hai, cost lagbhag quadratic badhta hai; tool output trim karo, prompt caching lagao.
- **Workflow vs agent:** steps pehle se pata, strict SLA ya auditable output = workflow; open-ended, unknown steps = agent. Hybrid sabse common.
- **Autonomy L0–L4:** single call, router, tool agent, multi-agent, autonomous; har level upar = zyada guardrails, HITL, evals.
- **Failure modes:** loop me atakna, galat tool, hallucinated args, context overflow, jaldi "done", tool output se injection, error nigal jaana.

**Interview me bolo:** "Har agent ki teen hard limits: max steps, max tokens/cost, aur wall-clock timeout. Default workflow se shuru karta hoon, agent tabhi jab evals dikhayein ki fixed path kaafi nahi."

**Galti mat karna:** Har LLM + tool system ko agent bolna; 30–50 tools ek saath dena; `tool_use_id` match na karna (400 error); sirf final answer dekhna, trajectory nahi.
