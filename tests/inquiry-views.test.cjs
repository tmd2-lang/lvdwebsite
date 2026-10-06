const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
function load(file, globals = {}) {
  const exports = {};
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  vm.runInNewContext(code, { exports, ...globals });
  return exports;
}
const { viewState, filterInquiries, lastActivityAt, isUnread, inquiryCounts } = load('src/lib/inquiry-views.ts');
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
      if (name.includes('admin-data')) return { markLeadUnread: async (...args) => { calls.push([...args, "mark_unread"]); return { activity: { detail: "unread" } }; }, applyLeadActivity: async (...args) => { calls.push(args); return { activity: { kind: args[2] } }; } };
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

test('personal unread is independent of colleagues and historical unknown state', () => {
  const row = lead({ activity: [{ kind: 'viewed', actor_id: 'tj', detail: null }] });
  assert.equal(isUnread(row, 'tj'), false);
  assert.equal(isUnread(row, 'tanah'), true);
  assert.equal(isUnread(lead(), 'tj'), true);
  assert.deepEqual(ids(filterInquiries([row], { ...defaults, viewed: 'unread', actorId: 'tanah' })), ['a']);
  assert.deepEqual(ids(filterInquiries([row], { ...defaults, viewed: 'unread', actorId: 'tj' })), []);
});
test('mark unread preserves shared seen history and reopening restores personal read', () => {
  const history = [{ kind: 'viewed', actor_id: 'tj', detail: 'unread' }, { kind: 'viewed', actor_id: 'tanah', detail: null }, { kind: 'viewed', actor_id: 'tj', detail: null }];
  assert.equal(isUnread(lead({ activity: history }), 'tj'), true);
  assert.equal(isUnread(lead({ activity: history }), 'tanah'), false);
  assert.equal(viewState(lead({ activity: history })), 'viewed');
  assert.equal(isUnread(lead({ activity: [{ kind: 'viewed', actor_id: 'tj', detail: null }, ...history] }), 'tj'), false);
});
test('overview counts use personal unread and shared statuses', () => {
  const rows = [lead(), lead({ id: 'b', status: 'booked', activity: [{ kind: 'viewed', actor_id: 'tj' }] }), lead({ id: 'c', status: 'contacted' })];
  assert.equal(JSON.stringify(inquiryCounts(rows, 'tj')), JSON.stringify({ total: 3, unread: 2, contacted: 1, booked: 1 }));
  assert.equal(rows[0].status, 'new');
});
test('mark unread uses signed-in identity, ignoring a forged actor', async () => {
  const user = { id: 'tj', name: 'TJ', role: 'owner' };
  const { routes, calls } = routeSetup(user);
  const result = await routes.POST({ json: async () => ({ action: 'mark_unread', actor_id: 'tanah' }) }, context);
  assert.equal(result.status, 200);
  assert.equal(calls[0][1], user);
  assert.equal(calls[0][2], 'mark_unread');
});

test('unread inbox opens immediately, persists even when row leaves filter, and mark unread survives rerender', async () => {
  const hooks = [], effects = [];
  let cursor = 0, requests = [], resolveView;
  const helpers = load('src/lib/inquiry-views.ts');
  const jsx = (type, props) => ({ type, props });
  const { default: Dashboard } = load('src/app/admin/inquiries/InquiriesDashboard.tsx', {
    window: { matchMedia: () => ({ matches: false }), setTimeout: () => 0 },
    fetch: async (_, init) => {
      const action = JSON.parse(init.body).action; requests.push(action);
      if (action === 'view') await new Promise(resolve => { resolveView = resolve; });
      return { ok: true, json: async () => ({ activity: { id: String(requests.length), kind: 'viewed', actor_id: 'tj', actor_name: 'TJ', detail: action === 'mark_unread' ? 'unread' : null, created_at: '2026-10-05T12:00:00Z' } }) };
    },
    require: name => {
      if (name === 'react') return {
        useState: initial => { const index = cursor++; if (!(index in hooks)) hooks[index] = initial; return [hooks[index], next => { hooks[index] = typeof next === 'function' ? next(hooks[index]) : next; }]; },
        useRef: initial => { const index = cursor++; return hooks[index] ||= { current: initial }; },
        useMemo: fn => fn(), useEffect: fn => effects.push(fn),
        createElement: (type, props, ...children) => jsx(type, { ...props, children }),
      };
      if (name === 'react/jsx-runtime') return { jsx, jsxs: jsx, Fragment: 'fragment' };
      if (name === 'next/image') return () => null;
      if (name.includes('admin-types')) return { LEAD_STATUSES: ['new', 'contacted', 'booked'] };
      if (name.includes('inquiry-views')) return helpers;
      if (name.endsWith('.css')) return { default: {} };
      throw Error(name);
    },
  });
  const row = lead({ name: 'Test Lead', source: 'admin', services: [], attachments: [] });
  const render = () => { cursor = 0; effects.length = 0; return Dashboard({ initialLeads: [row], user: { id: 'tj', name: 'TJ' } }); };
  function buttons(node, result = []) {
    if (!node || typeof node !== 'object') return result;
    if (Array.isArray(node)) { node.forEach(child => buttons(child, result)); return result; }
    if (node.type === 'button') result.push(node);
    buttons(node.props?.children, result); return result;
  }
  const text = node => typeof node === 'string' ? node : Array.isArray(node) ? node.map(text).join('') : node && typeof node === 'object' ? text(node.props?.children) : '';
  buttons(render()).find(button => text(button).includes('Waiting for you to open')).props.onClick();
  let tree = render();
  buttons(tree).find(button => text(button).includes('Test Lead')).props.onClick();
  tree = render();
  assert.equal(helpers.isUnread(hooks[0][0], 'tj'), false);
  assert.equal(buttons(tree).some(button => text(button).includes('Test Lead')), false);
  effects[0]();
  assert.deepEqual(requests, ['view']);
  resolveView(); await new Promise(setImmediate);
  tree = render();
  const mark = buttons(tree).find(button => text(button) === 'Mark unread for me');
  await mark.props.onClick(); await new Promise(setImmediate);
  render(); effects[0]();
  assert.equal(helpers.isUnread(hooks[0][0], 'tj'), true);
  assert.deepEqual(requests, ['view', 'mark_unread']);
});
