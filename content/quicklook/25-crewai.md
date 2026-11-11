**Ek line:** CrewAI role-based agents (role, goal, backstory) ki team ko clear expected output wale tasks pe chalata hai, aur unhe deterministic glue ke liye Flows (`@start`, `@listen`, `@router`, typed state) me wrap karta hai; CrewAI 1.15.x ke hisaab se.

- **Agent:** `role`, `goal`, `backstory`, `llm` (`openai/gpt-4.1-mini` jaisa model string), `tools`, `allow_delegation` ("delegate work" aur "ask question" coworker tools jodta hai), limits `max_iter`, `max_execution_time`, `max_rpm`.
- **Task:** `description` + `expected_output` + `agent`; explicit data flow ke liye `context=[task]`; typed output ke liye `output_pydantic`; `guardrail` `(True, value)` ya `(False, feedback)` lautata hai aur retry karta hai (default 3); `human_input`, `async_execution`.
- **Crew + Process:** sequential (list order, predictable, sasta) vs hierarchical (`manager_llm` ek manager banata hai jo delegate karta hai; 2–6 calls badhti hain, debug mushkil). `kickoff(inputs)` `.raw`, `.pydantic`, `.token_usage` wala `CrewOutput` lautata hai.
- **Flows:** Pydantic state ke saath `Flow[State]`; `@start` entry, `@listen(step)` step ke baad, `@router(step)` label lautata hai, `or_` / `and_`; `id` se resume ke liye `@persist`; `flow.plot()`.
- **Flows vs Crews:** jo step code ho sakta hai wo code hai; crew sirf ek Flow step ke andar jahan autonomy help kare. Zyada tar production apps Flow-first hain.
- **Task ke andar:** prompt = "You are {role}. {backstory}. Your goal: {goal}" + tools + task + expected output + context; final answer ya `max_iter` tak tool loop; phir Pydantic parse aur guardrail.
- **Memory aur knowledge:** 1.x me ek unified `Memory` (LLM scope aur importance score karta hai, LanceDB, shallow ya deep recall); knowledge sources (string, PDF) agent ya crew se jude RAG hain. Memory per user scope karo.
- **Project layout:** `crewai create crew` ab JSON-first hai (`agents/*.jsonc`, `crew.jsonc`); `--classic` deta hai `agents.yaml`, `tasks.yaml`, `@CrewBase`; Flow projects ke liye `crewai create flow`.
- **Production:** tracing (`crewai traces enable`, OpenTelemetry tools), har run ka `token_usage`, caps, `crewai eval`, async job API, apni service ya AMP pe deploy.
- **Cost:** persona aur tool schemas har call pe dobara jaate hain; crew tools wale ek agent se roughly 2–4× tokens leti hai.
- **Haal ke changes:** LangChain dependency nahi, late 2025 me 1.0, unified memory, JSON scaffold, `function_calling_llm` aur `allow_code_execution` deprecated.

**Interview me bolo:** "Typed state aur persistence wala Flow backbone hai; chhoti sequential crews sirf jahan judgement chahiye; paise wali har cheez pe `output_pydantic` plus code guardrails. Hierarchical sirf jab kaam ka split pata na ho. LangGraph ke against: CrewAI jaldi banta hai, LangGraph finer control aur checkpoints deta hai."

**Galti mat karna:** jahan chaar tools wala ek agent kaafi ho wahan chaar role-play agents; known pipeline ke liye hierarchical; har jagah `allow_delegation=True`; vague `expected_output`; multi-user app me unscoped `memory=True`; synchronous HTTP request ke andar `kickoff()`.
