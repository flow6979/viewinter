**Ek line:** Steps pata na ho to control flow LLM ko do (ReAct, plan-and-execute, Reflexion), aur multi-agent tabhi jab context isolation ya parallel breadth extra tokens ka paisa vasool kare.

- **ReAct:** model → `tool_calls`? → tools → model, jab tak tool call na ho; 3–15 tools aur input pe depend karta path. LangChain 1.0 me `create_agent` (middleware), deprecated `create_react_agent` nahi.
- **Plan-and-execute:** planner plan likhta, executor steps chalata, replanner update ya finish karta; bada planner + chhota executor = cost bachat. Replanner hi ise orchestrator-worker se alag karta hai.
- **ReWOO:** variables (`#E1`, `#E2`) ke saath ek baar plan, lagbhag 2 LLM calls, tokens bachte hain par replan nahi hota.
- **LLMCompiler:** tasks ka DAG, dependencies ready hote hi parallel; latency bachti hai, adaptivity kam.
- **Reflexion:** attempt, external signal (tests, errors) pe reflection, memory me save, retry; grounded signal ke bina bekaar.
- **Supervisor:** central LLM ke `transfer_to_<agent>` tools jo `Command(goto=..., graph=Command.PARENT)` return karte; workers wapas supervisor pe. Default, kyunki control flow ek jagah dikhta hai.
- **Hierarchical / swarm / network:** team subgraphs ke supervisors (har level 3–6 agents); swarm = active agent khud handoff kare, checkpointer yaad rakhe kaun active; network rare aur debug mushkil.
- **Cost reality:** Anthropic ka multi-agent research single agent se ~90% better, par chat se ~15x tokens; Cognition kehta hai coding jaise write-heavy kaam me single-threaded better.
- **Kab todna:** alag domains ke 30+ tools, ya breadth research; 10–15 se kam tools, tightly coupled edits ya high-volume FAQ = single agent.
- **Handoff state:** shared history (poora context, badhta hai) vs private scratchpad (sasta, info loss ho sakta); hybrid me sirf user turns + final answers shared. Handoff = structured brief.
- **Multi-agent failures:** ping-pong, role confusion, lost context, conflicting outputs, supervisor khud kaam kare, cost blow-up, silent failure; handoff counter, scoped tools, structured status se fix.

**Interview me bolo:** "Multi-agent ka decision token budget se shuru karta hoon: ek agent ka context tools aur history se overflow ho, ya parallel breadth chahiye, tab split. Warna single agent. Zyadatar multi-agent bugs coordination bugs hain, model bugs nahi."

**Galti mat karna:** Org chart ko agent chart bana dena; `graph=Command.PARENT` bhoolna; replanner skip karna; subagent ka poora 30k-token transcript parent me merge karna; sirf final answer eval karna.
