/* eslint-disable @typescript-eslint/no-require-imports */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const ts=require('typescript');
function load(file) {
 const exports={};
 const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText;
 vm.runInNewContext(code,{exports,process,console,require});
 return exports;
}
const budget=load('src/lib/budget-view.ts');
const line=(id,side,amount)=>({id,client_id:'c',category:'Other',side,vendor:id,description:null,status:'contracted',estimated_cents:amount,contracted_cents:amount,changes_cents:0,notes:null,position:0,created_at:''});
const pay=(line_id,payment_type,amount_cents,paid_cents,due_on)=>({id:line_id+payment_type,client_id:'c',line_id,payment_type,payer:'client',due_on,amount_cents,paid_cents,paid_on:null,manual_status:null,notes:null,created_at:''});
test('couple payment plan adds every LVD contract and leaves outside vendors out',()=>{
 const lines=[line('design','lvd_design',1200000),line('planning','lvd_planning',800000),line('venue','external',3000000)];
 const payments=[
  ...budget.lvdSchedule(1200000,'2027-06-01').map(p=>pay('design',p.payment_type,p.amount_cents,p.payment_type==='retainer'?p.amount_cents:0,p.due_on)),
  ...budget.lvdSchedule(800000,'2027-06-01').map(p=>pay('planning',p.payment_type,p.amount_cents,0,p.due_on)),
  pay('venue','retainer',1000000,1000000,'2026-01-01'),
 ];
 const plan=budget.lvdPaymentPlan(lines,payments);
 assert.equal(plan.total,2000000);
 assert.deepEqual(Array.from(plan.steps,s=>s.amount),[800000,600000,600000]);
 assert.equal(plan.paid,480000);
 assert.equal(plan.steps[0].balance,320000);
 assert.equal(plan.unscheduled,0);
 assert.equal(budget.lvdPaymentPlan([line('planning','lvd_planning',800000)],[]).unscheduled,800000);
});
