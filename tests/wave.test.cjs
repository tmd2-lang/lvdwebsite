/* eslint-disable @typescript-eslint/no-require-imports */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const ts=require('typescript');
function load(file,mocks={},globals={}) {
 const exports={};
 const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText;
 vm.runInNewContext(code,{exports,process,console,Buffer,URL,Headers,AbortSignal,fetch,...globals,require:name=>name in mocks?mocks[name]:name==='server-only'?{}:name.startsWith('@/')?(name.endsWith('.json')?JSON.parse(fs.readFileSync('src/'+name.slice(2),'utf8')):load('src/'+name.slice(2)+'.ts',mocks,globals)):require(name)});
 return exports;
}
const view=load('src/lib/wave-view.ts'),budget=load('src/lib/wave-budget.ts');
const invoice=(patch={})=>({id:'TEST-invoice',number:'TEST 1',customer_id:'TEST customer',customer_name:'TEST couple',customer_email:'test@example.test',status:'PARTIAL',currency:'USD',total:1388000,paid:1300000,balance:88000,issued_on:'2026-06-01',wave_due_on:'2099-01-01',modified_at:'2026-10-25T12:00:00Z',payment_url:'https://my.waveapps.com/TEST',items:[{name:'TEST design',description:'',amount:1388000}],client_id:'11111111-1111-4111-8111-111111111111',track:'design',signed_on:'2026-06-01',agreement_signed:true,synced_at:'2026-10-25T12:00:00Z',missing:false,...patch});
test('40/30/30 cumulative thresholds, dates, partial overdue and 7/14 day flags ignore Wave invoice due date',()=>{
 const rows=view.waveSchedule(invoice(),'2026-09-18','2026-10-25');assert.equal(rows[0].balance,0);assert.equal(rows[1].balance,0);assert.equal(rows[2].balance,88000);assert.equal(rows[2].due,'2026-08-19');assert.equal(rows[2].pauseFlag,true);assert.equal(view.waveStatus(invoice(),'2026-09-18','2026-10-25'),'Past due');
 const unknown=view.waveSchedule(invoice({paid:0,signed_on:null}),null,'2026-10-25');assert.equal(unknown.every(p=>p.daysLate===0),true);
 for(const [day,late,pause] of [['2026-06-07',false,false],['2026-06-08',true,false],['2026-06-15',true,true]]){const p=view.waveSchedule(invoice({paid:0}),null,day)[0];assert.equal(p.lateFeeFlag,late);assert.equal(p.pauseFlag,pause);}
});
test('milestones require all event invoices, explicit set review and signature; drafts and foreign currencies never show',()=>{
 const paid=invoice({paid:1388000,balance:0,status:'PAID'}),unpaid=invoice({id:'second',paid:0,balance:1388000});
 assert.equal(view.waveMilestones([paid,unpaid],null,'2026-10-25',true).final,false);assert.equal(view.waveMilestones([paid],null,'2026-10-25',false).final,false);assert.equal(view.waveMilestones([paid],null,'2026-10-25',true).final,true);
 assert.equal(view.waveMilestones([invoice({agreement_signed:false})],null,'2026-10-25',true).agreement,false);
 for(const patch of [{status:'DRAFT'},{status:'SAVED'},{currency:'CAD'},{missing:true}])assert.equal(view.waveIsBillable(invoice(patch)),false);
 assert.equal(view.safeWaveLink('https://my.waveapps.com/TEST'),'https://my.waveapps.com/TEST');for(const bad of ['javascript:alert(1)','https://waveapps.com.evil.test','https://user:pass@waveapps.com'])assert.equal(view.safeWaveLink(bad),null);
});
test('exact cents and budget allocations preserve invoice totals, partial payments, adjustments and overpayment credits',()=>{
 assert.equal(view.cents('0.29'),29);assert.equal(view.cents('-1.25'),-125);for(const value of ['1.234','1e4','12junk',1.25])assert.throws(()=>view.cents(value));assert.equal(view.cents('1500.000'),150000);assert.equal(view.cents('1,272.00'),127200);assert.equal(view.cents('-12,345,678.9'),-1234567890);for(const value of ['1,27.00','12,72.00',',100','1,,000'])assert.throws(()=>view.cents(value));assert.equal(view.cents('-2.5000'),-250);assert.equal(view.cents('33.335',true),3334);assert.equal(view.cents('33.334',true),3333);
 for(let total=1;total<100;total++){const inv=invoice({total,paid:Math.floor(total*.71),balance:total-Math.floor(total*.71),items:[{name:'TEST a',description:'',amount:total+7},{name:'TEST credit',description:'',amount:-7}]});const result=budget.waveBudget([inv],'2027-01-01','2026-10-25');assert.equal(result.lines.reduce((s,l)=>s+l.contracted_cents+l.changes_cents,0),total);assert.equal(result.payments.reduce((s,p)=>s+p.amount_cents,0),total);assert.equal(result.payments.reduce((s,p)=>s+p.paid_cents,0),inv.paid);assert.equal(result.payments.every(p=>p.paid_cents<=p.amount_cents),true);}
 const over=budget.waveBudget([invoice({paid:1400000,balance:0})],null,'2026-10-25');assert.equal(over.payments.reduce((s,p)=>s+p.paid_cents,0),1400000);
});
test('OAuth token encryption authenticates ciphertext; query client rejects writes; invoice normalization reconciles adjustments',async()=>{
 const env={WAVE_CLIENT_ID:'TEST',WAVE_CLIENT_SECRET:'TEST',WAVE_REDIRECT_URI:'http://localhost:3000/api/admin/wave/callback',WAVE_TOKEN_ENCRYPTION_KEY:Buffer.alloc(32,7).toString('base64')};
 // This loader passes process to the module; keep the scoped test environment local.
 const previous={};for(const [key,value]of Object.entries(env)){previous[key]=process.env[key];process.env[key]=value;}
 try {const api=load('src/lib/wave-api.ts');const sealed=api.encryptWave({access_token:'TEST secret'});assert.equal(sealed.includes('TEST secret'),false);assert.equal(api.decryptWave(sealed).access_token,'TEST secret');assert.throws(()=>api.decryptWave(sealed.slice(0,-3)+'bad'));await assert.rejects(api.waveQuery('TEST','mutation { invoiceCreate {} }',{}));
 const normalized=api.normalizeWave({id:'TEST',invoiceNumber:'TEST',invoiceDate:'2026-01-01',dueDate:null,modifiedAt:'2026-01-01T00:00:00Z',status:'SENT',viewUrl:'https://evil.test',customer:{id:'TEST',name:'TEST',email:null},currency:{code:'USD'},total:{value:'100.00'},amountPaid:{value:'0.00'},amountDue:{value:'100.00'},items:[{description:'TEST',product:null,total:{value:'90.00'}}]});assert.equal(normalized.items[1].amount,1000);assert.equal(normalized.payment_url,null);
 }finally{for(const [key,value]of Object.entries(previous))if(value===undefined)delete process.env[key];else process.env[key]=value;}
});
test('Token exchange accepts Wave\'s added basic scope and refuses write scopes',async()=>{
 const env={WAVE_CLIENT_ID:'TEST',WAVE_CLIENT_SECRET:'TEST',WAVE_REDIRECT_URI:'http://localhost:3000/api/admin/wave/callback',WAVE_TOKEN_ENCRYPTION_KEY:Buffer.alloc(32,7).toString('base64')};
 const previous={};for(const [key,value]of Object.entries(env)){previous[key]=process.env[key];process.env[key]=value;}
 const api=scope=>load('src/lib/wave-api.ts',{}, {URLSearchParams,fetch:async()=>new Response(JSON.stringify({access_token:'TEST',refresh_token:'TEST',expires_in:3600,scope}),{status:200})});
 try {await api('product:read business:read invoice:read basic customer:read').exchangeWave({grant_type:'authorization_code',code:'TEST'});
 await assert.rejects(api('business:read invoice:read invoice:write').exchangeWave({grant_type:'authorization_code',code:'TEST'}));
 }finally{for(const [key,value]of Object.entries(previous))if(value===undefined)delete process.env[key];else process.env[key]=value;}
});
const pgModule=process.env.LVD_PGLITE_MODULE;
test('Wave SQL snapshot/map/review/checklist is atomic, private, repeatable, preserves notes and rejects stale/foreign business', {skip:!pgModule},async()=>{
 const {PGlite}=require(pgModule),db=new PGlite();try{
 await db.exec(`create role anon;create role authenticated;create role service_role;create table clients(id uuid primary key);create function set_updated_at() returns trigger language plpgsql as $$begin new.updated_at=clock_timestamp();return new;end;$$;`);
 for(const f of ['checklist-schema.sql','budget-schema.sql','wave-schema.sql','wave-schema.sql'])await db.exec(fs.readFileSync('supabase/'+f,'utf8').replace('create extension if not exists pgcrypto;',''));
 const client=invoice().client_id;await db.query('insert into clients values($1)',[client]);await db.exec("insert into wave_connection(singleton,business_id,business_name,tokens,connected_by) values(true,'TEST business','Planning & Coordination LVD','TEST encrypted','TEST owner')");
 const lock=(await db.query('select wave_acquire_lock() token')).rows[0].token;
 await assert.rejects(db.query('select wave_acquire_lock()'));await assert.rejects(db.query('select wave_apply_snapshot($1,$2,$3)',[lock,'FOREIGN','[]']));
 const snapshot=async(invoices)=>db.query('select wave_apply_snapshot($1,$2,$3)',[lock,'TEST business',JSON.stringify(invoices)]);
 await snapshot([invoice()]);let row=(await db.query('select * from wave_invoices')).rows[0];
 const manual=(await db.query("insert into client_budget_lines(client_id,category,side,vendor) values($1,'Floral & Decor','lvd_design','TEST manual') returning id",[client])).rows[0].id;
 await assert.rejects(db.query('select wave_map_invoice($1,$2,$3,$4,$5,$6,$7)',[row.id,client,'design','2026-06-01',true,row.updated_at.toISOString(),'TEST planner']));
 await db.query("update client_budget_lines set status='canceled' where id=$1",[manual]);
 await db.query('select wave_map_invoice($1,$2,$3,$4,$5,$6,$7)',[row.id,client,'design','2026-06-01',true,row.updated_at.toISOString(),'TEST planner']);
 await assert.rejects(db.query("insert into client_budget_lines(client_id,category,side,vendor) values($1,'Floral & Decor','lvd_design','TEST duplicate')",[client]));
 assert.equal((await db.query('select count(*)::int n from client_checklist_items')).rows[0].n,0);
 await db.query('select wave_confirm_event($1,true,$2)',[client,'TEST planner']);
 assert.equal((await db.query("select status from client_checklist_items where task_id='LVD-104'")).rows[0].status,'complete');
 await db.query("update client_checklist_items set notes='SECRET studio notes' where task_id='LVD-104'");
 await snapshot([invoice({paid:1388000,balance:0,status:'PAID',modified_at:'2026-10-26T00:00:00Z'})]);assert.equal((await db.query("select status from client_checklist_items where task_id='LVD-108'")).rows[0].status,'complete');
 await snapshot([invoice({paid:0,balance:1388000,modified_at:'2026-10-27T00:00:00Z'})]);assert.equal((await db.query("select status from client_checklist_items where task_id='LVD-108'")).rows[0].status,'waiting_client');assert.equal((await db.query("select notes from client_checklist_items where task_id='LVD-104'")).rows[0].notes,'SECRET studio notes');
 await snapshot([invoice({paid:0,balance:1388000,modified_at:'2026-10-27T00:00:00Z'}),invoice({id:'TEST second invoice'})]);assert.equal((await db.query('select confirmed from wave_client_review')).rows[0].confirmed,false);await assert.rejects(db.query('select wave_confirm_event($1,true,$2)',[client,'TEST planner']));
 await snapshot([]);assert.equal((await db.query('select bool_and(missing) hidden from wave_invoices')).rows[0].hidden,true);
 const permissions=(await db.query("select has_table_privilege('authenticated','wave_connection','SELECT') tokens,has_function_privilege('anon','wave_apply_snapshot(uuid,text,jsonb)','EXECUTE') write")).rows[0];assert.equal(permissions.tokens,false);assert.equal(permissions.write,false);
 const beforeClear=(await db.query("select updated_at from wave_invoices where id='TEST-invoice'")).rows[0].updated_at.toISOString();
 await db.query('select wave_unmap_invoice($1,$2,$3)',['TEST-invoice',beforeClear,'TEST planner']);
 assert.equal((await db.query("select client_id from wave_invoices where id='TEST-invoice'")).rows[0].client_id,null);
 await db.query('select wave_release_lock($1)',[lock]);
 }finally{await db.close();}
});
test('studio Wave actions reject unauthorized roles before data access and reject forged mapping dates',async()=>{
 let user=null;const calls=[];
 const mocks={'next/server':{NextResponse:{json:(body,init)=>({body,status:init?.status??200})}},'@/lib/admin-auth':{getAdminUser:async()=>user,canManageClientPortal:u=>['owner','planner'].includes(u.role)},'@/lib/wave-data':{syncWave:async()=>{calls.push('sync');return 0;}},'@/lib/wave-db':{waveDb:async(...args)=>calls.push(args)}};
 const {POST}=load('src/app/api/admin/wave/route.ts',mocks);let body={action:'sync'};const request={json:async()=>body};
 assert.equal((await POST(request)).status,401);user={role:'inquiry_staff',email:'TEST'};assert.equal((await POST(request)).status,403);user.role='planner';assert.equal((await POST(request)).status,403);assert.equal(calls.length,0);
 user.role='owner';assert.equal((await POST(request)).status,200);assert.equal(calls.pop(),'sync');
 body={action:'map',invoiceId:'TEST',clientId:invoice().client_id,track:'design',signedOn:'2026-02-30',agreementSigned:true,expected:'2026-10-25T00:00:00Z'};assert.equal((await POST(request)).status,400);
 body.signedOn='2026-02-28';body.by='SPOOF';assert.equal((await POST(request)).status,200);assert.equal(calls[0][1].p_by,'TEST');
});
test('OAuth callback rejects cross-owner or incorrect state before exchanging tokens',async()=>{
 let value='TEST-user:good',exchanged=0;
 const mocks={'next/server':{NextResponse:{redirect:url=>({headers:new Headers({Location:String(url)}),cookies:{set(){}}}),json:(body,init)=>({body,status:init?.status??200})}},'next/headers':{cookies:async()=>({get:()=>({value})})},'@/lib/admin-auth':{getAdminUser:async()=>({id:'TEST-user',role:'owner',email:'TEST'})},'@/lib/wave-api':{waveConfig:()=>({redirect:'http://localhost:3000/api/admin/wave/callback'}),exchangeWave:async()=>{exchanged++;return{};},verifiedBusiness:async()=>({id:'TEST business',name:'Planning & Coordination LVD'}),encryptWave:()=> 'TEST encrypted'},'@/lib/wave-db':{waveDb:async path=>path==='rpc/wave_acquire_lock'?'TEST lock':[]}};
 const {GET}=load('src/app/api/admin/wave/callback/route.ts',mocks);
 let result=await GET({url:'http://localhost:3000/api/admin/wave/callback?code=TEST&state=bad'});assert.equal(result.headers.get('Location').includes('notice=authorization'),true);assert.equal(exchanged,0);
 value='OTHER-user:good';await GET({url:'http://localhost:3000/api/admin/wave/callback?code=TEST&state=good'});assert.equal(exchanged,0);
 value='TEST-user:good';await GET({url:'http://localhost:3000/api/admin/wave/callback?code=TEST&state=good'});assert.equal(exchanged,1);
});
test('event switch never grants access to an unassigned celebration',async()=>{
 const mocks={'next/server':{NextResponse:class {constructor(body,init){this.status=init.status;this.cookies={set(){}};}static json(body,init){return{body,status:init?.status??200};}}},'@/lib/portal-auth':{getPortalUser:async()=>({id:'TEST user'}),getPortalMemberships:async()=>[{client:{id:'OWN'}}],portalCookieOptions:()=>({})}};
 const {POST}=load('src/app/api/portal/event/route.ts',mocks);assert.equal((await POST({formData:async()=>new Map([['clientId','FOREIGN']])})).status,403);assert.equal((await POST({formData:async()=>new Map([['clientId','OWN']])})).status,303);
});

