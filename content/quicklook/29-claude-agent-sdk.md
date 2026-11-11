**Ek line:** Claude Code ka harness library ki tarah (`claude-agent-sdk`, pehle Claude Code SDK): prompt aur `ClaudeAgentOptions` do, aur Claude Code subprocess built-in tools, permissions, hooks, subagents, sessions aur compaction ke saath loop chalata hai.

- **`query()` vs `ClaudeSDKClient`:** har call ek task (naya session, error result ke baad raise) vs turns ke paar ek live session, `interrupt()`, `set_model()`, `set_permission_mode()` ke saath.
- **Built-in tools:** Read, Edit, Write, Glob, Grep, Bash, WebSearch, WebFetch, Agent (subagents), Skill, ToolSearch; read-only tools parallel, Edit/Write/Bash ek-ek karke.
- **`allowed_tools` sirf pre-approve karta hai:** tools `tools=[...]` se ya `disallowed_tools` me bare name se hatao; `Bash(rm *)` jaise scoped deny rules `bypassPermissions` me bhi tikte hain.
- **Custom tools:** `@tool(name, desc, schema)` + `create_sdk_mcp_server` → `mcp_servers={"payments": ...}`; naam `mcp__payments__get_payment`; saaf failure ke liye `is_error`; tool search MCP schemas defer karta hai.
- **Permission modes:** default, acceptEdits, plan, dontAsk (headless), auto (classifier), bypassPermissions (sirf sandbox); order: hooks → deny rules → mode/allow rules → `can_use_tool`.
- **Hooks:** PreToolUse (block ya allow), PostToolUse (audit), UserPromptSubmit, Stop, SubagentStart/Stop, PreCompact; `permissionDecision: "deny"` se deny; commands allow-list karo, block-list kabhi nahi.
- **Subagents:** `agents={"name": AgentDefinition(description, prompt, tools, model)}`; fresh window, sirf final report wapas; depth, concurrency aur `max_budget_usd` cap karo.
- **Sessions:** `ResultMessage` se `session_id`; `resume=`, `fork_session=True`; local transcripts container ke saath mar jaate hain, isliye `SessionStore` jodo.
- **Prompt aur settings:** default system prompt minimal; Claude Code behaviour ke liye `{"type": "preset", "preset": "claude_code", "append": ...}`; `setting_sources` user/project/local load karta hai (default sab, isolate ke liye `[]`); skills sirf invoke hone pe load.
- **Compaction:** limit ke paas automatic, `compact_boundary` deta hai; pakke rules `CLAUDE.md` me (har turn dobara jaata hai); subagents bloat pehle hi rokte hain.
- **vs Messages API:** wahan loop, tools, trimming aur safety tum stateless call me likhte ho; SDK poora harness deta hai par shell wala subprocess chalata hai.
- **Hosting:** har task ya tenant ka sandboxed container, allow-list aur credential injection wala egress proxy, per-tenant `cwd` aur config dir, `max_turns` + `max_budget_usd`, env vars se OTel.

**Interview me bolo:** "Main configure karta hoon, flow draw nahi karta: tight tools, deny rules aur PreToolUse allow-list hook, bhaari padhai ke liye saste models pe subagents, coding ke liye `claude_code` preset, har tenant ke liye `setting_sources=[]`, aur har session turn aur dollar caps ke saath sandbox me."

**Galti mat karna:** `allowed_tools` ko security samajhna; sandbox ke bahar `bypassPermissions`; bina preset Claude Code behaviour ki ummeed; multi-tenant hosts me default settings; autoscaled pods pe session store nahi; `total_cost_usd` ki jagah `usage` se billing.
