# Reports through a messaging agent, and sponsorship with a money trail

**What it is:** people in the field (water committees, drivers, site staff, volunteers) report what they see by WhatsApp or text, in their own words. A messaging agent relays each report to your endpoint, which decides what it means and asks back when something is missing. Sponsors fund the work, and every dollar and every action carries a receipt. It suits civic, nonprofit and field-operations services where the reporters will never install an app.

## Live example: AquaSentinel (Water Care AI Hackathon, 17 Oct 2026)

Team Ocean's prototype for a fictional rural district: 1,078 water points scored out of 100, an officer who approves every action, and committees who report by SMS or WhatsApp. Seller **Kepler Market Services on Qatom**; synthetic data; hackathon demo items, which may be retired.

| id | Item | Price |
|---|---|---|
| 212 | AquaSentinel: sponsor a Kijana water point (hackathon demo) | 1.000 |
| 213 | AquaSentinel: send an approved water alert (hackathon demo) | 0.020 |
| 214 | AquaSentinel: submit a water report (hackathon demo) | 0.001 |

- **Torque**, a Muse agent on WhatsApp (and iMessage/SMS through Inkbox), is the committees' contact. It submits whatever it has. The report store answers with `accepted`, a `need` list, `candidates` and the exact `reply` Torque sends back, in the reporter's language.
- "Olagoni pump imeharibika tena" (Swahili: "the Olagoni pump is broken again") comes back with `accepted: false`, `need: ["wp_id"]` and the four Olagoni pumps as `candidates`. When the committee answers "0631", the report is accepted, and the officer's console shows it within seconds.
- Two live transactions on 17 Oct: `91ca3e13…` ($1 sponsorship, #212) and `9d919d86…` ($0.02 officer-approved alert, #213).
- Demo video, code and wrap-up: https://github.com/StarwaterHeaven/AquaSentinel (see `docs/WRAP-UP.md` and `docs/TORQUE.md`).

## Recipe

| Step | Do |
|---|---|
| Items | A paid **submit** item (sub-cent; it gives each report a receipt), a paid **action** item the human approves (an alert, a dispatch), a paid **sponsor** item, and a free feedback item |
| Free preview | A free check that shows what a submit *would* do and stores nothing, so agents can test without writing or paying |
| Two doors, one handler | A free webhook for your own messaging agent, plus the paid catalog item for anyone else's. Both run the same code on the same body; the paid door only adds the receipt |
| Ask back, don't guess | An incomplete report is a 200 with `accepted: false`, a `need` list, `candidates` and a ready-to-send `reply`. Never invent an identifier: offer the candidates |
| Loose input, structured output | Accept a code, a full ID or a misspelt place name, and status words in each local language. Ask the relaying agent for structured fields (for example `channel`), with defaults, so a missing field breaks nothing |
| Human approval | Any action that reaches people (an alert, a mechanic sent out) is a purchase the responsible human approves in the Qatom Authenticator app or at the approval link |
| Public feed | A free read-only feed for dashboards, with personal data masked (keep only the last 3 digits of a phone number). Poll it directly, not through Qatom, so polling doesn't spend the plan's monthly transactions |
| Safety line | State in every reply what the service cannot establish (here: no score shows water is safe to drink; boil it until it is tested) |
| Rehearsal | A reset endpoint behind the secret path, and a console "Reset demo", to clear test reports before going live |

## Watch-outs

- **Plan live approvals before a demo.** Each live purchase waits for a human's yes. Run the live steps beforehand and replay their receipts, so the presentation never depends on an approval arriving on stage.
- **Guard the paid route with a header, not only a path.** Under time pressure item 214 used a secret path in its endpoint URL. The seller guide's preferred guard is a Sensitive `Authorization` header under Request headers & secret parameters, because other dashboard users can see the endpoint URL. Rotate any path you shared by email or chat.
- **Retire demo items after the event,** or leave them clearly labelled "demo" and let the catalog score them as they stand.
- **Who pays for unplaced reports?** Metering an ask-back to a sponsor's escrow is wrong; charge it to the channel's own line.

## Next steps for a real operator

- Replace the demo SMS with an aggregator shortcode and reverse-billed inbound messages.
- Pay the repair or service provider from the escrow when the job is confirmed, with a distribution from the sponsor item's twin.
- Give each sponsor a free statement item: what they funded, what was spent, what is left.
