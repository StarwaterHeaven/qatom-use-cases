// Qatom Demo store — one Cloudflare Worker behind three catalog items (Wizard Kepler, 11 Oct 2026).
//
//   Qatom Demo: customer feedback   free   POST /api/feedback
//   Qatom Demo: space station video  paid   GET|POST /paid/<SERVICE_PATH>/video
//   Qatom Demo: seller guide skill   paid   GET|POST /paid/<SERVICE_PATH>/seller-guide
//
// Public:   GET /  ·  GET /llms.txt  ·  GET /play?src=…  ·  GET /poster.jpg
// Gated:    GET /hls/<key>/<file>  (stream, per-purchase key)  ·  GET /dl/<key>/<file>  (download, per-purchase key)
//
// Secrets (wrangler secret put): SERVICE_PATH, SIGNING_KEY, QATOM_FULFILMENT_TOKEN (paid routes need
// `Authorization: Bearer <token>`, set on each paid item under Request headers & secret parameters),
// optional QATOM_FULFILMENT_TOKEN_PREVIOUS, RESEND_API_KEY. Vars: FEEDBACK_TO, FEEDBACK_FROM, FEEDBACK_PER_HOUR.
// KV binding FEEDBACK stores feedback. Static assets (binding ASSETS): /hls/*, /dl/*, meta.json, play.html, poster.jpg.

export const VERSION = '1.0.0';
const STORE = 'Qatom Demo';
const DEFAULT_TTL = 3600, MIN_TTL = 60, MAX_TTL = 86400;
const DL_TTL = 900; // download links live 15 minutes

const JSON_HEADERS = { 'content-type': 'application/json; charset=utf-8', 'access-control-allow-origin': '*', 'cache-control': 'no-store' };
const json = (body, status = 200, extra = {}) => new Response(JSON.stringify(body, null, 2), { status, headers: { ...JSON_HEADERS, ...extra } });
const err = (status, code, message, next_step, extra = {}) => json({ ok: false, error: { code, message, next_step }, read_me: '/llms.txt', ...extra }, status);

