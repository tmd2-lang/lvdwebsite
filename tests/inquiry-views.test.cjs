const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
function load(file, globals = {}) {
  const exports = {};
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  vm.runInNewContext(code, { exports, ...globals });
  return exports;
}
const { viewState, filterInquiries, lastActivityAt } = load('src/lib/inquiry-views.ts');
const defaults = { search: '', status: 'all', viewed: 'all', notes: 'all', sort: 'newest' };
function lead(overrides = {}) {
  return { id: 'a', name: 'Alex', created_at: '2026-09-29T12:00:00Z', updated_at: '2026-09-29T12:00:00Z', tracking_started_at: '2026-09-30T12:00:00Z', status: 'new', notes: [], activity: [], date_undecided: false, ...overrides };
}
const ids = list => Array.from(list, l => l.id);
test('historical views remain unknown; only new leads can be called unviewed', () => {
  assert.equal(viewState(lead()), 'unknown');
  assert.equal(viewState(lead({ created_at: '2026-10-01T12:00:00Z' })), 'unviewed');
  assert.equal(viewState(lead({ tracking_started_at: null })), 'unavailable');
  assert.equal(viewState(lead({ activity: [{ kind: 'viewed', created_at: '2026-09-30T13:00:00Z' }] })), 'viewed');
});
test('filters intersect across status, view history, notes and search', () => {
  const match = lead({ id: 'match', status: 'contacted', notes: [{ body: 'Follow up on roses', created_at: '2026-09-30T15:00:00Z' }], activity: [{ kind: 'viewed' }] });
  const rows = [match, lead({ id: 'other' }), { ...match, id: 'wrong-status', status: 'booked' }, { ...match, id: 'no-notes', notes: [] }];
  assert.deepEqual(ids(filterInquiries(rows, { ...defaults, status: 'contacted', viewed: 'viewed', notes: 'with', search: 'ROSES' })), ['match']);
  assert.deepEqual(ids(filterInquiries(rows, { ...defaults, search: 'not found' })), []);
});
test('not contacted means new/reviewing, excludes archived and booked', () => {
  const rows = ['new', 'reviewing', 'contacted', 'booked', 'archived'].map(status => lead({ id: status, status }));
  assert.deepEqual(ids(filterInquiries(rows, { ...defaults, status: 'not_contacted' })), ['new', 'reviewing']);
});
test('event sort places missing and undecided dates last and does not mutate inputs', () => {
  const rows = [lead({ id: 'unknown' }), lead({ id: 'late', event_date: '2028-05-01' }), lead({ id: 'open', event_date: '2026-01-01', date_undecided: true }), lead({ id: 'soon', event_date: '2027-05-01' })];
  assert.deepEqual(ids(filterInquiries(rows, { ...defaults, sort: 'event' })), ['soon', 'late', 'open', 'unknown']);
  assert.deepEqual(ids(rows), ['unknown', 'late', 'open', 'soon']);
});
test('latest activity includes notes, views and updates; received sort stays independent', () => {
  const old = lead({ id: 'old', notes: [{ created_at: '2026-10-02T12:00:00Z' }] });
  const recent = lead({ id: 'recent', created_at: '2026-10-01T12:00:00Z' });
  assert.equal(lastActivityAt(old), '2026-10-02T12:00:00Z');
  assert.deepEqual(ids(filterInquiries([old, recent], { ...defaults, sort: 'activity' })), ['old', 'recent']);
  assert.deepEqual(ids(filterInquiries([old, recent], defaults)), ['recent', 'old']);
});
test('activity RPC supplies server actor identity and returns atomic mutation result', async () => {
  let request;
  const { applyLeadActivity } = load('src/lib/admin-data.ts', {
    process: { env: { NEXT_PUBLIC_SUPABASE_URL: 'https://database.example', SUPABASE_SERVICE_ROLE_KEY: 'test' } },
    fetch: async (url, init) => { request = { url, ...init }; return { ok: true, json: async () => ({ activity: { kind: 'viewed' } }) }; },
  });
  await applyLeadActivity('lead-id', { id: 'staff-id', name: 'Tanah' }, 'viewed');
  assert.match(request.url, /rpc\/apply_lead_activity$/);
  assert.deepEqual(JSON.parse(request.body), { p_lead_id: 'lead-id', p_actor_id: 'staff-id', p_actor_name: 'Tanah', p_kind: 'viewed', p_detail: null });
});
test('database errors never fall back to unaudited writes except missing migration', async () => {
  let calls = 0;
  const { applyLeadActivity } = load('src/lib/admin-data.ts', {
    process: { env: { NEXT_PUBLIC_SUPABASE_URL: 'https://database.example', SUPABASE_SERVICE_ROLE_KEY: 'test' } },
    fetch: async () => { calls++; return { ok: false, json: async () => ({ code: '42501' }) }; },
  });
  await assert.rejects(applyLeadActivity('id', { id: 'staff', name: 'Tanah' }, 'status_changed', 'booked'));
  assert.equal(calls, 1);
});
function routeSetup(user) {
  const calls = [];
  const routes = load('src/app/api/admin/inquiries/[id]/route.ts', {
    require: name => {
      if (name === 'next/server') return { NextResponse: { json: (body, options) => ({ body, status: options?.status || 200 }) } };
      if (name.includes('admin-auth')) return { getAdminUser: async () => user, canSeeInquiries: account => ['owner', 'planner', 'inquiry_staff'].includes(account.role) };
      if (name.includes('admin-types')) return { LEAD_STATUSES: ['new', 'reviewing', 'contacted', 'qualified', 'booked', 'archived', 'spam'] };
      if (name.includes('admin-data')) return { applyLeadActivity: async (...args) => { calls.push(args); return { activity: { kind: args[2] } }; } };
      throw Error(name);
    },
  });
  return { routes, calls };
}
const context = { params: Promise.resolve({ id: 'lead-id' }) };
test('activity routes reject expired sessions and unauthorized roles before writing', async () => {
  for (const [user, expected] of [[null, 401], [{ role: 'client' }, 403]]) {
    const { routes, calls } = routeSetup(user);
    assert.equal((await routes.POST({ json: async () => ({ action: 'view' }) }, context)).status, expected);
    assert.equal((await routes.PATCH({ json: async () => ({ status: 'booked' }) }, context)).status, expected);
    assert.equal(calls.length, 0);
  }
});
test('view route ignores forged actor fields and uses the signed-in staff identity', async () => {
  const user = { id: 'real-staff', name: 'TJ', role: 'owner' };
  const { routes, calls } = routeSetup(user);
  const response = await routes.POST({ json: async () => ({ action: 'view', actor_id: 'someone-else', actor_name: 'Tanah' }) }, context);
  assert.equal(response.status, 200);
  assert.equal(calls[0][1], user);
  assert.equal(calls[0][2], 'viewed');
});
test('invalid status and blank/overlong notes do not write activity', async () => {
  const { routes, calls } = routeSetup({ id: 'staff', name: 'TJ', role: 'owner' });
  assert.equal((await routes.PATCH({ json: async () => ({ status: 'invalid' }) }, context)).status, 400);
  for (const body of ['', ' '.repeat(5), 'a'.repeat(4001)]) {
    assert.equal((await routes.POST({ json: async () => ({ body }) }, context)).status, 400);
  }
  assert.equal(calls.length, 0);
});
test('tracking reader paginates past the database row cap', async () => {
  let calls = 0;
  const { getLeadTracking } = load('src/lib/admin-data.ts', {
    process: { env: { NEXT_PUBLIC_SUPABASE_URL: 'https://database.example', SUPABASE_SERVICE_ROLE_KEY: 'test' } },
    fetch: async url => { calls++; return { ok: true, json: async () => url.includes('settings') ? [{ started_at: '2026-09-30T12:00:00Z' }] : url.includes('offset=0') ? Array.from({ length: 1000 }, (_, i) => ({ id: String(i) })) : [{ id: 'last' }] }; },
  });
  const result = await getLeadTracking();
  assert.equal(result.activity.length, 1001);
  assert.equal(calls, 3);
});
