const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
function load(file) {
  const exports = {};
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  vm.runInNewContext(code, { exports, Number });
  return exports;
}
const { salesStep, parseAmount, formatMoney, LOST_REASONS, SALES_ACTIONS } = load('src/lib/sales-stage.ts');
const step = lead => JSON.parse(JSON.stringify(salesStep(lead)));

test('Valentina walks through every step, each with an undo for the last answer', () => {
  assert.deepEqual(step({}), { step: 'consult' });
  assert.deepEqual(step({ consult_outcome: 'no_show' }), { step: 'no_show', undo: 'consult_clear' });
  assert.deepEqual(step({ consult_outcome: 'completed' }), { step: 'fit', undo: 'consult_clear' });
  assert.deepEqual(step({ consult_outcome: 'completed', fit: 'not_fit' }), { step: 'not_fit', undo: 'fit_clear' });
  assert.deepEqual(step({ consult_outcome: 'completed', fit: 'good_fit' }), { step: 'proposal', undo: 'fit_clear' });
  assert.deepEqual(step({ fit: 'good_fit', proposal_amount: '38500.00' }), { step: 'outcome', undo: 'proposal_clear' });
  assert.deepEqual(step({ proposal_amount: 38500, sales_outcome: 'booked', booked_amount: 36000 }), { step: 'booked', undo: 'outcome_clear' });
  assert.deepEqual(step({ sales_outcome: 'lost', lost_reason: 'budget' }), { step: 'lost', undo: 'outcome_clear' });
});

test('direct-call leads can skip straight to fit, proposal or outcome', () => {
  assert.equal(salesStep({ fit: 'good_fit' }).step, 'proposal');
  assert.equal(salesStep({ proposal_amount: 0 }).step, 'outcome');
});

test('amounts accept $ and commas and reject junk', () => {
  assert.equal(parseAmount('$38,500'), 38500);
  assert.equal(parseAmount(' 12000.50 '), 12000.5);
  for (const bad of ['', 'abc', '-5', '0', '1.234', '99999999']) assert.equal(parseAmount(bad), null, bad);
  assert.equal(formatMoney('36000.00'), '$36,000');
  assert.equal(formatMoney(null), '');
});

test('SQL accepts exactly the actions and reasons the app sends', () => {
  const sql = fs.readFileSync('supabase/lead-sales-schema.sql', 'utf8');
  for (const action of SALES_ACTIONS) assert.ok(sql.includes(`'${action}'`), action);
  for (const reason of Object.keys(LOST_REASONS)) assert.ok(sql.includes(`'${reason}'`), reason);
  assert.match(sql, /'appointment_rescheduled', 'sales_update'/);
});
