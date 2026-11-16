(function(root){
const questions=[
['我对这个人有真实的生理／情感吸引吗？','没有','一般','明显有'],
['我们现实条件和长期目标大体匹配吗？','明显冲突','尚不确定','基本匹配'],
['如果我不主动，对方会主动回来找我吗？','几乎不会','偶尔','稳定会'],
['对方会主动创造见面／相处机会吗？','不会','配合但少发起','会主动安排'],
['对方是真的想了解“我这个人”吗？','很少','偶尔问','持续好奇'],
['对方说过的事情会兑现吗？','经常不兑现','大部分会','很可靠'],
['我提出需求后，对方会调整行为吗？','不改／反驳','道歉但不稳定','有实际改变'],
['对方忙、累、低落时，还会维护基本连接吗？','经常消失','偶尔掉线','会说明情况'],
['出现矛盾／距离后，对方会回来修复吗？','冷处理','被动修复','主动处理'],
['和对方相处时，我总体是舒服还是内耗？','内耗明显','各半','大部分舒服']];
function score(a,long){if(!Array.isArray(a)||a.length!==10||a.some(x=>![0,1,2,null].includes(x)))throw Error('答案格式无效');const complete=a.every(x=>x!==null);const sum=a.reduce((s,x)=>s+(x||0),0);const hard=[6,7,8].filter(i=>a[i]===0&&long[i]===true).length>=2;return {complete,sum,hard,band:complete?(sum>=16?0:sum>=12?1:sum>=8?2:3):null};}
const api={questions,score,version:'1.0.0'};root.Relationship=api;if(typeof module!=='undefined')module.exports=api;
})(globalThis);
