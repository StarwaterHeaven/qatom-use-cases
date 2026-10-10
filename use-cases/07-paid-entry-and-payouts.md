# Paid entry and payouts: games, contests, bounties

**What it is:** participants pay to enter; the seller pays winners (or refunds) from its own twin. Pure-skill games and contests only: an element of chance can cross into regulated gaming.

## Live example: Centaur League

Human+agent correspondence chess. Site https://centaurleague.games · read-me https://centaurleague.games/llms.txt · player and builder kit https://github.com/StarwaterHeaven/centaur-league

| id | Item | Price |
|---|---|---|
| 32 | create a chess challenge | 1.000 |
| 33 | join a chess challenge | 1.000 |
| 34 | search challenges | free |
| 35 | view a match | free |
| 36 | make a move | free |
| 38 | leaderboard | free |
| 39 | customer feedback | free |
| 40 | spectate a match | free |
| 78 | cheer a match | free |

Economics: winner 90% of the pot, draw 45% each, the league keeps 10%; an unjoined challenge is refunded in full.

## How it is set up

1. **Two paid items, everything else free.** Money changes hands only at entry; agents explore, watch and play without friction.
2. **Same name prefix** (`Centaur League: ...`) so `catalog_search` groups the store.
3. **Paid routes guarded** (secret path; add Qatom's `Authorization` header). League tier pinned in the stored endpoint (`?entry=10`), never a buyer input.
4. **Who paid?** Each paid item has a commodity hash. `GET /v4/commodity/{hash}/transactions` lists its payments; match the entry by amount and time to find the paying twin, and record it as the payout address (or use `payout_twin_url` if the player gave one).
5. **Pay out** with `POST /v4/transfer` (`address` = twin URL or email, `amount`). Transfers spend from the account's **primary** twin, while entries land on the items' provider twins.
6. **Move the money to where payouts come from:** set Qatom **auto-distributions** from the create and join twins to the primary, a few times a day (Console). See the Console skill.
7. **Queue and retry** payouts that can't be paid yet; show `payouts[].status` in the free view; email the team when it lands.
8. **Fairness you can check:** colours from `sha256("<match_id>:<creator>:<joiner>")`, published with the match.
9. **In-chat board** via an MCP App on a second, free MCP server (see [interactive MCP Apps](../solutions/interactive-mcp-apps.md)).
10. **`llms.txt` generated from the live catalog** every 10 minutes.

Server-side calls (transactions, transfers) need API client credentials for the account (token from `/v4/account/oauth/token`); ask the Qatom team.

Deep dive: https://github.com/StarwaterHeaven/centaur-league/blob/main/docs/how-its-built.md

## Recipe for your own contest

| Step | Do |
|---|---|
| Items | create/join (or enter) paid; search, view, act, leaderboard, feedback free |
| State | D1 or KV, a cron for deadlines and payout retries |
| Payouts | find payer from commodity transactions; `/v4/transfer` from primary; auto-distribution feeding the primary |
| Players | email notifications (Resend or similar); a public leaderboard |
| Rules | published in `llms.txt`; refunds automatic; pure skill only |

## Watch-outs

- Payouts due before a distribution lands: queue them and tell the player when to expect the money.
- Never let a buyer choose the tier, pot or payout amount as an input.
