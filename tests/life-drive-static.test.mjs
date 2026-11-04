import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {rankAnswers} from '../src/pages/lifeDriveScoring.mjs';
import {createHash} from 'node:crypto';
const content=JSON.parse(await readFile(new URL('../src/data/life-drive-content.json',import.meta.url)));
const fixture=(...parts)=>parts.flatMap(([key,n])=>Array(n).fill(key));
test('matches all28 combinations in both primary orders',()=>{for(const r of content.reports){for(const [a,b]of[[r.id[0],r.id[1]],[r.id[1],r.id[0]]]){const out=rankAnswers(fixture([a,6],[b,4]));assert.deepEqual(out.primary,[a]);assert.deepEqual(out.secondary,[b]);assert.deepEqual(out.pairs,[r.id]);}}});
test('retains every tie and does not invent a second drive',()=>{
 assert.deepEqual(rankAnswers(fixture(['A',4],['B',2],['C',2],['D',1],['E',1])).pairs,['AB','AC']);
 assert.deepEqual(rankAnswers(fixture(['A',3],['B',3],['C',3],['D',1])).pairs,['AB','AC','BC']);
 assert.deepEqual(rankAnswers(fixture(['A',4],['B',4],['C',2])).pairs,['AB']);
 assert.equal(rankAnswers(Array(10).fill('H')).mode,'single');assert.deepEqual(rankAnswers(Array(10).fill('H')).secondary,[]);
 for(const key of 'ABCDEFGH')assert.equal(content.singles[key].id,key);
});
test('rejects incomplete, sparse and malformed answers',()=>{for(const value of [null,{},[],Array(10),Array(9).fill('A'),Array(10).fill('Z'),Array(10).fill(1)])assert.throws(()=>rankAnswers(value));});
test('keeps the original10 questions unchanged',()=>{assert.equal(createHash('sha256').update(JSON.stringify(content.questions)).digest('hex'),'d5fea6a9905fbc2e9ae8a47eefc313e59cfb72bf2dab5a9379dae5a57c55f139');});
test('static entry uses5297 and has no payment or server dependency',async()=>{const s=await readFile(new URL('../src/pages/LifeDrive.tsx',import.meta.url),'utf8');assert.ok(s.includes(createHash('sha256').update('5297').digest('hex')));assert.ok(!s.includes('付费'));assert.ok(!s.includes('fetch('));assert.ok(!s.includes('/api/'));});
