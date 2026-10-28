const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
function load(file, requireFn = () => ({})) {
  const exports = {};
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  vm.runInNewContext(code, { exports, require: requireFn, Number, Object, Map, Set, Math, Date, Array });
  return exports;
}
const adSource = load('src/lib/ad-source.ts');
const adReport = load('src/lib/ad-report.ts', name => name.includes('ad-source') ? adSource : {});
const stats = load('src/lib/platform-stats.ts', name => name.includes('ad-report') ? adReport : {});

const CSV = [
  'Campaign Name,Ad Group Name,Ad Name,Goal,Total Results,Cost per Result,Impressions,eCPM,Clicks,CPC (USD),CTR,Amount Spent (USD),Currency',
  'LVD First Campaign,Muse Ad Group,Ad 1,-,0,0.0,2760,9.16,17,1.49,0.006,25.292316,USD',
  'LVD First Campaign,Muse Ad Group,"Your Vision, Brought to Life",-,0,0.0,2822,9.54,38,0.71,0.0134,26.929475,USD',
  '',
].join('\n');

test('reads Reddit\'s per-ad export, including a quoted comma in the ad name', () => {
  const { rows, error } = stats.parseRedditAdCsv(CSV);
  assert.equal(error, null);
  assert.equal(rows.length, 2);
  assert.equal(rows[1].ad_name, 'Your Vision, Brought to Life');
  assert.equal(rows[1].spend, 26.93);
  assert.equal(rows[1].clicks, 38);
  assert.equal(rows[0].ad_group, 'Muse Ad Group');
});

test('refuses the campaign-level export and unreadable numbers', () => {
  const campaignLevel = 'Campaign Name,Goal,Total Results,Cost per Result,Impressions,eCPM,Clicks,CPC (USD),CTR,Amount Spent (USD),Currency\nLVD,,0,0,30359,13.12,510,0.78,0.0168,398.296186,USD\n';
  assert.match(stats.parseRedditAdCsv(campaignLevel).error, /Ad Name/);
  assert.match(stats.parseRedditAdCsv(CSV.replace('2760', 'lots')).error, /Ad 1/);
  assert.match(stats.parseRedditAdCsv('').error, /no rows/);
});

test('takes the report period from Reddit\'s file name', () => {
  assert.deepEqual({ ...stats.periodFromFilename('2026_custom_2026-09-01_2026-10-28 (2).csv') }, { start: '2026-09-01', end: '2026-10-28' });
  assert.equal(stats.periodFromFilename('report.csv'), null);
});

test('matches a link tag to an ad by name or by ad number', () => {
  assert.equal(stats.tagMatchesAdName('ad7_vision_brought_to_life', 'Your Vision, Brought to Life'), true);
  assert.equal(stats.tagMatchesAdName('ad7_vision_brought_to_life', 'A Wedding Designed in Full Bloom'), false);
  assert.equal(stats.tagMatchesAdName('ad1_luxury_florals', 'Ad 1'), true);
  assert.equal(stats.tagMatchesAdName('ad1_luxury_florals', 'Ad 2'), false);
});

const row = (ad_name, spend, utm_content = null) => ({ platform: 'reddit', campaign: 'LVD First Campaign', ad_group: 'Muse Ad Group', ad_name, period_start: '2026-09-01', period_end: '2026-10-28', spend, impressions: 1000, clicks: 10, utm_content, imported_at: '2026-10-28T20:00:00Z' });
const lead = (extra = {}) => ({ id: 'L', created_at: '2026-10-26T06:45:25Z', utm_source: 'reddit', investment: '$4,000 – $10,000', status: 'reviewing', attribution: { first: { params: { utm_content: 'ad7_vision_brought_to_life' } } }, appointments: [], ...extra });

test('puts each inquiry on exactly one ad and works out cost per inquiry', () => {
  const report = stats.buildPlatformReport('reddit', [row('Ad 1', 25.29), row('Your Vision, Brought to Life', 26.93)], [lead(), lead({ id: 'M', utm_source: 'fb' })]);
  const vision = report.rows.find(r => r.ad_name.startsWith('Your Vision'));
  assert.equal(vision.inquiries, 1);
  assert.equal(vision.tagGuessed, true);
  assert.equal(vision.costPerInquiry, 26.93);
  assert.equal(report.rows.find(r => r.ad_name === 'Ad 1').inquiries, 0);
  assert.equal(report.totals.inquiries, 1);
  assert.equal(report.totals.costPerInquiry, 52.22);
  assert.equal(report.unmatched.inquiries, 0);
});

test('a saved tag beats a guess, and unmatched or out-of-period inquiries are kept honest', () => {
  const saved = stats.buildPlatformReport('reddit', [row('Ad 1', 10, 'ad7_vision_brought_to_life'), row('Your Vision, Brought to Life', 20)], [lead()]);
  assert.equal(saved.rows.find(r => r.ad_name === 'Ad 1').inquiries, 1);
  assert.equal(saved.rows.find(r => r.ad_name.startsWith('Your Vision')).inquiries, 0);

  const mystery = stats.buildPlatformReport('reddit', [row('Ad 1', 10)], [lead({ attribution: { first: { params: { utm_content: 'mystery' } } } }), lead({ id: 'late', created_at: '2026-11-02T00:00:00Z' })]);
  assert.equal(mystery.unmatched.inquiries, 1);
  assert.deepEqual(Array.from(mystery.unmatched.tags), ['mystery']);
  assert.equal(mystery.totals.inquiries, 1);
});

test('empty imports give an empty report', () => {
  const report = stats.buildPlatformReport('reddit', [], [lead()]);
  assert.equal(report.rows.length, 0);
  assert.equal(report.period, null);
});
