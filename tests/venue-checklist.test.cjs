/* eslint-disable @typescript-eslint/no-require-imports -- Repository CommonJS Node test harness. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

function load(file) {
  const exports = {};
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: {
    module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true,
  } }).outputText;
  const requireModule = name => name.startsWith('./') ? load('src/lib/' + name.slice(2) + '.ts') : require(name);
  vm.runInNewContext(code, { exports, require: requireModule, Math }, { filename: file });
  return exports;
}

const { CHECKLIST_SECTIONS, sectionsFor } = load('src/lib/venue-checklist-questions.ts');
const { cleanTour, MAX_VENUES } = load('src/lib/venue-checklist-tour.ts');

// The PDF source, reduced to its question text and stars.
const pdf = fs.readFileSync('docs/venue-checklist/v4/index.html', 'utf8');
const decode = s => s.replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
const pdfQuestions = [...pdf.matchAll(/<li( class="s")?><span class="t">(.*?)<\/span>/gs)].map(m => ({ text: decode(m[2]), star: Boolean(m[1]) }));

test('the phone checklist asks exactly the PDF questions, in order, with the same stars', () => {
  const app = JSON.parse(JSON.stringify(CHECKLIST_SECTIONS.flatMap(s => s.questions).map(q => ({ text: q.text, star: Boolean(q.star) }))));
  assert.deepEqual(app, pdfQuestions);
});

test('standard edition has 43 questions, multicultural 57', () => {
  const count = edition => sectionsFor(edition).reduce((n, s) => n + s.questions.length, 0);
  assert.equal(count('standard'), 43);
  assert.equal(count('multicultural'), 57);
});

test('the standard edition has ten dealbreakers, and every one says why it matters', () => {
  const stars = sectionsFor('standard').flatMap(s => s.questions).filter(q => q.star);
  assert.equal(stars.length, 10);
  for (const q of CHECKLIST_SECTIONS.flatMap(s => s.questions).filter(q => q.star)) assert.ok(q.why, q.id);
});

test('question ids are unique', () => {
  const ids = CHECKLIST_SECTIONS.flatMap(s => s.questions.map(q => q.id));
  assert.equal(new Set(ids).size, ids.length);
});

test('saved progress keeps known answers and drops anything unexpected', () => {
  const tour = cleanTour({
    venues: [{
      id: 'a1', name: 'The Grand', email: 'events@grand.com',
      marks: { 'hours-1': 'slash', 'hours-2': 'check', 'cost-1': 'na', 'made-up': 'check', 'hours-3': 'maybe', 'alcohol-2': 'check' },
      answers: { 'hours-2': { answer: 'Midnight', who: 'Dana' }, 'nope': { answer: 'x' } },
      verdicts: { hours: 'clear', capacity: 'awful', ghost: 'deal' },
      notes: 'Lovely light', extra: 'ignored',
    }],
  });
  // Objects made inside the vm sandbox have a different prototype, so compare plain copies.
  const venue = JSON.parse(JSON.stringify(tour.venues[0]));
  assert.deepEqual(venue.marks, { 'hours-1': 'slash', 'hours-2': 'check', 'cost-1': 'na' });
  assert.deepEqual(venue.answers, { 'hours-2': { answer: 'Midnight', who: 'Dana' } });
  assert.deepEqual(venue.verdicts, { hours: 'clear' });
  assert.equal(venue.notes, 'Lovely light');
  assert.equal('extra' in venue, false);
});

test('saved progress is capped in size and never empty', () => {
  assert.equal(cleanTour(null).venues.length, 1);
  assert.equal(cleanTour({ venues: Array.from({ length: 20 }, () => ({})) }).venues.length, MAX_VENUES);
  assert.equal(cleanTour({ venues: [{ notes: 'x'.repeat(10000) }] }).venues[0].notes.length, 4000);
});
