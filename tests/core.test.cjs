const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const C = require('../dist/core.js');
const context = {window:{}};
vm.runInNewContext(fs.readFileSync(require.resolve('../dist/data.js'),'utf8'),context);
const bank = JSON.parse(JSON.stringify(context.window.CHEM_BANK));
const questions = bank.questions;

test('the complete source bank has 505 unique valid questions and reference answers',()=>{
  assert.equal(questions.length,505);
  assert.equal(new Set(questions.map(q=>q.id)).size,505);
  assert.equal(new Set(questions.map(q=>q.text)).size,505);
  assert.deepEqual(Object.fromEntries(['single','multiple','boolean'].map(type=>[type,questions.filter(q=>q.type===type).length])),{single:211,multiple:166,boolean:128});
  for(const q of questions){
    assert.ok(q.text.trim());assert.ok(q.difficulty>=1&&q.difficulty<=5);
    assert.ok(q.answer.length);assert.equal(new Set(q.options.map(o=>o.key)).size,q.options.length);
    assert.ok(q.answer.every(k=>q.options.some(o=>o.key===k)));
    if(q.type!=='multiple')assert.equal(q.answer.length,1);
    assert.ok(C.grade(q,q.answer));assert.ok(!C.grade(q,[]));
  }
});
test('single choice grades the selected key and rejects extra answers',()=>{
  assert.equal(C.grade(questions[0],['A']),true);
  assert.equal(C.grade(questions[0],['B']),false);
  assert.equal(C.grade(questions[0],['A','B']),false);
});
test('multiple choice is order independent and requires all correct options',()=>{
  const q=questions[3];assert.deepEqual(q.answer,['A','B','C']);
  assert.ok(C.grade(q,['C','A','B']));
  assert.ok(!C.grade(q,['A','B']));
  assert.ok(!C.grade(q,['A','B','C','D']));
});
test('boolean references preserve both original symbols',()=>{
  const right=questions.find(q=>q.sourceAnswer==='√');
  const wrong=questions.find(q=>q.sourceAnswer==='×');
  assert.ok(C.grade(right,['T']));assert.ok(!C.grade(right,['F']));
  assert.ok(C.grade(wrong,['F']));assert.ok(!C.grade(wrong,['T']));
});
test('random exam selection has no duplicates and does not mutate the bank',()=>{
  const ids=questions.map(q=>q.id);const snapshot=[...ids];
  const sample=C.sample(ids,100,()=>0.31);
  assert.equal(sample.length,100);assert.equal(new Set(sample).size,100);
  assert.deepEqual(ids,snapshot);
  assert.equal(C.sample(ids,999).length,505);
  assert.equal(C.sample(ids,0).length,0);
});
test('exam result includes unanswered questions in the denominator',()=>{
  const qs=[questions[0],questions[3],questions[5]];
  const answers={[qs[0].id]:['A'],[qs[1].id]:['A']};
  assert.deepEqual(C.summarize(qs,answers),{total:3,correct:1,answered:2,unanswered:1,incorrect:2,score:33.33});
  assert.equal(C.summarize([],{}).score,0);
});
test('deadline uses the absolute clock and expires at the exact boundary',()=>{
  assert.equal(C.remainingSeconds(60000,0),60);
  assert.equal(C.remainingSeconds(60000,59001),1);
  assert.equal(C.remainingSeconds(60000,60000),0);
  assert.equal(C.remainingSeconds(60000,100000),0);
});
test('retrying a wrong question updates its latest result while preserving attempt totals',()=>{
  const first=C.makeRecord(undefined,false,['B'],100);
  const retry=C.makeRecord(first,true,['A'],200);
  assert.equal(first.correct,false);assert.equal(retry.correct,true);
  assert.equal(retry.attempts,2);assert.equal(retry.correctAttempts,1);
  assert.equal(retry.lastAt,200);assert.deepEqual(retry.selection,['A']);
});
