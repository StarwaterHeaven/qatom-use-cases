# Secrets, credentials and other sensitive hand-offs

**What it is:** a service that moves something sensitive between an agent and a person (an API key, a password, a token, a document with personal data) and earns per call. The buyer's question is never only "does it work?" but "who else can see this?", so the listing has to answer that with things the buyer can check.

## Live example

| Item | id | Price | Shape |
|---|---|---|---|
| Secure Secrets Exchange: create one-time secret link | 199 | 0.100 | Paid action: a link that shows a secret once, then deletes it |
| Secure Secrets Exchange: request a secret from someone | 198 | 0.100 | Paid action: a private link a person uses to send you a secret |
| Secure Secrets Exchange: retrieve a requested secret | 197 | free | One check; polling goes to a free direct URL |
| Secure Secrets Exchange: send feedback | 196 | free | Storefront default |

Live at https://secrets.agentkepler.tech ([security page](https://secrets.agentkepler.tech/security), [`llms.txt`](https://secrets.agentkepler.tech/llms.txt)). Source, tests and the end-to-end spec: https://github.com/StarwaterHeaven/secure-secrets-exchange . In-chat app (MCP App, free, no sign-in): `https://sse-mcp.agentkepler.tech/mcp`.

## Recipe

| Step | What to do |
|---|---|
| Keep the other side free | The recipient or sender should need only a browser: no account, no payment, no Qatom. Charge the party that starts the exchange; make collecting free. |
| Build on proven open source, then close it | Run an established open-source core if one exists, unmodified and at a pinned version, behind a small gateway that sells the calls. Route only the paths buyers need (view, receipt, static assets) and return 404 for the rest: the core's own create API and web app would otherwise give the product away. Check every route from outside. |
| Offer end-to-end mode | The buyer's agent encrypts before buying (AES-256-GCM); the key travels only after `#` in the link, which browsers never send to a server. The recipient's browser decrypts after a click, so link previews can't burn it. You, Qatom and the CDN handle ciphertext only. Keep a standard mode for agents that can't run code, and say what it trusts. |
| Pin the browser code | Each page runs one inline script whose SHA-256 is in its Content-Security-Policy header. Publish the hashes on `/security`, in `/status` and in `llms.txt`, and ship a script that compares the live hashes with the repo. |
| Publish the threat model | `/security` says who can see the data in each mode (you, Qatom, TLS/CDN, the buyer's AI provider, the recipient), how it is stored and deleted, and what is logged (never payloads, keys or links). Add `/.well-known/security.txt`. |
| Keep the secret out of the chat | The buyer's AI provider sees whatever is typed in the chat. Offer an in-chat card (an MCP App on a second, free connector) where the human types the secret; the card encrypts it and hands the model ciphertext only. See [interactive MCP Apps](../solutions/interactive-mcp-apps.md). |
| Make the reveal easy to use | A **Copy** button and a **Clear from screen** button on the reveal page, and a status line saying the page can't show it again. A one-view secret that is hard to copy gets screenshotted. |
| Answer misses with 200 | "Not found", "already retrieved" and "waiting" return 200 with `ok: false` and a `status`. Qatom shows the buyer a paywall error for any non-2xx and drops your message. |
| Keep polling off Qatom | Retrieval loops call a free direct URL. Each Qatom purchase, free ones included, is a transaction, and the Builder plan allows 25 a month. |
| Guard the paid routes | Secret path plus a Sensitive `Authorization` header set on each paid item, compared in constant time; 404 otherwise. |
| Storefront defaults | Free feedback item (which also takes refund requests quoting the transaction id), free status check, generated `llms.txt` with a Refunds section. |

## Watch-outs

- One-time means one view. Link unfurlers in chat apps and email scanners fetch links; nothing should be consumed until a human clicks.
- The buyer's own AI provider sees anything that was in the agent's conversation. Say so, and offer the in-chat card so the secret is never in the conversation.
- Nobody outside can prove the deployed code equals the published code. End-to-end mode makes that matter less for the secret itself; say it plainly anyway.
- Tell buyers not to send long-lived master credentials, and to rotate anything important after the hand-off.
- Seen in practice (19 Oct 2026; full story in [`stories/sse-agent-credential-handoffs.md`](../stories/sse-agent-credential-handoffs.md)): a buyer agent handing Twilio credentials to an external dev team minted a secondary, revocable auth token and sent that instead of the primary, encrypted it end to end, and paid 0.10 USD-TDN with `agent_checkout`. It called `guest_checkout` first by mistake (that only makes a payment link for a person), so your `llms.txt` and item descriptions should name `agent_checkout` for agents.
- Self-hosting behind a tunnel hides the server's address; keep that address and the tunnel id out of the public repo.

## Hand over

Design and launch checks: the [seller guide](https://github.com/StarwaterHeaven/qatom-seller-guide) (§2 "Wrapping open-source or third-party software" and "Sensitive items", §6 checks).
