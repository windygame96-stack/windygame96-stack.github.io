import {questions,careers,prototypes,modes} from './data.js?v=2.1.0';
export const VERSION='2.1.0';
export const COVERAGE={drive:3,work:3,ability:0,ai:0};
const clamp=v=>Math.max(0,Math.min(1,v));
const mean=a=>a.length?a.reduce((s,n)=>s+n,0)/a.length:null;
export function validAnswers(a,complete=false){return Array.isArray(a)&&a.length<=questions.length&&(!complete||a.length===questions.length)&&Array.from(a).every((v,i)=>v===null||(Number.isInteger(v)&&v>=0&&v<questions[i].options.length));}
export function restoreAnswers(saved,now=Date.now()){return saved?.version===VERSION&&Number.isFinite(saved.expiresAt)&&saved.expiresAt>now&&validAnswers(saved.answers)?saved.answers:[];}
export function buildProfile(a){
 if(!validAnswers(a,true))throw Error('请完成或跳过全部18题');
 const traits={},counts=Object.fromEntries('ABCDEFGH'.split('').map(k=>[k,0]));
 questions.forEach((q,i)=>{if(a[i]===null)return;const o=q.options[a[i]];if(q.kind==='drive')counts[o.key]++;else if(o.value!==null)traits[q.key]=o.value;});
 const indices={drive:[0,1,2,3],work:[4,5,6,7],ability:[8,9,10,11,12,13],ai:[14,15]};
 const coverage=Object.fromEntries(Object.entries(indices).map(([k,ix])=>[k,{answered:ix.filter(i=>a[i]!==null&&(questions[i].kind==='drive'||questions[i].options[a[i]].value!==null)).length,total:ix.length,needed:COVERAGE[k]}]));
 const missing=['drive','work'].filter(k=>coverage[k].answered<COVERAGE[k]);
 const max=Math.max(...Object.values(counts));const primary=max?'ABCDEFGH'.split('').filter(k=>counts[k]===max):[];
 return {traits,counts,coverage,missing,primary,completeEvidence:coverage.ability.answered===6&&coverage.ai.answered===2,answered:a.filter(v=>v!==null).length,total:18};
}
function weighted(values,weights){let sum=0,total=0;for(const [k,w]of Object.entries(weights)){if(typeof values[k]==='number'){sum+=values[k]*w;total+=w;}}return total?sum/total:null;}
function preference(p,c){const t=p.traits;const parts=[];if(t.activity!==undefined)parts.push([(t.activity===c.prototype||t.activity===c.id)?1:(c.also||[]).includes(t.activity)?.75:.2,.45]);for(const [key,w]of [['social',.25],['management',.15],['business',.15]])if(t[key]!==undefined)parts.push([1-Math.abs(t[key]-c[key]),w]);return parts.length?parts.reduce((s,[v,w])=>s+v*w,0)/parts.reduce((s,[,w])=>s+w,0):null;}
export function components(profile,c){
 const t=profile.traits;const M=profile.coverage.drive.answered?c.drives.reduce((s,k)=>s+profile.counts[k],0)/profile.coverage.drive.answered:null;
 const knownSkills=Object.keys(c.skills).filter(k=>typeof t[k]==='number');
 const evidenceCoverage=knownSkills.reduce((s,k)=>s+c.skills[k],0)/Object.values(c.skills).reduce((s,w)=>s+w,0);
 const A=knownSkills.length===Object.keys(c.skills).length?weighted(t,c.skills):null,W=preference(profile,c);
 // AI杠杆仅是编辑假设：意愿、核验投入，以及AI可能补上的技术实现门槛。
 const foundationSkills=Object.fromEntries(Object.entries(c.skills).filter(([k])=>k!=='tech'));
 const foundation=Object.keys(foundationSkills).every(k=>typeof t[k]==='number')?weighted(t,foundationSkills):null;
 const bridge=typeof t.tech==='number'&&foundation!==null?foundation*c.bridge*(1-t.tech):null;
 const L=typeof t.ai==='number'&&typeof t.verify==='number'&&bridge!==null?.4*t.ai+.2*t.verify+.4*t.ai*bridge:null;
 const values=[M,A,W,L];const combined=values.every(v=>v!==null)?clamp(.25*M+.4*A+.2*W+.15*L):null;
 const interest=M!==null&&W!==null?clamp(.55*M+.45*W):null;
 // Unknown practice never becomes zero or triggers weight redistribution. All directions
 // use the same interest-only metric until all six practice areas and AI items are known.
 const score=profile.completeEvidence?combined:interest;
 return {M,A,W,L,bridge,score,combined,interest,evidenceCoverage,missingSkills:Object.keys(c.skills).filter(k=>typeof t[k]!=='number')};
}
export function recommendModes(profile){
 const t=profile.traits;const missing=['stability','goal','social','management','business'].filter(k=>t[k]===undefined);
 if(missing.length)return {status:'insufficient',missing,items:[],primary:[],note:'发展模式的信息还不够；可以先看职业方向，再补充收入需要、协作和经营意愿。'};
 const autonomy=1-t.social,buffer=t.stability,business=t.business,management=t.management;
 const raw={employment:.5*(1-buffer)+.25*t.social+.25*(1-business),freelance:.35*autonomy+.4*business+.25*buffer,solo:.35*autonomy+.35*business+.3*buffer,team:.35*management+.25*t.social+.25*business+.15*buffer};
 const items=modes.map(m=>{const reasons=[];let eligible=true;if(m.id==='solo'||m.id==='team'){if(buffer<2/3){eligible=false;reasons.push('当前更需要稳定收入，先把创业作为业余验证');}if(business<2/3){eligible=false;reasons.push('还不愿主动找使用者和客户，先验证获客意愿');}if(m.id==='team'&&management<2/3){eligible=false;reasons.push('目前不想持续组织团队，先找伙伴合作体验');}}if(m.id==='freelance'&&business<1/3){eligible=false;reasons.push('项目接单需要主动沟通与推广，可先尝试一次小合作');}return {...m,score:clamp((raw[m.id]+(t.goal===m.id?.12:0))/1.12),eligible,reasons,supplemental:m.id==='freelance'&&buffer<2/3};}).sort((a,b)=>b.score-a.score||a.id.localeCompare(b.id));
 const eligible=items.filter(m=>m.eligible);const primary=buffer<1/3?[eligible.find(m=>m.id==='employment')].filter(Boolean):eligible.slice(0,2);
 return {status:'ready',missing:[],items,primary,note:buffer<2/3?'保留当前稳定收入，副业接单或创业都先做小范围验证。':'你自评能接受一定波动，但实际资源、需求和成本仍需单独验证。'};
}
function startup(profile,ranked,modeResult){
 if(modeResult.status!=='ready')return {status:'insufficient',title:'创业路径暂不下结论',note:'先补发展模式题。测试没有核验你的资金、经验、合伙人和真实需求。',paths:[]};
 const scoreOf=ids=>Math.max(...ranked.filter(c=>ids.includes(c.id)).map(c=>c.score));
 const paths=[{id:'product',name:'产品创业',score:scoreOf(['c04','c17','c18','c26','c29','c30']),task:'画一个解决具体问题的小工具，找一位潜在使用者试用，再决定是否继续。'},{id:'content',name:'内容创业',score:scoreOf(['c01','c02','c03','c05','c06','c23']),task:'为明确受众做一件小作品，请一位目标读者指出哪里有用、哪里看不懂。'},{id:'service',name:'服务创业',score:scoreOf(['c21','c22','c24','c25','c27','c28']),task:'用自己已有经验做一个虚构服务样例，向一位潜在使用者核对需求与范围。'}].sort((a,b)=>b.score-a.score||a.id.localeCompare(b.id));
 const eligible=modeResult.items.some(m=>['solo','team'].includes(m.id)&&m.eligible);
 return {status:eligible?'explore':'prepare',title:eligible?`可先验证${paths[0].name}这条路径`:'当前先以就业或小项目积累证据',note:'这是创业探索线索，不是创业能力或成功概率。资金缓冲、领域经验、获客成本、合作条件与付费需求尚未核验。',paths};
}
export function score(a){
 const profile=buildProfile(a),modeResult=recommendModes(profile);
 if(profile.missing.length)return {...profile,status:'insufficient',metric:'interest',ranked:[],prototypeScores:[],topPrototypes:[],recommendations:[],modeResult,startup:{status:'insufficient',title:'先补充回答，再看创业路径',note:'信息不足时不生成创业判断。',paths:[]}};
 const ranked=careers.map(c=>({...c,...components(profile,c)})).sort((a,b)=>b.score-a.score||a.id.localeCompare(b.id));
 const prototypeScores=prototypes.map(p=>({...p,...components(profile,{...p,prototype:p.id,also:[]})})).sort((a,b)=>b.score-a.score||a.id.localeCompare(b.id));
 const top=prototypeScores[0].score;const topPrototypes=prototypeScores.filter(p=>top-p.score<=.03);
 const first=ranked[0];const remaining=ranked.filter(c=>c.id!==first.id);
 const potential=remaining.find(c=>c.missingSkills.length>0)||remaining[0];
 const rest=remaining.filter(c=>c.id!==potential.id);const topIds=new Set(topPrototypes.map(p=>p.id));
 const surprise=rest.find(c=>!topIds.has(c.prototype)&&first.score-c.score<=.2)||rest[0];
 const recommendations=[{...first,tier:'优先探索',tierNote:profile.completeEvidence?'本次综合线索较突出，先用一件小作品验证。':'本次兴趣线索较突出，不代表已经具备从业准备。'},{...potential,tier:'补证后再看',tierNote:profile.completeEvidence?'相关自评已有线索，仍需不同任务的小作品核验。':'这是兴趣线索；先补上缺少的实践证据，再判断从业准备。'},{...surprise,tier:'意外可能',tierNote:'从其他方向扩展视野；不代表比其余方向更适合你。'}];
 return {...profile,status:'ready',metric:profile.completeEvidence?'combined':'interest',ranked,prototypeScores,topPrototypes,recommendations,modeResult,startup:startup(profile,ranked,modeResult)};
}
