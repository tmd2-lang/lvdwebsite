/* eslint-disable @typescript-eslint/no-require-imports -- Repository CommonJS Node test harness. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const { createHash } = require('node:crypto');

function load(file, mocks = {}, globals = {}) {
  const exports = {};
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: {
    module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true,
  } }).outputText;
  const requireModule = name => {
    if (name in mocks) return mocks[name];
    if (name === 'server-only') return {};
    if (name.startsWith('@/')) return load('src/' + name.slice(2) + '.ts', mocks, globals);
    return require(name);
  };
  vm.runInNewContext(code, { exports, require: requireModule, process, console, URL, ...globals }, { filename: file });
  return exports;
}
const view = load('src/lib/client-resources-view.ts');
const json = (body, options = {}) => ({ body, status: options.status ?? 200 });
const next = { NextResponse: { json, redirect: url => ({ redirect: String(url) }) } };
const clientId = '844569d9-4db6-4309-a9c8-9f1736d43ed5';

test('gallery validation permits complete HTTPS links and rejects scripts, credentials, malformed and excessive input', () => {
  assert.equal(view.normalizePhotographerGallery(' https://example.com/gallery?key=private '), 'https://example.com/gallery?key=private');
  assert.equal(view.normalizePhotographerGallery('  '), null);
  for (const url of ['javascript:alert(1)', 'http://example.com', 'https://user:secret@example.com/', 'no link', 'https://example.com/' + 'a'.repeat(2050), null]) {
    assert.throws(() => view.normalizePhotographerGallery(url));
  }
});

function resourceRoute(user, hooks = {}) {
  return load('src/app/api/admin/client-resources/route.ts', {
    'next/server': next,
    '@/lib/admin-auth': { getAdminUser: async () => user, canManageClientPortal: u => ['owner', 'planner'].includes(u.role) },
    '@/lib/client-data': { getClientById: hooks.getClient ?? (async () => ({ id: clientId })) },
    '@/lib/client-resources-data': { attachStandardDocuments: hooks.attach ?? (async () => {}), savePhotographerGallery: hooks.save ?? (async () => {}) },
  });
}
const req = body => ({ json: async () => body });
test('resource mutations reject missing/inquiry-only sessions before lookups or writes', async () => {
  for (const [user, status] of [[null, 401], [{ role: 'inquiry_staff' }, 403]]) {
    const r = resourceRoute(user, { getClient: () => { throw Error('must not query'); } });
    assert.equal((await r.POST(req({ clientId, action: 'attach_defaults' }))).status, status);
  }
});
test('resource mutations validate targets/actions/URLs and take actor identity only from the session', async () => {
  const writes = [];
  const r = resourceRoute({ role: 'planner', email: 'studio@example.com' }, { save: async (...args) => writes.push(args), attach: async (...args) => writes.push(args) });
  assert.equal((await r.POST(req({ clientId: 'bad', action: 'attach_defaults' }))).status, 400);
  assert.equal((await r.POST(req({ clientId, action: 'publish' }))).status, 400);
  assert.equal((await r.POST(req({ clientId, action: 'save_gallery', url: 'javascript:alert(1)' }))).status, 400);
  assert.equal(writes.length, 0);
  assert.equal((await r.POST(req({ clientId, action: 'save_gallery', url: 'https://example.com/TEST', by: 'forged' }))).status, 200);
  assert.deepEqual(writes[0], [clientId, 'https://example.com/TEST', 'studio@example.com']);
  await r.POST(req({ clientId, action: 'attach_defaults', by: 'forged' }));
  assert.deepEqual(writes[1], [clientId, 'studio@example.com']);
  const missing = resourceRoute({ role: 'owner' }, { getClient: async () => null });
  assert.equal((await missing.POST(req({ clientId, action: 'attach_defaults' }))).status, 404);
});

test('client document downloads scope the row before serving built-in resources', async () => {
  let served = false;
  let signed = false;
  const calls = [];
  const mocks = {
    'next/server': next,
    '@/lib/portal-auth': { getPortalSession: async () => ({ client: { id: clientId } }) },
    '@/lib/document-data': {
      getDocumentForClient: async (...args) => { calls.push(args); return null; },
      signedDocumentUrl: async () => { signed = true; },
    },
    '@/lib/standard-document-response': { standardDocumentResponse: async () => { served = true; } },
  };
  const { GET } = load('src/app/api/portal/documents/[id]/route.ts', mocks);
  const result = await GET({ url: 'https://studio.test/api/portal/documents/foreign' }, { params: Promise.resolve({ id: 'foreign' }) });
  assert.equal(result.status, 404);
  assert.deepEqual(calls, [['foreign', clientId]]);
  assert.equal(served || signed, false);
  mocks['@/lib/document-data'].getDocumentForClient = async () => ({ standard_key: 'welcome_packet', storage_path: null });
  await load('src/app/api/portal/documents/[id]/route.ts', mocks).GET({ url: 'https://studio.test/resource' }, { params: Promise.resolve({ id: 'own' }) });
  assert.equal(served, true);
  assert.equal(signed, false);
});

test('built-in welcome PDF is the exact chosen file and planning guide opens only the fixed local destination', async () => {
  // Pin the exact PDF selected by TJ without depending on the untracked design-source folder.
  assert.equal(createHash('sha256').update(fs.readFileSync('src/assets/client-documents/welcome-packet.pdf')).digest('hex'), 'cabec27e45d88195d127abf4d0b54e87f2a237afe0298e33fdec64a339bd6bfd');
  const { standardDocumentResponse } = load('src/lib/standard-document-response.ts', {
    'next/server': { NextResponse: class extends Response { static redirect(url) { return Response.redirect(String(url)); } } },
  });
  const pdf = await standardDocumentResponse('welcome_packet', 'https://studio.test');
  assert.equal(pdf.headers.get('Content-Type'), 'application/pdf');
  assert.equal(pdf.headers.get('Cache-Control'), 'private, no-store');
  assert.equal((await pdf.text()).startsWith('%PDF-'), true);
  const guide = await standardDocumentResponse('planning_guide', 'https://studio.test/api/resource');
  assert.equal(guide.headers.get('Location'), 'https://studio.test/planning-guide');
});

const pgModule = process.env.LVD_PGLITE_MODULE;
test('SQL resources migration: repeatable, automatic/idempotent defaults, atomic gallery status, preserved manual edits, private roles', { skip: !pgModule }, async () => {
  const { PGlite } = require(pgModule);
  const db = new PGlite();
  try {
    await db.exec(`create role anon; create role authenticated; create role service_role;
      create schema auth; create table auth.users(id uuid primary key);
      create table public.leads(id uuid primary key);
      create function public.set_updated_at() returns trigger language plpgsql as $$begin new.updated_at=greatest(clock_timestamp(),old.updated_at + interval '1 millisecond');return new;end;$$;`);
    for (const file of ['clients-schema.sql', 'documents-schema.sql', 'documents-soft-delete.sql', 'checklist-schema.sql']) {
      await db.exec(fs.readFileSync('supabase/' + file, 'utf8').replace('create extension if not exists pgcrypto;', ''));
    }
    const existing = '11111111-1111-4111-8111-111111111111';
    const fresh = '22222222-2222-4222-8222-222222222222';
    await db.query("insert into clients(id,partner_one_name,display_name) values($1,'TEST','TEST legacy')", [existing]);
    const migration = fs.readFileSync('supabase/client-resources-schema.sql', 'utf8');
    await db.exec(migration); await db.exec(migration);
    assert.equal((await db.query('select count(*)::int n from documents')).rows[0].n, 0, 'no silent backfill');
    await db.query("insert into clients(id,partner_one_name,display_name) values($1,'TEST','TEST new')", [fresh]);
    assert.equal((await db.query('select count(*)::int n from documents where client_id=$1', [fresh])).rows[0].n, 2);
    await db.query('select attach_client_standard_documents($1,$2)', [fresh, 'TEST']);
    assert.equal((await db.query('select count(*)::int n from documents where client_id=$1', [fresh])).rows[0].n, 2);
    await db.query("update documents set deleted_at=now() where client_id=$1 and standard_key='welcome_packet'", [fresh]);
    await db.query('select attach_client_standard_documents($1,$2)', [fresh, 'TEST']);
    assert.equal((await db.query('select count(*)::int n from documents where client_id=$1 and deleted_at is null', [fresh])).rows[0].n, 1);
    await assert.rejects(db.query("insert into documents(client_id,name,storage_path) values($1,'TEST',null)", [fresh]));

    const save = (id, url) => db.query('select save_client_photographer_gallery($1,$2,$3)', [id, url, 'TEST studio']);
    const task = async id => (await db.query("select * from client_checklist_items where client_id=$1 and task_id='LVD-116'", [id])).rows[0];
    await save(fresh, 'https://example.com/TEST-gallery');
    assert.equal((await task(fresh)).status, 'complete');
    await save(fresh, null);
    assert.equal(await task(fresh), undefined, 'remove only the auto-created untouched override');

    await db.query("insert into client_checklist_items(client_id,task_id,status,owner,due_on,notes) values($1,'LVD-116','waiting_vendor','Planning Assistant','2026-12-01','TEST original notes')", [existing]);
    await save(existing, 'https://example.com/TEST-gallery');
    assert.equal((await task(existing)).status, 'complete');
    assert.equal((await task(existing)).notes, 'TEST original notes');
    await save(existing, 'https://example.com/TEST-updated');
    await save(existing, null);
    assert.equal((await task(existing)).status, 'waiting_vendor');
    assert.equal((await task(existing)).owner, 'Planning Assistant');

    await save(existing, 'https://example.com/TEST-gallery');
    await db.query("update client_checklist_items set notes='TEST manual edit' where client_id=$1 and task_id='LVD-116'", [existing]);
    await save(existing, null);
    assert.equal((await task(existing)).status, 'complete', 'later manual edit is preserved');
    assert.equal((await task(existing)).notes, 'TEST manual edit');
    const before = JSON.stringify((await db.query('select * from client_post_event where client_id=$1', [existing])).rows);
    await assert.rejects(save(existing, 'javascript:bad'));
    assert.equal(JSON.stringify((await db.query('select * from client_post_event where client_id=$1', [existing])).rows), before);
    await save(existing, 'https://example.com/TEST-manually-complete');
    await save(existing, null);
    assert.equal((await task(existing)).status, 'complete');

    const permissions = (await db.query("select has_table_privilege('authenticated','client_post_event','SELECT') readable, has_function_privilege('anon','save_client_photographer_gallery(uuid,text,text)','EXECUTE') executable, has_function_privilege('authenticated','attach_client_standard_documents(uuid,text)','EXECUTE') attachable")).rows[0];
    assert.equal(permissions.readable, false); assert.equal(permissions.executable, false); assert.equal(permissions.attachable, false);
    assert.equal((await db.query("select count(*)::int n from information_schema.columns where table_name='clients' and column_name='photographer_gallery_url'")).rows[0].n, 0);
  } finally { await db.close(); }
});
