const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
function load(file, globals = {}) {
  const exports = {};
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  vm.runInNewContext(code, { exports, URL, Date, JSON, Object, Number, ...globals });
  return exports;
}
const { touchFromUrl, mergeTouch, attributionColumns } = load('src/lib/attribution.ts');
const plain = value => JSON.parse(JSON.stringify(value));
const metaUrl = 'https://www.ladyvictoriadesigns.com/welcome?utm_source=ig&utm_medium=paid&utm_id=52668577648474&utm_campaign=52668577648474&utm_term=52668773752674&utm_content=52668773909274&fbclid=PAZabc123&name=Sarah';
const day = 24 * 60 * 60 * 1000;

test('a tagged landing URL becomes a touch; personal query values and referrer paths are dropped', () => {
  const touch = plain(touchFromUrl(metaUrl, 'https://l.instagram.com/path?u=secret', new Date('2026-10-05T12:00:00Z')));
  assert.equal(touch.landing_page, '/welcome');
  assert.equal(touch.referrer, 'https://l.instagram.com');
  assert.equal(touch.params.utm_content, '52668773909274');
  assert.equal(touch.params.fbclid, 'PAZabc123');
  assert.equal(touch.params.name, undefined);
});

test('untagged visits, placeholder fbclid and unfilled macros are ignored', () => {
  assert.equal(touchFromUrl('https://x.com/inquire', null, new Date()), null);
  assert.equal(touchFromUrl('https://x.com/welcome?fbclid=fbclid', null, new Date()), null);
  assert.equal(touchFromUrl('https://x.com/welcome?utm_content={{ad.id}}', null, new Date()), null);
});

test('first touch is kept for 90 days, last touch always updates', () => {
  const t0 = new Date('2026-08-01T00:00:00Z');
  const first = touchFromUrl(metaUrl, null, t0);
  const later = new Date(t0.getTime() + 10 * day);
  const retarget = touchFromUrl('https://x.com/welcome?utm_source=fb&utm_content=999999', null, later);
  const merged = mergeTouch({ first, last: first }, retarget, later);
  assert.equal(merged.first, first);
  assert.equal(merged.last, retarget);
  const stale = new Date(t0.getTime() + 91 * day);
  assert.equal(mergeTouch({ first, last: first }, retarget, stale).first, retarget);
  assert.deepEqual(plain(mergeTouch({ first }, null, later)), plain({ first }));
});

test('server maps Meta first touch to campaign / ad set / ad IDs', () => {
  const now = new Date('2026-10-05T12:00:00Z');
  const first = touchFromUrl(metaUrl, null, now);
  const cols = plain(attributionColumns({ first, last: first, fbp: 'fb.1.1700000000000.123', ga_client_id: '123.456' }, null, now));
  assert.equal(cols.utm_source, 'ig');
  assert.equal(cols.meta_campaign_id, '52668577648474');
  assert.equal(cols.meta_adset_id, '52668773752674');
  assert.equal(cols.meta_ad_id, '52668773909274');
  assert.equal(cols.landing_page, '/welcome');
  assert.equal(cols.first_touch_at, '2026-10-05T12:00:00.000Z');
  assert.equal(cols.attribution.fbp, 'fb.1.1700000000000.123');
  assert.equal(cols.attribution.ga_client_id, '123.456');
});

test('non-Meta tags keep utm fields but no Meta IDs', () => {
  const now = new Date();
  const first = touchFromUrl('https://x.com/inquire?utm_source=Pinterest&utm_medium=PaidSocial&utm_campaign=626759449594&epik=abc', null, now);
  const cols = attributionColumns({ first }, null, now);
  assert.equal(cols.utm_source, 'Pinterest');
  assert.equal(cols.meta_campaign_id, null);
  assert.equal(cols.meta_ad_id, null);
});

test('server rejects junk and falls back to the submitting page URL', () => {
  const now = new Date('2026-10-05T12:00:00Z');
  const junk = plain(attributionColumns({ first: { at: 'nope', landing_page: 'evil', params: {} }, fbc: 'bad value <script>' }, null, now));
  assert.equal(junk.utm_source, null);
  assert.deepEqual(junk.attribution, {});
  const fallback = attributionColumns(undefined, metaUrl, now);
  assert.equal(fallback.meta_ad_id, '52668773909274');
  assert.equal(fallback.landing_page, '/welcome');
});
