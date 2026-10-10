# Turn a GitHub repo or CLI into a paid service

**What it is:** a project whose core function a stranger's agent would call (transcribe, audit, convert, generate, score) is hosted and the call is sold. The code stays open source; you sell the compute, the data, the uptime and the curation.

## Recipe

1. **Find the call.** One verb, one answer: "transcribe this URL", "audit this lockfile", "where is this load".
2. **Score it** (2/1/0 each; 7 or more is a strong first item): one call one answer; valuable per call; runs server-side; a free sibling exists; unique.
3. **Write `catalog.json`** in the template: name, price, inputs with types and ranges, a free check, the feedback item. `node ../lib/gen.mjs catalog.json` until the checks pass.
4. **Wrap the function** in `src/handlers.mjs`; it receives validated inputs and returns `{ result, summary }`.
5. **Deploy**, set `SERVICE_PATH` and `QATOM_FULFILMENT_TOKEN`, regenerate with `--base <your URL>`.
6. **List and buy it once**, then add your store to [STORES.md](https://github.com/StarwaterHeaven/qatom-hack-the-andes/blob/main/STORES.md).

The template's own example sells a GitHub repo card (paid) with a free existence check: https://github.com/StarwaterHeaven/qatom-hack-the-andes/tree/main/template

Candidate repos and scores from the Crafter Station community: https://github.com/StarwaterHeaven/qatom-hack-the-andes/blob/main/docs/repo-to-catalog.md

## Long-running jobs

If the work takes more than a few seconds (transcribing an hour of audio), sell **the job**: the paid call returns a `job_id` and a free status item returns progress and, when done, a short-lived result link. Price by tier (one item per duration band).

## Watch-outs

- Price tiers are separate items; each description says what the higher tier adds.
- Anything that acts on the buyer's own third-party accounts stays a private tool.
