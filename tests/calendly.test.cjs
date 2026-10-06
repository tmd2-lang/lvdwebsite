const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const crypto = require('node:crypto');
function load(path, extras = {}, requireFn = require) {
  const exports = {};
  const code = ts.transpileModule(fs.readFileSync(path, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  vm.runInNewContext(code, { exports, require: requireFn, Buffer, URL, AbortSignal, Date, Intl, console: { error() {} }, ...extras });
  return exports;
}
const webhook = load('src/lib/calendly-webhook.ts');
const type = 'https://api.calendly.com/event_types/design';
const lead = '11111111-1111-4111-8111-111111111111';
function fixture() { return { event: 'invitee.created', created_at: '2026-10-06T12:00:00Z', payload: {
 uri: 'https://api.calendly.com/scheduled_events/event/invitees/guest', event: 'https://api.calendly.com/scheduled_events/event', email: ' TEST@example.com ', tracking: { utm_content: `lvd_lead_${lead}` }, rescheduled: false,
 scheduled_event: { uri: 'https://api.calendly.com/scheduled_events/event', event_type: type, start_time: '2026-10-08T18:00:00Z', end_time: '2026-10-08T18:30:00Z' } } }; }
function signature(raw, key, timestamp = Math.floor(Date.now()/1000)) { return `t=${timestamp},v1=${crypto.createHmac('sha256',key).update(`${timestamp}.${raw}`).digest('hex')}`; }
test('signatures bind exact body and reject tampering, stale/future timestamps and malformed headers', () => {
 const raw = JSON.stringify(fixture()); const key = 'secret';
 assert.equal(webhook.verifyCalendlySignature(raw, signature(raw,key),key),true);
 assert.equal(webhook.verifyCalendlySignature(raw+' ',signature(raw,key),key),false);
 assert.equal(webhook.verifyCalendlySignature(raw,signature(raw,key),'wrong'),false);
 for (const offset of [-181,181]) assert.equal(webhook.verifyCalendlySignature(raw,signature(raw,key,Math.floor(Date.now()/1000)+offset),key),false);
 for (const header of [null,'t=no,v1=bad','t=1,t=2,v1=bad']) assert.equal(webhook.verifyCalendlySignature(raw,header,key),false);
 assert.equal(webhook.verifyCalendlySignature(raw,`v1=${'0'.repeat(64)},${signature(raw,key)}`,key),true);
});
test('normalization filters exact event type, preserves reschedule links and accepts only opaque lead tags', async () => {
 const input=fixture(); const result=await webhook.normalizeCalendlyWebhook(input,type);
 assert.equal(result.p_lead_id,lead); assert.equal(result.p_email,'test@example.com'); assert.equal(result.p_status,'scheduled');
 assert.equal(await webhook.normalizeCalendlyWebhook(input,type+'other'),null);
 input.payload.tracking.utm_content='ad123'; assert.equal((await webhook.normalizeCalendlyWebhook(input,type)).p_lead_id,null);
 input.event='invitee.canceled';input.payload.rescheduled=true;input.payload.new_invitee='https://api.calendly.com/scheduled_events/new/invitees/new';
 const canceled=await webhook.normalizeCalendlyWebhook(input,type);assert.equal(canceled.p_status,'canceled');assert.equal(canceled.p_rescheduled,true);assert.equal(canceled.p_new_invitee_uri,input.payload.new_invitee);
 input.payload.event='https://evil.example/secret';await assert.rejects(webhook.normalizeCalendlyWebhook(input,type),/Invalid Calendly resource/);
});
test('event enrichment only fetches Calendly resources and API failure remains retryable', async () => {
 let fetched;
 const normalized=load('src/lib/calendly-webhook.ts',{fetch:async(url)=>{fetched=url;return {ok:true,json:async()=>({resource:fixture().payload.scheduled_event})};}});
 const input=fixture();delete input.payload.scheduled_event;
 await normalized.normalizeCalendlyWebhook(input,type,'token');assert.equal(fetched,input.payload.event);
 await assert.rejects(normalized.normalizeCalendlyWebhook(input,type),/token required/);
});
test('booking context survives navigation, expires, and never puts contact info in booking URL', () => {
 const storage=new Map();const window={sessionStorage:{setItem:(k,v)=>storage.set(k,v),getItem:k=>storage.get(k)}};
 const booking=load('src/lib/consultation-booking.ts',{window});
 booking.rememberConsultation(lead,'PRIVATE NAME','private@example.com');
 assert.equal(booking.consultationContext().email,'private@example.com');
 const url=booking.consultationUrl();assert.match(url,/design-consultation\?utm_content=lvd_lead_/);assert.doesNotMatch(url,/private|NAME|email/i);
 const key=[...storage.keys()][0];const old=JSON.parse(storage.get(key));old.savedAt-=86400001;storage.set(key,JSON.stringify(old));assert.equal(booking.consultationContext(),null);
 const blocked=load('src/lib/consultation-booking.ts',{window:{sessionStorage:{setItem(){throw Error();},getItem(){throw Error();}}}});
 assert.doesNotThrow(()=>blocked.rememberConsultation(lead,'x','y'));assert.equal(blocked.consultationContext(),null);
});
test('portal displays replacement rather than canceled old booking, and never infers attendance', () => {
 const display=load('src/lib/consultation-display.ts');
 const old={id:'old',starts_at:'2026-10-09T18:00:00Z',status:'canceled',rescheduled:true};
 const replacement={id:'new',starts_at:'2026-10-08T18:00:00Z',status:'scheduled',rescheduled:false};
 assert.equal(display.currentConsultation([old,replacement]).id,'new');
 assert.match(display.consultationLabel({appointments:[replacement]}),/2:00 PM EDT/);
 assert.match(display.consultationLabel({appointments:[old]}),/awaiting replacement/);
 assert.equal(display.consultationLabel({consultation_sync_available:false}),'Consultation data unavailable');
});
test('webhook rejects unsigned requests before DB writes and retries failed persistence', async () => {
 const key='test-signing-key';let writes=0;let dbOK=true;
 const route=load('src/app/api/webhooks/calendly/route.ts',{process:{env:{CALENDLY_WEBHOOK_SIGNING_KEY:key,CALENDLY_DESIGN_CONSULTATION_EVENT_TYPE_URI:type,NEXT_PUBLIC_SUPABASE_URL:'https://db.example',SUPABASE_SERVICE_ROLE_KEY:'server-key'}},fetch:async()=>{writes++;return {ok:dbOK};}},name=>name==='next/server'?{NextResponse:{json:(body,init={})=>({body,status:init.status||200})}}:webhook);
 const raw=JSON.stringify(fixture());
 function request(header,body=raw){return new Request('https://example.com/api/webhooks/calendly',{method:'POST',body,headers:header?{'Calendly-Webhook-Signature':header}:{}});}
 assert.equal((await route.POST(request())).status,401);assert.equal(writes,0);
 assert.equal((await route.POST(request(signature(raw,key)))).status,200);assert.equal(writes,1);
 dbOK=false;assert.equal((await route.POST(request(signature(raw,key)))).status,503);
 const other=fixture();other.payload.scheduled_event.event_type=type+'other';const body=JSON.stringify(other);const before=writes;
 assert.equal((await route.POST(request(signature(body,key),body))).body.ignored,true);assert.equal(writes,before);
 const huge='x'.repeat(1048577);assert.equal((await route.POST(request(signature(huge,key),huge))).status,413);
});
test('appointment reader paginates and exposes only display fields; missing migration is explicit', async () => {
 const calls=[];
 const env={NEXT_PUBLIC_SUPABASE_URL:'https://db.example',SUPABASE_SERVICE_ROLE_KEY:'key'};
 const data=load('src/lib/admin-data.ts',{process:{env},fetch:async(url)=>{calls.push(url);return {ok:true,json:async()=>calls.length===1?Array.from({length:1000},(_,i)=>({id:String(i)})):[{id:'last'}]};}});
 const result=await data.getLeadAppointments();assert.equal(result.available,true);assert.equal(result.appointments.length,1001);
 assert.match(calls[1],/offset=1000/);assert.doesNotMatch(calls[0],/raw_payload|invitee_email|invitee_uri/);
 const missing=load('src/lib/admin-data.ts',{process:{env},fetch:async()=>({ok:false})});assert.equal((await missing.getLeadAppointments()).available,false);
});
test('appointment refresh requires inquiry access before reading data', async () => {
 let reads=0,user=null;
 const route=load('src/app/api/admin/inquiries/appointments/route.ts',{},name=>{
 if(name==='next/server')return {NextResponse:{json:(body,init={})=>({body,status:init.status||200})}};
 if(name.includes('admin-auth'))return {getAdminUser:async()=>user,canSeeInquiries:u=>u.allowed};
 return {getLeadAppointments:async()=>{reads++;return {available:true,appointments:[]};}};
 });
 assert.equal((await route.GET()).status,401);user={allowed:false};assert.equal((await route.GET()).status,403);assert.equal(reads,0);
 user={allowed:true};assert.equal((await route.GET()).status,200);assert.equal(reads,1);
});
