const {questions,score,version}=Relationship, app=document.querySelector('#app'),KEY='relationship-check-v1',TTL=365*86400000;
let answers=Array(10).fill(null),long={},index=0,editing=false,locked=false,person='',stage='认识约1个月',persist=false,records=[],saved=false,savedId=null,storageError='';
try{const data=JSON.parse(localStorage.getItem(KEY)||'null');if(data&&data.version===version&&Array.isArray(data.records))records=data.records.filter(r=>Number.isFinite(r.time)&&Date.now()-r.time<TTL&&typeof r.person==='string'&&typeof r.stage==='string'&&Array.isArray(r.answers)&&r.answers.length===10&&r.answers.every(x=>[0,1,2].includes(x))&&r.long&&typeof r.long==='object');if(data)localStorage.setItem(KEY,JSON.stringify({version,records}));}catch{storageError='本机存储不可用；仍可完成测试，本次记录只在当前页面保留。';}
function el(tag,text,cls){const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;}
function add(parent,...nodes){nodes.forEach(n=>parent.append(n));return parent;}
function btn(t,fn,cls){const b=el('button',t,cls);b.onclick=fn;return b;}
function title(t){const h=el('h2',t);h.tabIndex=-1;app.append(h);h.focus();}
function resetView(){app.replaceChildren();window.scrollTo(0,0);}
function write(){try{localStorage.setItem(KEY,JSON.stringify({version,records}));return true;}catch{return false;}}
function home(){resetView();add(app,el('div','LOVE, WITH YOUR EYES OPEN','eyebrow'));const hero=el('section',undefined,'hero');add(hero,el('div','先心动\n再看行动','stamp'));const h=el('h1');add(h,el('span','这段关系，'),el('br'),el('span','值得继续投入吗？','accent'));add(hero,h,el('p','10个问题，整理最近4–8周的真实相处。\n不替对方解释，也不替你决定。','intro'));app.append(hero);const meta=el('div',undefined,'meta');['10道题','每题0–2分','预计2–3分钟'].forEach(t=>meta.append(el('span',t)));app.append(meta);
const card=el('section',undefined,'card');const lab=el('label','给这次观察的对象一个代号（可选）');const input=el('input');input.type='text';input.maxLength=24;input.placeholder='例如：对象A，不用真实姓名';input.value=person;lab.append(input);card.append(lab);
const known=[...new Set(records.map(r=>r.person))];if(known.length){const l=el('label','或选择已有对象');const s=el('select');add(s,el('option','选择对象'));known.forEach(p=>{const o=el('option',p);o.value=p;s.append(o)});s.onchange=()=>{if(s.selectedIndex)input.value=s.value};l.append(s);card.append(l);}
const sl=el('label','本次复测节点');const select=el('select');['认识约1个月','认识约3个月','第一次明显矛盾／压力后','其他时间'].forEach(x=>{const o=el('option',x);o.value=x;select.append(o)});select.value=stage;sl.append(select);card.append(sl);
const privacy=el('label');const check=el('input');check.type='checkbox';check.checked=persist;add(privacy,check,document.createTextNode(' 自愿在此浏览器保存结果，用于以后复测'));add(card,privacy,el('p','保存365天，可随时清除；不跨设备同步。未勾选时，刷新即清空本次答案。','small'));add(card,btn('开始观察 →',()=>{person=input.value.trim()||'对象A';stage=select.value;persist=check.checked;answers=Array(10).fill(null);long={};index=0;saved=false;savedId=null;editing=false;quiz();},'primary wide'));app.append(card);if(storageError)app.append(el('p',storageError,'notice'));if(records.length)app.append(btn('查看复测记录',history));const d=el('details');add(d,el('summary','如何计分与理解结果'),el('p','16–20：值得加仓；12–15：继续观察；8–11：高风险观察区；0–7：降级。第7、8、9题任意两项长期为0时，硬规则优先。本工具沿用你提供的观察规则，未经心理测量验证；分数不是对方爱你的概率。','small'));app.append(d);}
function quiz(){resetView();add(app,el('div',`${person} · ${stage}`,'eyebrow'));const row=el('div',undefined,'row between');add(row,el('span',`第 ${index+1} / 10 题`),el('span',`已答 ${answers.filter(x=>x!==null).length} 题`,'small'));app.append(row);const progress=el('progress');progress.max=10;progress.value=answers.filter(x=>x!==null).length;progress.setAttribute('aria-label','答题进度');app.append(progress);title(questions[index][0]);app.append(el('p','按最近4–8周的实际行为选择；没有经历可以跳过。','small'));
questions[index].slice(1).forEach((t,v)=>{const b=btn('',()=>choose(v),'option');add(b,el('span',String(v)),el('div',t));b.setAttribute('aria-pressed',String(answers[index]===v));app.append(b)});const nav=el('div',undefined,'row between');const back=btn('← 上一题',()=>{index--;quiz()});back.disabled=index===0;add(nav,back,btn('不了解／跳过',()=>choose(null)));app.append(nav);if(editing)app.append(btn('返回复核',review));}
function choose(v){if(locked)return;locked=true;answers[index]=v;if(v!==0)delete long[index];document.querySelectorAll('.option').forEach((b,i)=>b.setAttribute('aria-pressed',String(i===v)));setTimeout(()=>{if(editing||index===9)review();else{index++;quiz()}setTimeout(()=>locked=false,180)},140);}
function review(){editing=false;resetView();title('先核对，再看结果');app.append(el('p','跳过不计为0分；答完10题后才给出总分结论。','small'));questions.forEach((q,i)=>{const row=el('div',undefined,'review-row');const box=el('div');add(box,el('div',`${i+1}. ${q[0]}`),el('span',answers[i]===null?'尚未回答':`${answers[i]}分 · ${q[answers[i]+1]}`,'small'));add(row,box,btn('修改',()=>{index=i;editing=true;quiz()}));app.append(row)});
const zeros=[6,7,8].filter(i=>answers[i]===0);if(zeros.length){const card=el('div',undefined,'card');add(card,el('h3','这已经是长期表现吗？'),el('p','只勾选你确认长期为0的项目。一次事件或没有经历，不等于长期为0；不确定就不勾选。','small'));zeros.forEach(i=>{const l=el('label');l.style.display='block';l.style.margin='12px 0';const c=el('input');c.type='checkbox';c.checked=long[i]===true;c.onchange=()=>long[i]=c.checked;add(l,c,document.createTextNode(` 第${i+1}题：${questions[i][1]}，长期如此`));card.append(l)});app.append(card)}const missing=answers.filter(x=>x===null).length;if(missing)app.append(el('p',`还有${missing}题不了解：当前信息不足，不能生成完整分数。`,'notice'));const b=btn('查看本次结果 →',result,'primary wide');b.disabled=missing>0;app.append(b);}
const titles = ['值得加仓', '继续观察', '单边驱动', '及时止损'];
const scoreRanges = ['16–20', '12–15', '8–11', '0–7'];
const plainAdvice = [
  '目前相处不错，可以慢慢多投入一点，比如多安排几次见面。',
  '可以继续约会，先看看对方主动联系、兑现承诺这些表现能不能保持。',
  '先别增加投入。接下来看看联系、约见面和解决问题，是不是大多靠你。',
  '可以先少投入一点，重新想想你还愿不愿意继续接触。'
];
const keyItems = [
  { index: 6, label: '你提需求后，对方会不会调整？' },
  { index: 7, label: '对方忙、累或心情不好时，会不会打个招呼？' },
  { index: 8, label: '有矛盾后，对方会不会回来谈？' }
];

