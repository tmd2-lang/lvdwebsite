const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
function load(file, requireFn = () => ({})) {
  const exports = {};
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  vm.runInNewContext(code, { exports, require: requireFn, Intl, Date });
  return exports;
}
const display = load('src/lib/consultation-display.ts');
const { attentionReasons, needsAttention } = load('src/lib/attention.ts', name => name.includes('consultation-display') ? display : {});
// Oct 8, 2026, 10:00 AM Eastern.
const now = new Date('2026-10-08T14:00:00Z');
const lead = (o = {}) => ({ id: o.id || 'v', name: 'Valentina', status: 'new', created_at: '2026-10-05T00:00:00Z', appointments: [], ...o });
const appt = (starts, ends, o = {}) => ({ id: starts, lead_id: 'v', starts_at: starts, ends_at: ends, status: 'scheduled', rescheduled: false, outcome: null, ...o });
const reasons = l => Array.from(attentionReasons(l, now));

test('new inquiries from the last 14 days need a first contact; older ones do not', () => {
  assert.deepEqual(reasons(lead()), ['new_uncontacted']);
  assert.deepEqual(reasons(lead({ created_at: '2026-09-01T00:00:00Z' })), []);
  assert.deepEqual(reasons(lead({ status: 'contacted' })), []);
});

test('Valentina booked a consult: today, then outcome missing until someone clicks', () => {
  const today = lead({ appointments: [appt('2026-10-08T18:00:00Z', '2026-10-08T18:30:00Z')] });
  assert.deepEqual(reasons(today), ['consult_today']);
  const past = lead({ appointments: [appt('2026-10-07T18:00:00Z', '2026-10-07T18:30:00Z')] });
  assert.deepEqual(reasons(past), ['outcome_missing']);
  assert.deepEqual(reasons({ ...past, consult_outcome: 'completed', status: 'contacted' }), []);
  const canceled = lead({ created_at: '2026-09-01T00:00:00Z', appointments: [appt('2026-10-07T18:00:00Z', '2026-10-07T18:30:00Z', { status: 'canceled' })] });
  assert.deepEqual(reasons(canceled), []);
  // A consult later this week is not a to-do yet, and replaces "not contacted".
  assert.deepEqual(reasons(lead({ appointments: [appt('2026-10-10T18:00:00Z', '2026-10-10T18:30:00Z')] })), []);
});

test('a proposal with no answer after 7 days needs a follow-up', () => {
  const base = { status: 'qualified', fit: 'good_fit', proposal_amount: 38500 };
  assert.deepEqual(reasons(lead({ ...base, proposal_sent_at: '2026-09-30T00:00:00Z' })), ['proposal_waiting']);
  assert.deepEqual(reasons(lead({ ...base, proposal_sent_at: '2026-10-06T00:00:00Z' })), []);
});

test('closed inquiries never need attention', () => {
  for (const closed of [{ sales_outcome: 'booked' }, { sales_outcome: 'lost' }, { fit: 'not_fit' }, { status: 'spam' }, { status: 'archived' }, { status: 'booked' }]) {
    assert.deepEqual(reasons(lead({ ...closed, appointments: [appt('2026-10-08T18:00:00Z', '2026-10-08T18:30:00Z')] })), []);
  }
});

test('most urgent first', () => {
  const list = [
    lead({ id: 'new' }),
    lead({ id: 'proposal', status: 'qualified', proposal_amount: 1, proposal_sent_at: '2026-09-01T00:00:00Z' }),
    lead({ id: 'today', appointments: [appt('2026-10-08T18:00:00Z', '2026-10-08T18:30:00Z')] }),
    lead({ id: 'missing', appointments: [appt('2026-10-07T18:00:00Z', '2026-10-07T18:30:00Z')] }),
    lead({ id: 'old', created_at: '2026-08-01T00:00:00Z' }),
  ];
  assert.deepEqual(Array.from(needsAttention(list, now), l => l.id), ['today', 'missing', 'proposal', 'new']);
});
