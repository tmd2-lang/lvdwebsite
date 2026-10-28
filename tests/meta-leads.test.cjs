const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
function load(file, context = {}, requireFn = () => ({})) {
  const exports = {};
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText, { exports, require: requireFn, ...context });
  return exports;
}
function pixel(hostname = 'www.ladyvictoriadesigns.com', pathname = '/inquire', storage = new Map()) {
  const calls = [];
  const window = { location: { hostname, pathname }, fbq: (...args) => calls.push(args),
    sessionStorage: { getItem: key => storage.get(key), setItem: (key, value) => storage.set(key, value) } };
  return { api: load('src/lib/meta-pixel.ts', { window }), calls, window, storage };
}
test('bootstrap disables the separate Meta rule engine before init and never sends a Lead on page load', () => {
  const source = fs.readFileSync('src/components/MarketingScripts.tsx','utf8');
  const inline = source.split('<Script id="meta-pixel"')[1].split('{`')[1].split('`}')[0]
    .replaceAll('${META_PIXEL_ID}', '1263840655319183');
  const calls=[];
  vm.runInNewContext(inline, {
    window:{fbq(){}}, document:{},location:{hostname:'www.ladyvictoriadesigns.com'},fbq:(...args)=>calls.push(args),
  });
  assert.deepEqual(calls[0], ['optOut','1263840655319183','ESTRuleEngine']);
  assert.deepEqual(calls[1], ['init','1263840655319183']);
  assert.deepEqual(calls[2], ['trackSingle','1263840655319183','PageView']);
  assert.doesNotMatch(source,/1245149713783773/);
});
test('saved inquiry identity targets only the live pixel and survives repeated calls/reload', () => {
  const s = pixel();
  assert.equal(s.api.trackMetaLead('inquire', ''), false);
  assert.equal(s.api.trackMetaLead('inquire', 'saved-id'), true);
  assert.equal(s.api.trackMetaLead('inquire', 'saved-id'), false);
  assert.deepEqual(JSON.parse(JSON.stringify(s.calls)), [['trackSingle', '1263840655319183', 'Lead',
    { content_name: 'inquire' }, { eventID: 'lvd_saved-id_inquiry' }]]);
  assert.equal(pixel(undefined, undefined, s.storage).api.trackMetaLead('inquire', 'saved-id'), false);
});
test('quiz completions and preview/private pages cannot inflate inquiry Leads', () => {
  const s = pixel(); s.api.trackMetaLead('style_quiz', 'quiz-id');
  assert.equal(s.calls[0][0], 'trackSingleCustom');
  assert.equal(s.calls[0][2], 'StyleQuizCompleted');
  for (const [host, path] of [['localhost','/inquire'], ['preview.vercel.app','/welcome'], ['www.ladyvictoriadesigns.com','/admin/inquiries'], ['www.ladyvictoriadesigns.com','/portal']]) {
    const other = pixel(host,path);
    assert.equal(other.api.trackMetaLead('inquire','id'), false);
    assert.equal(other.api.trackMetaPageView(), false);
    assert.equal(other.calls.length, 0);
  }
});
test('storage denial retains memory protection, missing pixel can be retried', () => {
  const s = pixel(); s.window.sessionStorage = { getItem(){throw Error()}, setItem(){throw Error()} };
  const fbq = s.window.fbq; delete s.window.fbq;
  assert.equal(s.api.trackMetaLead('reserve', 'id'), false);
  s.window.fbq = fbq;
  assert.equal(s.api.trackMetaLead('reserve', 'id'), true);
  assert.equal(s.api.trackMetaLead('reserve', 'id'), false);
});
test('central submission dispatch requires a saved ID, skips spam, and tolerates broken analytics', async () => {
  for (const outcome of [ 'saved', 'rejected', 'no-id', 'spam', 'broken-pixel' ]) {
    const events = [];
    const api = load('src/lib/lead-submit.ts', {
      fetch: async () => ({ ok: outcome !== 'rejected', json: async () => ({
        leadId: outcome === 'no-id' ? '' : 'saved-id', trackingEligible: outcome !== 'spam', error: 'Rejected',
      }) }),
    }, name => name.includes('meta-pixel') ? { trackMetaLead: (...args) => {
      if (outcome === 'broken-pixel') throw Error('blocked'); events.push(args);
    } } : name.includes('attribution') ? { attributionForSubmit: () => ({}) }
      : name.includes('consultation-booking') ? { rememberConsultation(){} } : { trackGA4(){} });
    const submission = { source:'inquire', name:'Test', email:'test@example.invalid', phone:'2025550100' };
    if (['rejected','no-id'].includes(outcome)) await assert.rejects(api.submitLead(submission));
    else assert.equal((await api.submitLead(submission)).leadId, 'saved-id');
    assert.equal(events.length, outcome === 'saved' ? 1 : 0);
  }
});
test('narrow solicitation filter preserves legitimate inquiry text', () => {
  const quality = load('src/lib/lead-quality.ts');
  assert.equal(quality.isMarketingSolicitation('I was reviewing your website and spotted tweaks to make it visible to local users searching via ChatGPT. Would you be open to checking them out?'), true);
  assert.equal(quality.isMarketingSolicitation('I found your website via ChatGPT and am interested in wedding flowers.'), false);
  assert.equal(quality.readLeadNotification({notification:{status:'invented'}}), undefined);
});
test('two simultaneous identical submissions share one save and one conversion', async () => {
  let writes = 0, conversions = 0;
  const api = load('src/lib/lead-submit.ts', { fetch: async () => {
    writes++; return {ok:true,json:async()=>({leadId:'one-save'})};
  } }, name => name.includes('meta-pixel') ? {trackMetaLead(){conversions++;}}
    : name.includes('attribution') ? {attributionForSubmit:()=>({})}
    : name.includes('consultation-booking') ? {rememberConsultation(){}} : {});
  const submission = {source:'inquire',name:'Fixture',email:'test@example.invalid',phone:'2025550100'};
  await Promise.all([api.submitLead(submission),api.submitLead({...submission})]);
  assert.equal(writes,1); assert.equal(conversions,1);
});
test('email retries preserve the saved inquiry, never resend to accepted recipients, and report failures honestly', async () => {
  for (const mode of ['recover', 'fail', 'partial', 'not_configured']) {
    const background = [], writes = [], messages = [];
    const quality = load('src/lib/lead-quality.ts');
    const route = load('src/app/api/leads/route.ts', {
      Request, Response, AbortSignal, console: {error(){},log(){}},
      process: {env:{NEXT_PUBLIC_SUPABASE_URL:'https://fixture.invalid',SUPABASE_SERVICE_ROLE_KEY:'fixture',
        GMAIL_USER:'sender@example.invalid', GMAIL_APP_PASSWORD:mode === 'not_configured' ? '' : 'fixture',
        NOTIFICATION_EMAIL:'one@example.invalid,two@example.invalid'}},
      fetch: async (url, options) => { writes.push({method: options.method, body: JSON.parse(options.body)});
        return { ok: true, json: async () => [{ id:'saved-id' }] }; },
    }, name => name === 'node:crypto' ? require(name) : name === 'next/server' ? { after: fn => background.push(fn) }
      : name === '@/lib/lead-quality' ? quality : name === '@/lib/attribution' ? { attributionColumns: () => ({}) }
      : name === 'nodemailer' ? {default:{createTransport:()=>({sendMail:async message=>{
        messages.push(message);
        if (mode === 'fail' || (mode === 'recover' && messages.length === 1)) throw Error('SMTP failure');
        return {accepted:mode === 'partial' && messages.length === 1 ? ['one@example.invalid'] : message.to};
      }})}} : {});
    const response = await route.POST(new Request('https://fixture.invalid/api/leads',{method:'POST',body:JSON.stringify({source:'inquire',name:'Fixture',email:'test@example.invalid',phone:'2025550100'})}));
    const result = await response.json();
    assert.equal(result.notificationSent, false);
    assert.equal(result.notificationStatus, mode === 'not_configured' ? 'not_configured' : 'queued');
    assert.equal(messages.length, 0);
    for (const job of background) await job();
    assert.equal(writes.filter(w=>w.method === 'POST').length, 1);
    assert.equal(messages.length, mode === 'not_configured' ? 0 : mode === 'fail' ? 3 : 2);
    if (mode !== 'not_configured') assert.equal(writes.at(-1).body.payload.notification.status, mode === 'fail' ? 'failed' : 'accepted');
    if (mode === 'partial') assert.deepEqual(Array.from(messages[1].to), ['two@example.invalid']);
  }
});
