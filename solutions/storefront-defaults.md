# Storefront defaults: feedback item, free checks, generated read-me

Every Qatom storefront, whatever it sells, should carry these three.

## 1. Free customer-feedback item

Price 0. Inputs: `message` (required, 3 to 2,000 characters), optional `from_email`, optional `subject_ref` (an order, match or item id). The endpoint stores the message and forwards it to the seller's account email, with a rate cap (30 an hour is a good start).

- Reference: Centaur League item #39 (`POST /api/feedback`); Mexican freight item #183.
- Built into the Worker template as `feedbackHandler` (KV storage, Resend email, hourly cap counted in KV). It answers `503 not_configured` until storage or email is set up, rather than pretending someone reads it.
- Name it with your store prefix: `Brand: customer feedback`.

## 2. A free sibling for every paid item

A search, check, preview or status call that helps an agent decide before it pays: "does this reference exist?", "which inputs does it accept?", "what tier is this report?". A free answer is one fixed fact or an identity check, never a surface a script can sample for the paid value.

## 3. `llms.txt`, generated

A Markdown read-me at your site root written for language models: who you are, what's free, prices, how to call (master MCP, `catalog_search`, `agent_checkout`), worked examples, the catalog table, input schemas, every error with its next step.

Generate it, never hand-write it:

- **From `catalog.json`**: the template serves `/llms.txt` from the same file the endpoint reads.
- **From the live catalog**: Centaur League regenerates it every 10 minutes from `GET https://pay.m.todaq.net/v4/catalog/items` (public, paged with `limit` and `offset`; fields include `commodity_name`, `commodity_description`, `commodity_cost`, `service_method`, `service_schema`, `active`). Filter to your seller, render, cache. What is listed is what the read-me says.

Coming on Qatom: an auto-generated read-me per merchant (from the catalog and the merchant's site, editable by the merchant) and a `read_me_url` on search results. Until then the seller hosts `llms.txt`, and points both at the same content when they arrive.
