# Access passes, credits, and orders with a human yes

Three commerce patterns that carry state beyond one call.

## Access pass or membership

One payment grants a role or a period of access; the endpoint issues a token or adds the buyer to a list.

- Live: **Audience Member** (#31, Truce Media, 5.000).
- Recipe: the paid call returns `access_token`, `expires_at` and what it unlocks; a free `status` item checks a token; the protected service checks tokens on every request. Tie the pass to the paying twin (from the item's commodity transactions) if it must not be shared.

## Credits and resale

Sell units of something the buyer spends later: compute, API calls, discounted aftermarket capacity.

- Live: **Compute Credits** (#79, 0.100).
- Recipe: one item per pack size; the paid call credits a balance keyed to the buyer and returns it; free items report the balance and the price list. Keep the ledger on your side and make every spend idempotent.

## Orders and bookings

An agent places an order or booking on the buyer's behalf.

- Recipe: a **free preview** item returns the exact order (items, price, delivery, cancellation terms) and a short-lived `confirmation_token`; the **paid** item takes only that token. The human sees the preview and approves the payment in Qatom's own flow, so money moves only after a human yes.
- Never accept free-text order instructions as the paid input; the preview is the contract.

## Watch-outs

- State lives on your side; Qatom settles the payment and proves it. Store the transaction id with every grant.
- Refunds: deactivate an item to stop new sales at once; refunds are transfers from your primary twin (Console).
