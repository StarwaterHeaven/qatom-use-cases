# Qatom Demo store

The official Qatom demo storefront: one Cloudflare Worker behind three catalog items, used for the Qatom user guide walk-throughs.

| Catalog item | Price | Route | Shows |
|---|---|---|---|
| Qatom Demo: customer feedback | free | `POST /api/feedback` | the storefront default every seller should have |
| Qatom Demo: space station video | paid | `POST /paid/<SERVICE_PATH>/video` | selling a video stream: signed, time-limited HLS per purchase |
| Qatom Demo: seller guide skill | paid | `POST /paid/<SERVICE_PATH>/seller-guide` | selling a document or agent skill: a 15-minute signed download link |

Paid routes need both the secret path and Qatom's fulfilment header (`Authorization: Bearer <QATOM_FULFILMENT_TOKEN>`, set Sensitive on each paid item). Stream and download keys are scoped, so one cannot open the other.

```bash
node test/run.mjs      # 15 offline checks (Node 20+)
bash deploy.sh         # builds (NASA clip + skill zip), creates KV and secrets, deploys, smoke-tests
```

`deploy.sh` writes `SECRET-demo-catalog.md` with the endpoints and header value to paste into the Dashboard. Never commit or share it.

Video: NASA "Space Station Fisheye Fly-Through 4K" from the NASA Ultra-High-Definition collection on archive.org, a US Government work in the public domain. Skill: https://github.com/StarwaterHeaven/qatom-seller-guide (MIT).
