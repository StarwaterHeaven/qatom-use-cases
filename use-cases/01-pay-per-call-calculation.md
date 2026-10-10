# Pay per call: a calculation or model output

**What it is:** a computed answer at the buyer's inputs. Stateless, read-only, the data already exists. The default first item for most sellers.

## Live examples

| Item | id | Price | What it shows |
|---|---|---|---|
| Harcourt Mining NAV Query (Harcourt Capital Services) | 24 | 1.000 | The reference case: one item per product family, ticker alone gives the published NAV, metal prices or a discount rate turn it into a paid scenario |
| BTC Options Market Read (Market Structure OS) | 22 | 0.000001 | How small a price can go |
| Spreadsheet formulas as tools | 41–77 | 0.001–0.002 | One spreadsheet becomes thirty-seven tools |

## Harcourt NAV Query: how it is set up

1. **One endpoint, the company as an input.** One tool per report went stale; one endpoint with `ticker` did not.
2. **Free published value, paid scenario.** The ticker alone returns the published NAV at the latest close; any input (metal prices, discount rate) is the paid product.
3. **Mode pinned by the seller** (`deck=closing`), never chosen by the buyer: today put it in a Not sensitive fulfilment parameter.
4. **Aliases from the catalog.** Every exchange symbol resolves to one canonical id; the answer reports `alias.requested` and `alias.resolved`.
5. **Self-describing answers.** `answer_type`, `defaulted_inputs` with their source, units and currency every time, `out_of_range`.
6. **Actionable errors.** Unknown ticker: the coverage table. Unsupported input: the accepted inputs. Ambiguous symbol: candidates, never a guess.
7. **`llms.txt` generated** from the same file the endpoint reads.
8. **Not-advice line** in the description and every response (finance).

Full write-up: [seller guide, worked examples](https://github.com/StarwaterHeaven/qatom-seller-guide/blob/main/skills/qatom-seller-guide/references/worked-examples.md).

## Recipe

| Step | Do |
|---|---|
| Items | One paid item per product family and price; one free check (does the subject exist, which inputs it accepts) |
| Inputs | One required subject id; optional named inputs with unit, type and published range (about 7% inside the real limits) |
| Price | 0.001 to 1.000 per call; price for an agent that calls often |
| Endpoint | Template Worker; put the model in `src/handlers.mjs` |
| Guard | Sensitive `Authorization` header on the paid item |
| Read-me | `/llms.txt` with worked examples of the free call, the paid call alone and the paid call with inputs |

## Spreadsheet to tools

Each formula becomes one item with the formula's inputs as the schema. Good for anyone whose value lives in Excel. Name items with a shared prefix ("Brand: loan payment") so they group in search, and **set the seller display name** (items #41–#77 show "None", which is what not to do).

## Watch-outs

- Health, finance, investment and legal answers carry a not-advice line.
- No free-form query input (no SQL, code or formulas from the buyer).
- A failed call can still be charged: test the endpoint directly first.
