/* Small, optional reminders earned by reading the story. No real account data is collected. */
(()=>{'use strict';
const TOPICS=['想让钱留住','最近有点缺钱','想买的东西太多','辛苦钱还没收到','想找点新机会'];
const NOTES=[["先谈工钱，再谈心","经营账和自己的家用分开。分工、报酬和退出办法先说清，求财也别把自己白送出去。"],["财神也有不擅长的事","有人管太多，有人嘴太快。发现经营上的毛病就说，帮忙之前也给自己的饭和报酬留位置。"],["便宜和顺路都先看看","核用途、总价、实际位置和时间。差一点中奖不会让下一次更容易，没收到的钱也先别花。"],["一起补救，比保住面子要紧","保留原始记录，说明自己经手的事实，协商后续安排。共同承担不会让错误消失，但能让下次合作有话可说。"],["约会得本人开口","饭要吃，累了可以歇，不想约会也能明说。别用工钱、帮忙或一张签替别人答应。"],["有空白，才装得下今天","卖不完就核原因，拿不准就再问。自己的喜欢和休息也要有位置，不必靠一笔大赚证明一整天。"],["赚钱和喜欢，都要自己愿意","可以恋爱，可以做朋友，也可以去开自己的店。交清账、说清心意，各自的打算都值得认真对待。"]];
const SPECIAL=[["别把自己也安排没了","守好钱袋，也把值守分出去。一个人扛下所有事，很容易连晚饭都顾不上。"],["先听完，再问价","客人要什么先听清。便宜货未必合用，贵重物件也未必立刻卖得出去。"],["表里留一点空","赠茶照实记，变动一起商量。安排可以帮助生活，不能让生活只能照表发生。"],["帮忙也得问清工钱","先问范围、报酬和时间，保留交接记录。喜欢一个人，也不能把自己的劳力当赠品。"],["好听的话，要有人办完","消息先核实，承诺要跟进。好运是彩头，实际的商品、费用和条件得说清。"]];
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
