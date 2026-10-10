# Interactive MCP Apps in the customer experience

An MCP App is a small HTML view that an MCP server attaches to a tool. Clients that support MCP Apps (Claude, ChatGPT, Goose, VS Code and others) render it inside the conversation, so the customer gets a live board, card, player or form instead of a wall of text, and the agent still sees everything as text. Clients that don't support it simply show the text. Nothing breaks.

Live reference: **Centaur League**. `view_match` and `spectate` open a chess board in the chat; the human drags pieces, offers draws and resigns on it, and the agent is told each move so it can recommend the reply.

## Where it fits with Qatom (today)

Qatom's `agent_checkout` returns the seller's answer inside the receipt as text and JSON. It does not yet pass an MCP App view through. So the working pattern is **two connections**:

| Connection | URL | What lives there |
|---|---|---|
| Qatom master MCP | `https://mcp.m.todaq.net/mcp` | Discovery, every paid item, every free catalog item, the wallet |
| Your own free MCP server | `https://<your-domain>/mcp` | The same free tools again, with views attached (no sign-in, no money) |

Centaur League runs exactly this: paid entry (create, join) only on Qatom; the board on `https://centaurleague.games/mcp`. Keep money on Qatom; keep the view server read-mostly and free.

When Qatom passes views through checkout, the second connection becomes optional. Design your view so it only needs the tool result, and it will move over unchanged.

## Build one

Start from [`examples/mcp-app-minimal`](../examples/mcp-app-minimal). Seven steps:

1. **Advertise the extension** in `initialize`: `capabilities.extensions['io.modelcontextprotocol/ui'] = { mimeTypes: ['text/html;profile=mcp-app'] }`.
2. **Attach the view to a tool** with `_meta: { ui: { resourceUri: 'ui://<store>/<view>-v1' } }`.
3. **Serve the view** from `resources/read` with mime type `text/html;profile=mcp-app`. One self-contained HTML file: inline CSS and JS, no network calls (declare an empty `csp` unless you truly need a domain).
4. **Return both forms** from the tool: `content: [{type:'text', ...}]` for the model, `structuredContent` for the view. Keep the text a good answer on its own.
5. **Start the view**: it sends `ui/initialize`, then `ui/notifications/initialized`, then listens for `ui/notifications/tool-result` and draws `params.structuredContent`.
6. **Let the human act**: the view calls `tools/call` through the host (Centaur: `make_move`), then sends `ui/update-model-context` with one plain sentence about what happened, so the agent stays in the loop.
7. **Version the URI**: hosts cache views by URI. Change the suffix (`-v1`, `-v2`) on every change to the HTML, and keep serving old URIs for a while.

Also: send `ui/notifications/size-changed` after each render; use `ui/open-link` for links (fall back to `window.open`); answer any host request you don't handle with an empty result; honour light and dark mode.

## Design rules that worked for Centaur League

- **The agent recommends; the human acts on the view.** Tool descriptions say so ("recommend a move, let the human play it on the board"). The view is where the human's own decision happens.
- **Secrets stay out of the view's text.** A team token passed as an input is used by the view, never printed in the model text.
- **Every view has a non-app fallback**: an image (Centaur renders a PNG board in the Worker), a text board, and a web link.
- **Summaries for the model, full JSON for the view.** Strip helper fields the view doesn't need before sending `structuredContent`.
- **Free only.** No purchase starts from inside a view. The human approves money in Qatom's own flow.

## Good fits

| Use case | View |
|---|---|
| Games and contests | A board, a bracket, a live scoreboard |
| Live status (freight, orders) | A map card with position, ETA and a refresh button |
| Video and media | A player for the signed stream URL the paid item returned |
| Quotes and calculations | A card with inputs the human can adjust and re-run (free re-runs only for free items) |
| Reports | A preview page with title, abstract and table of contents before the paid download |
