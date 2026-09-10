const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

function setup({ blocked = false, stored = null, ok = true } = {}) {
  const storage = new Map(stored ? [['lvd_marketing_attribution', stored]] : []);
  const window = { location: { pathname: '/welcome', origin: 'https://example.com', search: '?gclid=click_123&utm_source=google&utm_campaign=weddings&email=private%40example.com' } };
  const context = vm.createContext({ window, document: { referrer: 'https://search.example/?email=secret' }, URL, URLSearchParams,
    sessionStorage: { getItem: k => { if (blocked) throw Error(); return storage.get(k); }, setItem: (k,v) => { if (blocked) throw Error(); storage.set(k,v); } },
    fetch: async () => ({ ok, json: async () => ok ? { leadId: '123' } : { error: 'Rejected' } }),
  });
  function load(file, requireFn) {
    const output = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2017 } }).outputText;
    context.exports = {}; context.require = requireFn;
    vm.runInContext(`(function(exports, require) { ${output} })(exports, require)`, context);
    return context.exports;
  }
  const ga = load('src/lib/ga4.ts');
  const lead = load('src/lib/lead-submit.ts', () => ga);
  const events = () => (window.dataLayer || []).map(a => Array.from(a));
  return { ga, lead, window, storage, events, load, context };
}

test('queues targeted GA4 events, strips PII and preserves attribution through navigation/reload', () => {
  const s = setup(); s.ga.trackGA4('page_view');
  s.window.location.pathname = '/inquire'; s.window.location.search = '';
  s.ga.trackGA4('page_view');
  assert.equal(s.events().filter(e => e[0] === 'config').length, 1);
  const event = s.events().at(-1);
  assert.equal(event[2].send_to, 'G-QS8T3YC21F');
  assert.equal(event[2].campaign_source, 'google');
  assert.equal(event[2].page_location, 'https://example.com/inquire?gclid=click_123');
  assert.equal(event[2].page_referrer, 'https://example.com/welcome');
  assert.doesNotMatch(JSON.stringify(s.events()), /private|secret|email|AW-/);
  const reloaded = setup({ stored: s.storage.get('lvd_marketing_attribution') });
  reloaded.window.location.search = ''; reloaded.ga.trackGA4('page_view');
  assert.equal(reloaded.events().at(-1)[2].campaign_name, 'weddings');
});
test('storage denial does not break tracking and private pages are excluded', () => {
  const s = setup({ blocked: true }); s.ga.trackGA4('page_view');
  const count = s.events().length;
  for (const path of ['/portal', '/portal/welcome', '/admin/login']) {
    s.window.location.pathname = path; s.ga.trackGA4('page_view');
  }
  assert.equal(s.events().length, count);
});
test('only successful welcome/inquire submissions send generate_lead, without submission fields', async () => {
  const s = setup();
  for (const path of ['/welcome', '/inquire', '/reserve']) {
    s.window.location.pathname = path;
    await s.lead.submitLead({ name: 'PRIVATE_NAME', email: 'PRIVATE_EMAIL', phone: 'PRIVATE_PHONE', payload: { vision: 'PRIVATE_CONTENT' } });
  }
  assert.equal(s.events().filter(e => e[1] === 'generate_lead').length, 2);
  assert.doesNotMatch(JSON.stringify(s.events()), /PRIVATE_/);
  const failed = setup({ ok: false });
  await assert.rejects(failed.lead.submitLead({}), /Rejected/);
  assert.equal(failed.events().length, 0);
});


test('navigation replay is deduplicated and Calendly requires a trusted iframe', () => {
  const s = setup();
  const callbacks = [];
  const refs = [];
  let index = 0;
  let listener;
  const frameWindow = {};
  s.window.addEventListener = (name, fn) => { listener = fn; };
  s.window.removeEventListener = () => {};
  s.context.document.querySelectorAll = () => [{ src: 'https://calendly.com/embed', contentWindow: frameWindow }];
  const component = s.load('src/components/GA4Tracking.tsx', name => {
    if (name === 'react') return {
      useEffect: fn => callbacks.push(fn),
      useRef: initial => refs[index++] ||= { current: initial },
    };
    if (name === 'next/navigation') return {
      usePathname: () => s.window.location.pathname,
      useSearchParams: () => new URLSearchParams(s.window.location.search),
    };
    return s.ga;
  }).default;
  function render() { index = 0; callbacks.length = 0; component(); callbacks.forEach(fn => fn()); }
  render(); render();
  assert.equal(s.events().filter(e => e[1] === 'page_view').length, 1);
  s.window.location.pathname = '/inquire'; render();
  assert.equal(s.events().filter(e => e[1] === 'page_view').length, 2);
  const data = { event: 'calendly.event_scheduled', payload: { event: { uri: 'private-booking-id' }, invitee: { email: 'private@example.com' } } };
  listener({ origin: 'https://evil.example', source: frameWindow, data });
  listener({ origin: 'https://calendly.com', source: {}, data });
  assert.equal(s.events().filter(e => e[1] === 'book_appointment').length, 0);
  listener({ origin: 'https://calendly.com', source: frameWindow, data });
  listener({ origin: 'https://calendly.com', source: frameWindow, data });
  assert.equal(s.events().filter(e => e[1] === 'book_appointment').length, 1);
  assert.doesNotMatch(JSON.stringify(s.events()), /private/);
});
