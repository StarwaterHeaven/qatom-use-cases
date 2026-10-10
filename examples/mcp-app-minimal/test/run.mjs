// node test/run.mjs : offline checks of the MCP App server (Node 20+).
import assert from 'node:assert/strict';
import worker, { APP_HTML } from '../src/index.mjs';

let n = 0; const ok = (m) => console.log(`ok ${++n} - ${m}`);
const rpc = async (method, params, id = 1) => {
  const r = await worker.fetch(new Request('https://x.test/mcp', { method: 'POST', body: JSON.stringify({ jsonrpc: '2.0', id, method, params }) }));
  return r.json();
};

let r = await rpc('initialize', { protocolVersion: '2025-06-18' });
assert.equal(r.result.protocolVersion, '2025-06-18');
assert.deepEqual(r.result.capabilities.extensions['io.modelcontextprotocol/ui'].mimeTypes, ['text/html;profile=mcp-app']);
ok('initialize advertises the MCP Apps extension');

r = await rpc('tools/list');
const show = r.result.tools.find((t) => t.name === 'show_quote');
assert.equal(show._meta.ui.resourceUri, 'ui://example-store/quote-v1');
assert.equal(show.inputSchema.additionalProperties, false);
ok('show_quote links its view by resourceUri');

r = await rpc('resources/read', { uri: show._meta.ui.resourceUri });
assert.equal(r.result.contents[0].mimeType, 'text/html;profile=mcp-app');
assert.ok(r.result.contents[0].text.includes("request('ui/initialize'"));
ok('the view resource is served as an MCP App');

r = await rpc('tools/call', { name: 'show_quote', arguments: { code: 'abc123' } });
assert.equal(r.result.isError, false);
assert.equal(r.result.structuredContent.code, 'ABC123');
assert.ok(r.result.content[0].text.startsWith('ABC123:'));
ok('tool result carries text for the model and structuredContent for the view');

r = await rpc('tools/call', { name: 'show_quote', arguments: { code: 'abc', extra: 1 } });
assert.equal(r.result.isError, true); assert.equal(r.result.structuredContent.error, 'unknown_parameter');
ok('unknown parameters are refused');

const res = await worker.fetch(new Request('https://x.test/mcp', { method: 'POST', body: JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' }) }));
assert.equal(res.status, 202);
ok('notifications get 202 and no body');

assert.ok(!/https?:\/\/(?!www\.w3)/.test(APP_HTML.replace(/'\*'/g, '')), 'view must not load anything from the network');
ok('the view is self-contained');

console.log(`\n${n} passed`);
