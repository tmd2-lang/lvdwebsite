const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

// Run the actual panel effect with controlled hooks/DOM; no production data writes.
function setup(mobile = true) {
  const effects = [], updates = [], events = new Map();
  let document;
  class Element {
    constructor() { this.children = []; this.parentElement = null; this.inert = false; this.isConnected = true; this.attributes = new Map(); this.style = {}; }
    append(...children) { this.children.push(...children); children.forEach(c => { c.parentElement = this; }); }
    setAttribute(k, v) { this.attributes.set(k, v); }
    removeAttribute(k) { this.attributes.delete(k); }
    contains(e) { return e === this || this.children.some(c => c.contains(e)); }
    querySelectorAll() { return this.controls || []; }
    getClientRects() { return [{}]; }
    focus() { document.activeElement = this; }
  }
  const body = new Element(), main = new Element(), workspace = new Element(), grid = new Element();
  const sidebar = new Element(), header = new Element(), list = new Element(), panel = new Element();
  const opener = new Element(), close = new Element(), status = new Element(), last = new Element();
  body.style.overflow = 'auto';
  body.append(main); main.append(sidebar, workspace); workspace.append(header, grid); grid.append(list, panel);
  list.append(opener); panel.append(close, status, last); panel.controls = [close, status, last];
  document = { body, activeElement: opener, addEventListener: (name, fn) => events.set(name, fn), removeEventListener: (name, fn) => { if (events.get(name) === fn) events.delete(name); } };
  const media = { matches: mobile, addEventListener: (_, fn) => { media.change = fn; }, removeEventListener: () => {} };
  const lead = { id: 'lead', name: 'Test Inquiry', source: 'admin', status: 'new', created_at: '2026-10-01T12:00:00Z', updated_at: '2026-10-01T12:00:00Z', services: [], attachments: [], notes: [], activity: [] };
  const jsx = (type, props) => ({ type, props });
  const exports = {};
  const code = ts.transpileModule(fs.readFileSync('src/app/admin/inquiries/InquiriesDashboard.tsx', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  vm.runInNewContext(code, { exports, document, window: { matchMedia: () => media }, HTMLElement: Element, Node: Element, require: name => {
    if (name === 'react') return { useState: value => [value, next => updates.push(next)], useRef: value => ({ current: value }), useMemo: fn => fn(), useEffect: fn => effects.push(fn) };
    if (name === 'react/jsx-runtime') return { jsx, jsxs: jsx, Fragment: 'fragment' };
    if (name === 'next/image') return () => null;
    if (name.includes('admin-types')) return { LEAD_STATUSES: ['new', 'contacted', 'booked'] };
    if (name.includes('inquiry-views')) return { filterInquiries: rows => rows, isUnread: () => true, inquiryCounts: rows => ({ total: rows.length, unread: rows.length, contacted: 0, booked: 0 }), viewState: () => 'unknown', latestView: () => undefined, lastActivityAt: row => row.created_at };
    if (name.endsWith('.css')) return { default: { detailPanel: 'detailPanel', detailScroll: 'detailScroll' } };
    throw Error(name);
  } });
  const tree = exports.default({ initialLeads: [lead], user: { name: 'Test Staff' }, initialSelectedId: 'lead' });
  const scroller = { scrollTop: 600 };
  function mount(node) {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) return node.forEach(mount);
    if (node.props?.className === 'detailPanel') node.props.ref.current = panel;
    if (node.props?.className === 'detailScroll') node.props.ref.current = scroller;
    mount(node.props?.children);
  }
  mount(tree);
  const cleanup = effects[1]();
  return { document, events, media, panel, sidebar, header, list, opener, close, last, scroller, updates, cleanup };
}

test('mobile open resets scroll, focuses Close, uses dialog semantics and disables background', () => {
  const s = setup();
  assert.equal(s.scroller.scrollTop, 0);
  assert.equal(s.document.activeElement, s.close);
  assert.equal(s.panel.attributes.get('role'), 'dialog');
  assert.equal(s.panel.attributes.get('aria-modal'), 'true');
  assert.ok(s.sidebar.inert && s.header.inert && s.list.inert);
  assert.equal(s.document.body.style.overflow, 'hidden');
  s.cleanup();
  assert.equal(s.document.activeElement, s.opener);
  assert.ok(!s.sidebar.inert && !s.header.inert && !s.list.inert);
  assert.equal(s.document.body.style.overflow, 'auto');
  assert.equal(s.events.size, 0);
});
test('Tab and Shift+Tab wrap, escaped focus returns inside, Escape closes', () => {
  const s = setup();
  let prevented = 0;
  const event = (key, shiftKey = false) => ({ key, shiftKey, preventDefault: () => prevented++ });
  s.document.activeElement = s.last;
  s.events.get('keydown')(event('Tab'));
  assert.equal(s.document.activeElement, s.close);
  s.events.get('keydown')(event('Tab', true));
  assert.equal(s.document.activeElement, s.last);
  s.document.activeElement = s.opener;
  s.events.get('focusin')({ target: s.opener });
  assert.equal(s.document.activeElement, s.close);
  s.events.get('keydown')(event('Escape'));
  assert.ok(s.updates.includes(false));
  assert.equal(prevented, 3);
  s.cleanup();
});
test('desktop resize releases mobile dialog and scroll lock; desktop opens also reset scroll', () => {
  const s = setup();
  s.media.matches = false; s.media.change();
  assert.equal(s.document.body.style.overflow, 'auto');
  assert.equal(s.panel.attributes.has('aria-modal'), false);
  assert.equal(s.list.inert, false);
  assert.equal(s.events.size, 0);
  s.cleanup();
  const desktop = setup(false);
  assert.equal(desktop.scroller.scrollTop, 0);
  assert.equal(desktop.list.inert, false);
  assert.equal(desktop.panel.attributes.has('role'), false);
  desktop.cleanup();
});
