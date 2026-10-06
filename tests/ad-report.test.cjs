const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
function load(file, requireFn = () => ({})) {
  const exports = {};
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  vm.runInNewContext(code, { exports, require: requireFn, Number, Object, Map });
  return exports;
}
const adSource = load('src/lib/ad-source.ts');
const { buildAdReport, budgetFloor, costPer } = load('src/lib/ad-report.ts', name => name.includes('ad-source') ? adSource : {});
const plain = v => JSON.parse(JSON.stringify(v));
const BTS = '52668773909274';
const lead = (o = {}) => ({ id: Math.random().toString(), status: 'new', investment: '$12,000 – $19,000', appointments: [], ...o });

test('budget floors read the first dollar amount', () => {
  assert.equal(budgetFloor('$20,000 – $34,000'), 20000);
  assert.equal(budgetFloor('$55,000+'), 55000);
  assert.equal(budgetFloor('$8,000 – $15,000'), 8000);
  assert.equal(budgetFloor(null), null);
});

test("Valentina's full trail adds up under the BTS ad", () => {
  const leads = [
    lead({ utm_source: 'ig', meta_ad_id: BTS, investment: '$20,000 – $34,000', consult_outcome: 'completed', fit: 'good_fit', proposal_amount: 38500, sales_outcome: 'booked', booked_amount: '36000.00' }),
    lead({ utm_source: 'fb', meta_ad_id: BTS, appointments: [{ status: 'scheduled' }] }),
    lead({ utm_source: 'fb', meta_ad_id: BTS, sales_outcome: 'lost', lost_reason: 'budget' }),
    lead({ utm_source: 'Pinterest' }),
    lead({}),
  ];
  const report = plain(buildAdReport(leads, { [BTS]: 261.3, '11111111111': 50 }));
  const bts = report.ads.find(r => r.adId === BTS);
  assert.equal(bts.label, 'BTS Transformation - Sept 2026');
  assert.deepEqual([bts.inquiries, bts.highBudget, bts.consults, bts.completed, bts.goodFit, bts.proposals, bts.booked, bts.bookedAmount, bts.lost, bts.spend],
    [3, 1, 2, 1, 1, 1, 1, 36000, 1, 261.3]);
  // An ad with spend but no inquiries still shows up, with zero inquiries.
  assert.equal(report.ads.find(r => r.adId === '11111111111').inquiries, 0);
  assert.deepEqual(report.other.map(r => r.inquiries), [1, 1]);
  assert.equal(report.totals.inquiries, 3);
  assert.equal(report.totals.spend, 311.3);
  assert.equal(report.ads[0].adId, BTS, 'ads with booked revenue first');
});

test('costs need both spend and a count', () => {
  assert.equal(costPer(261.3, 3), 87.10000000000001);
  assert.equal(costPer(null, 3), null);
  assert.equal(costPer(100, 0), null);
});

test('bookings marked with the old status dropdown still count', () => {
  const report = plain(buildAdReport([lead({ utm_source: 'ig', meta_ad_id: BTS, status: 'booked' })]));
  assert.equal(report.ads[0].booked, 1);
  assert.equal(report.ads[0].bookedAmount, 0);
});
