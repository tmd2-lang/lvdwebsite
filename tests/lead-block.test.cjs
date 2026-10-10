const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const { createHash } = require('node:crypto');
const blockedFixtureIp = '192.0.2.10';

function setup() {
  const effects = { writes: 0, notifications: 0 };
  const exports = {};
  // Substitute a test-network hash so hashing uses real crypto without production secrets.
  const source = fs.readFileSync('src/app/api/leads/route.ts', 'utf8');
  const savedHash = '90ed09a1288d18d82c9c75f25f576112ce4ef54518cf5351179be9b70748f3a6';
  assert.ok(source.includes(savedHash));
  const fixtureHash = createHash('sha256').update(`${blockedFixtureIp}:test-key`).digest('hex');
  const code = ts.transpileModule(source.replace(savedHash, fixtureHash), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  vm.runInNewContext(code, {
    exports, Response, console: { error() {} },
    process: { env: {
      NEXT_PUBLIC_SUPABASE_URL: 'https://db.example', SUPABASE_SERVICE_ROLE_KEY: 'test-key',
      GMAIL_USER: 'test@example.com', GMAIL_APP_PASSWORD: 'test-password', NOTIFICATION_EMAIL: 'studio@example.com',
    } },
    fetch: async () => {
      effects.writes++;
      return { ok: true, json: async () => [{ id: 'test-lead' }] };
    },
    require(name) {
      if (name === 'node:crypto') return require(name);
      if (name === 'nodemailer') return {};
      if (name === 'next/server') return { after() { effects.notifications++; } };
      if (name === '@/lib/attribution') return { attributionColumns: () => ({}) };
      throw new Error(`Unexpected import: ${name}`);
    },
  });
  return { effects, submit: (body, headers = {}) => exports.POST(new Request('https://example.com/api/leads', {
    method: 'POST', body: JSON.stringify(body), headers,
  })) };
}

test('known sender identifiers are rejected across all forms before storage or notifications', async () => {
  const { submit, effects } = setup();
  for (const source of ['inquire', 'consultation', 'reserve', 'style_quiz']) {
    for (const contact of [
      { email: 'emmahines23@gamil.com', phone: '3022333290' },
      { email: ' EMMAHINES23@GAMIL.COM ', phone: '2025550123' },
      { email: 'emmahines23@gmail.com', phone: '2025550123' },
      { email: 'changed@example.com', phone: '(302) 233-3290' },
      { email: 'changed@example.com', phone: '+1 (302) 233-3290' },
      { email: 'changed@example.com', phone: '302233290' },
    ]) {
      const response = await submit({ source, name: 'Emma Brooke hines', ...contact });
      assert.equal(response.status, 403);
      assert.equal((await response.json()).error, 'Unable to accept this inquiry.');
    }
  }
  assert.equal(effects.writes, 0);
  assert.equal(effects.notifications, 0);
});

test('blocked network rejects changed contact details before storage or notifications', async () => {
  const { submit, effects } = setup();
  for (const source of ['inquire', 'consultation', 'reserve', 'style_quiz']) {
    for (const headers of [
      { 'x-forwarded-for': blockedFixtureIp },
      { 'x-forwarded-for': ` ${blockedFixtureIp}, 192.0.2.20` },
      { 'x-real-ip': blockedFixtureIp },
    ]) {
      const response = await submit({ source, name: 'Changed name', email: 'different@example.com', phone: '3022333291' }, headers);
      assert.equal(response.status, 403);
    }
  }
  assert.equal(effects.writes, 0);
  assert.equal(effects.notifications, 0);
});

test('different network remains allowed and request-body IP cannot trigger the block', async () => {
  const { submit, effects } = setup();
  const response = await submit({ source: 'reserve', name: 'Other contact', email: 'other@example.com', phone: '2025550123', ip_hash: '90ed09a1288d18d82c9c75f25f576112ce4ef54518cf5351179be9b70748f3a6' }, { 'x-forwarded-for': '192.0.2.11' });
  assert.equal(response.status, 200);
  assert.equal(effects.writes, 1);
  assert.equal(effects.notifications, 1);
});

test('unrelated contacts still submit successfully, including someone with the same name', async () => {
  const { submit, effects } = setup();
  const response = await submit({ source: 'reserve', name: 'Emma Brooke hines', email: 'other@example.com', phone: '+1 (302) 233-3291' });
  assert.equal(response.status, 200);
  assert.equal(effects.writes, 1);
  assert.equal(effects.notifications, 1);
});
