const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const crypto = require('node:crypto');
function load(file, requireFn, env = {}) {
  const exports = {};
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  vm.runInNewContext(code, { exports, require: requireFn, process: { env }, URLSearchParams, JSON, Number, Math, Intl, Date, Array });
  return exports;
}
const meta = load('src/lib/meta-ads.ts', name => name === 'node:crypto' ? crypto : {});
const sha = v => crypto.createHash('sha256').update(v).digest('hex');
const plain = v => JSON.parse(JSON.stringify(v));

test('spend request asks for every ad since tracking began, on the right account and API version', () => {
  const url = new URL(meta.insightsUrl('https://graph.facebook.com/v26.0', '55657071', '2026-10-06'));
  assert.equal(url.pathname, '/v26.0/act_55657071/insights');
  assert.equal(url.searchParams.get('level'), 'ad');
  assert.deepEqual(JSON.parse(url.searchParams.get('time_range')), { since: '2026-08-13', until: '2026-10-06' });
  assert.equal(url.searchParams.get('access_token'), null, 'token travels in a header, never the URL');
  const config = plain(meta.metaConfig());
  assert.equal(config.pixel, '1263840655319183');
  assert.equal(config.adAccount, '55657071');
});

test("Meta's spend rows are cleaned up", () => {
  assert.deepEqual(plain(meta.parseInsights([
    { ad_id: '52668773909274', ad_name: 'BTS Transformation', spend: '261.304' },
    { ad_id: 'nope', spend: '5' }, { ad_id: '123456', spend: 'x' }, null,
  ])), [{ ad_id: '52668773909274', ad_name: 'BTS Transformation', spend: 261.3 }]);
  assert.deepEqual(plain(meta.parseInsights(undefined)), []);
});

test('email and phone are normalized the way Meta requires before hashing', () => {
  assert.equal(meta.normalizeEmail('  Valentina@Example.COM '), 'valentina@example.com');
  assert.equal(meta.normalizeEmail('not-an-email'), '');
  assert.equal(meta.normalizePhone('(804) 467-4585'), '18044674585');
  assert.equal(meta.normalizePhone('+44 20 7946 0958'), '442079460958');
  assert.equal(meta.normalizePhone('123'), '');
});

test("Valentina's booking becomes a hashed Purchase worth $36,000; nothing readable leaves", () => {
  const lead = { id: 'lead-1', email: 'Valentina@Example.com', phone: '804-467-4585', attribution: { fbc: 'fb.1.1.abc', fbp: 'fb.1.2.def' } };
  const event = plain(meta.capiEvent('booked', lead, 36000, new Date('2026-10-12T15:00:00Z')));
  assert.equal(event.event_name, 'Purchase');
  assert.equal(event.event_id, 'lvd_lead-1_booked');
  assert.equal(event.event_time, 1791817200);
  assert.equal(event.action_source, 'system_generated');
  assert.deepEqual(event.custom_data, { value: 36000, currency: 'USD' });
  assert.deepEqual(event.user_data.em, [sha('valentina@example.com')]);
  assert.deepEqual(event.user_data.ph, [sha('18044674585')]);
  assert.deepEqual(event.user_data.external_id, [sha('lead-1')]);
  assert.equal(event.user_data.fbc, 'fb.1.1.abc');
  assert.ok(!JSON.stringify(event).includes('alentina'), 'no plain email in the payload');
  const qualified = plain(meta.capiEvent('fit_good', { id: 'lead-1', email: null, phone: null }, null));
  assert.equal(qualified.event_name, 'QualifiedLead');
  assert.equal(qualified.custom_data, undefined);
  assert.equal(qualified.user_data.em, undefined);
});

test('the daily job refuses callers without the cron secret', async () => {
  const route = load('src/app/api/cron/meta-spend/route.ts', name => {
    if (name === 'next/server') return { NextResponse: { json: (body, init) => ({ body, status: init?.status || 200 }) } };
    if (name.includes('meta-spend-sync')) return { runMetaSpendSync: async () => ({ ads: 7, spend: 100 }) };
    return {};
  }, { CRON_SECRET: 's3cret' });
  const call = header => route.GET({ headers: { get: () => header } });
  assert.equal((await call(null)).status, 401);
  assert.equal((await call('Bearer wrong')).status, 401);
  assert.equal((await call('Bearer s3cret')).status, 200);
});
