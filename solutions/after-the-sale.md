# After the sale: where the money goes

A short map. The step-by-step lives in the Console skill: https://github.com/StarwaterHeaven/qatom-console-skill

| Question | Answer |
|---|---|
| Where does a payment land? | On the **provider twin** of the catalog item that was bought. Each item has its own. |
| How do I see payments? | Per item in the Console (assets and transaction records), or by API: `GET /v4/commodity/{hash}/transactions` with the item's commodity hash |
| How do I prove a payment happened? | Every payment is a TODA file with a cryptographic provenance chain; the Console lets you inspect and verify it. The buyer gets a receipt with a transaction id. |
| Where do payouts and refunds come from? | `POST /v4/transfer` spends from the account's **primary** twin |
| How does money get from item twins to the primary? | Move it in the Console, or set **auto-distributions** (for example a few times a day) |
| Can I split revenue (royalties, partners, platform share)? | Through distributions from the item twins; what a distribution can target is set out in the Console skill |
| How do I take money out to a bank? | Human-only, in the Console (bank and card gateways). Agents never reach the gateways. |
| Can I stop sales at once? | Deactivate the item (reversible); Archive retires it |

## Rule of thumb for builders

Design so your code never needs money to be in a particular twin at a particular second. Queue payouts, retry on a schedule, and show the player or customer a status (`queued`, `paid`) with a timestamp.
