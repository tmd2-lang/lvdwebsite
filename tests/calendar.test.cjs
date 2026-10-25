/* eslint-disable @typescript-eslint/no-require-imports -- Match the repository's CommonJS Node test harness. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

function load(file, mocks = {}, globals = {}) {
  const exports = {};
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText;
  const requireModule = name => {
    if (name in mocks) return mocks[name];
    if (name === 'server-only') return {};
    if (name.startsWith('@/')) {
      const path = 'src/' + name.slice(2);
      return path.endsWith('.json') ? JSON.parse(fs.readFileSync(path, 'utf8')) : load(path + '.ts', mocks, globals);
    }
    return require(name);
  };
  vm.runInNewContext(code, { exports, require: requireModule, console, process, ...globals }, { filename: file });
  return exports;
}
const calendar = load('src/lib/calendar-view.ts');
const client = (overrides = {}) => ({ id: 'a', display_name: 'TEST Tanah & Kaisa', event_date: '2027-06-05', design_tier: null, status: 'booked', ...overrides });
const row = (overrides = {}) => ({ client_id: 'a', task_id: 'LVD-001', status: 'in_progress', owner: 'Studio Manager', due_on: '2026-10-25', ...overrides });
const line = (overrides = {}) => ({ id: 'line', client_id: 'a', side: 'lvd_planning', vendor: 'TEST vendor', description: '', status: 'contracted', ...overrides });
const payment = (overrides = {}) => ({ id: 'pay', client_id: 'a', line_id: 'line', payment_type: 'installment', payer: 'client', due_on: '2026-10-24', amount_cents: 10000, paid_cents: 2000, manual_status: null, ...overrides });
const ids = rows => Array.from(rows, r => r.id);

test('merges saved deadlines and owners, excludes complete/N/A/archived and unbooked tracks', () => {
  const entries = calendar.buildCalendarEntries([client(), client({ id: 'archived', status: 'archived' })], [
    row(), row({ task_id: 'LVD-002', status: 'complete' }), row({ task_id: 'LVD-003', status: 'not_applicable' }),
  ], [], []);
  const task = entries.find(e => e.id === 'task:a:LVD-001');
  assert.equal(task.date, '2026-10-25');
  assert.equal(task.suggested, false);
  assert.equal(task.owner, 'Studio Manager');
  assert.equal(entries.some(e => e.id === 'task:a:LVD-002' || e.id === 'task:a:LVD-003'), false);
  assert.equal(entries.some(e => e.clientId === 'archived' || e.track === 'Design & Floral'), false);
  assert.equal(entries.find(e => e.kind === 'wedding').date, '2027-06-05');
});

test('reuses checklist date suggestions, moves them with event dates, keeps overrides fixed', () => {
  const template = load('src/lib/checklist-view.ts');
  const candidate = template.CHECKLIST_TEMPLATE.find(t => t.track === 'Planning Core' && template.suggestDue(t, '2027-06-05'));
  const first = calendar.buildCalendarEntries([client()], [], [], []).find(e => e.id === `task:a:${candidate.id}`);
  const moved = calendar.buildCalendarEntries([client({ event_date: '2027-07-05' })], [], [], []).find(e => e.id === first.id);
  assert.equal(first.suggested, true);
  assert.notEqual(first.date, moved.date);
  const fixed = calendar.buildCalendarEntries([client({ event_date: '2027-07-05' })], [row({ task_id: candidate.id })], [], []).find(e => e.id === first.id);
  assert.equal(fixed.date, '2026-10-25');
});

test('approval alert requires both an approval task and waiting-client status, even without a date', () => {
  const template = load('src/lib/checklist-view.ts');
  const approval = template.CHECKLIST_TEMPLATE.find(t => t.approval === 'Yes' && t.track === 'Planning Core');
  const entries = calendar.buildCalendarEntries([client({ event_date: null })], [
    row({ task_id: approval.id, status: 'waiting_client', due_on: null }),
    row({ task_id: 'LVD-001', status: 'waiting_client' }),
  ], [], []);
  const alerts = calendar.calendarFocusEntries(entries, 'approvals', '2026-10-25');
  assert.deepEqual(ids(alerts), [`task:a:${approval.id}`]);
  assert.equal(alerts[0].date, null);
  assert.equal(calendar.calendarFocusEntries(calendar.buildCalendarEntries([client()], [], [], []), 'approvals', '2026-10-25').length, 0);
});

test('payments keep partial balance and correct track; canceled, paid, waived, orphan and foreign lines excluded', () => {
  const entries = calendar.buildCalendarEntries([client()], null,
    [line(), line({ id: 'cancel', status: 'canceled' }), line({ id: 'foreign', client_id: 'other' })], [
      payment(), payment({ id: 'paid', paid_cents: 10000 }), payment({ id: 'waived', manual_status: 'waived' }),
      payment({ id: 'canceled', line_id: 'cancel' }), payment({ id: 'orphan', line_id: 'missing' }),
      payment({ id: 'foreign', line_id: 'foreign' }), payment({ id: 'other-client', client_id: 'other' }),
    ]);
  const payments = entries.filter(e => e.kind === 'payment');
  assert.deepEqual(ids(payments), ['payment:pay']);
  assert.equal(payments[0].balanceCents, 8000);
  assert.equal(payments[0].track, 'Planning Core');
  assert.equal(payments[0].title, 'Installment · TEST vendor');
  assert.equal(payments[0].href, '/admin/portal/clients/a?tab=budget');
});

test('past weddings and disputed payments are visible but never overdue', () => {
  const entries = calendar.buildCalendarEntries([client({ event_date: '2020-01-01' })], null, [line()], [payment({ manual_status: 'disputed' })]);
  assert.equal(entries.length, 2);
  assert.equal(calendar.calendarFocusEntries(entries, 'overdue', '2026-10-25').length, 0);
  const open = calendar.buildCalendarEntries([client()], null, [line()], [payment()]);
  assert.equal(calendar.calendarFocusEntries(open, 'overdue', '2026-10-25').length, 1);
  assert.equal(calendar.calendarFocusEntries(open, 'overdue', '2026-10-24').length, 0);
});

test('week alerts include today through Sunday and cross month/year boundaries', () => {
  const e = date => ({ date, kind: 'task', disputed: false });
  assert.equal(calendar.isCalendarDueThisWeek(e('2027-01-03'), '2026-12-31'), true);
  assert.equal(calendar.isCalendarDueThisWeek(e('2027-01-04'), '2026-12-31'), false);
  assert.equal(calendar.isCalendarDueThisWeek(e('2026-12-30'), '2026-12-31'), false);
  assert.equal(calendar.isCalendarDueThisWeek(e('2026-10-25'), '2026-10-25'), true);
  assert.equal(calendar.isCalendarDueThisWeek(e('2026-10-26'), '2026-10-25'), false);
});

test('calendar math is stable over midnight, DST, leap days and Monday-first month grids', () => {
  assert.equal(calendar.studioToday(new Date('2026-10-26T02:00:00Z')), '2026-10-25');
  assert.equal(calendar.studioToday(new Date('2026-11-01T05:30:00Z')), '2026-11-01');
  assert.equal(calendar.shiftCalendarDay('2028-02-28', 1), '2028-02-29');
  assert.equal(calendar.shiftCalendarDay('2026-03-08', 1), '2026-03-09');
  assert.equal(calendar.shiftCalendarMonth('2026-12', 1), '2027-01');
  const days = calendar.calendarDays('2026-10');
  assert.equal(days[0], '2026-09-28');
  assert.equal(days.at(-1), '2026-11-01');
  assert.equal(days.length % 7, 0);
});

test('client, track, owner, type and case-insensitive search filters intersect', () => {
  const entries = calendar.buildCalendarEntries([client(), client({ id: 'b', display_name: 'Other' })], [row()], [line()], [payment()]);
  const filters = { ...calendar.EMPTY_CALENDAR_FILTERS, client: 'a', owner: 'Studio Manager', kind: 'task', track: 'Planning Core', search: 'SIGNED AGREEMENT' };
  assert.deepEqual(ids(calendar.filterCalendarEntries(entries, filters)), ['task:a:LVD-001']);
  assert.equal(calendar.filterCalendarEntries(entries, { ...filters, track: 'Design & Floral' }).length, 0);
  assert.equal(calendar.filterCalendarEntries(entries, { ...calendar.EMPTY_CALENDAR_FILTERS, owner: 'unassigned', kind: 'payment' }).length, 1);
});

function dataLoader(handler) {
  return load('src/lib/calendar-data.ts', {}, { fetch: handler, process: { env: { NEXT_PUBLIC_SUPABASE_URL: 'https://example.test', SUPABASE_SERVICE_ROLE_KEY: 'test-only' } } });
}
function response(rows, range = `0-${rows.length - 1}/${rows.length}`) {
  return { ok: true, json: async () => rows, headers: { get: () => range } };
}
test('reader paginates past database row caps, uses no-store and selects no private notes', async () => {
  const calls = [];
  const data = dataLoader(async (url, options) => {
    calls.push(url);
    assert.equal(options.cache, 'no-store');
    assert.equal(url.includes('notes'), false);
    if (url.includes('/clients?')) return url.includes('offset=0') ? response([client()], '0-0/2') : response([client({ id: 'b' })], '1-1/2');
    return response([]);
  });
  const result = await data.getStudioCalendar();
  assert.equal(result.clients.length, 2);
  assert.equal(calls.some(url => url.includes('/clients?') && url.includes('offset=1')), true);
});

test('failed checklist reads produce explicit warning rather than false open-task alerts', async () => {
  const data = dataLoader(async url => {
    if (url.includes('/clients?')) return response([client()]);
    if (url.includes('checklist')) return { ok: false };
    return response([]);
  });
  const result = await data.getStudioCalendar();
  assert.equal(result.warnings.length, 1);
  assert.equal(result.entries.some(e => e.kind === 'task'), false);
  assert.equal(result.entries.some(e => e.kind === 'wedding'), true);
});

test('page refuses unauthenticated and inquiry-only users before querying any calendar data', async () => {
  for (const [user, canManage, expected] of [[null, false, '/admin/login'], [{ role: 'inquiry_staff' }, false, '/admin/portal/inquiries']]) {
    let queried = false;
    const { default: page } = load('src/app/admin/portal/calendar/page.tsx', {
      'next/navigation': { redirect: path => { throw new Error(path); } },
      '@/lib/admin-auth': { getAdminUser: async () => user, hasAdminRefreshToken: async () => false, canManageClientPortal: () => canManage },
      '@/lib/calendar-data': { getStudioCalendar: async () => { queried = true; } },
      './CalendarPanel': {},
    });
    await assert.rejects(page(), { message: expected });
    assert.equal(queried, false);
  }
});
