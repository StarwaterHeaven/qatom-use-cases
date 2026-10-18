# Interactive MCP Apps in the customer experience

An MCP App is a small HTML view that an MCP server attaches to a tool. Clients that support MCP Apps (Claude, ChatGPT, Goose, VS Code and others) render it inside the conversation, so the customer gets a live board, card, player or form instead of a wall of text, and the agent still sees everything as text. Clients that don't support it simply show the text. Nothing breaks.

Live references:

- **Centaur League**. `view_match` and `spectate` open a chess board in the chat; the human drags pieces, offers draws and resigns on it, and the agent is told each move so it can recommend the reply.
- **Secure Secrets Exchange in-chat app** (`https://sse-mcp.agentkepler.tech/mcp`, source in `mcp-app/` of [secure-secrets-exchange](https://github.com/StarwaterHeaven/secure-secrets-exchange)). A send card where the human types a secret that the model must never see, and an open card that reveals a link with a Copy button. See "Keeping input away from the model" below.

## Where it fits with Qatom (today)

Qatom's `agent_checkout` returns the seller's answer inside the receipt as text and JSON. It does not yet pass an MCP App view through. So the working pattern is **two connections**:

| Connection | URL | What lives there |
|---|---|---|
| Qatom master MCP | `https://mcp.m.todaq.net/mcp` | Discovery, every paid item, every free catalog item, the wallet |
| Your own free MCP server | `https://<your-domain>/mcp` | The same free tools again, with views attached (no sign-in, no money) |

Centaur League runs exactly this: paid entry (create, join) only on Qatom; the board on `https://centaurleague.games/mcp`. So does Secure Secrets Exchange: create (#199) is bought on Qatom; the cards are on `https://sse-mcp.agentkepler.tech/mcp`. Keep money on Qatom; keep the view server read-mostly and free.

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

## Keeping input away from the model (Secure Secrets Exchange)

Centaur's view shows the model's world to the human. A view can also do the reverse: take something from the human that the model must not see, and hand the model only a safe form of it.

- **The human types into the view, not the chat.** Tool descriptions and server `instructions` say "never ask the human to type or paste a secret into the chat; open the card".
- **Transform in the view.** The send card makes the key and encrypts with WebCrypto; only ciphertext leaves the card.
- **Hand the model a ready instruction with `ui/message`.** The card sends a user-role message: "buy item 199 with this payload, then call `sse_link_ready` with ref X". If the host refuses `ui/message`, the card shows the same text with a Copy button for the human to send.
- **Return path by ref.** The model reports the paid result to a free tool (`sse_link_ready(ref, share_url_base, ...)`), the server keeps it briefly (KV, 2 hours), and the view polls a free tool (`sse_get_link(ref)`) through `tools/call`. The view then adds its own part (the `#key`) locally.
- **Declare the one domain you need.** The open card fetches ciphertext from the service, so the resource declares `csp.connectDomains: ['https://secrets.agentkepler.tech']`, and the service sends `Access-Control-Allow-Origin: *` on the two credential-free routes the card calls.
- **Copy buttons with a fallback.** `navigator.clipboard` can be blocked in a sandboxed iframe; fall back to selecting the text and `execCommand('copy')`, then "press Ctrl/Cmd+C".
- **Be honest about trust.** The host app runs the view and could read the input; the card protects against the model, transcripts and the transfer path, not the app vendor. Say so on `/security`.
- **Test in a secure context.** WebCrypto needs HTTPS: a test host page served from `about:blank` fails with "no WebCrypto". Serve the fake host from an `https://` route in the test browser.
- **ASCII in the view.** Characters like `…` can garble when a host embeds the HTML with a different charset. Keep the view ASCII-only.

## Good fits

| Use case | View |
|---|---|
| Games and contests | A board, a bracket, a live scoreboard |
| Live status (freight, orders) | A map card with position, ETA and a refresh button |
| Video and media | A player for the signed stream URL the paid item returned |
| Quotes and calculations | A card with inputs the human can adjust and re-run (free re-runs only for free items) |
| Reports | A preview page with title, abstract and table of contents before the paid download |
| Secrets and personal data | An input card that encrypts or redacts before the model sees anything, and a reveal card with Copy |
