# Video streams: pay per view or rental

**What it is:** each purchase returns its own signed, time-limited HLS stream, a player link and a poster. When the key expires, the playlist and every segment answer 403. No accounts, no DRM vendor, no per-viewer servers: one small Worker in front of an HLS ladder.

## Live example

**ISS Earth Observations Video Demo (NASA, 4K)**, item **27**, 0.100, seller Dobox. NASA public-domain footage.

**Try it:** *"Search the Qatom catalog for ISS"*, then *"Buy item 27."* Approve, open `player_url`. Change one character of the key in `hls_url` and it answers 403 `bad_signature`.

Code (11 offline tests, `build-hls.sh` builds the ladder from any MP4): https://github.com/StarwaterHeaven/qatom-hack-the-andes/tree/main/examples/paid-video-stream

Live customers run this pattern at scale: Digital Experience Corp paywalls a media library of 1,200+ assets; Atlalux runs white-label video monetization.

## Recipe

| Step | Do |
|---|---|
| Media | Build an HLS ladder (1080p/720p/480p, 4-second segments) and a poster; or sign URLs on your existing CDN or stream platform |
| Endpoint | One fulfilment route (`/v/<SERVICE_PATH>`) that issues a key `<expiry>.<HMAC signature>` and returns `hls_url`, `player_url`, `poster_url`, `expires_at` |
| Delivery | `/hls/<key>/...` checks signature and expiry on every playlist and segment |
| Input | Only `ttl_seconds` (60 to 86,400, default 3,600); for a library, add `asset_id` |
| Presentation | A `display` block (`image`, `primary_link`, `primary_link_label`, `caption`) and an `agent_note` so the buyer's agent shows the poster and a "Watch" link, not a raw playlist URL |
| Guard | Secret path plus Sensitive `Authorization` header (`QATOM_FULFILMENT_TOKEN`) |
| Item | Method GET (POST and PUT also work); description says what the buyer receives, the source and its licence |

## Variations

- **Clip library:** one item, `asset_id` input, priced per title; a free item lists titles with poster and duration.
- **Tiers:** one item per quality or rental length; each description says what the higher tier adds.
- **Live pay-per-view:** the same key pattern in front of a live HLS origin.
- **In-chat player:** an MCP App view that plays the `hls_url` inside the conversation (see [interactive MCP Apps](../solutions/interactive-mcp-apps.md)); keep the purchase itself on Qatom.
- **Royalty splits:** payments land on the item's twin; distributions in the Console split them to rights holders. See the Console skill.

## Watch-outs

- The key is per purchase, not per viewer: anyone holding a valid `hls_url` can watch until it expires. That is the rental shape; bind to a device or session if you need more.
- Cloudflare static assets cap at 25 MiB per file; long video belongs on your own storage with the Worker signing URLs.
- Guest card checkout has a minimum of about $0.50; small video prices suit agent wallets.
