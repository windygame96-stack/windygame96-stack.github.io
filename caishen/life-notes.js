/* Small, optional reminders earned by reading the story. No real account data is collected. */
(()=>{'use strict';
const TOPICS=['想让钱留住','最近有点缺钱','想买的东西太多','辛苦钱还没收到','想找点新机会'];
const NOTES=[
['先把账分开','庙里经营、人间生活分开记。接手前，把报酬、分工和退出办法问明白。'],
['别只数收进的钱','把进货、工钱、近期必需开支留出来，再看能安排多少。留多少按自己的情况调整。'],
['心急时先停一停','差一点、快翻本、别人赚了，都不能保证下一次结果。先保住生活必需的钱。'],
['记录清楚，出了问题才好追','留下原单、往来和处理时间，按实际情况更正。钱能否追回不能先保证。'],
['吃饭和休息也有位置','安排开支时，把必要的生活和能负担的喜欢都算进去，遇到困难可以再商量。'],
['讨彩头，也照顾实际','小符、红包、开门迎财和小签是故事里的小仪式，不保证现实运势。用它提醒自己完成一件能做的小事。'],
['日子可以慢慢安排','经营的安排可以调整，自己的茶铺计划也可以继续。忙完今天，先好好吃顿饭。']
];
const SPECIAL=[['先扣成本再看利润','缺钱时先核必要开支和可商量的安排，别把赌博当成补窟窿的办法。'],['喜欢也可以慢慢挑','看总价、实际用途、搭售和来源。闲置未卖出前，别先当作可花的钱。'],['先想什么时候要用钱','存款与理财要分清；购买前理解风险、取用规则和费用，不懂的向正规机构问清。'],['先说清活，再说清钱','明确内容、报酬和时间；保留交接记录，按事实询问未付报酬。必要时再寻求相应的专业帮助。'],['先核实，再小步试','了解机会的来源、费用和实际安排，按能负担的范围尝试。尝试没结果也允许歇一歇。']];
const CARE=[
['花钱前，陪你看清这笔要付给谁。','先把吃饭和近期必要的钱留住，急事一件件谈。','喜欢可以记下，别被今晚最后一次催着掏钱。','做过哪些、约好多少，先把记录收好。','有消息先核实，别因为急就把钱袋交出去。'],
['今晚一起理理钱袋，别把没成交的钱先花出去。','缺多少、急在哪儿，方便的话说给我听。','看清总价和用途，真喜欢的也可以慢慢安排。','单据留下，我陪你核一核。','先看看来历，问价前也问问条件。'],
['近期要付什么，先留位置。余钱再按你的情况安排。','先排最要紧的，拿不准的那笔一起看。','开心也能留一格，金额按能负担的来。','把约好的数和未到的款列出来，别只记在心里。','先看风险、费用和何时能取用，别只看宣传的收益。'],
['进账和跑过的路都记一下，今天也记得吃饭。','要忙我陪你，先别把自己整日的饭省掉。','买东西先放稳，别一路被人催着又加一箱。','先核清，再问具体的付款安排。我陪着。','范围、报酬、交接时间问清，咱们再出发。'],
['机会来了也问清代价，今天不必急着证明什么。','想一下翻身的心情，我听见了。先别信谁能保证。','先看是不是用得上，倒计时不会替你付钱。','先把自己的那份问明白，再想下一笔机会。','先问一个消息也好，没立刻有回音就明天再看。']
];
const oldShrine=shrineView,oldReply=prayerReply,oldStory=storyView,oldBag=bagView;
shrineView=function(){let html=oldShrine();return html.replace('<div class="shrine-stage',`<details class="panel life-concern"><summary>聊聊钱的烦恼（可选）</summary><label for="lifeConcern">今天在烦恼什么？</label><select id="lifeConcern"><option value="-1" ${!Number.isInteger(state.memory.lifeConcern)||state.memory.lifeConcern<0?'selected':''}>先听听今天的心愿</option>${TOPICS.map((v,i)=>`<option value="${i}" ${state.memory.lifeConcern===i?'selected':''}>${v}</option>`).join('')}</select><p class="small muted">仅影响他的回应。</p></details><div class="shrine-stage`)};
prayerReply=function(g,wish){let s=oldReply(g,wish),k=state?.memory.lifeConcern;if(Number.isInteger(k)&&k>=0&&k<TOPICS.length)s+=' “'+CARE[g][k]+'”';return s};
function entry(){if(!state?.daily.story)return '';return `<div class="panel life-note"><span class="eyebrow">今夜记下的小事</span><h3>${state.day===1?NOTES[0][0]:SPECIAL[Game.routeOf(state)][0]}</h3><p>${NOTES[state.day-1][1]}</p>${btn('翻开财神的小叮嘱','lifeNotes','','outline small')}</div>`}
storyView=function(){return oldStory()+entry()};bagView=function(){return oldBag()+`<div class="panel life-note"><h3>财神的小叮嘱</h3>${btn('查看已读章节的提醒','lifeNotes','','outline small')}</div>`};
function show(){let g=Game.routeOf(state),days=[...new Set(state.story.map(s=>s.day))].sort((a,b)=>a-b);modal('财神的小叮嘱',`<p>这些提醒来自你们一起经营和相处的经历。可以按自己的情况取用，不必一次做完。</p>${days.length?days.map(day=>`<article class="panel life-note"><span class="eyebrow">第 ${day} 夜 · ${day===1?'五位财神':GODS[g].name}</span><h3>${NOTES[day-1][0]}</h3><p>${NOTES[day-1][1]}</p>${day>1?'<p class="small">'+SPECIAL[g][1]+'</p>':''}</article>`).join(''):'<p>读完第一夜，这里就会收好第一份小叮嘱。</p>'}<p class="small muted">剧情是架空故事，招财小仪式只供讨彩头。这里不推荐具体投资产品，也不保证现实收益。</p>`)}
document.addEventListener('change',e=>{if(e.target.id==='lifeConcern'&&state){state.memory.lifeConcern=Number(e.target.value);persist()}});
document.addEventListener('click',e=>{if(e.target.closest('[data-a="lifeNotes"]')&&state){e.stopImmediatePropagation();show()}},true);
})();
