# Documents and reports

**What it is:** sell a short-lived download link to a report, not the file itself. A free metadata call lets an agent decide before it pays.

## Recipe

| Step | Do |
|---|---|
| Identity | Stable slug per report (`ev-battery-supply-2026`); aliases ISBN, DOI, prior slugs, short title |
| Free item | Title, date, edition, pages, abstract, table of contents, price tier, licence terms |
| Paid answer | `download_url`, `expires_at`, `bytes`, `sha256`, `pages`, `edition` |
| Prices | One item per price tier (`$9`, `$29`, `$99`), each pinning its tier with a Not sensitive fulfilment parameter |
| Wrong tier | `400 wrong_tier` naming the right tool; make the tier unmistakable in `llms.txt`, the free call and each description, because a refused call can still be charged |
| Storage | Sign links against your existing storage (R2, S3, your CMS) with a 15-minute expiry |

Full worked example with schema and description: [seller guide, example A](https://github.com/StarwaterHeaven/qatom-seller-guide/blob/main/skills/qatom-seller-guide/references/worked-examples.md).

## Ask this first

Would agents rather buy **the data inside** the document? A mining report sold whole to people became a NAV calculation sold per call to agents (see [01](01-pay-per-call-calculation.md)). Keep the PDF as a sale to people by card, and sell agents the answer.

## Watch-outs

- PDFs streamed through MCP are rarely usable by the agent; a link plus metadata is.
- Audit sample pages and public previews so none gives away more than the free product.
