# Changelog

## 1.3.1 — 18 October 2026

- Score links now point at Qatom Scorecard (`scorecard.agentkepler.tech/item/{id}`, beta) and its CONTRIBUTING guide (en, es).

## 1.3 — 18 October 2026

From the AquaSentinel build at the Water Care AI Hackathon (17 Oct 2026).

- `use-cases/11`: reports through a messaging agent, and sponsorship with a money trail. Live example AquaSentinel (#212–#214): the agent relays loose reports; the endpoint asks back with `need`, `candidates` and a ready `reply` instead of guessing; one handler behind a free webhook and a paid item; a free preview that stores nothing; masked public feed; human-approved actions; live approvals planned before a demo; demo items retired after the event.
- README (en, es) and skill: row 11, and where to check a listing's score (public catalog scores page and free lookup item #200), per Pirate Kepler's 16 Oct request. Catalog date 18 October 2026.

## 1.2 — 15 October 2026

Catalog review, 15 Oct 2026.

- `01`: Harcourt as one product sold three ways (query #24 at 1.000, pass #192 at 5.000, report #193 at 15.000), each description routing to the right rung. The not-advice step now reads as a requirement to check, not a claim about a listing.
- `06`: live example, Harcourt NAV Report #193 (PDF links valid 24 hours, free figure and sample first).
- `08`: live example, Harcourt NAV Query Pass #192 (bearer link, priced against the per-call item).
- Centaur League ids corrected to #32–#36, #38–#40, #78 (#37 is not in the public catalog). README (en, es) and skill tables updated; catalog date 15 October 2026.

## 1.1 — 15 October 2026

- `use-cases/10`: secrets, credentials and other sensitive hand-offs, with Secure Secrets Exchange (#196–#199) as the live example: keep the other side free, close the open-source core's own routes, end-to-end mode with the key in the link fragment, browser code pinned by hash, a public threat model, misses answered with 200, polling kept off Qatom.
- README (English and Spanish) and the skill: new row for use case 10 and a "Verifiable security" solution.
- Skill: master MCP canonical address `https://mcp.m.todaq.net`.

## 1.0 — 10 October 2026

First release, after the Hack the Andes build session (9 Oct 2026).

- `use-cases/00`–`09`: start-here setup and nine recipes, each with live catalog examples (Harcourt NAV #24, Mexican freight #181–#183, ISS video #27, Centaur League #32–#40 and #78, and more).
- `solutions/`: interactive MCP Apps, storefront defaults, after the sale.
- `examples/mcp-app-minimal`: a dependency-free MCP server with one interactive view (7 offline tests), cut down from the Centaur League board.
- `skills/qatom-use-cases`: an agent skill that routes a person to the right recipe.
- Spanish index (`README.es.md`).
