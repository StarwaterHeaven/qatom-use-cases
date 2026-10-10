# After the sale: where the money goes

A short map. The step-by-step lives in the Console skill: https://github.com/StarwaterHeaven/qatom-console-skill

| Question | Answer |
|---|---|
| Where does a payment land? | On the **provider twin** of the catalog item that was bought. Each item has its own. |
| How do I see payments? | Per item in the Console (assets and transaction records), or by API: `GET /v4/commodity/{hash}/transactions` with the item's commodity hash |
| How do I prove a payment happened? | Every payment is a TODA file with a cryptographic provenance chain; the Console lets you inspect and verify it. The buyer gets a receipt with a transaction id. |
| Where do payouts and refunds come from? | `POST /v4/transfer` spends from the account's **primary** twin |
| How does money get from item twins to the primary? | A **standing distribution** on each item twin (Console → Configuration → Distributions): 100% to the primary or the account email; sweeps show on the primary as Microdistribution Income |
| Can I split revenue (royalties, partners, platform share)? | Yes: a distribution can pay up to 200 recipients by percentage, by twin or by email |
| How do I take money out to a bank? | Human-only, in the Console: Banking Profile, then Bank Transfer (at least 10 TDN, flat 1.00 USD fee, ACH in 2–5 business days). Agents never reach the gateways. |
| Can I stop sales at once? | Deactivate the item (reversible); Archive retires it |

## Rule of thumb for builders

Design so your code never needs money to be in a particular twin at a particular second. Queue payouts, retry on a schedule, and show the player or customer a status (`queued`, `paid`) with a timestamp.
