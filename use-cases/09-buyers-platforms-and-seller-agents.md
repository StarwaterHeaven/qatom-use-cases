# Buyers, platforms and seller agents

Use cases where the customer is not a single seller listing an item.

## Programmatic buyer

A business buys from the catalog at volume through its own agent wallets and spend limits. Live customer: **Gracia AI**.

- Setup: connect the master MCP; fund one agent twin per agent or per workload; each twin's balance is that agent's hard ceiling.
- Several agents or teams sharing one funded wallet, or one agent drawing on several wallets, is set up in the Console (twin groups). See the Console skill: https://github.com/StarwaterHeaven/qatom-console-skill .
- Approval: purchases may ask a human to approve before they settle (for example above a spend threshold). Where that threshold is set is covered in the Console skill.

## Orchestration platform (embed Qatom)

A platform lets its own users buy and sell through Qatom inside its product and takes a share of transaction volume. Live customer: **Northern Village**.

- Each platform customer gets its own seller identity and catalog; the platform's own MCP server can expose a curated set of items.
- Revenue share: payments land on each item's twin; distributions split them to the platform and the end seller (Console).

## Seller agent

An agent that sells a merchant's catalog in chat (web, WhatsApp, Telegram, Signal) and closes fixed-price sales.

- Today: a Claude skill plus the master MCP. Pirate Kepler is the reference persona (publishing, pricing, answering buyer questions, logging, weekly summaries).
- Rules that keep it safe: it quotes listed prices only, never negotiates outside the catalog, logs every interaction, and the buyer pays through Qatom's own checkout (`agent_checkout` for agents, `guest_checkout` link for people).
- Configurable seller agents are on the Qatom roadmap.

## Agent-to-agent services

An agent sells its own skill (research, translation, review) as a catalog item and buys what it needs from others. Same recipes as [01](01-pay-per-call-calculation.md) and [04](04-repo-to-service.md); the twist is that both sides are agents, so `llms.txt` and the response envelope matter even more.
