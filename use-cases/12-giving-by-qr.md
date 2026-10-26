# Giving by QR: donations and cause-linked gifts on a product or poster

**What it is:** a QR code on a pack, a receipt, a poster or a shelf tag opens a page where a person gives a small fixed amount to a cause. Qatom's checkout takes the payment (card or wallet), your endpoint records the gift once, and the giver lands on a thank-you page with a receipt. Every gift carries a Qatom transaction, so the brand, the charity and the giver can all see where the money went. It suits brands running a cause campaign, charities, events and venues.

## Live example: Donate-on-Pack (Glacier Fresh x WaterAid Canada, live since 24 Oct 2026)

A live demo at https://give.agentkepler.tech: a mock water pack with three QR codes (box, shipping insert, sleeve). Every gift is a real payment to Qatom's demo donation account (seller **GiveDemo**). Qatom will donate the total collected by the demo to WaterAid Canada. No tax receipt is issued, and the page says so.

| id | Item | Price | Shape |
|---|---|---|---|
| 219 | Donate-on-Pack: $1 gift | 1.000 | Paid gift; requires `gift_ref` from the page |
| 220 | Donate-on-Pack: $2 gift | 2.000 | Same |
| 221 | Donate-on-Pack: $3 gift | 3.000 | Same |
| 222 | Donate-on-Pack: donation feedback | free | Storefront default: feedback, or an email to receive the results |

## How a gift completes

1. **The QR opens the giving page** with its attribution in the URL: `/give/gf?s=<SKU>&p=<placement>`. One code per placement shows which pack and which spot drives giving.
2. **The giver picks an amount** ($1, $2 or $3) and, optionally, a first name.
3. **The page creates the gift**, with a reference such as `G` plus 11 letters or digits, and opens a Qatom checkout for that amount's item, passing the reference as the item's argument: `POST /v4/payment/checkout` with `{"catalog_item_id": 220, "arguments": {"gift_ref": "G..."}}`.
4. **The giver pays on Qatom's checkout.** Qatom emails its own receipt.
5. **Qatom calls your endpoint** with the reference, the item's fulfilment header and `X-Qatom-Transaction-Id`. The endpoint verifies the sale (`GET /v4/catalog/purchases/{transaction_id}`), refuses a transaction it has seen before, and marks the gift paid.
6. **The giver's page flips to the thank-you screen** and links a receipt page showing the amount and the Qatom transaction.

## Recipe

| Step | Do |
|---|---|
| Items | One paid item per amount (a fixed price is simpler to trust than a free-form amount), plus a free feedback item. Name the cause and who holds the money in every description |
| Require the page's reference | The schema of every gift item requires the reference (`gift_ref`, with a `pattern`), and the description says to start at the giving page. Validate it in the endpoint too: Qatom does not enforce `pattern` |
| Endpoint path | Answer the item's endpoint path and anything under it (`/qatom/dispatch` and `/qatom/dispatch/...`): Qatom has been seen adding a segment |
| Fulfilment header | Set the item's `Authorization: Bearer <token>` under Request headers & secret parameters, marked Sensitive, on **every** gift item, and press Save headers & parameters. The endpoint answers anything without it as "not found" |
| Verify, then record once | Check each `X-Qatom-Transaction-Id` with `GET /v4/catalog/purchases/{id}`; keep the ids you have used so one payment never records two gifts |
| Expected misses are answers | Unknown reference, already recorded, transaction used: return 200 with `ok: false`, a `status` and a plain next step, never a 4xx |
| Thank-you without a webhook | The page polls its own free status URL; when Qatom reports the checkout closed, say "payment received, recording your gift" rather than leaving the giver staring at a spinner |
| Public trail | A public records page (amount, time, Qatom transaction, first initial only) and a partner view (gifts and totals by SKU and placement) |
| Honesty | Real payments only, no simulated mode, no hidden test codes. Say who receives the money, what happens to it and that no tax receipt is issued |
| Rehearsal | A reset behind a secret team path, used once before launch so the totals start at zero |

## Watch-outs (seen 26 Oct 2026)

- **Test the delivery with a real gift, not only the refusal.** The deploy test checked that a call with no header gets a 404, but never made a paid call with the header. Three real gifts paid, the checkout warned that the service did not respond, no gift was recorded, and each giver had only Qatom's email receipt. Launch only after one real lowest-amount gift reaches the thank-you page and appears in the records.
- **Accept a trailing segment on the endpoint path.** The live log showed Qatom calling `/qatom/dispatch/1` for an item whose endpoint is `/qatom/dispatch`; the endpoint answered only the exact path, so every delivery got a 404. Route `/your/path` and `/your/path/...` to the same handler, and watch one real call in your logs before launch (`wrangler tail` on Cloudflare).
- **A public gift item without a required reference invites a paid call that can't be delivered.** An agent bought the $2 gift directly with no reference (purchase 276), and delivery failed. Qatom returned the payment to the agent's wallet, so nothing was lost, but the call did nothing. Requiring `gift_ref` in the schema stops that buyer before they pay.
- **Agents can give too.** Leave the items public: an agent with a reference from the page can pay from its agent wallet with `agent_checkout`. A gift above the owner's auto-approve limit waits for their approval in the Qatom Authenticator app.
- **Money first, promise second.** Keep the collected funds in one seller account, publish the running total, and pay the charity from that account, so the public trail and the donation match.
