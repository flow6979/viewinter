**In one line:** A tool is an API whose user is a model, so design it like a public API; MCP standardizes agent-to-tool connections, A2A standardizes agent-to-agent delegation.

- **Tool design:** verb_noun names with a namespace prefix, descriptions that say when (not) to use, typed args with units (`amount_paise`), one clear job per tool.
- **Write tools:** an `idempotency_key` so agent retries never double-refund; errors short and actionable, no stack traces.
- **Large outputs:** pagination, token-capped truncation with "N more results", a `concise | detailed` option, drop low-signal fields.
- **100+ tools:** tool RAG (embed descriptions, bind top 5–15), hierarchical routing or per-domain sub-agents; keep the tool set stable per session for caching; measure tool-retrieval recall.
- **MCP roles:** host (the app), client (1:1 connection per server), server. Primitives: tools (model-controlled), resources (app-controlled, by URI), prompts (user-controlled).
- **MCP wire:** JSON-RPC 2.0; `initialize` → `tools/list` → `tools/call`; stdio for local subprocesses, Streamable HTTP + OAuth for remote multi-user (HTTP+SSE is deprecated).
- **MCP auth:** OAuth 2.1 with PKCE, audience-bound tokens, no token passthrough, least-privilege scopes; take `user_id` from the token, not an arg.
- **MCP risks:** tool poisoning, rug pull, tool shadowing, indirect injection; the lethal trifecta (private data + untrusted content + exfiltration channel); pin, allow-list, HITL on writes.
- **A2A:** Agent Card at `/.well-known/agent-card.json`; stateful tasks (`submitted → working → input-required → completed`); messages and artifacts made of parts; JSON-RPC over HTTPS, SSE, push webhooks.
- **MCP vs A2A:** MCP is vertical (agent to tools), A2A is horizontal (agent to opaque peer agent); complementary. Same-company, same-framework multi-agent does not need A2A.
- **Sandboxes + browsers:** run LLM code in Docker/gVisor/Firecracker with limits, no secrets, no network by default; browser agents are a last resort (API → script → DOM → vision).

**Say in the interview:** "I treat an MCP server like an npm package: pin, review, least-privilege scopes, HITL on write actions. MCP is an integration standard, not an agent framework, and A2A is for crossing org or vendor boundaries."

**Avoid:** Wrapping a whole REST API 1:1 into tools with 50 KB raw responses; a public remote MCP server without auth; reviewing server code but not tool descriptions; running `exec()` on the app server.
