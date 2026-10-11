// node test/run.mjs : offline checks of the Qatom Demo store Worker (Node 20+).
import assert from 'node:assert/strict';
import worker from '../src/index.mjs';

const files = {
  '/meta.json': JSON.stringify({ video: { title: 'Space Station fisheye fly-through (NASA, 4K)', duration_seconds: 120 },
    seller_guide: { version: '1.4', file: 'qatom-seller-guide-1.4.zip', bytes: 20000, sha256: 'ab'.repeat(32), files: ['SKILL.md'] } }),
  '/hls/master.m3u8': '#EXTM3U\n', '/hls/480p/seg_000.ts': 'TS', '/dl/qatom-seller-guide-1.4.zip': 'PK', '/play.html': '<html>', '/poster.jpg': 'JPG',
};
const ASSETS = { fetch: async (req) => { const p = new URL(req.url).pathname; return p in files ? new Response(files[p]) : new Response('nf', { status: 404 }); } };
const kv = new Map(); const FEEDBACK = { get: async (k) => kv.get(k) ?? null, put: async (k, v) => { kv.set(k, v); } };
const env = { SERVICE_PATH: 'sp', SIGNING_KEY: 'k'.repeat(40), QATOM_FULFILMENT_TOKEN: 'tok', ASSETS, FEEDBACK, FEEDBACK_PER_HOUR: '2' };
const auth = { authorization: 'Bearer tok' };
const call = async (path, { method = 'POST', body, headers = {}, e = env } = {}) => {
  const r = await worker.fetch(new Request('https://demo.test' + path, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) }), e, {});
  const t = await r.text(); let j; try { j = JSON.parse(t); } catch { j = t; }
  return { status: r.status, body: j, headers: r.headers };
};
let n = 0; const ok = (m) => console.log(`ok ${++n} - ${m}`);

let r = await call('/llms.txt', { method: 'GET' }); assert.equal(r.status, 200); assert.ok(r.body.includes('Qatom Demo: seller guide skill')); ok('llms.txt');
r = await call('/paid/sp/video', { body: {} }); assert.equal(r.status, 404); ok('paid route without the Authorization header is 404');
r = await call('/paid/wrong/video', { body: {}, headers: auth }); assert.equal(r.status, 404); ok('wrong secret path is 404');
r = await call('/paid/sp/video', { body: {}, headers: auth, e: { ...env, QATOM_FULFILMENT_TOKEN: undefined } }); assert.equal(r.status, 404); ok('paid route fails closed without a fulfilment token configured');
r = await call('/paid/sp/video', { body: { ttl_seconds: 30 }, headers: auth });
assert.equal(r.status, 200); assert.equal(r.body.result.ttl_seconds, 60); assert.equal(r.body.out_of_range, true); assert.ok(r.body.display.primary_link.includes('/play?src='));
const hls = new URL(r.body.result.hls_url).pathname; ok('video: clamps ttl, returns player and stream');
assert.equal((await call(hls, { method: 'GET' })).status, 200); assert.equal((await call(hls.replace('master.m3u8', '480p/seg_000.ts'), { method: 'GET' })).status, 200); ok('stream key opens playlist and segments');
assert.equal((await call(hls.replace(/\/hls\/(\d+)\./, '/hls/$1.x'), { method: 'GET' })).status, 403); ok('tampered stream key is 403');
r = await call('/paid/sp/video', { body: { colour: 'red' }, headers: auth }); assert.equal(r.status, 400); assert.equal(r.body.error.code, 'unknown_parameter'); ok('unknown input refused');
r = await call('/paid/sp/seller-guide', { body: {}, headers: auth });
assert.equal(r.status, 200); assert.equal(r.body.result.version, '1.4'); const dl = new URL(r.body.result.download_url).pathname; ok('seller guide: download link and metadata');
const d = await call(dl, { method: 'GET' }); assert.equal(d.status, 200); assert.equal(d.headers.get('content-type'), 'application/zip'); ok('download key serves the zip');
assert.equal((await call(dl.replace('/dl/', '/hls/'), { method: 'GET' })).status, 403); ok('a download key cannot open the stream (scoped keys)');
r = await call('/api/feedback', { body: { message: 'hi' } }); assert.equal(r.status, 400); ok('feedback: too short refused');
r = await call('/api/feedback', { body: { message: 'Video plays well', subject_ref: 'video' } }); assert.equal(r.status, 200); assert.equal(r.body.result.received, true); ok('feedback stored');
await call('/api/feedback', { body: { message: 'second one' } });
r = await call('/api/feedback', { body: { message: 'third one' } }); assert.equal(r.status, 429); ok('feedback hourly cap');
r = await call('/api/feedback', { body: { message: 'x y z' }, e: { ...env, FEEDBACK: undefined } }); assert.equal(r.status, 503); ok('feedback refuses when nothing would read it');
console.log(`\n${n} passed`);