test('Wave adapters keep overpaid credit out of remaining balance and zero invoices do not satisfy payment milestones',()=>{
 const adapter=load('src/lib/wave-invoice-adapter.ts'),totals=load('src/lib/invoice-types.ts');
 const mapped=adapter.waveInvoiceAdapter(invoice({paid:1400000,balance:0}),null,'2026-10-25');assert.equal(totals.celebrationTotals([mapped]).remaining,0);assert.equal(totals.invoicePaid(mapped),1400000);
 assert.equal(view.waveMilestones([invoice({total:0,paid:0,balance:0})],null,'2026-10-25',true).retainer,false);
});

test('Wave pagination commits only a complete, stable invoice set',async()=>{
 const raw={id:'TEST 1',invoiceNumber:'TEST',invoiceDate:'2026-01-01',dueDate:null,modifiedAt:'2026-01-01T00:00:00Z',status:'SENT',viewUrl:null,customer:{id:'TEST',name:'TEST',email:null},currency:{code:'USD'},total:{value:'1.00'},amountPaid:{value:'0.00'},amountDue:{value:'1.00'},items:[]};
 const api=(mode)=>load('src/lib/wave-api.ts',{}, {fetch:async(url,init)=>{const page=JSON.parse(init.body).variables.page;return new Response(JSON.stringify({data:{business:{id:'TEST business',name:'Planning & Coordination LVD',invoices:{pageInfo:{totalPages:2,totalCount:mode==='changed'&&page===2?3:2},edges:[{node:{...raw,id:page===2&&mode!=='duplicate'?'TEST 2':'TEST 1'}}]}}}}),{status:200});}});
 assert.equal((await api('valid').readWaveInvoices('TEST token','TEST business')).length,2);
 await assert.rejects(api('changed').readWaveInvoices('TEST token','TEST business'));
 await assert.rejects(api('duplicate').readWaveInvoices('TEST token','TEST business'));
});
