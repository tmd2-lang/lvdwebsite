/* eslint-disable @typescript-eslint/no-require-imports */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const ts=require('typescript');
function load(file,mocks={}) {
 const exports={};
 const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText;
 vm.runInNewContext(code,{exports,process,console,require:name=>name in mocks?mocks[name]:name==='server-only'?{}:name.startsWith('@/')?(name.endsWith('.json')?JSON.parse(fs.readFileSync('src/'+name.slice(2),'utf8')):load('src/'+name.slice(2)+'.ts',mocks)):require(name)});
 return exports;
}
const planning=load('src/lib/couple-planning-data.ts');
const guest=load('src/lib/couple-guests-view.ts');
test('couple checklist publishes only client work or safe approvals and strips studio metadata',()=>{
 const base={phase:'TEST',task:'TEST',status:'not_started',track:'Planning Core',assignedOwner:'Studio Manager',approval:'No',notes:'SECRET',dependency:'SECRET',updatedBy:'SECRET',dueOn:null,suggestedDue:'2026-11-01'};
 const items=planning.projectCoupleChecklist([{...base,id:'a',assignedOwner:'Client'},{...base,id:'b',approval:'Yes'},{...base,id:'c'},{...base,id:'LVD-103',track:'Design & Floral',approval:'Yes'},{...base,id:'LVD-101',track:'Design & Floral',approval:'Yes'},{...base,id:'d',assignedOwner:'Client',status:'not_applicable'}],'2026-10-26');
 assert.deepEqual(Array.from(items,i=>i.id),['a','b','LVD-101']);
 assert.equal(JSON.stringify(items).includes('SECRET'),false);
 assert.equal(items[0].dueOn,'2026-11-01');
});
test('timeline requires explicit complete confirmation and omits private cues and metadata',()=>{
 const cue={ref:'a',start:'12:00',end:'13:00',activity:'Ceremony',location:'TEST',phase:'Ceremony',status:'Confirmed',visibility:'Client Facing',notes:'SECRET',people:'SECRET'};
 const doc={version:2,confirmed_at:'2026-10-25',cues:[cue,{...cue,ref:'b',visibility:'Studio Only'},{...cue,ref:'c',visibility:'Guest Facing'},{...cue,ref:'d',status:'Canceled'}],production:[],vendors:[{email:'SECRET'}],crew:[]};
 assert.equal(planning.projectCoupleTimeline({...doc,confirmed_at:null},null),null);
 assert.equal(planning.projectCoupleTimeline({...doc,production:[{status:'Draft'}]},null),null);
 const view=planning.projectCoupleTimeline(doc,null);
 assert.deepEqual(Array.from(view.cues,c=>c.ref),['a','c']);
 assert.equal(JSON.stringify(view).includes('SECRET'),false);
});
test('guest projection and validation exclude studio fields and reject foreign households',()=>{
 const record=guest.projectCoupleGuestRecord({id:'a',kind:'guest',created_at:'today',data:{first:'TEST',notes:'SECRET',source:'SECRET',gift:'SECRET',table_id:'t'},updated_by:'SECRET'});
 assert.equal(JSON.stringify(record).includes('SECRET'),false);
 assert.equal(record.data.table_id,'t');
 assert.throws(()=>guest.cleanCoupleGuestPatch('guest',{notes:'bad'},new Set(),[]));
 assert.throws(()=>guest.cleanCoupleGuestPatch('guest',{household_id:'foreign'},new Set(),[]));
 assert.throws(()=>guest.cleanCoupleGuestPatch('guest',{events:{Reception:'yes'}},new Set(),['Reception']));
 assert.equal(guest.cleanCoupleGuestPatch('guest',{first:' TEST ',events:{Reception:true}},new Set(),['Reception']).first,'TEST');
});
test('booking dates validate calendar dates and skip weekends for business deadlines',()=>{
 const dates=load('src/lib/planning-dates.ts');
 assert.equal(dates.isPlanningDate('2026-02-30'),false);
 assert.equal(dates.isPlanningDate('2028-02-29'),true);
 assert.equal(dates.addBusinessDays('2026-10-23',2),'2026-10-27');
 const checklist=load('src/lib/checklist-view.ts');
 assert.equal(checklist.suggestDue({phase:'Booking & Onboarding',timing:'Within 1 business day'},null,'2026-10-23'),'2026-10-26');
});
test('late bookings squeeze stranded early tasks into the time left; couples never see a passed suggestion',()=>{
 const checklist=load('src/lib/checklist-view.ts');
 const client={design_tier:'design-florals',event_date:'2027-06-12',booked_on:'2026-10-26'};
 const late=checklist.buildChecklist(client,[]),early=checklist.buildChecklist({...client,booked_on:'2025-12-01'},[]),unknown=checklist.buildChecklist({...client,booked_on:null},[]);
 const leadUp=late.filter(i=>i.phase!=='Booking & Onboarding'&&i.phase!=='Post-Event'&&i.suggestedDue);
 assert.ok(unknown.some(i=>i.suggestedDue&&i.suggestedDue<'2026-10-26'),'template alone strands tasks before booking');
 assert.equal(leadUp.every(i=>i.suggestedDue>='2026-10-26'),true,'nothing due before Booked on');
 const raw=unknown.map(i=>i.suggestedDue),moved=late.map(i=>i.suggestedDue);
 for(let i=0;i<raw.length;i++)for(let j=0;j<raw.length;j++)if(raw[i]&&raw[j]&&moved[i]&&moved[j]&&leadUp.some(x=>x.id===late[i].id)&&leadUp.some(x=>x.id===late[j].id)&&raw[i]<raw[j])assert.ok(moved[i]<=moved[j],'original order kept');
 for(let i=0;i<raw.length;i++)if(raw[i]&&raw[i]>='2027-02-17'&&late[i].phase!=='Booking & Onboarding')assert.equal(moved[i],raw[i],'second-half deadlines untouched');
 assert.equal(early.filter(i=>i.phase!=='Booking & Onboarding').every((i,k)=>i.suggestedDue===unknown.filter(x=>x.phase!=='Booking & Onboarding')[k].suggestedDue),true,'early bookings unchanged');
 const base={phase:'TEST',task:'TEST',status:'not_started',track:'Planning Core',assignedOwner:'Client',approval:'No',dueOn:null};
 const [stale,manual,future]=planning.projectCoupleChecklist([{...base,id:'a',suggestedDue:'2026-04-12'},{...base,id:'b',dueOn:'2026-04-12',suggestedDue:null},{...base,id:'c',suggestedDue:'2026-12-01'}],'2026-10-26');
 assert.equal(stale.dueOn,null);assert.equal(manual.dueOn,'2026-04-12');assert.equal(future.dueOn,'2026-12-01');
});
const pgModule=process.env.LVD_PGLITE_MODULE;
test('SQL migration repeats safely, protects confirmed versions, scopes guest writes and logs locked-count changes atomically',{skip:!pgModule},async()=>{
 const {PGlite}=require(pgModule);const db=new PGlite();
 try {
 await db.exec(`create role anon;create role authenticated;create role service_role;
 create table clients(id uuid primary key);
 create function public.set_updated_at() returns trigger language plpgsql as $$begin new.updated_at=clock_timestamp();return new;end;$$;`);
 for(const f of ['guests-schema.sql','timeline-schema.sql','couple-planning-schema.sql','couple-planning-schema.sql']) await db.exec(fs.readFileSync('supabase/'+f,'utf8').replace('create extension if not exists pgcrypto;',''));
 const a='11111111-1111-4111-8111-111111111111',b='22222222-2222-4222-8222-222222222222';
 await db.query('insert into clients values($1),($2)',[a,b]);
 const mutate=async(client,id,patch,expected,action='save')=>(await db.query('select mutate_couple_guest($1,$2,$3,$4,$5,$6,$7) result',[client,id,'guest',action,JSON.stringify(patch),expected,'TEST couple'])).rows[0].result;
 let row=await mutate(a,null,{first:'TEST',rsvp:'Attending'},null);
 await db.query("update client_guest_records set data=data || '{\"notes\":\"SECRET\"}' where id=$1",[row.id]);
 row=(await db.query('select * from client_guest_records where id=$1',[row.id])).rows[0];
 const stamp=row.updated_at.toISOString();
 await db.query('update client_guest_settings set counts_locked=true where client_id=$1',[a]);
 const changed=await mutate(a,row.id,{meal:'Vegetarian'},stamp);
 assert.equal(changed.data.notes,'SECRET');
 assert.equal((await db.query('select jsonb_array_length(exceptions) n from client_guest_settings where client_id=$1',[a])).rows[0].n,1);
 await assert.rejects(mutate(a,row.id,{first:'STALE'},stamp));
 await assert.rejects(mutate(b,row.id,{first:'FOREIGN'},changed.updated_at));
 await assert.rejects(mutate(a,row.id,{notes:'BAD'},changed.updated_at));
 await mutate(a,row.id,{},changed.updated_at,'delete');
 assert.equal((await db.query('select jsonb_array_length(exceptions) n from client_guest_settings where client_id=$1',[a])).rows[0].n,2);
 await db.query("insert into client_timelines(client_id,cues,confirmed_at) values($1,'[{\"status\":\"Confirmed\",\"activity\":\"TEST\"}]',now())",[a]);
 assert.ok((await db.query('select confirmed_fingerprint from client_timelines')).rows[0].confirmed_fingerprint);
 await db.query("update client_timelines set overview='{\"change\":true}' where client_id=$1",[a]);
 assert.equal((await db.query('select confirmed_at from client_timelines')).rows[0].confirmed_at,null);
 await assert.rejects(db.query("update client_timelines set cues='[{\"status\":\"Draft\"}]',confirmed_at=now() where client_id=$1",[a]));
 assert.equal((await db.query("select has_function_privilege('authenticated','mutate_couple_guest(uuid,uuid,text,text,jsonb,timestamptz,text)','EXECUTE') allowed")).rows[0].allowed,false);
 }finally{await db.close();}
});
test('guest route derives client and actor from session, rejects guests and foreign records before writes',async()=>{
 let session=null;const calls=[];let exists=true;
 const auth={getPortalSession:async()=>session,canEditGuestList:r=>['client','partner'].includes(r)};
 const mocks={'next/server':{NextResponse:{json:(body,init)=>({body,status:init?.status??200})}},'@/lib/portal-auth':auth,'@/lib/guests-data':{getRecord:async(client)=>{calls.push(client);return exists?{kind:'guest'}:null;},getRecordIds:async()=>new Set(),getSettings:async()=>({events:[]})},'@/lib/couple-guests-data':{CoupleGuestConflict:class extends Error{},mutateCoupleGuest:async(input)=>{calls.push(input);return null;}}};
 const {POST}=load('src/app/api/portal/guests/route.ts',mocks);
 const request={json:async()=>({action:'save',kind:'guest',id:'11111111-1111-4111-8111-111111111111',expectedUpdatedAt:'2026-10-25T00:00:00Z',data:{first:'TEST'},clientId:'FOREIGN',by:'SPOOF'})};
 assert.equal((await POST(request)).status,401);
 session={client:{id:'OWN'},user:{email:'TEST actor'},relationship:'guest'};
 assert.equal((await POST(request)).status,403);assert.equal(calls.length,0);
 session.relationship='partner';exists=false;
 assert.equal((await POST(request)).status,404);assert.equal(calls.pop(),'OWN');
 exists=true;assert.equal((await POST(request)).status,200);
 const write=calls.pop();assert.equal(write.clientId,'OWN');assert.equal(write.by,'TEST actor');
});
