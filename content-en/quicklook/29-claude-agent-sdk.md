**In one line:** Claude Code's harness as a library (`claude-agent-sdk`, formerly Claude Code SDK): you pass a prompt and `ClaudeAgentOptions`, and a Claude Code subprocess runs the loop with built-in tools, permissions, hooks, subagents, sessions and compaction.

- **`query()` vs `ClaudeSDKClient`:** one task per call (new session, raises after an error result) vs one live session across turns with `interrupt()`, `set_model()`, `set_permission_mode()`.
- **Built-in tools:** Read, Edit, Write, Glob, Grep, Bash, WebSearch, WebFetch, Agent (subagents), Skill, ToolSearch; read-only tools run in parallel, Edit/Write/Bash run one at a time.
- **`allowed_tools` only pre-approves:** remove tools with `tools=[...]` or a bare name in `disallowed_tools`; scoped deny rules like `Bash(rm *)` hold even in `bypassPermissions`.
- **Custom tools:** `@tool(name, desc, schema)` + `create_sdk_mcp_server` → `mcp_servers={"payments": ...}`; names are `mcp__payments__get_payment`; return `is_error` for clean failures; MCP schemas deferred by tool search.
- **Permission modes:** default, acceptEdits, plan, dontAsk (headless), auto (classifier), bypassPermissions (sandbox only); order: hooks → deny rules → mode/allow rules → `can_use_tool`.
- **Hooks:** PreToolUse (block or allow), PostToolUse (audit), UserPromptSubmit, Stop, SubagentStart/Stop, PreCompact; deny via `permissionDecision: "deny"`; allow-list commands, never block-list.
- **Subagents:** `agents={"name": AgentDefinition(description, prompt, tools, model)}`; fresh window, only the final report returns; cap depth, concurrency and `max_budget_usd`.
- **Sessions:** `session_id` from `ResultMessage`; `resume=`, `fork_session=True`; local transcripts die with the container, so add a `SessionStore`.
- **Prompt and settings:** default system prompt is minimal; `{"type": "preset", "preset": "claude_code", "append": ...}` for Claude Code behaviour; `setting_sources` loads user/project/local (default all, `[]` to isolate); skills load only when invoked.
- **Compaction:** automatic near the limit, emits `compact_boundary`; durable rules go in `CLAUDE.md` (re-sent every turn); subagents prevent bloat in the first place.
- **vs Messages API:** there you write the loop, tools, trimming and safety in a stateless call; the SDK gives a full harness but runs a subprocess with a shell.
- **Hosting:** sandboxed container per task or tenant, egress proxy with allow-list and credential injection, per-tenant `cwd` and config dir, `max_turns` + `max_budget_usd`, OTel via env vars.

**Say in the interview:** "I configure, I don't draw the flow: tight tools, deny rules and a PreToolUse allow-list hook, subagents on cheap models for heavy reading, the `claude_code` preset for coding, `setting_sources=[]` per tenant, and every session in a sandbox with turn and dollar caps."

**Avoid:** treating `allowed_tools` as security; `bypassPermissions` outside a sandbox; expecting Claude Code behaviour without the preset; default settings in multi-tenant hosts; no session store on autoscaled pods; billing from `usage` instead of `total_cost_usd`.
