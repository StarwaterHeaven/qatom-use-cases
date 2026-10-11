#!/usr/bin/env bash
# Builds and deploys the Qatom Demo store Worker from this Mac, creates its secrets and KV, and smoke-tests it.
# Run in Terminal from this folder:  bash deploy.sh
# Writes: SECRET-demo.env (the three secrets; never share), SECRET-demo-catalog.md (what to paste into the
# Dashboard: endpoints and the Authorization header value; never share), demo-deploy-result.txt (no secrets).
set -euo pipefail
cd "$(dirname "$0")"
OUT=demo-deploy-result.txt; : > "$OUT"
log () { echo "$*" | tee -a "$OUT"; }
command -v npx >/dev/null || { echo "Node.js is required"; exit 1; }
[ -d node_modules/wrangler ] || npm i -s -D wrangler@4 >/dev/null
W="npx wrangler"
$W whoami >/dev/null 2>&1 || $W login

[ -f public/meta.json ] && [ -d public/hls ] || bash build.sh

if ! grep -q '^\[\[kv_namespaces\]\]' wrangler.toml; then
  ID=$($W kv namespace create FEEDBACK 2>&1 | grep -oE '[0-9a-f]{32}' | head -1)
  [ -n "$ID" ] || { echo "Could not create the FEEDBACK KV namespace"; exit 1; }
  printf '\n[[kv_namespaces]]\nbinding = "FEEDBACK"\nid = "%s"\n' "$ID" >> wrangler.toml
  log "KV FEEDBACK created"
fi

URL=$($W deploy 2>&1 | tee /tmp/wk-demo-deploy.log | grep -oE 'https://[a-z0-9.-]+\.workers\.dev' | head -1)
[ -n "$URL" ] || { cat /tmp/wk-demo-deploy.log; exit 1; }
log "deployed: $URL"

if [ ! -f SECRET-demo.env ]; then
  { echo "SERVICE_PATH=$(openssl rand -hex 20)"; echo "SIGNING_KEY=$(openssl rand -hex 32)"; echo "QATOM_FULFILMENT_TOKEN=$(openssl rand -hex 24)"; } > SECRET-demo.env
  chmod 600 SECRET-demo.env
  NEW=1
fi
set -a; . ./SECRET-demo.env; set +a
if [ "${NEW:-0}" = 1 ]; then
  for k in SERVICE_PATH SIGNING_KEY QATOM_FULFILMENT_TOKEN; do printf '%s' "${!k}" | $W secret put "$k" >/dev/null; done
  log "secrets set"
fi


cat > SECRET-demo-catalog.md <<MD
# Qatom Demo — Dashboard values (SECRET: never share, never paste into chat)

| Item | Method | Endpoint | Request header (Sensitive) |
|---|---|---|---|
| Qatom Demo: customer feedback | POST | $URL/api/feedback | none |
| Qatom Demo: space station video | POST | $URL/paid/$SERVICE_PATH/video | Authorization = Bearer $QATOM_FULFILMENT_TOKEN |
| Qatom Demo: seller guide skill | POST | $URL/paid/$SERVICE_PATH/seller-guide | Authorization = Bearer $QATOM_FULFILMENT_TOKEN |
MD
chmod 600 SECRET-demo-catalog.md

sleep 5
code () { curl -s -o /dev/null -w '%{http_code}' "$@"; }
log "llms.txt: $(code "$URL/llms.txt")  (want 200)"
log "video without header: $(code -X POST "$URL/paid/$SERVICE_PATH/video" -d '{}')  (want 404)"
log "video with header: $(code -X POST -H "authorization: Bearer $QATOM_FULFILMENT_TOKEN" "$URL/paid/$SERVICE_PATH/video" -d '{}')  (want 200)"
log "skill with header: $(code -X POST -H "authorization: Bearer $QATOM_FULFILMENT_TOKEN" "$URL/paid/$SERVICE_PATH/seller-guide" -d '{}')  (want 200)"
log "feedback: $(code -X POST "$URL/api/feedback" -d '{"message":"Deploy smoke test from deploy.sh","subject_ref":"deploy"}')  (want 200)"
log "public base URL (safe to share): $URL"
echo; echo "Open SECRET-demo-catalog.md for the values to paste into the Dashboard."
