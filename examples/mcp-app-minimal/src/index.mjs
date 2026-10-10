// Minimal MCP server with one interactive MCP App view, as a Cloudflare Worker (no dependencies).
//
// The pattern Centaur League uses for its in-chat chess board, cut down to the parts every seller needs:
//   POST /mcp      MCP over Streamable HTTP, stateless JSON responses (initialize, tools/list, tools/call,
//                  resources/list, resources/read)
//   GET  /         a plain page saying what this is
//
// One tool, `show_quote`, returns a result as text for the model AND as structuredContent for the view.
// The tool's _meta.ui.resourceUri points at a ui:// resource holding a self-contained HTML app. Hosts that
// support MCP Apps (Claude, ChatGPT, Goose, VS Code and others) render that app in the conversation and push
// the tool result into it; hosts that don't simply show the text. The app can call tools back
// (here: `refresh_quote`) and tell the model what the human did (ui/update-model-context).
//
// Swap `quoteFor()` for your own data: a match, a shipment, a stream, a report preview.

const UI_URI = 'ui://example-store/quote-v1'; // bump the suffix on every change to the HTML: hosts cache views by URI
const UI_MIME = 'text/html;profile=mcp-app';
const SERVER_INFO = { name: 'example-store', title: 'Example Store', version: '1.0.0' };
const VERSIONS = ['2025-11-25', '2025-06-18', '2025-03-26', '2024-11-05'];

const TOOLS = [
  {
    name: 'show_quote',
    title: 'Show a price quote',
    description: 'Show a live price quote for a product code as an interactive card. Returns price, currency and time. The human can refresh it on the card.',
    inputSchema: {
      type: 'object',
      required: ['code'],
      properties: { code: { type: 'string', description: 'Product code, three to ten letters or digits.' } },
      additionalProperties: false,
    },
    _meta: { ui: { resourceUri: UI_URI } },
  },
  {
    name: 'refresh_quote',
    title: 'Refresh a quote',
    description: 'Fetch the current quote for a product code (used by the card; agents may call it too).',
    inputSchema: {
      type: 'object',
      required: ['code'],
      properties: { code: { type: 'string', description: 'Product code, three to ten letters or digits.' } },
      additionalProperties: false,
    },
  },
];

// ---------- your data ----------
export function quoteFor(code, now = Date.now()) {
  const c = String(code || '').trim().toUpperCase();
  if (!/^[A-Z0-9]{3,10}$/.test(c)) return { ok: false, error: 'bad_value', message: 'code must be three to ten letters or digits.' };
  let h = 0; for (const ch of c) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const minute = Math.floor(now / 60000);
  const price = ((h % 9000) / 100 + 10 + Math.sin(minute + h) * 0.5).toFixed(2);
  return { ok: true, code: c, price: Number(price), currency: 'USD', as_of: new Date(minute * 60000).toISOString(), demo: true };
}

// ---------- MCP over HTTP ----------
const ok = (id, result) => ({ jsonrpc: '2.0', id, result });
const err = (id, code, message) => ({ jsonrpc: '2.0', id, error: { code, message } });

function callTool(name, args = {}) {
  const tool = TOOLS.find((t) => t.name === name);
  if (!tool) return null;
  const allowed = Object.keys(tool.inputSchema.properties);
  const extra = Object.keys(args).filter((k) => !allowed.includes(k));
  const q = extra.length ? { ok: false, error: 'unknown_parameter', message: `Not accepted: ${extra.join(', ')}` } : quoteFor(args.code);
  const text = q.ok ? `${q.code}: ${q.price.toFixed(2)} ${q.currency} as of ${q.as_of} (demo data).` : `Error ${q.error}: ${q.message}`;
  return {
    content: [{ type: 'text', text }],              // what the model reads
    structuredContent: q,                           // what the view reads (and any client that wants JSON)
    isError: !q.ok,
  };
}

function handle(m) {
  if (!m || m.jsonrpc !== '2.0' || !m.method) return m && m.id != null ? err(m.id, -32600, 'invalid request') : null;
  if (m.id === undefined || m.id === null) return null; // notifications get no reply
  const p = m.params || {};
  switch (m.method) {
    case 'initialize':
      return ok(m.id, {
        protocolVersion: VERSIONS.includes(p.protocolVersion) ? p.protocolVersion : VERSIONS[0],
        capabilities: { tools: { listChanged: false }, resources: { listChanged: false }, extensions: { 'io.modelcontextprotocol/ui': { mimeTypes: [UI_MIME] } } },
        serverInfo: SERVER_INFO,
        instructions: 'Example Store: show_quote renders an interactive quote card. Paid items for this store are bought on the Qatom master MCP.',
      });
    case 'ping': return ok(m.id, {});
    case 'tools/list': return ok(m.id, { tools: TOOLS });
    case 'tools/call': {
      const r = callTool(p.name, p.arguments || {});
      return r ? ok(m.id, r) : err(m.id, -32602, `unknown tool ${p.name}`);
    }
    case 'resources/list': return ok(m.id, { resources: [{ uri: UI_URI, name: 'Quote card', mimeType: UI_MIME }] });
    case 'resources/templates/list': return ok(m.id, { resourceTemplates: [] });
    case 'resources/read':
      if (p.uri !== UI_URI) return err(m.id, -32002, 'resource not found');
      return ok(m.id, { contents: [{ uri: UI_URI, mimeType: UI_MIME, text: APP_HTML, _meta: { ui: { prefersBorder: true, csp: { connectDomains: [], resourceDomains: [] } } } }] });
    case 'prompts/list': return ok(m.id, { prompts: [] });
    default: return err(m.id, -32601, `method not found: ${m.method}`);
  }
}

