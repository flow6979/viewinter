**Ek line:** Tool ek API hai jiska user model hai, isliye use public API jaisa design karo; MCP agent-to-tool connection standard karta hai, A2A agent-to-agent delegation.

- **Tool design:** verb_noun naam + namespace prefix, description me kab use karna aur kab nahi, units wale typed args (`amount_paise`), har tool ka ek clear kaam.
- **Write tools:** `idempotency_key` taaki agent retry pe double refund na ho; errors chhote aur actionable, stack trace nahi.
- **Bade outputs:** pagination, token-capped truncation + "N aur results", `concise | detailed` option, low-signal fields hatao.
- **100+ tools:** tool RAG (descriptions embed, top 5–15 bind), hierarchical routing ya per-domain sub-agents; caching ke liye session me tool set stable; tool-retrieval recall naapo.
- **MCP roles:** host (app), client (har server se 1:1 connection), server. Primitives: tools (model control), resources (app control, URI se), prompts (user control).
- **MCP wire:** JSON-RPC 2.0; `initialize` → `tools/list` → `tools/call`; local subprocess ke liye stdio, remote multi-user ke liye Streamable HTTP + OAuth (HTTP+SSE deprecated).
- **MCP auth:** PKCE ke saath OAuth 2.1, audience-bound tokens, token passthrough nahi, least-privilege scopes; `user_id` token se lo, arg se nahi.
- **MCP risks:** tool poisoning, rug pull, tool shadowing, indirect injection; lethal trifecta (private data + untrusted content + exfiltration channel); pin, allow-list, writes pe HITL.
- **A2A:** `/.well-known/agent-card.json` pe Agent Card; stateful tasks (`submitted → working → input-required → completed`); parts se bane messages aur artifacts; HTTPS pe JSON-RPC, SSE, push webhooks.
- **MCP vs A2A:** MCP vertical (agent se tools), A2A horizontal (agent se opaque peer agent); dono complementary. Ek company, ek framework ke multi-agent ko A2A nahi chahiye.
- **Sandbox + browser:** LLM code Docker/gVisor/Firecracker me limits ke saath, secrets nahi, default no network; browser agent last resort (API → script → DOM → vision).

**Interview me bolo:** "MCP server ko npm package ki tarah treat karta hoon: pin, review, least-privilege scopes, write actions pe HITL. MCP integration standard hai, agent framework nahi, aur A2A org ya vendor boundary cross karne ke liye hai."

**Galti mat karna:** Poori REST API 1:1 tools me badal ke 50 KB raw response dena; bina auth ka public remote MCP server; server code review karna par tool descriptions nahi; app server pe `exec()` chalana.
