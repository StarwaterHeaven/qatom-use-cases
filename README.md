# Qatom use cases

How to set up every kind of business on [Qatom](https://qatom.ai), the agentic market and payment rail: what to build, which catalog items to create, how to guard and price them, and what to do in the Console after the first sale. Each recipe names a live example on the Qatom catalog you can try in two minutes. *[Leer en español](README.es.md)*

## Start here

[`use-cases/00-start-here.md`](use-cases/00-start-here.md): connect the master MCP, fund an agent twin, set up as a seller. Every recipe assumes it.

## Use cases

| # | Use case | Live example (catalog id) | Recipe |
|---|---|---|---|
| 01 | Pay per call: a calculation or model output | **Harcourt Mining NAV Query** (#24, with #192 and #193 as a price ladder), BTC Options Market Read (#22), spreadsheet formulas (#41–#77) | [01](use-cases/01-pay-per-call-calculation.md) |
| 02 | Live status or record lookup | Mexican Freight Agentic Tracking and Tracing (#181–#183) | [02](use-cases/02-live-status-lookup.md) |
| 03 | Sell an API you already run, or hold a key for | Weather (#80), npm Package Freshness (#26) | [03](use-cases/03-wrap-an-existing-api.md) |
| 04 | Turn a GitHub repo or CLI into a paid service | Worker template (repo card) | [04](use-cases/04-repo-to-service.md) |
| 05 | Video streams: pay per view or rental | ISS Earth Observations Video Demo (#27) | [05](use-cases/05-video-streams.md) |
| 06 | Documents and reports | **Harcourt NAV Report** (#193) | [06](use-cases/06-documents-and-reports.md) |
| 07 | Paid entry and payouts: games, contests, bounties | **Centaur League** (#32–#36, #38–#40, #78) | [07](use-cases/07-paid-entry-and-payouts.md) |
| 08 | Access passes, credits, orders with a human yes | Harcourt NAV Query Pass (#192), Audience Member (#31), Compute Credits (#79) | [08](use-cases/08-access-credits-and-orders.md) |
| 09 | Programmatic buyers, orchestration platforms, seller agents | Gracia AI, Northern Village, Pirate Kepler | [09](use-cases/09-buyers-platforms-and-seller-agents.md) |
| 10 | Secrets, credentials and other sensitive hand-offs | **Secure Secrets Exchange** (#196–#199) | [10](use-cases/10-secrets-and-sensitive-handoffs.md) |
| 11 | Reports through a messaging agent, and sponsorship with a money trail | **AquaSentinel** (#212–#214, hackathon demo) | [11](use-cases/11-agent-relayed-reports-and-sponsorship.md) |

## Functional solutions

| Solution | What it gives your customer | Guide |
|---|---|---|
| Interactive MCP Apps | A live board, card or player inside the chat; the human acts on it and the agent is told | [guide](solutions/interactive-mcp-apps.md) · [working example](examples/mcp-app-minimal) |
| Video delivery | Signed, time-limited HLS with a player link and poster | [05](use-cases/05-video-streams.md) · [code](https://github.com/StarwaterHeaven/qatom-hack-the-andes/tree/main/examples/paid-video-stream) |
| Storefront defaults | Free feedback item, free checks, a generated `llms.txt` | [guide](solutions/storefront-defaults.md) |
| Verifiable security | A threat model buyers can check, end-to-end encryption with the key in the link fragment, browser code pinned by hash | [10](use-cases/10-secrets-and-sensitive-handoffs.md) · [code](https://github.com/StarwaterHeaven/secure-secrets-exchange) |
| After the sale | Where payments land, payouts, distributions, verification | [guide](solutions/after-the-sale.md) |

## Tools for each stage

| Stage | Use |
|---|---|
| Pick a use case | This repo, or install its skill: `npx skills add StarwaterHeaven/qatom-use-cases --skill qatom-use-cases` |
| Design and list the items | [Qatom seller guide](https://github.com/StarwaterHeaven/qatom-seller-guide): `npx skills add StarwaterHeaven/qatom-seller-guide --skill qatom-seller-guide` |
| Host the endpoint | [Worker template and examples](https://github.com/StarwaterHeaven/qatom-hack-the-andes) |
| Check how your listing scores | [Public catalog scores](https://starwaterheaven.github.io/Qatom-Review-and-Rating-System/), or the free lookup item #200 "Qatom Catalog Ratings: free lookup" (input `item_id`) |
| Run the store after launch | [Qatom Console skill](https://github.com/StarwaterHeaven/qatom-console-skill) |
| Play or build a game | [Centaur League kit](https://github.com/StarwaterHeaven/centaur-league) |

Catalog ids and prices are from the public catalog on 18 October 2026; `catalog_search` on the master MCP has the current list.

## Add your use case

Open a pull request with a recipe in the same shape (what it is, live example, recipe table, watch-outs) and a live item that shows in `catalog_search`.

## About

Published by StarwaterHeaven and Wizard Kepler. Qatom is built by TODAQ Micro Inc. (Toronto); API docs at https://docs.m.todaq.net. MIT licensed. See [CHANGELOG.md](CHANGELOG.md).