export default {
  async fetch(request) {
    const url = new URL(request.url);
    if (url.pathname === '/mcp') {
      if (request.method === 'DELETE') return new Response(null, { status: 204 });
      if (request.method !== 'POST') return new Response('MCP server. POST JSON-RPC here.', { status: 405, headers: { allow: 'POST' } });
      let body; try { body = await request.json(); } catch { return Response.json(err(null, -32700, 'parse error'), { status: 400 }); }
      const batch = Array.isArray(body);
      const out = (batch ? body : [body]).map(handle).filter(Boolean);
      if (!out.length) return new Response(null, { status: 202 });
      return Response.json(batch ? out : out[0], { headers: { 'cache-control': 'no-store' } });
    }
    if (url.pathname === '/') return new Response('Example MCP App server. Add /mcp as a custom connector in an MCP Apps client.', { headers: { 'content-type': 'text/plain' } });
    return new Response('not found', { status: 404 });
  },
};

// ---------- the view: self-contained HTML, no network, speaks MCP Apps over postMessage ----------
export const APP_HTML = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>
:root{color-scheme:light dark;--bg:#fff;--fg:#14181f;--mut:#5b6472;--line:#d9dee6;--acc:#2456d6}
@media (prefers-color-scheme:dark){:root{--bg:#14181f;--fg:#eef1f5;--mut:#9aa4b2;--line:#2c3440;--acc:#7aa2ff}}
body{margin:0;font:15px/1.4 system-ui,sans-serif;background:var(--bg);color:var(--fg)}
.card{padding:16px;border:1px solid var(--line);border-radius:12px;max-width:420px}
.code{font-weight:600;letter-spacing:.04em}.price{font-size:32px;font-weight:700;margin:6px 0}
.mut{color:var(--mut);font-size:13px}button{margin-top:12px;padding:8px 14px;border-radius:8px;border:1px solid var(--acc);background:none;color:var(--acc);font:inherit;cursor:pointer}
</style></head><body><div class="card"><div class="code" id="code">Waiting for a quote…</div><div class="price" id="price"></div>
<div class="mut" id="asof"></div><button id="refresh" hidden>Refresh</button><div class="mut" id="msg"></div></div>
<script>
var nextId=1,pending={},Q=null;
function send(m){window.parent.postMessage(m,'*')}
function request(method,params){var id=nextId++;send({jsonrpc:'2.0',id:id,method:method,params:params||{}});
  return new Promise(function(res,rej){pending[id]={res:res,rej:rej};setTimeout(function(){if(pending[id]){delete pending[id];rej(new Error(method+' timed out'))}},30000)})}
function notify(method,params){send({jsonrpc:'2.0',method:method,params:params||{}})}
function size(){notify('ui/notifications/size-changed',{height:document.documentElement.scrollHeight})}
function show(q){Q=q;var $=function(i){return document.getElementById(i)};
  if(!q||!q.ok){$('msg').textContent=(q&&q.message)||'No quote.';size();return}
  $('code').textContent=q.code;$('price').textContent=q.price.toFixed(2)+' '+q.currency;
  $('asof').textContent='As of '+new Date(q.as_of).toLocaleString()+(q.demo?' · demo data':'');$('refresh').hidden=false;$('msg').textContent='';size()}
window.addEventListener('message',function(e){var m=e.data;if(!m||m.jsonrpc!=='2.0')return;
  if(m.id!=null&&pending[m.id]&&!m.method){var p=pending[m.id];delete pending[m.id];m.error?p.rej(new Error(m.error.message)):p.res(m.result);return}
  if(m.method&&m.id!=null){send({jsonrpc:'2.0',id:m.id,result:{}});return}   // host requests, e.g. ui/resource-teardown
  if(m.method==='ui/notifications/tool-result'){show(m.params&&m.params.structuredContent)}});
document.getElementById('refresh').onclick=function(){if(!Q)return;document.getElementById('msg').textContent='Refreshing…';
  request('tools/call',{name:'refresh_quote',arguments:{code:Q.code}}).then(function(r){
    var t=r&&r.content&&r.content[0]&&r.content[0].text||'';show(r&&r.structuredContent);
    request('ui/update-model-context',{content:[{type:'text',text:'The human refreshed the '+Q.code+' quote on the card: '+t}]}).catch(function(){})
  }).catch(function(e){document.getElementById('msg').textContent=e.message;size()})};
request('ui/initialize',{appInfo:{name:'Quote card',version:'1.0.0'},appCapabilities:{},protocolVersion:'2026-01-26'})
  .then(function(){notify('ui/notifications/initialized',{});size()}).catch(function(){});
</script></body></html>`;
