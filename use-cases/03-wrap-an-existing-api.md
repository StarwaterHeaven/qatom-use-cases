# Sell an API you already run (or one you hold a key for)

**What it is:** an existing HTTPS API becomes a paid catalog item. Either list it directly, with Qatom adding your key on each fulfilment call, or put a thin Worker in front that adds the key and reshapes the answer for agents.

## Live examples

| Item | id | Price | Shape |
|---|---|---|---|
| Weather (NOAA GFS, 15-day daily forecast) | 80 | 0.050 | Public data, packaged for agents |
| npm Package Freshness Check | 26 | 0.001 | A developer tool a coding agent calls during dependency work |

## Option A: list the API directly (no code)

Use when the API's answers already suit agents: JSON, clear fields, units stated, useful errors.

1. **Endpoint** with placeholders: `https://api.example.com/points/{input.lat},{input.lon}/days?key={secret.apikey}`. `{input.name}` inserts a buyer input (declare it required in the schema); `{secret.name}` inserts a URL value saved under Request headers & secret parameters.
2. **Request headers & secret parameters:** add the key in the form the API documents: a header (`x-api-key`), a query parameter (`key=`) or a URL value. Mark it **Sensitive**. Click **Save headers & parameters** (separate from Save changes).
3. **Pinned settings** the buyer must not choose (`units=metric`, `format=json`): **Not sensitive** parameters.
4. **Schema:** only the inputs the API honours, `additionalProperties: false`.

## Option B: a thin Worker in front

Use when the API's answers need reshaping, when you want aliases and actionable errors, or when you want a free check that doesn't cost you an upstream call.

1. Start from the template; the handler calls the upstream API with the key from a Worker secret.
2. Return the agent envelope: inputs echoed, units, `as_of`, `summary`, errors with a next step.
3. Guard the paid route with Qatom's `Authorization` header (Worker secret `QATOM_FULFILMENT_TOKEN`).

## Watch-outs

- Check that the upstream API's terms allow resale or redistribution.
- Never put a key in the endpoint URL itself: other users of your dashboard can see it. Use `{secret.name}`.
- Rate limits upstream become your limits: cap free checks per caller.
- Tools that need the **buyer's** own login (their Uber, their WhatsApp) are not good public items; the value is in the buyer's account, not your hosting.
