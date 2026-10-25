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
const view=load('src/lib/moodboard-view.ts');
const id='11111111-1111-4111-8111-111111111111';
test('moodboard submission validates exact image set, expected version and design fields',()=>{
 const body={title:'TEST',summary:'TEST first version',images:[id],expected:null,design:{palette:'Blue',furniture:'TEST',florals:'TEST',price:'TEST $100'}};
 assert.equal(view.moodboardInput(body).design.palette,'Blue');
 for(const patch of [{images:[id,id]},{images:[]},{images:['foreign']},{expected:'bad'},{title:''},{summary:''},{design:{palette:42}}])assert.throws(()=>view.moodboardInput({...body,...patch}));
 assert.equal(view.isMoodboardApprover('partner'),true);assert.equal(view.isMoodboardApprover('family'),false);
});
test('approval route requires explicit approval and session-derived actor/client; family cannot approve',async()=>{
 let session=null;const calls=[];
 const mocks={'next/server':{NextResponse:{json:(body,init)=>({body,status:init?.status??200})}},'@/lib/portal-auth':{getPortalSession:async()=>session},'@/lib/moodboard-data':{MoodboardConflict:class extends Error{},approveMoodboard:async(...args)=>calls.push(args)}};
 const {POST}=load('src/app/api/portal/moodboards/route.ts',mocks);
 let body={revision:id,approved:true,clientId:'SPOOF',name:'SPOOF',userId:'SPOOF'};const req={json:async()=>body};
 assert.equal((await POST(req)).status,401);
 session={client:{id:'OWN'},user:{id:'USER',displayName:'TEST partner'},relationship:'family'};
 assert.equal((await POST(req)).status,403);assert.equal(calls.length,0);
 session.relationship='partner';body.approved=false;assert.equal((await POST(req)).status,400);
 body.approved=true;assert.equal((await POST(req)).status,200);assert.deepEqual(Array.from(calls[0]),['OWN',id,'USER','TEST partner']);
});
const pgModule=process.env.LVD_PGLITE_MODULE;
test('SQL moodboards: immutable snapshots, explicit either-partner approval, reapproval, stale/cross-client rejection, notes isolation and permissions',{skip:!pgModule},async()=>{
 const {PGlite}=require(pgModule),db=new PGlite();
 try{
 await db.exec(`create role anon;create role authenticated;create role service_role;create schema auth;create table auth.users(id uuid primary key);create table clients(id uuid primary key);create table client_users(client_id uuid,user_id uuid,relationship text);create function set_updated_at() returns trigger language plpgsql as $$begin new.updated_at=clock_timestamp();return new;end;$$;`);
 for(const f of ['images-schema.sql','images-soft-delete.sql','checklist-schema.sql','moodboard-schema.sql','moodboard-schema.sql'])await db.exec(fs.readFileSync('supabase/'+f,'utf8').replace('create extension if not exists pgcrypto;',''));
 await db.exec(fs.readFileSync('supabase/moodboard-checklist-fix.sql','utf8'));
 const a=id,b='22222222-2222-4222-8222-222222222222',u='33333333-3333-4333-8333-333333333333',v='44444444-4444-4444-8444-444444444444';
 await db.query('insert into clients values($1),($2)',[a,b]);await db.query('insert into auth.users values($1),($2)',[u,v]);await db.query("insert into client_users values($1,$2,'partner'),($1,$3,'family')",[a,u,v]);
 const image=(await db.query("insert into client_images(client_id,name,album,storage_path) values($1,'TEST board','Design','TEST/board.png') returning id",[a])).rows[0].id;
 const design={palette:'TEST blue',furniture:'TEST chairs',florals:'TEST rose',price:'TEST $100'};
 const publish=async(client,expected,images=[image],d=design)=>(await db.query('select publish_client_moodboard($1,$2,$3,$4,$5,$6,$7) id',[client,expected,'TEST design',JSON.stringify(d),images,'TEST summary','TEST planner'])).rows[0].id;
 const approve=(client,revision,user=u)=>db.query('select approve_client_moodboard($1,$2,$3,$4)',[client,revision,user,'TEST partner']);
 const first=await publish(a,null);assert.equal((await db.query('select count(*)::int n from client_moodboard_approvals')).rows[0].n,0);
 await assert.rejects(approve(b,first));await assert.rejects(approve(a,first,v));
 await approve(a,first);await approve(a,first);assert.equal((await db.query('select count(*)::int n from client_moodboard_approvals')).rows[0].n,1);
 assert.equal((await db.query("select status from client_checklist_items where client_id=$1 and task_id='LVD-101'",[a])).rows[0].status,'complete');
 await db.query("insert into client_moodboard_production(client_id,note,updated_by) values($1,'SECRET production details','TEST planner')",[a]);
 assert.equal((await db.query('select count(*)::int n from client_moodboard_approvals')).rows[0].n,1);
 const second=await publish(a,first,[image],{...design,price:'TEST $200'});
 assert.equal((await db.query("select status from client_checklist_items where client_id=$1 and task_id='LVD-101'",[a])).rows[0].status,'waiting_client');
 await assert.rejects(approve(a,first));await assert.rejects(publish(a,first));
 await assert.rejects(publish(b,null));await assert.rejects(publish(a,second,[image,image]));
 await approve(a,second);
 await db.query('update client_images set deleted_at=now() where id=$1',[image]);
 assert.equal((await db.query('select images from client_moodboard_versions where id=$1',[first])).rows[0].images[0].storage_path,'TEST/board.png');
 await assert.rejects(db.query('delete from client_images where id=$1',[image]));
 await assert.rejects(db.query("update client_images set storage_path='TEST/replaced' where id=$1",[image]));
 await assert.rejects(publish(a,second));
 const permissions=(await db.query("select has_table_privilege('authenticated','client_moodboard_production','SELECT') notes,has_function_privilege('anon','approve_client_moodboard(uuid,uuid,uuid,text)','EXECUTE') approve")).rows[0];assert.equal(permissions.notes,false);assert.equal(permissions.approve,false);
 }finally{await db.close();}
});
