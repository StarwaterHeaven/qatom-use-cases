# Start here: the setup every use case shares

Do these once. Every recipe in this repo assumes them.

## As a buyer (or to test your own items)

1. **Connect the Qatom master MCP.** In Claude: Settings > Connectors > Add custom connector, URL `https://mcp.m.todaq.net/mcp`, sign in. Grok: grok.com/connectors > Custom, same URL. Any other MCP client: add it as a remote MCP server. Sign-in is OAuth in your client's own connector flow.
2. **Check the agent's wallet.** Ask: *"Check my Qatom agent wallet."* (`agent_wallet_info`). Signing in gives you a primary twin (your wallet, MFA-gated) and an agent twin (the agent's wallet).
3. **Fund it a little.** `fund_primary_wallet` gives you a card top-up page; `transfer_to_agent` moves an amount from your primary to the agent twin. The agent can never spend more than its twin holds, and never touches your primary wallet or your card.
4. **Find and buy.** *"Search the Qatom catalog for weather."* (`catalog_search`), then *"Buy item 80 for Lima."* (`agent_checkout`). Your agent asks you before paying. Free items cost 0.000.

## As a seller

1. **Open the dashboard** and set your **seller display name** first (items without one show the seller as "None").
2. **Install the seller guide** in your agent and let it walk you through first use case, endpoint, schema, listing, `llms.txt` and the launch report:
   ```bash
   npx skills add StarwaterHeaven/qatom-seller-guide --skill qatom-seller-guide
   ```
3. **Host the endpoint.** The fastest path is the Worker template: https://github.com/StarwaterHeaven/qatom-hack-the-andes/tree/main/template . It reads one `catalog.json`, validates inputs, guards the paid route (secret path plus Qatom's `Authorization` fulfilment header), serves `/llms.txt` and runs the free feedback item.
4. **Create items** (Catalog items > New item): name, price (0 for free; paid items at least 0.001 USD-TDN), method, endpoint, description (up to 1,024 characters, pointing to your `llms.txt`), input schema with `additionalProperties: false`.
5. **Guard every paid item**: under *Request headers & secret parameters* add a Sensitive header `Authorization: Bearer <token>` and click *Save headers & parameters*. Your endpoint checks it.
6. **Keep it private until it passes**, buy it once yourself with `agent_checkout`, then make it public.
7. **Add the defaults**: a free customer-feedback item and a free check beside every paid item.

## After launch

Payments land on each item's twin. Seeing them, verifying them, moving funds to the twin you pay out from, and setting auto-distributions happen in the Qatom Console. See the Console skill: https://github.com/StarwaterHeaven/qatom-console-skill .

## Words you'll meet

| Word | Meaning |
|---|---|
| Twin | A wallet-and-identity micro-app. You have a primary twin and an agent twin; each catalog item has its own provider twin |
| USD-TDN | USD-denominated settlement token; settles to 0.001 |
| Catalog item | One thing for sale at one price, with one endpoint and one input schema |
| Master MCP | `https://mcp.m.todaq.net/mcp`: discovery of every public item, plus the wallet tools |
| Seller MCP instance | Your own MCP server on Qatom; private and featured items behave differently there |
| Fulfilment call | Qatom's server-to-server call to your endpoint after a payment settles |
