// Optional real PostgreSQL/WASM runtime; install outside the project and set LVD_PGLITE_MODULE.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const modulePath = process.env.LVD_PGLITE_MODULE;
test('SQL migration is repeatable; deliveries are atomic, idempotent, linked and order-safe', {skip: !modulePath}, async () => {
 const {PGlite}=require(modulePath);const db=new PGlite();
 try {
 await db.exec(`create role anon; create role authenticated; create role service_role;`);
 // pgcrypto is unnecessary: modern PostgreSQL ships gen_random_uuid in core.
 await db.exec(fs.readFileSync('supabase/leads-schema.sql','utf8').replace('create extension if not exists pgcrypto;',''));
 await db.exec(fs.readFileSync('supabase/lead-activity-schema.sql','utf8'));
 const migration=fs.readFileSync('supabase/lead-appointments-schema.sql','utf8');await db.exec(migration);await db.exec(migration);
 const id='11111111-1111-4111-8111-111111111111';const second='22222222-2222-4222-8222-222222222222';
 await db.query(`insert into leads(id,source,email,created_at) values ($1,'inquire','TEST@example.com','2026-10-01'),($2,'inquire','test@example.com','2026-10-05')`,[id,second]);
 let delivery=0;
 async function sync({uri='old',status='scheduled',rescheduled=false,old=null,next=null,leadId=id,email='test@example.com',key,occurred='2026-10-06T12:00:00Z'}={}) {
 const args=[key||`delivery-${++delivery}`,JSON.stringify({event:status}),uri,'shared-group-event','design',leadId,email,'2026-10-08T18:00:00Z','2026-10-08T18:30:00Z',occurred,status,rescheduled,old,next];
 return (await db.query(`select sync_calendly_appointment(${args.map((_,i)=>'$'+(i+1)).join(',')}) result`,args)).rows[0].result;
 }
 await sync({key:'same'});assert.equal((await sync({key:'same'})).duplicate,true);
 assert.equal((await db.query('select * from lead_activity')).rows.length,1);
 await sync({status:'canceled',rescheduled:true,next:'new',occurred:'2026-10-06T13:00:00Z'});
 await sync({occurred:'2026-10-06T12:00:00Z'});assert.equal((await db.query("select status from lead_appointments where invitee_uri='old'")).rows[0].status,'canceled');
 await sync({uri:'new',old:'old',leadId:null});assert.equal((await db.query("select lead_id from lead_appointments where invitee_uri='new'")).rows[0].lead_id,id);
 // Email fallback chooses most recent earlier inquiry, while ID matching wins over it.
 await sync({uri:'email',leadId:null});assert.equal((await db.query("select lead_id from lead_appointments where invitee_uri='email'")).rows[0].lead_id,second);
 await sync({uri:'unmatched',email:'unmatched@example.com',leadId:id});assert.equal((await db.query("select lead_id from lead_appointments where invitee_uri='unmatched'")).rows[0].lead_id,null);
 // Replacement arrived before old: repair link when old arrives later.
 await sync({uri:'reverse-new',old:'reverse-old',leadId:null,email:'other@example.com'});
 await db.query("insert into leads(id,source,email,created_at) values ('33333333-3333-4333-8333-333333333333','inquire','other@example.com','2026-10-07')");
 await sync({uri:'reverse-old',leadId:'33333333-3333-4333-8333-333333333333',email:'other@example.com',status:'canceled',rescheduled:true,next:'reverse-new'});
 assert.equal((await db.query("select lead_id from lead_appointments where invitee_uri='reverse-new'")).rows[0].lead_id,'33333333-3333-4333-8333-333333333333');
 const before=(await db.query('select count(*)::int n from calendly_webhook_events')).rows[0].n;
 await assert.rejects(sync({uri:'bad',status:'invalid'}));
 assert.equal((await db.query('select count(*)::int n from calendly_webhook_events')).rows[0].n,before);
 assert.equal((await db.query('select status from leads where id=$1',[id])).rows[0].status,'new');
 const permissions=await db.query("select has_table_privilege('anon','lead_appointments','SELECT') allowed,has_function_privilege('authenticated','sync_calendly_appointment(text,jsonb,text,text,text,uuid,text,timestamptz,timestamptz,timestamptz,text,boolean,text,text)','EXECUTE') executable");
 assert.equal(permissions.rows[0].allowed,false);assert.equal(permissions.rows[0].executable,false);
 } finally { await db.close(); }
});