// ---------- crypto helpers ----------
function b64url(bytes) { let s = ''; for (const b of bytes) s += String.fromCharCode(b); return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); }
async function hmac(key, msg) {
  const enc = new TextEncoder();
  const k = await crypto.subtle.importKey('raw', enc.encode(key), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return b64url(new Uint8Array(await crypto.subtle.sign('HMAC', k, enc.encode(msg))));
}
export function same(a, b) {
  const x = new TextEncoder().encode(String(a)), y = new TextEncoder().encode(String(b));
  let d = x.length ^ y.length;
  for (let i = 0; i < Math.max(x.length, y.length); i++) d |= (x[i] ?? 0) ^ (y[i] ?? 0);
  return d === 0;
}
// A key is "<exp>.<sig>", signed over "<scope>:<exp>" so a stream key cannot open a download and vice versa.
async function makeKey(secret, scope, exp) { return `${exp}.${await hmac(secret, `${scope}:${exp}`)}`; }
async function checkKey(secret, scope, key) {
  const m = /^(\d{1,12})\.([A-Za-z0-9_-]{20,})$/.exec(key || '');
  if (!m) return { ok: false, reason: 'malformed_key' };
  if (!same(await hmac(secret, `${scope}:${m[1]}`), m[2])) return { ok: false, reason: 'bad_signature' };
  if (Math.floor(Date.now() / 1000) > Number(m[1])) return { ok: false, reason: 'expired', exp: Number(m[1]) };
  return { ok: true, exp: Number(m[1]) };
}
function fulfilmentHeaderOk(request, env) {
  const tokens = [env.QATOM_FULFILMENT_TOKEN, env.QATOM_FULFILMENT_TOKEN_PREVIOUS].filter(Boolean);
  if (!tokens.length) return false; // this store always requires the header on paid routes
  const got = request.headers.get('authorization') || '';
  let ok = false; for (const t of tokens) ok = same(got, `Bearer ${t}`) || ok;
  return ok;
}

// ---------- inputs ----------
async function readInputs(request, url) {
  const p = {};
  url.searchParams.forEach((v, k) => { p[k] = v; });
  if (request.method === 'POST' || request.method === 'PUT') {
    const text = await request.text();
    if (text) {
      let body; try { body = JSON.parse(text); } catch { throw Object.assign(new Error('Body must be JSON.'), { code: 'bad_value' }); }
      if (body && typeof body === 'object' && !Array.isArray(body)) Object.assign(p, body);
    }
  }
  return p;
}
function onlyAllowed(p, allowed) {
  const extra = Object.keys(p).filter((k) => !allowed.includes(k));
  return extra.length ? extra : null;
}

async function meta(env, origin) {
  try { const r = await env.ASSETS.fetch(new Request(`${origin}/meta.json`)); if (r.ok) return await r.json(); } catch {}
  return { video: { title: 'Space Station fisheye fly-through (NASA, 4K)', duration_seconds: null }, seller_guide: null };
}

// ---------- items ----------
async function video(p, env, url, request) {
  const extra = onlyAllowed(p, ['ttl_seconds']);
  if (extra) return err(400, 'unknown_parameter', `Not accepted: ${extra.join(', ')}.`, 'This item takes only ttl_seconds.', { accepts: ['ttl_seconds'] });
  let ttl = DEFAULT_TTL, outOfRange = false;
  if (p.ttl_seconds !== undefined && p.ttl_seconds !== '') {
    const n = Number(p.ttl_seconds);
    if (!Number.isFinite(n)) return err(400, 'bad_value', 'ttl_seconds must be a number of seconds.', 'Use 60 to 86400.');
    ttl = Math.max(MIN_TTL, Math.min(MAX_TTL, Math.floor(n))); outOfRange = ttl !== Math.floor(n);
  }
  const m = await meta(env, url.origin);
  const now = Math.floor(Date.now() / 1000), exp = now + ttl;
  const key = await makeKey(env.SIGNING_KEY, 'hls', exp);
  const hls = `${url.origin}/hls/${key}/master.m3u8`;
  const player = `${url.origin}/play?src=${encodeURIComponent(hls)}`;
  const poster = `${url.origin}/poster.jpg`;
  const expires = new Date(exp * 1000).toISOString();
  return json({
    ok: true, item: 'space-station-video', answer_type: 'document', as_of: new Date(now * 1000).toISOString(),
    inputs: p, defaulted_inputs: p.ttl_seconds === undefined ? { ttl_seconds: { value: DEFAULT_TTL, source: 'default' } } : {},
    accepts: [{ input: 'ttl_seconds', unit: 'seconds', range: [MIN_TTL, MAX_TTL] }], out_of_range: outOfRange,
    result: {
      kind: 'video', title: m.video?.title, hls_url: hls, player_url: player, poster_url: poster, expires_at: expires, ttl_seconds: ttl,
      duration_seconds: m.video?.duration_seconds ?? null, renditions: ['1080p', '720p', '480p'],
      source: { owner: 'NASA', collection: 'NASA Ultra-High-Definition (archive.org)', license: 'US Government work, public domain' },
    },
    display: { image: poster, primary_link: player, primary_link_label: 'Watch the stream', caption: `${m.video?.title || 'NASA space station video'}. Your stream key is valid until ${expires}.` },
    agent_note: 'Media purchase: show display.image and display.primary_link together with the caption. hls_url is for video players, not the main link.',
    summary: `Stream ready until ${expires}: open the player link to watch.`,
    next_steps: [{ action: 'Leave feedback', item: 'Qatom Demo: customer feedback' }],
    served_by: `qatom-demo-store ${VERSION}`,
  });
}

async function sellerGuide(p, env, url) {
  const extra = onlyAllowed(p, []);
  if (extra) return err(400, 'unknown_parameter', `Not accepted: ${extra.join(', ')}.`, 'This item takes no inputs.', { accepts: [] });
  const m = await meta(env, url.origin);
  const g = m.seller_guide;
  if (!g) return err(503, 'not_configured', 'The skill package is not built on this store yet.', 'Ask the seller to run build.sh and redeploy.');
  const now = Math.floor(Date.now() / 1000), exp = now + DL_TTL;
  const key = await makeKey(env.SIGNING_KEY, 'dl', exp);
  const download = `${url.origin}/dl/${key}/${g.file}`;
  return json({
    ok: true, item: 'seller-guide-skill', answer_type: 'document', as_of: new Date(now * 1000).toISOString(), inputs: {}, defaulted_inputs: {}, accepts: [], out_of_range: false,
    result: {
      kind: 'skill', name: 'qatom-seller-guide', version: g.version, download_url: download, expires_at: new Date(exp * 1000).toISOString(),
      bytes: g.bytes, sha256: g.sha256, files: g.files,
      install: { from_github: 'npx skills add StarwaterHeaven/qatom-seller-guide --skill qatom-seller-guide', from_zip: 'Unzip into your agent\'s skills folder (for Claude Code: ~/.claude/skills/qatom-seller-guide).' },
      repo: 'https://github.com/StarwaterHeaven/qatom-seller-guide', license: 'MIT',
    },
    display: { primary_link: download, primary_link_label: `Download qatom-seller-guide ${g.version}`, caption: `Qatom seller guide skill ${g.version}. Link valid 15 minutes; SHA-256 ${String(g.sha256).slice(0, 12)}….` },
    summary: `Download link for the Qatom seller guide skill ${g.version}, valid 15 minutes.`,
    note: 'The skill is open source (MIT). This item shows how a seller delivers a document or skill as a paid, time-limited download.',
    served_by: `qatom-demo-store ${VERSION}`,
  });
}

async function feedback(p, env, ctx) {
  const extra = onlyAllowed(p, ['message', 'from_email', 'subject_ref']);
  if (extra) return err(400, 'unknown_parameter', `Not accepted: ${extra.join(', ')}.`, 'Send message, and optionally from_email and subject_ref.');
  const message = String(p.message ?? '').trim();
  if (message.length < 3 || message.length > 2000) return err(400, 'bad_value', 'message must be 3 to 2000 characters.', 'Write the feedback in a sentence or two.');
  const from = p.from_email ? String(p.from_email).trim() : '';
  if (from && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(from)) return err(400, 'bad_value', 'from_email is not an email address.', 'Leave it out, or give a reply address.');
  const ref = p.subject_ref ? String(p.subject_ref).slice(0, 120) : '';
  const canStore = !!env.FEEDBACK, canEmail = !!(env.RESEND_API_KEY && env.FEEDBACK_TO);
  if (!canStore && !canEmail) return err(503, 'not_configured', 'Feedback is not set up on this store yet.', 'Try again later.');
  const cap = Number(env.FEEDBACK_PER_HOUR || 30);
  if (canStore) {
    const hourKey = `rate:${new Date().toISOString().slice(0, 13)}`;
    const used = Number(await env.FEEDBACK.get(hourKey)) || 0;
    if (used >= cap) return err(429, 'rate_limited', 'Too many feedback messages this hour.', 'Try again next hour.');
    await env.FEEDBACK.put(hourKey, String(used + 1), { expirationTtl: 7200 });
  }
  const id = crypto.randomUUID(), at = new Date().toISOString();
  const record = { id, at, message, from_email: from || null, subject_ref: ref || null };
  if (canStore) await env.FEEDBACK.put(`fb:${at}:${id}`, JSON.stringify(record));
  if (canEmail) {
    const send = fetch('https://api.resend.com/emails', {
      method: 'POST', headers: { authorization: `Bearer ${env.RESEND_API_KEY}`, 'content-type': 'application/json' },
      body: JSON.stringify({ from: env.FEEDBACK_FROM || 'Qatom Demo <league@centaurleague.games>', to: [env.FEEDBACK_TO], reply_to: from || undefined,
        subject: `[${STORE}] feedback${ref ? ` about ${ref}` : ''}`, text: `${message}\n\nFrom: ${from || 'not given'}\nRef: ${ref || '—'}\nId: ${id}\nAt: ${at}` }),
    }).catch(() => {});
    ctx?.waitUntil ? ctx.waitUntil(send) : await send;
  }
  return json({ ok: true, item: 'customer-feedback', answer_type: 'action', as_of: at, inputs: p, defaulted_inputs: {}, accepts: [{ input: 'message' }, { input: 'from_email' }, { input: 'subject_ref' }], out_of_range: false,
    result: { received: true, id }, summary: `Thanks: your feedback reached the ${STORE} team (reference ${id.slice(0, 8)}).`, served_by: `qatom-demo-store ${VERSION}` });
}

// ---------- read-me ----------
export function llmsTxt(origin, env = {}) {
  const id = (k, label) => env[k] || `<${label} id>`;
  return `# ${STORE}

> The official Qatom demo storefront: a free feedback item and two paid items that show how a seller delivers a video stream and a document (an agent skill) through the Qatom catalog. Prices are tiny on purpose. Buy from the Qatom master MCP (https://mcp.m.todaq.net/mcp): catalog_search for "Qatom Demo", then agent_checkout with the item id.

Generated by the store itself (version ${VERSION}). Read-me for agents; people can read it too.

## Items

| Id | Item | Price (USD-TDN) | Inputs | Returns |
| --- | --- | --- | --- | --- |
| ${id('ITEM_ID_FEEDBACK', 'feedback')} | Qatom Demo: customer feedback | free | message (required, 3–2000 chars), from_email, subject_ref | a reference id; the team reads every message |
| ${id('ITEM_ID_VIDEO', 'video')} | Qatom Demo: space station video | 0.010 | ttl_seconds (60–86400, default 3600) | a signed, time-limited HLS stream, a player link and a poster |
| ${id('ITEM_ID_SKILL', 'skill')} | Qatom Demo: seller guide skill | 0.005 | none | a 15-minute download link to the qatom-seller-guide skill zip, version, SHA-256, install command |

## Worked examples
- Feedback: agent_checkout(catalog_item_id=${id('ITEM_ID_FEEDBACK', 'feedback')}, arguments={"message":"The video played well on mobile.","subject_ref":"space station video"})
- Video: agent_checkout(catalog_item_id=${id('ITEM_ID_VIDEO', 'video')}, arguments={"ttl_seconds":1800}) → show display.image and display.primary_link
- Skill: agent_checkout(catalog_item_id=${id('ITEM_ID_SKILL', 'skill')}, arguments={}) → give the human display.primary_link

## Errors
unknown_parameter 400 (an input the item does not take) · bad_value 400 · rate_limited 429 (feedback cap per hour) · not_configured 503. A stream or download key that is wrong or expired answers 403 with a reason.

## Help
Refunds and billing questions: the feedback item first. Docs: https://github.com/StarwaterHeaven/qatom-use-cases · Seller guide: https://github.com/StarwaterHeaven/qatom-seller-guide
`;
}

// ---------- router ----------
export default {
  async fetch(request, env = {}, ctx = {}) {
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, '') || '/';
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: { 'access-control-allow-origin': '*', 'access-control-allow-methods': 'GET, POST, OPTIONS', 'access-control-allow-headers': '*' } });
    try {
      if (path === '/') return json({ ok: true, store: STORE, version: VERSION, read_me: `${url.origin}/llms.txt` });
      if (path === '/llms.txt') return new Response(llmsTxt(url.origin, env), { headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'public, max-age=300' } });
      if (path === '/api/feedback') {
        if (!['GET', 'POST'].includes(request.method)) return err(405, 'method_not_allowed', 'Use POST.', 'POST a JSON body.');
        return await feedback(await readInputs(request, url), env, ctx);
      }
      const paid = /^\/paid\/([^/]+)\/(video|seller-guide)$/.exec(path);
      if (paid) {
        if (!env.SERVICE_PATH || !env.SIGNING_KEY || !same(paid[1], env.SERVICE_PATH) || !fulfilmentHeaderOk(request, env)) return err(404, 'not_found', 'No such route.', 'See /llms.txt.');
        if (!['GET', 'POST', 'PUT'].includes(request.method)) return err(405, 'method_not_allowed', 'Use GET or POST.', 'See /llms.txt.');
        const p = await readInputs(request, url);
        return paid[2] === 'video' ? await video(p, env, url, request) : await sellerGuide(p, env, url);
      }
      const gated = /^\/(hls|dl)\/([^/]+)\/(.+)$/.exec(path);
      if (gated) {
        if (!['GET', 'HEAD'].includes(request.method)) return err(405, 'method_not_allowed', 'Use GET.', '');
        const [, scope, key, file] = gated;
        if (!/^[A-Za-z0-9_.\/-]+$/.test(file) || file.includes('..')) return err(404, 'not_found', 'No such file.', '');
        const v = await checkKey(env.SIGNING_KEY || '', scope, key);
        if (!v.ok) return json({ ok: false, error: scope === 'hls' ? 'stream_key_invalid' : 'download_key_invalid', reason: v.reason }, 403);
        const res = await env.ASSETS.fetch(new Request(`${url.origin}/${scope}/${file}`));
        if (res.status === 404) return err(404, 'not_found', 'No such file.', '');
        const h = new Headers(res.headers);
        h.set('access-control-allow-origin', '*');
        if (file.endsWith('.m3u8')) { h.set('content-type', 'application/vnd.apple.mpegurl'); h.set('cache-control', 'no-store'); }
        else if (file.endsWith('.ts')) { h.set('content-type', 'video/mp2t'); h.set('cache-control', 'private, max-age=300'); }
        else if (file.endsWith('.zip')) { h.set('content-type', 'application/zip'); h.set('content-disposition', `attachment; filename="${file.split('/').pop()}"`); h.set('cache-control', 'no-store'); }
        return new Response(request.method === 'HEAD' ? null : res.body, { status: res.status, headers: h });
      }
      if (path === '/play') return env.ASSETS.fetch(new Request(`${url.origin}/play.html`));
      if (path === '/poster.jpg') return env.ASSETS.fetch(new Request(`${url.origin}/poster.jpg`));
      return err(404, 'not_found', 'No such route.', 'See /llms.txt.');
    } catch (e) {
      if (e && e.code) return err(400, e.code, e.message, 'See /llms.txt.');
      console.error(e);
      return err(500, 'internal_error', 'Something went wrong on our side.', 'Try again, then use the feedback item.');
    }
  },
};
