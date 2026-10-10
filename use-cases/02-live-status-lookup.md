# Live status or record lookup

**What it is:** "where is it / what state is it in", answered from data the seller already collects: shipments, orders, tickets, packages, devices.

## Live example: Mexican Freight Agentic Tracking and Tracing

Seller **Qatom Logistics Demo**, synthetic trips `MXF-1001` to `MXF-1005`.

| id | Item | Price |
|---|---|---|
| 181 | Mexican freight example: trip status | 0.010 |
| 182 | Mexican freight example: trip check | free |
| 183 | Mexican freight example: customer feedback | free |

- **Free check** confirms the reference and returns origin, destination and carrier. No position, no ETA.
- **Paid status** returns position with GPS age, status, ETA with delay, window and confidence, the driver's last update, a data-quality score with flags (`gps_stale`, `driver_unresponsive`, `eta_slipping`), a map link and a one-sentence summary in `es` or `en`.
- `next_steps` tells the buyer's agent what to do when something is off ("ask the carrier to call the driver").
- Read-me: https://trip-status-demo.hassan-khan-cd6.workers.dev/llms.txt
- Code (15 offline tests): https://github.com/StarwaterHeaven/qatom-hack-the-andes/tree/main/examples/mx-freight-trip-status

**Try it in two minutes:** connect the master MCP, then *"Use Qatom item 182 to check trip MXF-1004, then buy item 181 for its status."*

## Why it sells

Every shipper wants status in its own format, and the data lives in GPS, an ERP and chat groups. One machine-readable answer lets each buyer's agent do the formatting. The value to the buyer is machine readability and a metered, identified call, not a new charge for something they already get by phone.

## Recipe

| Step | Do |
|---|---|
| Items | Paid status, free check, free feedback |
| Identity | One canonical reference per record; aliases (with and without prefix, case-insensitive) generated, never hand-kept |
| Answer | `as_of`, freshness of each source, a quality flag list, `summary` in the buyer's language |
| Price | 0.001 to 0.050; status is called often |
| Bilingual | Accept `lang` (`es`/`en`) as an enum input with a default |
| Guard | Sensitive `Authorization` header on the paid item |

## Next steps for a real operator

- Aggregate across carriers so one tool answers "where is my load?" for a broker's agent.
- Payments to drivers or carriers are a later step (local currency ramps, onboarding); start by selling the answer.
- An MCP App map card (see [interactive MCP Apps](../solutions/interactive-mcp-apps.md)) gives the human a live view with a refresh button.