function reportGuide(band) {
  const guide = el('details', undefined, 'card report-guide');
  const ranges = el('ul');
  scoreRanges.forEach((range, i) => {
    const row = el('li');
    const label = `${range}分${i === band ? '（你的分数在这里）' : ''}`;
    add(row, el('strong', label), document.createTextNode(' · ' + plainAdvice[i]));
    ranges.append(row);
  });
  const checks = el('ul');
  keyItems.forEach(({ label }) => checks.append(el('li', label)));
  add(guide, el('summary', '总分和长期提醒怎么看？'),
    el('p', '总分来自10道题，反映你对最近相处的感受和观察。'),
    ranges, el('p', '第7–9题单独看遇到事情时的表现。'), checks,
    el('p', '其中两件事长期都做不到时，先别往长期关系推进，即使总分很高。偶尔一次没做好，不算长期。'));
  return guide;
}

function result() {
  resetView();
  const r = score(answers, long);
  if (!r.complete) return review();
  if (persist) {
    const old = records.find(x => x.id === savedId);
    const entry = {
      id: savedId || crypto.randomUUID(), person, stage,
      time: old ? old.time : Date.now(), answers: [...answers], long: { ...long }
    };
    records = records.filter(x => x.id !== savedId);
    records.push(entry);
    savedId = entry.id;
    saved = true;
    if (!write()) storageError = '保存失败：本次记录只在当前页面保留，刷新后可能丢失。';
  }

  app.append(el('div', `${person} · ${stage}`, 'eyebrow'));
  title(r.hard ? '先暂停长期投入' : titles[r.band]);
  const sc = el('div', undefined, 'score');
  add(sc, document.createTextNode(String(r.sum)), el('small', ' / 20'));
  app.append(sc);
  app.append(el('p', r.hard ? '先别往长期关系推进。你确认了下面这些情况已经持续一段时间：' : plainAdvice[r.band], r.hard ? 'notice' : 'report-lead'));

  const card = el('section', undefined, 'card');
  if (r.hard) {
    const confirmed = el('ul');
    keyItems.filter(({ index }) => answers[index] === 0 && long[index] === true)
      .forEach(({ index, label }) => confirmed.append(el('li', `${label} 你的回答：${questions[index][1]}，长期如此。`)));
    add(card, el('h3', '这次为什么先缓一缓？'), confirmed,
      el('p', '同时遇到两项以上这样的长期问题，测试会优先给出这条提醒。可以先说清一件你在意的事，再看看接下来几次对方有没有实际改变。'));
  } else {
    const zeroItems = keyItems.filter(({ index }) => answers[index] === 0);
    if (zeroItems.length) {
      const observations = el('ul');
      zeroItems.forEach(({ index, label }) => observations.append(el('li', `${label} 你的回答：${questions[index][1]}。`)));
      add(card, el('h3', '接下来留意这几件事'), observations,
        el('p', '其中确认长期如此的不足两项，所以这次没有触发长期提醒。可以再看看这些情况会不会反复出现。'));
    }
  }
  if (card.childElementCount) app.append(card);
  app.append(reportGuide(r.band));
  if (storageError) app.append(el('p', storageError, 'notice'));
  app.append(el('p', persist && saved ? '已加入该对象的复测记录。' : '本次未保存，刷新后清空。', 'small'));
  const nav = el('div', undefined, 'row');
  add(nav, btn('查看答案', review), btn('同一对象再测', home, 'primary'), btn('查看趋势', () => history(person)));
  app.append(nav);
  app.append(el('p', '建议在认识约1个月、3个月、第一次明显矛盾／压力后复测。对照分数变化时，也想想这段时间具体发生了什么。', 'small'));
}
function history(selected){resetView();title('看起点，也看变化');const people=[...new Set(records.map(r=>r.person))];if(!people.length){add(app,el('p','还没有保存的记录。开始前勾选自愿保存，即可积累同一对象的趋势。'),btn('返回首页',home));return;}const p=people.includes(selected)?selected:people[0];const label=el('label','选择观察对象');const s=el('select');people.forEach(x=>{const o=el('option',x);o.value=x;s.append(o)});s.value=p;s.onchange=()=>history(s.value);label.append(s);app.append(label);const list=records.filter(r=>r.person===p).sort((a,b)=>a.time-b.time);const chart=el('div',undefined,'chart');chart.setAttribute('aria-label','历次总分趋势');list.forEach(r=>{const v=score(r.answers,r.long);const w=el('div',undefined,'bar-wrap');const bar=el('div',undefined,'bar');bar.style.height=(v.sum*5+3)+'px';add(w,el('strong',String(v.sum)),bar,el('div',r.stage,'chart-label'));chart.append(w)});app.append(chart);app.append(el('p',list.length<2?'已有1次记录，再测一次后可比较变化。':`历次总分：${list.map(r=>score(r.answers,r.long).sum).join(' → ')}。请结合相处时长与具体事件一起看。`,'small'));list.slice().reverse().forEach(r=>{const v=score(r.answers,r.long);const row=el('div',undefined,'review-row');add(row,el('div',`${new Date(r.time).toLocaleDateString('zh-CN')} · ${r.stage}\n${v.sum}/20 · ${v.hard?'硬规则触发':titles[v.band]}`),btn('删除',()=>{records=records.filter(x=>x.id!==r.id);if(!write())storageError='删除未能保存到浏览器。';history(p)}));app.append(row)});app.append(el('p','记录仅在此浏览器保存365天；不会上传答案，也不会跨设备同步。','small'));add(app,btn('返回首页',home),btn('清除全部记录',()=>{if(confirm('清除所有对象的复测记录？此操作不可撤销。')){records=[];try{localStorage.removeItem(KEY)}catch{storageError='浏览器未允许清除存储。'}home()}}));}
if (window.frameElement?.id === 'rf-heart-check' && window.parent.location.pathname === '/relationship-fit/') {
  home();
} else {
  window.location.replace('/relationship-fit/');
}
