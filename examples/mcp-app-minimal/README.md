# Minimal MCP App server

A dependency-free Cloudflare Worker that serves an MCP server with one interactive view: a quote card that renders inside the chat, refreshes itself by calling a tool, and tells the model what the human did. It is the Centaur League chess board pattern cut down to its bones, so you can swap in your own data.

```bash
node test/run.mjs          # 7 offline checks (Node 20+)
npx wrangler login
npx wrangler deploy        # note the URL
```

Then add `https://<your-worker>/mcp` as a custom connector in an MCP Apps client (no sign-in), and ask: *"Show me the quote for ABC123."*

## What each part does

| Piece | Where | Why |
|---|---|---|
| `extensions['io.modelcontextprotocol/ui']` in `initialize` | `handle()` | Tells the host this server has MCP App views |
| `_meta.ui.resourceUri` on the tool | `TOOLS` | Links `show_quote` to its view |
| `ui://example-store/quote-v1` resource, `text/html;profile=mcp-app` | `resources/read` | The view itself: one self-contained HTML file |
| `content` + `structuredContent` in the tool result | `callTool()` | Text for the model; JSON for the view |
| `ui/initialize`, `ui/notifications/tool-result` | `APP_HTML` | The view starts, then receives the result to draw |
| `tools/call` from the view | Refresh button | The view calls your server back through the host |
| `ui/update-model-context` | Refresh button | The model learns what the human did on the card |
| `ui/notifications/size-changed` | `size()` | The host sizes the frame to the content |

Full explanation, and how this fits beside paid Qatom items: [`../../solutions/interactive-mcp-apps.md`](../../solutions/interactive-mcp-apps.md).
