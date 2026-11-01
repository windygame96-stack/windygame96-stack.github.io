(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('./routes-data.js'),require('./fortune-data.js'));else root.Game=factory(root.Routes,root.Fortunes)})(typeof globalThis!=='undefined'?globalThis:this,function(Routes,Fortunes){
'use strict';
const NAMES=['赵公明','萧升','曹宝','陈九公','姚少司'];
const COSTS={temple:[0,100,180],tea:[0,120,210],treasure:[160,180,260]};
function fresh(){return {version:2,route:0,routeChosen:false,day:1,cash:220,debt:300,incense:0,reputation:0,independent:10,love:[0,0,0,0,0],trust:[0,0,0,0,0],buildings:{temple:{level:1,value:100},tea:{level:1,value:120},treasure:{level:0,value:0}},flags:[],history:[],ledger:[{day:1,label:'接手庙宇',cash:220,debt:300,book:220,net:140,delta:220}],days:[],daily:daily(),memory:{wishes:[],offerings:[],tiger:0,games:[0,0,0,0,0],luck:{stay:0,swap:0,rounds:0},knowledge:[]},story:[],ending:null,relationship:null,seed:Math.floor(Math.random()*2147483646)+1};}
function daily(){return {collected:false,prayed:false,offered:false,signed:false,order:false,story:false,collab:-1,rewards:[],wish:null};}
function assets(s){return s.cash+Object.values(s.buildings).reduce((a,b)=>a+b.value,0)-s.debt;}
function rand(s){s.seed=s.seed*16807%2147483647;return (s.seed-1)/2147483646;}
function log(s,label,delta=0){s.ledger.push({day:s.day,label,cash:s.cash,debt:s.debt,book:Object.values(s.buildings).reduce((a,b)=>a+b.value,0),net:assets(s),delta});}
function change(s,k,n){s[k]=Math.max(0,Math.min(100,s[k]+n));}
function bond(s,g,l,t){s.love[g]=Math.max(0,Math.min(100,s.love[g]+l));s.trust[g]=Math.max(0,Math.min(100,s.trust[g]+t));}
function flag(s,x){if(!s.flags.includes(x))s.flags.push(x)}
function income(s){let b=s.buildings,t=b.temple.level*20,tea=b.tea.level*80,treasure=b.treasure.level*110,bonus=Math.min(30,s.incense),cost=25+b.tea.level*20+b.treasure.level*30,collab=0;if(s.daily.collab===1&&b.treasure.level)collab=30;if(s.daily.collab===2)collab=Math.floor((tea+treasure)*.2);if(s.daily.collab===3)collab=25;if(s.daily.collab===4)collab=20;if(b.treasure.level&&s.memory.knowledge.length)collab+=15;if(b.treasure.level){const finds=new Set((s.memory.treasureFinds||[]).filter(x=>['jade-pendant','gold-box','porcelain-vase'].includes(x.art)).map(x=>x.art));collab+=Math.min(3,finds.size)*5}let blessing=s.daily.wish==='求财'?20:0;return {temple:t,tea,treasure,incense:bonus,cost,collab,blessing,net:t+tea+treasure+bonus+collab+blessing-cost};}
function routeOf(s){return Number.isInteger(s?.route)&&s.route>=0&&s.route<=4?s.route:0;}
function getStory(s,day=s.day){return day===1||routeOf(s)===0?STORY[day-1]:Routes[routeOf(s)].chapters[day-2];}
function canChooseRoute(s){return s.day<=2&&!s.story.some(x=>x.day>=2);}
function orderGod(s){if(s.routeChosen||!canChooseRoute(s))return routeOf(s);let g=s.daily.collab;return Number.isInteger(g)&&g>=0&&g<5?g:null;}
function endingGod(id){let e=ENDINGS[id];return e&&Number.isInteger(e.g)?e.g:0;}
function ending(s){let rich=s.debt===0&&assets(s)>=900&&s.independent>=65&&s.flags.includes('truth'),g=routeOf(s);if(s.relationship==='friend')return rich?'sixth':'business';let good=s.relationship==='romance'&&s.trust[g]>=50&&s.love[g]>=55&&s.flags.includes('truth')&&!s.flags.includes('betray')&&(g===0||s.flags.includes('route_'+g+'_honest'));if(g===0)return good?(rich?'double':'he'):'be';return Routes[g].endings[good?(rich?'double':'he'):'be'];}

function forecastReward(count){let n=Number.isInteger(count)?Math.max(0,Math.min(3,count)):0;return {correct:n,cash:10+5*n,love:2+n,trust:2+n,independent:n}}
function deliveryReward(count){let n=Number.isInteger(count)?Math.max(0,Math.min(8,count)):0;return {count:n,cash:10+3*n,love:n,trust:n,independent:Math.floor(n/2)}}
function act(s,type,p={}){if(s.ending)return {ok:false,text:'七日已经结束，可以回顾或重新开始。'};let msg='',d=s.daily;switch(type){
case 'chooseRoute':if(!canChooseRoute(s))return {ok:false,text:'本周同行已在第二夜确定，可以重开体验其他路线。'};if(!Number.isInteger(p.g)||p.g<0||p.g>4)return {ok:false,text:'请选择一位同行者。'};s.route=p.g;s.routeChosen=true;if(s.presentation)s.presentation.vn=null;msg='本周与'+NAMES[p.g]+'同行，商业协作仍可任选五位。';break;
case 'collab':if(d.collected)return {ok:false,text:'今日收益已结算，明天可重新安排协作。'};if(!Number.isInteger(p.g)||p.g<0||p.g>4)return {ok:false,text:'请选择财神。'};d.collab=p.g;msg=NAMES[p.g]+'已安排协作；与恋爱进度无关。';break;
case 'collect':if(d.collected)return {ok:false,text:'今日收益已经领取。'};let inc=income(s);s.cash+=inc.net;d.collected=true;log(s,'店铺结算（收入 '+(inc.net+inc.cost)+' / 成本 '+inc.cost+'）',inc.net);let r=rand(s),event=r<.25?(d.collab===0?0:-15):r<.55?20:0;if(event){s.cash+=event;log(s,event>0?'商机：街坊追加小单':'商事：雨天货损',event)}d.event=r<.25?(d.collab===0?'雨天货损被赵公明提前拦下，未造成损失。':'雨天货损 -15 元宝。'):r<.55?'街坊追加小单，额外 +20 元宝。':'今日经营平稳，无额外收支。';msg='今日净收入 +'+inc.net+' 元宝（已扣日常成本 '+inc.cost+'）。';break;
case 'upgrade':{let b=s.buildings[p.key],cost=b&&COSTS[p.key][b.level];if(!b||b.level>=3)return {ok:false,text:'建筑已达到 Demo 最高等级。'};if(s.cash<cost)return {ok:false,text:'元宝不足，需要 '+cost+'。'};s.cash-=cost;b.level++;b.value+=cost;log(s,({temple:'庙宇',tea:'茶楼',treasure:'珍宝阁'})[p.key]+'建设',-cost);msg='建设完成，现金 -'+cost+'，建筑账面价值 +'+cost+'；净资产不变。';break;}
case 'repay':{let n=Math.min(s.debt,s.cash,p.amount||s.debt);if(n<=0)return {ok:false,text:s.debt?'暂时没有可还款的现金。':'债务已经清偿。'};s.cash-=n;s.debt-=n;log(s,'偿还债务',-n);msg='已还债 '+n+'，剩余债务 '+s.debt+'。';break;}
case 'pray':{if(d.prayed)return {ok:false,text:'今日已上香，可以明日再来。'};if(!Number.isInteger(p.g)||p.g<0||p.g>4||!['求财','事业','姻缘'].includes(p.wish))return {ok:false,text:'请选择财神与心愿。'};d.prayed=true;d.wish=p.wish;s.incense+=10;s.memory.wishes.push({day:s.day,g:p.g,wish:p.wish});bond(s,p.g,p.wish==='姻缘'?3:1,2);if(p.wish==='事业')change(s,'independent',3);msg='香火 +10，'+NAMES[p.g]+'记住了你今日的「'+p.wish+'」。'+(p.wish==='求财'?'当日收益额外 +20（领取前生效）。':'');break;}
case 'offer':if(d.offered)return {ok:false,text:'今日供品已经摆好。'};if(s.cash<10)return {ok:false,text:'供品需要 10 元宝，可先经营或直接推进剧情。'};if(!Number.isInteger(p.g)||p.g<0||p.g>4||!['茶','水果','糕点'].includes(p.item))return {ok:false,text:'请选择供品。'};s.cash-=10;s.incense+=8;d.offered=true;s.memory.offerings.push({day:s.day,g:p.g,item:p.item});bond(s,p.g,2,2);log(s,'供奉 '+p.item,-10);msg='供奉完成：元宝 -10、香火 +8、好感 +2、信任 +2。';break;
case 'sign':{if(d.signed)return {ok:false,text:'今日签文已收在背包。'};let seen=new Set(s.history.filter(x=>x.type==='sign').map(x=>x.value)),pool=Fortunes.map((_,i)=>i).filter(i=>!seen.has(i));if(!pool.length)pool=Fortunes.map((_,i)=>i);let sign=pool[Math.floor(rand(s)*pool.length)];d.signed=true;s.history.push({day:s.day,type:'sign',value:sign,g:Number.isInteger(p.g)&&p.g>=0&&p.g<5?p.g:routeOf(s)});msg='抽到「'+Fortunes[sign].title+'」，已收进背包。';break;}
case 'order':{if(d.order)return {ok:false,text:'今日委托已完成。'};let kinds={safe:{cost:40,income:100},risk:{cost:80,income:0},investigate:{cost:60,income:150}},o=kinds[p.kind];if(!o)return {ok:false,text:'委托不存在。'};if(s.cash<o.cost)return {ok:false,text:'启动资金不足；可以先领取店铺收益。'};let gain=o.income;if(p.kind==='risk'){let success=rand(s)<.6;gain=success?190:(d.collab===0?70:20);msg=success?'商队顺利到达。':'商队遇雨，'+(d.collab===0?'赵公明止损，收回 70 元宝。':'仅收回 20 元宝。');change(s,'independent',1);}else{change(s,'independent',p.kind==='investigate'?8:3);change(s,'reputation',4);if(p.kind==='investigate'){let g=orderGod(s);if(g!==null){bond(s,g,2,4);msg=NAMES[g]+'好感 +2、信任 +4。'}else msg='尚未选择同行者或安排协作，本次仅结算经营奖励。';flag(s,'investigated')}}s.cash+=gain-o.cost;d.order=true;log(s,'委托 '+({safe:'茶会订单',risk:'黄金商队',investigate:'调查并谈判'})[p.kind]+'（支出 '+o.cost+' / 回款 '+gain+'）',gain-o.cost);msg+=' 委托结算：支出 '+o.cost+'，回款 '+gain+'，净变化 '+(gain-o.cost)+'。';break;}
case 'game':{let g=p.g;if(!Number.isInteger(g)||g<0||g>4)return {ok:false,text:'小游戏不存在。'};s.memory.games[g]++;if(g===0)s.memory.tiger+=p.win?3:1;if(g===1&&p.win&&!p.skipKnowledge&&Number.isInteger(p.card)&&p.card>=0&&p.card<2&&!s.memory.knowledge.includes(p.card))s.memory.knowledge.push(p.card);if(g===4&&p.experiment){s.memory.luck.rounds+=p.experiment.rounds;s.memory.luck.stay+=p.experiment.stay;s.memory.luck.swap+=p.experiment.swap;}if(d.rewards.includes(g)){msg='练习完成。今日该角色奖励已领，重复游玩不再增加经济奖励。';break;}d.rewards.push(g);let r=g===3&&Object.prototype.hasOwnProperty.call(p,'deliveryCount')?deliveryReward(p.deliveryCount):g===2&&Object.prototype.hasOwnProperty.call(p,'forecastCorrect')?forecastReward(p.forecastCorrect):{cash:p.win?25:10,love:p.win?5:2,trust:p.win?4:2,independent:p.win?2:0};s.cash+=r.cash;bond(s,g,r.love,r.trust);change(s,'independent',r.independent);log(s,NAMES[g]+'互动奖励',r.cash);msg=(r.correct!==undefined?'商品合约猜中 '+r.correct+' 次':r.count!==undefined?'送达 '+r.count+' / 8 户':p.win?'互动成功':'完成练习')+'：元宝 +'+r.cash+'、好感 +'+r.love+'、信任 +'+r.trust+'、独立 +'+r.independent+'。';break;}
case 'story':{if(d.story)return {ok:false,text:'今日剧情已经读完。'};let chapter=getStory(s),g=s.day===1?0:routeOf(s),choice=chapter.choices[p.choice];if(!choice)return {ok:false,text:'选择不存在。'};d.story=true;bond(s,g,choice.l,choice.t);change(s,'independent',choice.i||0);if(choice.flag)flag(s,choice.flag);if(choice.flags)choice.flags.forEach(f=>flag(s,f));if(s.day===7)s.relationship=p.choice===0?'romance':p.choice===1?'friend':'leave';s.story.push({day:s.day,g,choice:p.choice,title:chapter.title,response:choice.response});msg=choice.response;break;}
case 'next':if(!d.story)return {ok:false,text:'先读完今夜剧情，再结束这一天。'};s.days.push({day:s.day,cash:s.cash,debt:s.debt,net:assets(s),independent:s.independent,collected:d.collected,order:d.order});if(s.day===7){s.ending=ending(s);msg='七日之约已完成。';}else{s.day++;s.daily=daily();msg='第 '+s.day+' 日，财神庙又迎来新的早晨。';}break;
default:return {ok:false,text:'未知操作。'};
}return {ok:true,text:msg};}
const STORY=[
  {
    "title": "我来求财，财神给我排班",
    "place": "序幕 · 雨夜财神庙",
    "text": "旁白：工资到账，房租扣走。你把手机翻过来，免得余额和电量一起刺激你。\n你：财神爷，求财。最好今天到账，我不介意加急。\n旁白：你抱着茶铺计划进庙躲雨。供桌旁，一只黑虎叼走了最后半块饼。\n你：这庙真养虎？那我跪的是财神，还是它的饭票？\n赵公明：别跑。它嘴里有饼，顾不上你。站这边。\n旁白：黑衣男子从神像边走下来。金冠威严，衣袍华贵，手里端着一个接雨的铜盆。\n你：这是招财法器？\n赵公明：铜盆。接雨的。\n萧升：起初也接钱。后来发现，水来得更稳定。\n你：你们这里，财神在岗吗？\n赵公明：本君便是。\n旁白：你看了看神像，又看了看盆。决定暂时不追问神仙的住宿条件。\n曹宝：雨没停，先坐。顺便看一页账，不收你咨询钱。\n你：我来求财，你给我看账？\n曹宝：现钱二百二十元宝，旧欠三百，一间还能开门的茶楼。我们缺位会经营的庙主。\n你：五位财神，能不能先保佑一下自己？\n萧升：保过。今天第一个进门的就是你。\n你：原来我才是你们求来的财？\n曹宝：还不能入账。得看你愿不愿意。\n陈九公：你会做茶？我会跑街坊！你管开店，我管找客人，货我也能送！\n你：发工钱也归你？\n陈九公：这个归曹宝。我平时负责跑，还不太会问钱。\n你：听出来了，你们确实缺个我。\n姚少司：我替你抽了一签，今日宜合作。\n你：其他签呢？\n旁白：他把几支签倒出来。宜坐下聊聊，宜先别走。最后一支写着宜吃饭。\n你：你这签筒，跟招工告示有什么区别？\n姚少司：能管饭。选最后一支，我就去拿碗。\n赵公明：旧债由庙里还。报酬、分账、退出办法写清，不动你人间家用。先看条件，再答应。\n你：那你负责什么？\n赵公明：修庙，守钱，处理找上门的麻烦。\n旁白：屋顶又漏下一串水。他面不改色，把盆接了回去。\n萧升：还有这一项，已经很熟练了。\n你：我想开自己的茶铺，手头钱不够。你们有铺子，我有手艺。可以谈，但别把我也算进固定资产。\n曹宝：工钱单列。我负责盯账，你也可以盯我。\n赵公明：七日后交经营账，庙能否继续开，就看这几日。主意由你拿，后果一起担。\n旁白：你坐回桌边，把刚插好的香往外拔了一点。\n你：最后问一句，这支能报销吗？我还没入职，就先倒贴了。",
    "choices": [
      {
        "label": "先看契约，香钱也要问清楚",
        "l": 8,
        "t": 10,
        "i": 8,
        "response": "工钱、分账写好。香钱问问，能报最好，不能报也别拿旧债糊弄我。 准。你敢当面问，倒省得本君以后猜。 他把钥匙放到你面前。曹宝另取一张纸，认真写下香一支。",
        "replyFrames": [
          {
            "who": "你",
            "text": "工钱、分账写好。香钱问问，能报最好，不能报也别拿旧债糊弄我。",
            "g": null,
            "mood": ""
          },
          {
            "who": "赵公明",
            "text": "准。你敢当面问，倒省得本君以后猜。",
            "g": 0,
            "mood": ""
          },
          {
            "who": "旁白",
            "text": "他把钥匙放到你面前。曹宝另取一张纸，认真写下香一支。",
            "g": 0,
            "mood": ""
          }
        ]
      },
      {
        "label": "先坐下吃饭，契约等我缓口气再看",
        "l": 2,
        "t": 0,
        "i": 0,
        "response": "先吃。饿着看账，我容易把零看成肉丸，做出不理智的决定。 饭可以先吃，名字明日看清再签。契约不给你塞碗底。 你护住自己的碗，五位财神终于找到一件不必开会就能办的事。",
        "replyFrames": [
          {
            "who": "你",
            "text": "先吃。饿着看账，我容易把零看成肉丸，做出不理智的决定。",
            "g": null,
            "mood": ""
          },
          {
            "who": "赵公明",
            "text": "饭可以先吃，名字明日看清再签。契约不给你塞碗底。",
            "g": 0,
            "mood": ""
          },
          {
            "who": "旁白",
            "text": "你护住自己的碗，五位财神终于找到一件不必开会就能办的事。",
            "g": 0,
            "mood": ""
          }
        ]
      }
    ],
    "frames": [
      {
        "who": "旁白",
        "text": "工资到账，房租扣走。你把手机翻过来，免得余额和电量一起刺激你。",
        "g": null,
        "mood": "",
        "hideGod": true
      },
      {
        "who": "你",
        "text": "财神爷，求财。最好今天到账，我不介意加急。",
        "g": null,
        "mood": "",
        "hideGod": true
      },
      {
        "who": "旁白",
        "text": "你抱着茶铺计划进庙躲雨。供桌旁，一只黑虎叼走了最后半块饼。",
        "g": null,
        "mood": "",
        "hideGod": true
      },
      {
        "who": "你",
        "text": "这庙真养虎？那我跪的是财神，还是它的饭票？",
        "g": null,
        "mood": "",
        "hideGod": true
      },
      {
        "who": "赵公明",
        "text": "别跑。它嘴里有饼，顾不上你。站这边。",
        "g": 0,
        "mood": "沉声制止"
      },
      {
        "who": "旁白",
        "text": "黑衣男子从神像边走下来。金冠威严，衣袍华贵，手里端着一个接雨的铜盆。",
        "g": 0,
        "mood": ""
      },
      {
        "who": "你",
        "text": "这是招财法器？",
        "g": null,
        "mood": ""
      },
      {
        "who": "赵公明",
        "text": "铜盆。接雨的。",
        "g": 0,
        "mood": ""
      },
      {
        "who": "萧升",
        "text": "起初也接钱。后来发现，水来得更稳定。",
        "g": 1,
        "mood": ""
      },
      {
        "who": "你",
        "text": "你们这里，财神在岗吗？",
        "g": null,
        "mood": ""
      },
      {
        "who": "赵公明",
        "text": "本君便是。",
        "g": 0,
        "mood": ""
      },
      {
        "who": "旁白",
        "text": "你看了看神像，又看了看盆。决定暂时不追问神仙的住宿条件。",
        "g": 0,
        "mood": ""
      },
      {
        "who": "曹宝",
        "text": "雨没停，先坐。顺便看一页账，不收你咨询钱。",
        "g": 2,
        "mood": ""
      },
      {
        "who": "你",
        "text": "我来求财，你给我看账？",
        "g": null,
        "mood": ""
      },
      {
        "who": "曹宝",
        "text": "现钱二百二十元宝，旧欠三百，一间还能开门的茶楼。我们缺位会经营的庙主。",
        "g": 2,
        "mood": ""
      },
      {
        "who": "你",
        "text": "五位财神，能不能先保佑一下自己？",
        "g": null,
        "mood": ""
      },
      {
        "who": "萧升",
        "text": "保过。今天第一个进门的就是你。",
        "g": 1,
        "mood": ""
      },
      {
        "who": "你",
        "text": "原来我才是你们求来的财？",
        "g": null,
        "mood": ""
      },
      {
        "who": "曹宝",
        "text": "还不能入账。得看你愿不愿意。",
        "g": 2,
        "mood": ""
      },
      {
        "who": "陈九公",
        "text": "你会做茶？我会跑街坊！你管开店，我管找客人，货我也能送！",
        "g": 3,
        "mood": ""
      },
      {
        "who": "你",
        "text": "发工钱也归你？",
        "g": null,
        "mood": ""
      },
      {
        "who": "陈九公",
        "text": "这个归曹宝。我平时负责跑，还不太会问钱。",
        "g": 3,
        "mood": ""
      },
      {
        "who": "你",
        "text": "听出来了，你们确实缺个我。",
        "g": null,
        "mood": ""
      },
      {
        "who": "姚少司",
        "text": "我替你抽了一签，今日宜合作。",
        "g": 4,
        "mood": ""
      },
      {
        "who": "你",
        "text": "其他签呢？",
        "g": null,
        "mood": ""
      },
      {
        "who": "旁白",
        "text": "他把几支签倒出来。宜坐下聊聊，宜先别走。最后一支写着宜吃饭。",
        "g": 4,
        "mood": ""
      },
      {
        "who": "你",
        "text": "你这签筒，跟招工告示有什么区别？",
        "g": null,
        "mood": ""
      },
      {
        "who": "姚少司",
        "text": "能管饭。选最后一支，我就去拿碗。",
        "g": 4,
        "mood": ""
      },
      {
        "who": "赵公明",
        "text": "旧债由庙里还。报酬、分账、退出办法写清，不动你人间家用。先看条件，再答应。",
        "g": 0,
        "mood": ""
      },
      {
        "who": "你",
        "text": "那你负责什么？",
        "g": null,
        "mood": ""
      },
      {
        "who": "赵公明",
        "text": "修庙，守钱，处理找上门的麻烦。",
        "g": 0,
        "mood": ""
      },
      {
        "who": "旁白",
        "text": "屋顶又漏下一串水。他面不改色，把盆接了回去。",
        "g": 0,
        "mood": ""
      },
      {
        "who": "萧升",
        "text": "还有这一项，已经很熟练了。",
        "g": 1,
        "mood": ""
      },
      {
        "who": "你",
        "text": "我想开自己的茶铺，手头钱不够。你们有铺子，我有手艺。可以谈，但别把我也算进固定资产。",
        "g": null,
        "mood": ""
      },
      {
        "who": "曹宝",
        "text": "工钱单列。我负责盯账，你也可以盯我。",
        "g": 2,
        "mood": ""
      },
      {
        "who": "赵公明",
        "text": "七日后交经营账，庙能否继续开，就看这几日。主意由你拿，后果一起担。",
        "g": 0,
        "mood": ""
      },
      {
        "who": "旁白",
        "text": "你坐回桌边，把刚插好的香往外拔了一点。",
        "g": 0,
        "mood": ""
      },
      {
        "who": "你",
        "text": "最后问一句，这支能报销吗？我还没入职，就先倒贴了。",
        "g": null,
        "mood": ""
      }
    ]
  },
  {
    "title": "客人进门要过几道关",
    "place": "第二夜 · 茶楼账房",
    "text": "旁白：茶楼开门，赵公明贴出三张告示。防烫、防滑、防碰虎。门口又摆了一条绳。\n你：这是喝茶，还是过关领赏？\n赵公明：热水烫人，台阶积水，黑虎尚未习惯客流。该防的都得防。\n旁白：一个客人看完，转身走了。你伸手挽留，他说自己只是想喝杯茶，没带遗书。\n你：你的告示，比对面铺子的招牌都醒目。\n赵公明：那便说明看见了。\n你：也看见回家的路了。绳留在湿地边，热壶放柜后，黑虎交给我。客人不用入店先背三张纸。\n赵公明：你守得住？\n你：我在这儿做事。出问题先叫停，不会拿客人练胆。你也不必同时当门神、伙计和虎的家长。\n旁白：他拆下两张告示，只留下湿地提示，又去检查了一遍壶盖。\n赵公明：本君在旁边。你先试。\n旁白：第一桌客人顺利落座，黑虎也顺利趴下。只有你看着钱匣，没顺利忍住笑。\n你：赚了！明天把新茶具买齐，剩下贴个金招牌！\n赵公明：茶叶、炭、工钱，尚未付。\n你：我刚让客人自由了，钱就不自由了。\n赵公明：本君方才替客人想得太多。你眼下，替这些钱想得太远。\n旁白：你们把未付的单子摆在一起。他坐下来，把笔交给你，没有再替你写。",
    "choices": [
      {
        "label": "先留成本，新茶具只买缺的",
        "l": 10,
        "t": 8,
        "i": 3,
        "response": "金招牌先住我脑子里，那里暂时不收租。 可以。明日这扇门，仍由你开。本君不再摆那条绳。",
        "replyFrames": [
          {
            "who": "你",
            "text": "金招牌先住我脑子里，那里暂时不收租。",
            "g": null,
            "mood": ""
          },
          {
            "who": "赵公明",
            "text": "可以。明日这扇门，仍由你开。本君不再摆那条绳。",
            "g": 0,
            "mood": ""
          }
        ]
      },
      {
        "label": "先列满愿望单，今晚不肯放过一个漂亮杯子",
        "l": 0,
        "t": 5,
        "i": 5,
        "response": "单先写，钱先不动。你让我对着这些杯子高兴一会儿。 写得下便写。若写到伙计的工钱，本君会把纸翻过去。 你在最后一栏写下今日快乐，暂不付款。",
        "replyFrames": [
          {
            "who": "你",
            "text": "单先写，钱先不动。你让我对着这些杯子高兴一会儿。",
            "g": null,
            "mood": ""
          },
          {
            "who": "赵公明",
            "text": "写得下便写。若写到伙计的工钱，本君会把纸翻过去。",
            "g": 0,
            "mood": ""
          },
          {
            "who": "旁白",
            "text": "你在最后一栏写下今日快乐，暂不付款。",
            "g": 0,
            "mood": ""
          }
        ]
      }
    ],
    "frames": [
      {
        "who": "旁白",
        "text": "茶楼开门，赵公明贴出三张告示。防烫、防滑、防碰虎。门口又摆了一条绳。",
        "g": 0,
        "mood": ""
      },
      {
        "who": "你",
        "text": "这是喝茶，还是过关领赏？",
        "g": null,
        "mood": ""
      },
      {
        "who": "赵公明",
        "text": "热水烫人，台阶积水，黑虎尚未习惯客流。该防的都得防。",
        "g": 0,
        "mood": ""
      },
      {
        "who": "旁白",
        "text": "一个客人看完，转身走了。你伸手挽留，他说自己只是想喝杯茶，没带遗书。",
        "g": 0,
        "mood": ""
      },
      {
        "who": "你",
        "text": "你的告示，比对面铺子的招牌都醒目。",
        "g": null,
        "mood": ""
      },
      {
        "who": "赵公明",
        "text": "那便说明看见了。",
        "g": 0,
        "mood": ""
      },
      {
        "who": "你",
        "text": "也看见回家的路了。绳留在湿地边，热壶放柜后，黑虎交给我。客人不用入店先背三张纸。",
        "g": null,
        "mood": ""
      },
      {
        "who": "赵公明",
        "text": "你守得住？",
        "g": 0,
        "mood": ""
      },
      {
        "who": "你",
        "text": "我在这儿做事。出问题先叫停，不会拿客人练胆。你也不必同时当门神、伙计和虎的家长。",
        "g": null,
        "mood": ""
      },
      {
        "who": "旁白",
        "text": "他拆下两张告示，只留下湿地提示，又去检查了一遍壶盖。",
        "g": 0,
        "mood": ""
      },
      {
        "who": "赵公明",
        "text": "本君在旁边。你先试。",
        "g": 0,
        "mood": ""
      },
      {
        "who": "旁白",
        "text": "第一桌客人顺利落座，黑虎也顺利趴下。只有你看着钱匣，没顺利忍住笑。",
        "g": 0,
        "mood": ""
      },
      {
        "who": "你",
        "text": "赚了！明天把新茶具买齐，剩下贴个金招牌！",
        "g": null,
        "mood": ""
      },
      {
        "who": "赵公明",
        "text": "茶叶、炭、工钱，尚未付。",
        "g": 0,
        "mood": ""
      },
      {
        "who": "你",
        "text": "我刚让客人自由了，钱就不自由了。",
        "g": null,
        "mood": ""
      },
      {
        "who": "赵公明",
        "text": "本君方才替客人想得太多。你眼下，替这些钱想得太远。",
        "g": 0,
        "mood": ""
      },
      {
        "who": "旁白",
        "text": "你们把未付的单子摆在一起。他坐下来，把笔交给你，没有再替你写。",
        "g": 0,
        "mood": ""
      }
    ]
  },
  {
    "title": "财神没收了我的发财机会",
    "place": "第三夜 · 人间集市",
    "text": "旁白：修瓦报价一出来，你准备把屋顶改名为碎银顶，毕竟每片都在碎你的银子。\n旁白：赵公明直接圈了整排旧瓦，又要顺手把旁边两根梁换掉。\n你：先等等，我们修的是漏雨，还是想让这座庙百年免检？\n赵公明：既然发现了隐患，便该一次处理。\n你：瓦匠能一次做完，钱袋不能。先修会漏到客人的地方，其余记下日期，别全压今天。\n旁白：他握着笔没落下。你把报价拆成三张，拉他逐处看。\n赵公明：本君习惯先替人挡完。\n你：我知道。可你把所有事都挡在自己身上，我只能负责站旁边喊加油，那工钱我拿得有点心虚。\n旁白：他终于在第一张上点头。你却被街边彩头摊的锣声勾走了眼睛。\n你：那边说差一点就中大奖。要是补上这笔瓦钱，我今天能多爱这座庙一点。\n赵公明：方才替本君拆报价的人，现在想把整袋钱交给一面锣？\n你：我脑子在两边上班，意见暂时没统一。\n旁白：你刚才用闲钱玩过一次，停得还不太甘心。他没有抢钱袋，只站在摊外等你。\n赵公明：修瓦可以分步，输掉的钱不认你这套安排。你出来，本君陪你找瓦匠。\n你：你肯分步了？\n赵公明：肯。你也把那句再来一次，留在这里。",
    "choices": [
      {
        "label": "离开彩头摊，拿分批报价去谈修缮",
        "l": 8,
        "t": 12,
        "i": 10,
        "flag": "evidence",
        "response": "走。少押一次，今天先靠自己的脚给钱袋积德。 那本君跟着。报价你来问，别又只让本君一个人开口。",
        "replyFrames": [
          {
            "who": "你",
            "text": "走。少押一次，今天先靠自己的脚给钱袋积德。",
            "g": null,
            "mood": ""
          },
          {
            "who": "赵公明",
            "text": "那本君跟着。报价你来问，别又只让本君一个人开口。",
            "g": 0,
            "mood": ""
          }
        ]
      },
      {
        "label": "还舍不得那次差一点，站着犹豫",
        "l": 2,
        "t": -10,
        "i": 0,
        "response": "我知道该走，腿还想留一会儿。你别替我付，也别说我下一次能中。 本君不会替那面锣担保。等你把脚收回来，再一起走。 锣又响了，你低头按紧钱袋。今日还有一段路得自己迈。",
        "replyFrames": [
          {
            "who": "你",
            "text": "我知道该走，腿还想留一会儿。你别替我付，也别说我下一次能中。",
            "g": null,
            "mood": ""
          },
          {
            "who": "赵公明",
            "text": "本君不会替那面锣担保。等你把脚收回来，再一起走。",
            "g": 0,
            "mood": ""
          },
          {
            "who": "旁白",
            "text": "锣又响了，你低头按紧钱袋。今日还有一段路得自己迈。",
            "g": 0,
            "mood": ""
          }
        ]
      }
    ],
    "frames": [
      {
        "who": "旁白",
        "text": "修瓦报价一出来，你准备把屋顶改名为碎银顶，毕竟每片都在碎你的银子。",
        "g": 0,
        "mood": ""
      },
      {
        "who": "旁白",
        "text": "赵公明直接圈了整排旧瓦，又要顺手把旁边两根梁换掉。",
        "g": 0,
        "mood": ""
      },
      {
        "who": "你",
        "text": "先等等，我们修的是漏雨，还是想让这座庙百年免检？",
        "g": null,
        "mood": ""
      },
      {
        "who": "赵公明",
        "text": "既然发现了隐患，便该一次处理。",
        "g": 0,
        "mood": ""
      },
      {
        "who": "你",
        "text": "瓦匠能一次做完，钱袋不能。先修会漏到客人的地方，其余记下日期，别全压今天。",
        "g": null,
        "mood": ""
      },
      {
        "who": "旁白",
        "text": "他握着笔没落下。你把报价拆成三张，拉他逐处看。",
        "g": 0,
        "mood": ""
      },
      {
        "who": "赵公明",
        "text": "本君习惯先替人挡完。",
        "g": 0,
        "mood": ""
      },
      {
        "who": "你",
        "text": "我知道。可你把所有事都挡在自己身上，我只能负责站旁边喊加油，那工钱我拿得有点心虚。",
        "g": null,
        "mood": ""
      },
      {
        "who": "旁白",
        "text": "他终于在第一张上点头。你却被街边彩头摊的锣声勾走了眼睛。",
        "g": 0,
        "mood": ""
      },
      {
        "who": "你",
        "text": "那边说差一点就中大奖。要是补上这笔瓦钱，我今天能多爱这座庙一点。",
        "g": null,
        "mood": ""
      },
      {
        "who": "赵公明",
        "text": "方才替本君拆报价的人，现在想把整袋钱交给一面锣？",
        "g": 0,
        "mood": ""
      },
      {
        "who": "你",
        "text": "我脑子在两边上班，意见暂时没统一。",
        "g": null,
        "mood": ""
      },
      {
        "who": "旁白",
        "text": "你刚才用闲钱玩过一次，停得还不太甘心。他没有抢钱袋，只站在摊外等你。",
        "g": 0,
        "mood": ""
      },
      {
        "who": "赵公明",
        "text": "修瓦可以分步，输掉的钱不认你这套安排。你出来，本君陪你找瓦匠。",
        "g": 0,
        "mood": ""
      },
      {
        "who": "你",
        "text": "你肯分步了？",
        "g": null,
        "mood": ""
      },
      {
        "who": "赵公明",
        "text": "肯。你也把那句再来一次，留在这里。",
        "g": 0,
        "mood": ""
      }
    ]
  },
  {
    "title": "假财神保证我发财",
    "place": "第四夜 · 茶楼账房",
    "text": "旁白：一位商贩送来招财担保单，盖着玄坛旧印。你看中可退的小额样单，付过钱才来核来源。\n你：这单保证客似云来。我本来想问，云来以后喝不喝茶，光站着也占桌子。\n赵公明：停用的旧印。单据给本君，后续先停。\n旁白：他抬手要取走全部材料，又准备独自出门。\n你：把我也带上。我付过样单钱，来往话是我听的，你连证人都想自己兼任？\n赵公明：旧印出自本司，是本君的责任。\n你：你查印，我写收款时间。谁的错记谁的，别一出事就把我从桌上搬走。我还没领那种不用干活的工钱。\n旁白：他停在门边，重新坐回你身旁。你们把宣传、收据和问题列成三栏。\n你：样单钱也写。我贪那个客似云来，给自己买了堂识字课，不能拿客人的钱补学费。\n赵公明：本君会署名说明旧印停用。钱能追回多少，要查，不能先答应。\n你：行。以后客人问保证发财吗，我就请他看看我们屋顶。\n旁白：他本想维持严肃，目光却被你桌边的接雨盆带歪了一瞬。\n赵公明：这句，倒足够有凭有据。\n你：你看，我还能帮你说实话，便宜又耐用。\n赵公明：本君听见了。下回有事，会先同你商量。",
    "choices": [
      {
        "label": "一起留证据、说明旧印问题，承担各自责任",
        "l": 10,
        "t": 15,
        "i": 12,
        "flag": "truth",
        "response": "样单钱记我经手，印的问题记你核查。谁也别替谁把错藏进袖子。 好。今晚这份说明，你我一同署名。",
        "replyFrames": [
          {
            "who": "你",
            "text": "样单钱记我经手，印的问题记你核查。谁也别替谁把错藏进袖子。",
            "g": null,
            "mood": ""
          },
          {
            "who": "赵公明",
            "text": "好。今晚这份说明，你我一同署名。",
            "g": 0,
            "mood": ""
          }
        ]
      },
      {
        "label": "先停合作，各自把经手的问题处理清",
        "l": -8,
        "t": -20,
        "i": -5,
        "flag": "betray",
        "response": "我会如实退掉这单，也说明我付过样单钱。但现在不想联名，我得先想清楚还信不信这套办事方式。 可以。本君仍会查旧印，你该拿的材料和报酬，一样不扣。 两份单据分开放着。事情照样处理，你们暂时没能坐到一张纸前。",
        "replyFrames": [
          {
            "who": "你",
            "text": "我会如实退掉这单，也说明我付过样单钱。但现在不想联名，我得先想清楚还信不信这套办事方式。",
            "g": null,
            "mood": ""
          },
          {
            "who": "赵公明",
            "text": "可以。本君仍会查旧印，你该拿的材料和报酬，一样不扣。",
            "g": 0,
            "mood": ""
          },
          {
            "who": "旁白",
            "text": "两份单据分开放着。事情照样处理，你们暂时没能坐到一张纸前。",
            "g": 0,
            "mood": ""
          }
        ]
      }
    ],
    "frames": [
      {
        "who": "旁白",
        "text": "一位商贩送来招财担保单，盖着玄坛旧印。你看中可退的小额样单，付过钱才来核来源。",
        "g": 0,
        "mood": ""
      },
      {
        "who": "你",
        "text": "这单保证客似云来。我本来想问，云来以后喝不喝茶，光站着也占桌子。",
        "g": null,
        "mood": ""
      },
      {
        "who": "赵公明",
        "text": "停用的旧印。单据给本君，后续先停。",
        "g": 0,
        "mood": ""
      },
      {
        "who": "旁白",
        "text": "他抬手要取走全部材料，又准备独自出门。",
        "g": 0,
        "mood": ""
      },
      {
        "who": "你",
        "text": "把我也带上。我付过样单钱，来往话是我听的，你连证人都想自己兼任？",
        "g": null,
        "mood": ""
      },
      {
        "who": "赵公明",
        "text": "旧印出自本司，是本君的责任。",
        "g": 0,
        "mood": ""
      },
      {
        "who": "你",
        "text": "你查印，我写收款时间。谁的错记谁的，别一出事就把我从桌上搬走。我还没领那种不用干活的工钱。",
        "g": null,
        "mood": ""
      },
      {
        "who": "旁白",
        "text": "他停在门边，重新坐回你身旁。你们把宣传、收据和问题列成三栏。",
        "g": 0,
        "mood": ""
      },
      {
        "who": "你",
        "text": "样单钱也写。我贪那个客似云来，给自己买了堂识字课，不能拿客人的钱补学费。",
        "g": null,
        "mood": ""
      },
      {
        "who": "赵公明",
        "text": "本君会署名说明旧印停用。钱能追回多少，要查，不能先答应。",
        "g": 0,
        "mood": ""
      },
      {
        "who": "你",
        "text": "行。以后客人问保证发财吗，我就请他看看我们屋顶。",
        "g": null,
        "mood": ""
      },
      {
        "who": "旁白",
        "text": "他本想维持严肃，目光却被你桌边的接雨盆带歪了一瞬。",
        "g": 0,
        "mood": ""
      },
      {
        "who": "赵公明",
        "text": "这句，倒足够有凭有据。",
        "g": 0,
        "mood": ""
      },
      {
        "who": "你",
        "text": "你看，我还能帮你说实话，便宜又耐用。",
        "g": null,
        "mood": ""
      },
      {
        "who": "赵公明",
        "text": "本君听见了。下回有事，会先同你商量。",
        "g": 0,
        "mood": ""
      }
    ]
  },
  {
    "title": "谁把虎的饭钱算我头上了",
    "place": "第五夜 · 庙后小院",
    "text": "旁白：你为省钱啃半张饼。赵公明一整日没吃饭，却给你端来一大碗热汤。\n你：先别照顾我。你的饭呢？\n赵公明：本君不急。\n你：好，我也不急。咱们把两碗都供给虎，让它当唯一会吃饭的庙主。\n旁白：黑虎闻声抬头。你们同时把碗护住，它又失望地趴回去。\n赵公明：别闹。你下午便饿了。\n你：你午饭都没动。我要给别人发工钱，也得管自己吃饭，你这个道理怎么只朝我这边使？\n旁白：你添出第二碗汤，挪走他手边的单据。他这次没有拿回来。\n赵公明：本君总想着先办完。\n你：你要真能办完，明天就没有新单子了？先吃，神仙也别靠别人说辛苦了充饥。\n旁白：他终于坐下。你刚喝一口，发现两碗里只有你那份卧着一个蛋。\n你：不公平。我的饭预算是不是超了？\n赵公明：从本君那份出的。\n你：那你今天少吃的，我还得心疼。给我半个，剩下你自己吃，我不负责独吞你的好意。\n旁白：你把蛋分开。他看了半天，才低低说了一声好。\n赵公明：本君往后，会记自己的饭。",
    "choices": [
      {
        "label": "把饭吃好，也要求他别总拿自己顶着",
        "l": 12,
        "t": 8,
        "i": 3,
        "response": "先约好，谁忘了吃，谁洗两个碗。我可会抓现行。 本君记下。你若忘了，也不许拿半张饼蒙混。",
        "replyFrames": [
          {
            "who": "你",
            "text": "先约好，谁忘了吃，谁洗两个碗。我可会抓现行。",
            "g": null,
            "mood": ""
          },
          {
            "who": "赵公明",
            "text": "本君记下。你若忘了，也不许拿半张饼蒙混。",
            "g": 0,
            "mood": ""
          }
        ]
      },
      {
        "label": "还想再赶一份活，端着碗不肯坐",
        "l": 0,
        "t": 8,
        "i": 6,
        "response": "我再抄半张单。汤在这里，今天保证不让它凉到明天。 本君把椅子放这儿。你刚才教训人的话，可还热着。 你终于发现，拿自己的话堵自己，确实不太好还嘴。",
        "replyFrames": [
          {
            "who": "你",
            "text": "我再抄半张单。汤在这里，今天保证不让它凉到明天。",
            "g": null,
            "mood": ""
          },
          {
            "who": "赵公明",
            "text": "本君把椅子放这儿。你刚才教训人的话，可还热着。",
            "g": 0,
            "mood": ""
          },
          {
            "who": "旁白",
            "text": "你终于发现，拿自己的话堵自己，确实不太好还嘴。",
            "g": 0,
            "mood": ""
          }
        ]
      }
    ],
    "frames": [
      {
        "who": "旁白",
        "text": "你为省钱啃半张饼。赵公明一整日没吃饭，却给你端来一大碗热汤。",
        "g": 0,
        "mood": ""
      },
      {
        "who": "你",
        "text": "先别照顾我。你的饭呢？",
        "g": null,
        "mood": ""
      },
      {
        "who": "赵公明",
        "text": "本君不急。",
        "g": 0,
        "mood": ""
      },
      {
        "who": "你",
        "text": "好，我也不急。咱们把两碗都供给虎，让它当唯一会吃饭的庙主。",
        "g": null,
        "mood": ""
      },
      {
        "who": "旁白",
        "text": "黑虎闻声抬头。你们同时把碗护住，它又失望地趴回去。",
        "g": 0,
        "mood": ""
      },
      {
        "who": "赵公明",
        "text": "别闹。你下午便饿了。",
        "g": 0,
        "mood": ""
      },
      {
        "who": "你",
        "text": "你午饭都没动。我要给别人发工钱，也得管自己吃饭，你这个道理怎么只朝我这边使？",
        "g": null,
        "mood": ""
      },
      {
        "who": "旁白",
        "text": "你添出第二碗汤，挪走他手边的单据。他这次没有拿回来。",
        "g": 0,
        "mood": ""
      },
      {
        "who": "赵公明",
        "text": "本君总想着先办完。",
        "g": 0,
        "mood": ""
      },
      {
        "who": "你",
        "text": "你要真能办完，明天就没有新单子了？先吃，神仙也别靠别人说辛苦了充饥。",
        "g": null,
        "mood": ""
      },
      {
        "who": "旁白",
        "text": "他终于坐下。你刚喝一口，发现两碗里只有你那份卧着一个蛋。",
        "g": 0,
        "mood": ""
      },
      {
        "who": "你",
        "text": "不公平。我的饭预算是不是超了？",
        "g": null,
        "mood": ""
      },
      {
        "who": "赵公明",
        "text": "从本君那份出的。",
        "g": 0,
        "mood": ""
      },
      {
        "who": "你",
        "text": "那你今天少吃的，我还得心疼。给我半个，剩下你自己吃，我不负责独吞你的好意。",
        "g": null,
        "mood": ""
      },
      {
        "who": "旁白",
        "text": "你把蛋分开。他看了半天，才低低说了一声好。",
        "g": 0,
        "mood": ""
      },
      {
        "who": "赵公明",
        "text": "本君往后，会记自己的饭。",
        "g": 0,
        "mood": ""
      }
    ]
  },
  {
    "title": "上香五文，喂虎五十文",
    "place": "第六夜 · 迎财灯会",
    "text": "旁白：你把祈福钱与肉干钱分开放。赵公明看着两堆，半晌没开口。\n赵公明：五文。五十文。\n你：供你一支香，供它一袋肉。怎么，财神也要查虎的伙食？\n赵公明：本君只问，为何进门先找它。\n你：它闻着味就来，你上回让我等到一份修缮单写完。\n旁白：他像接到一份比账册难看的投诉。你掏出两张灯会票，拍在他面前。\n你：今晚有空，直接约。别再通过虎向我转达不满，它只会把这句话理解成加餐。\n赵公明：本君确有一事，想单独同你办。\n你：查账的票不长这样。\n赵公明：逛灯会。\n旁白：他取出一张写得极短的红纸，刚好塞进你的手机壳。上面写着看清再付。\n你：能招财吗？\n赵公明：能提醒你别急。决定还是你拿，本君不会每笔都替你批。\n你：那今晚我要挑一盏漂亮的，预算自己管。你负责别拿公务从半路消失。\n赵公明：已交接。专门留的时间。",
    "choices": [
      {
        "label": "带他去灯会，约好今晚都不抢着管对方",
        "l": 12,
        "t": 10,
        "i": 8,
        "response": "走。虎留家里，免得它也来竞争五十文。 本君今日不带它。想看看你没有肉干，还找不找得着路。",
        "replyFrames": [
          {
            "who": "你",
            "text": "走。虎留家里，免得它也来竞争五十文。",
            "g": null,
            "mood": ""
          },
          {
            "who": "赵公明",
            "text": "本君今日不带它。想看看你没有肉干，还找不找得着路。",
            "g": 0,
            "mood": ""
          }
        ]
      },
      {
        "label": "还想让他替自己决定所有开销",
        "l": 2,
        "t": 10,
        "i": 10,
        "response": "你都在旁边了，要不今晚每笔钱都替我批一下？我就负责看灯。 本君陪你，不替你长脑子。红纸第一行，你再念念。 你把票收好，决定今晚至少亲自挑一盏灯。",
        "replyFrames": [
          {
            "who": "你",
            "text": "你都在旁边了，要不今晚每笔钱都替我批一下？我就负责看灯。",
            "g": null,
            "mood": ""
          },
          {
            "who": "赵公明",
            "text": "本君陪你，不替你长脑子。红纸第一行，你再念念。",
            "g": 0,
            "mood": ""
          },
          {
            "who": "旁白",
            "text": "你把票收好，决定今晚至少亲自挑一盏灯。",
            "g": 0,
            "mood": ""
          }
        ]
      }
    ],
    "frames": [
      {
        "who": "旁白",
        "text": "你把祈福钱与肉干钱分开放。赵公明看着两堆，半晌没开口。",
        "g": 0,
        "mood": ""
      },
      {
        "who": "赵公明",
        "text": "五文。五十文。",
        "g": 0,
        "mood": ""
      },
      {
        "who": "你",
        "text": "供你一支香，供它一袋肉。怎么，财神也要查虎的伙食？",
        "g": null,
        "mood": ""
      },
      {
        "who": "赵公明",
        "text": "本君只问，为何进门先找它。",
        "g": 0,
        "mood": ""
      },
      {
        "who": "你",
        "text": "它闻着味就来，你上回让我等到一份修缮单写完。",
        "g": null,
        "mood": ""
      },
      {
        "who": "旁白",
        "text": "他像接到一份比账册难看的投诉。你掏出两张灯会票，拍在他面前。",
        "g": 0,
        "mood": ""
      },
      {
        "who": "你",
        "text": "今晚有空，直接约。别再通过虎向我转达不满，它只会把这句话理解成加餐。",
        "g": null,
        "mood": ""
      },
      {
        "who": "赵公明",
        "text": "本君确有一事，想单独同你办。",
        "g": 0,
        "mood": ""
      },
      {
        "who": "你",
        "text": "查账的票不长这样。",
        "g": null,
        "mood": ""
      },
      {
        "who": "赵公明",
        "text": "逛灯会。",
        "g": 0,
        "mood": ""
      },
      {
        "who": "旁白",
        "text": "他取出一张写得极短的红纸，刚好塞进你的手机壳。上面写着看清再付。",
        "g": 0,
        "mood": ""
      },
      {
        "who": "你",
        "text": "能招财吗？",
        "g": null,
        "mood": ""
      },
      {
        "who": "赵公明",
        "text": "能提醒你别急。决定还是你拿，本君不会每笔都替你批。",
        "g": 0,
        "mood": ""
      },
      {
        "who": "你",
        "text": "那今晚我要挑一盏漂亮的，预算自己管。你负责别拿公务从半路消失。",
        "g": null,
        "mood": ""
      },
      {
        "who": "赵公明",
        "text": "已交接。专门留的时间。",
        "g": 0,
        "mood": ""
      }
    ]
  },
  {
    "title": "财神申请下班以后见你",
    "place": "第七夜 · 庙后小院",
    "text": "旁白：茶楼收摊，赵公明准时坐在饭桌边。没抱账册，也没带一张待核的单。\n你：今天这么干净，公事都被你藏袖子里了？\n赵公明：交接了。袖子也可查。\n旁白：他竟真把手伸过来。你摸了一下袖口，转头假装是在检查布料。\n你：合格。暂时没有发现藏起来的工作。\n赵公明：初见时，本君想把每件事替你挡完。后来发现，你会先替本君把椅子搬来，让我坐下。\n你：主要你站着管事，影子刚好挡住我数钱。\n赵公明：也会顶嘴，拆告示，分本君的蛋。出了问题，却没有退到本君身后。\n旁白：你本想再讨一项搬椅子的报酬，抬眼却见他正认真看你。\n赵公明：本君如今会等你拿主意。也想等你收摊，听些和庙无关的话。\n你：比如今天我想赚很多钱，只赚到一点？\n赵公明：比如你想吃什么。钱赚多少，都可以说。\n你：我毛病不少。贪财，嘴快，还会看见便宜就多看两眼。\n赵公明：本君也未必事事能放手。你会指出来，本君会学。\n旁白：他将身旁的位置空出来，没有替你拉过去。\n赵公明：往后，肯不肯同本君一起过？这回没有公事，单问你。",
    "choices": [
      {
        "label": "答应恋爱，先约定彼此都要好好下班",
        "l": 8,
        "t": 8,
        "i": 0,
        "response": "愿意。工钱照发，恋爱另算，不能拿亲一下抵我三天班。 本君不赖账。至于亲一下，得另问你肯不肯。 你坐到他身边，第一次没急着算这段时间能做几杯茶。",
        "replyFrames": [
          {
            "who": "你",
            "text": "愿意。工钱照发，恋爱另算，不能拿亲一下抵我三天班。",
            "g": null,
            "mood": ""
          },
          {
            "who": "赵公明",
            "text": "本君不赖账。至于亲一下，得另问你肯不肯。",
            "g": 0,
            "mood": ""
          },
          {
            "who": "旁白",
            "text": "你坐到他身边，第一次没急着算这段时间能做几杯茶。",
            "g": 0,
            "mood": ""
          }
        ]
      },
      {
        "label": "继续当朋友和合伙人，先忙自己的生意",
        "l": 0,
        "t": 5,
        "i": 8,
        "response": "我想先当好庙主。饭还能一起吃，恋爱这笔我还没准备好开。 好。你愿意留下做的事，本君照旧同你商量。 他把椅子留在原处，让你自己挑了舒服的位置。",
        "replyFrames": [
          {
            "who": "你",
            "text": "我想先当好庙主。饭还能一起吃，恋爱这笔我还没准备好开。",
            "g": null,
            "mood": ""
          },
          {
            "who": "赵公明",
            "text": "好。你愿意留下做的事，本君照旧同你商量。",
            "g": 0,
            "mood": ""
          },
          {
            "who": "旁白",
            "text": "他把椅子留在原处，让你自己挑了舒服的位置。",
            "g": 0,
            "mood": ""
          }
        ]
      },
      {
        "label": "回人间开茶铺，约好以后再见",
        "l": 0,
        "t": 0,
        "i": 0,
        "response": "我想把自己的店开起来。等开张，来做第一位真掏钱的客人吧。 好。到时本君带钱，不带担保单。 他送你到门口。这回接过你行李前，先问了一句，能否帮忙。",
        "replyFrames": [
          {
            "who": "你",
            "text": "我想把自己的店开起来。等开张，来做第一位真掏钱的客人吧。",
            "g": null,
            "mood": ""
          },
          {
            "who": "赵公明",
            "text": "好。到时本君带钱，不带担保单。",
            "g": 0,
            "mood": ""
          },
          {
            "who": "旁白",
            "text": "他送你到门口。这回接过你行李前，先问了一句，能否帮忙。",
            "g": 0,
            "mood": ""
          }
        ]
      }
    ],
    "frames": [
      {
        "who": "旁白",
        "text": "茶楼收摊，赵公明准时坐在饭桌边。没抱账册，也没带一张待核的单。",
        "g": 0,
        "mood": ""
      },
      {
        "who": "你",
        "text": "今天这么干净，公事都被你藏袖子里了？",
        "g": null,
        "mood": ""
      },
      {
        "who": "赵公明",
        "text": "交接了。袖子也可查。",
        "g": 0,
        "mood": ""
      },
      {
        "who": "旁白",
        "text": "他竟真把手伸过来。你摸了一下袖口，转头假装是在检查布料。",
        "g": 0,
        "mood": ""
      },
      {
        "who": "你",
        "text": "合格。暂时没有发现藏起来的工作。",
        "g": null,
        "mood": ""
      },
      {
        "who": "赵公明",
        "text": "初见时，本君想把每件事替你挡完。后来发现，你会先替本君把椅子搬来，让我坐下。",
        "g": 0,
        "mood": ""
      },
      {
        "who": "你",
        "text": "主要你站着管事，影子刚好挡住我数钱。",
        "g": null,
        "mood": ""
      },
      {
        "who": "赵公明",
        "text": "也会顶嘴，拆告示，分本君的蛋。出了问题，却没有退到本君身后。",
        "g": 0,
        "mood": ""
      },
      {
        "who": "旁白",
        "text": "你本想再讨一项搬椅子的报酬，抬眼却见他正认真看你。",
        "g": 0,
        "mood": ""
      },
      {
        "who": "赵公明",
        "text": "本君如今会等你拿主意。也想等你收摊，听些和庙无关的话。",
        "g": 0,
        "mood": ""
      },
      {
        "who": "你",
        "text": "比如今天我想赚很多钱，只赚到一点？",
        "g": null,
        "mood": ""
      },
      {
        "who": "赵公明",
        "text": "比如你想吃什么。钱赚多少，都可以说。",
        "g": 0,
        "mood": ""
      },
      {
        "who": "你",
        "text": "我毛病不少。贪财，嘴快，还会看见便宜就多看两眼。",
        "g": null,
        "mood": ""
      },
      {
        "who": "赵公明",
        "text": "本君也未必事事能放手。你会指出来，本君会学。",
        "g": 0,
        "mood": ""
      },
      {
        "who": "旁白",
        "text": "他将身旁的位置空出来，没有替你拉过去。",
        "g": 0,
        "mood": ""
      },
      {
        "who": "赵公明",
        "text": "往后，肯不肯同本君一起过？这回没有公事，单问你。",
        "g": 0,
        "mood": ""
      }
    ]
  }
];
const ENDINGS={
  "he": {
    "name": "本君下班，先别找虎",
    "type": "赵公明 HE",
    "text": "庙门落锁，赵公明第三次回头看屋檐。你把他的脸转回来，问今夜究竟跟谁约会。\n他终于把巡查单交给轮值的人，牵住你的手。黑虎在身后低吼，他脚步一顿。你先开口，虎吃过了，你还没有。\n后来他仍会操心，你也仍会为打折多看两眼。一个提醒别把所有事扛走，一个提醒便宜也得用得上。吵完去吃饭，饭钱轮流付。\n你问财神谈恋爱有没有香火返还。他说没有，手却没松。"
  },
  "double": {
    "name": "庙有余钱，财神有空",
    "type": "爱情事业双丰收",
    "text": "旧欠还清，店里留够周转的钱。你宣布今晚提前关门，赵公明立刻问，明日的货谁验。\n你指向排班。他看完，终于把钥匙放下。黑虎趁机叼走半块庆功饼，你伸手追，他拦住你，另半块给你留着。\n后来你开自己的茶铺，他陪你看铺面，却忍住没替你定。你也替他守住每月几次真正不用值守的休息。\n新店第一笔私账，是两个人的晚饭。你在旁边画了只虎，注明不得报销。"
  },
  "be": {
    "name": "铜盆还在，各自接雨",
    "type": "赵公明 BE",
    "text": "七日结束，你们把交接写清。经营上尚有没谈拢的地方，往后的关系也没有定下来。\n赵公明本想再替你列一张安排，你笑着伸手，给我纸就好，我自己写。\n他把笔一起交来。临走前，你给黑虎留了块饼，它连同纸袋一起叼走。两个人追到院门，终于笑了一次。\n你带走自己的茶铺计划。他留在庙里，学着把值守交出去。以后怎样，你们都没有提前许诺。"
  },
  "sixth": {
    "name": "第六路财神，正在催款",
    "type": "隐藏 · 独身暴富",
    "text": "旧欠还清，生意站稳，街坊送来一块第六路财神的牌匾。你先摸了摸，问纯金的吗。\n萧升说镀的。你立即让大家扶稳，镀的也不能磕。\n赵公明排值守，曹宝算工钱，陈九公送货前先问报酬，姚少司把招牌上的包发财改成茶已烧好。你挨个验收，决定先给自己放半天假。\n有人来求一夜暴富。你请他坐下，把茶推过去。暴富暂时没有，账可以一起看。茶钱五文，明码标价。"
  },
  "business": {
    "name": "恋爱先放放，茶要趁热卖",
    "type": "普通经营结局",
    "text": "你选择继续做生意。五位财神没有撤走帮忙的人，也没把租约涨成失恋价。\n赵公明仍提醒你看好门，萧升偶尔帮客人挑茶具，曹宝坚持记清赠茶，陈九公终于会把运费写在单上。姚少司热情地介绍新茶，夸到第三句便自己收住。\n你也会进错杯子、买多茶叶。做错就改，欠的账慢慢清，自己的报酬按时领。\n新客问你这间庙灵不灵。你指向那五位，求财效果还在观察，催人上班相当有效。"
  },
  "xiao_he": {
    "name": "鉴宝满分，约会重学",
    "type": "萧升 HE",
    "text": "珍宝阁多了一只铃。萧升要开口考人，你便拨一下。他抬眼瞪你，最终把那句你懂什么咽回去，先听客人说完。\n收摊后你故意晃着鱼杯问价。他把杯子从你手里接走，另一只手伸过来。礼物不卖，人也不考，你要不要跟我吃饭？\n你答应了，顺手问能不能点贵的。\n他笑着把菜单推来。你看完价格，点了两碗面。今天省下的钱，留着明天再见。",
    "g": 1
  },
  "xiao_be": {
    "name": "铃响了，门仍开着",
    "type": "萧升 BE",
    "text": "珍宝阁交接完毕，萧升将你的寄存物一件件包好。这回他没有拿一道难题拖住你。\n你们能把货说清，却还没找到让彼此舒服相处的办法。你收好账单，他也收起尚未送出的鱼杯。\n门边的铃响了一下，他先问你是不是漏了东西。你说没有，只是想确认，他如今真肯先问了。\n他笑得有点无奈，送你到街口。你们道过别，各自把后面的事慢慢做好。",
    "g": 1
  },
  "xiao_double": {
    "name": "满柜珠玉，最怕你摇铃",
    "type": "萧升 · 爱情事业双丰收",
    "text": "珍宝阁和茶楼都攒下家底，你拿出新铺子的计划。萧升看完先问你的打算，等你说完，才挑出两处进货的问题。\n你举起铃，他立即补充，问题在单子上，没有考你。\n后来店里贵重物件越来越多，那颗便宜珠子仍装在最好的盒子里。你要拿它压账单，他连盒子一起挪走，换上一枚昂贵镇纸。\n你笑问这是不是偏心。他说是，连人带珠子都偏。然后低头亲了你一下，没有出题。",
    "g": 1
  },
  "cao_he": {
    "name": "今晚留白，先亲一下",
    "type": "曹宝 HE",
    "text": "曹宝的新日历留了许多空白。第一次约会恰好下雨，你以为他要拿出备用安排，他却先问，想去哪里躲？\n你说茶楼有免费的热水。两个人坐回自家柜台，连路费都省了。\n他仍会认真算账，你仍会替喜欢的东西争取一点预算。算到最后，他把笔搁下，问现在可不可以亲你。\n你说这项不在预算里。\n他等着。你笑着靠过去，临时加的，批准。",
    "g": 2
  },
  "cao_be": {
    "name": "下一页，各自填写",
    "type": "曹宝 BE",
    "text": "交接那天，曹宝没有替你安排下一间铺子。他把核好的凭据交来，等你自己放进袋里。\n你们有过配合顺手的时候，也有怎么商量都别扭的时候。最后没能把两个人的以后写进同一页。\n他问还需要什么。你想了想，撕下一张空白纸，说这个就够。\n他点头，把尺也递过来。你没有接，两个人都笑了。往后那条线，你想试着自己画。",
    "g": 2
  },
  "cao_double": {
    "name": "有钱有闲，表上没填",
    "type": "曹宝 · 爱情事业双丰收",
    "text": "旧欠清偿，新店也有了周转的钱。曹宝拿出下一季安排，翻到中间，竟空着半页。\n你问漏算了多少收入。他说那几天不开店，陪你出去。\n你当场检查纸背，怀疑藏着另一张表。他任你翻，最后从袖里取出两张车票。这一项确实提前买了，怕没座。\n旅途中下了雨，你们就在檐下吃面。你算今天省了多少，他算你筷子伸进自己碗里几次。第三次，他主动把肉夹给你。",
    "g": 2
  },
  "chen_he": {
    "name": "这回专程来约你",
    "type": "陈九公 HE",
    "text": "陈九公来约你，路上有人喊他顺手搬货。他停下来，先问要几箱、送到哪、工钱多少。\n对方说就一小会儿。他笑着摇头，今天已经有约了，明日可以另谈。\n你在门后听见，替他鼓掌。他耳尖发红，说练过很多遍，刚才还是有点紧张。\n你把自己的催款消息给他看，你也紧张，但发出去了。两个人并排吃饼，谁都没有把自己的那份让出去。吃完，他才轻轻牵你的手。",
    "g": 3
  },
  "chen_be": {
    "name": "信已读，路各自走",
    "type": "陈九公 BE",
    "text": "那封约会信没有换来相约往后的答案。陈九公把送货交接单留给你，自己的信收回怀里。\n他说舍不得，却没有拿这些天跑过的路换一个答应。你也认真谢过他帮你开口问回自己的报酬。\n街坊又来请他顺手送东西，他先问清内容，约了明日的时辰。随后陪你走到街口。\n这段路他没收钱。你问起来，他笑了一下，送朋友，自己愿意的。",
    "g": 3
  },
  "chen_double": {
    "name": "财神终于准点下班",
    "type": "陈九公 · 爱情事业双丰收",
    "text": "庙里还清旧欠，送货也有了固定排班。你把报酬和加单办法写在墙上，陈九公负责每天亲口说清。\n最先不同意的是熟客，最先习惯的也是熟客。如今谁来临时加活，都会先问一句，今天接得下吗？\n你开新茶铺那天，他专程来剪彩。剪完有人要他送花篮，他指指接班的伙伴，自己站回你身边。\n你偷偷塞给他一块热饼。他把你拉到人少的地方，小声问，老板娘，下班能不能再约一次？",
    "g": 3
  },
  "yao_he": {
    "name": "宜约会，本人同意",
    "type": "姚少司 HE",
    "text": "姚少司依然爱说吉利话，只是出门前会查路，卖茶时会说口味，约你时会等回答。\n有天你抽到一支宜早睡。他看了一眼，认真说那明天再来。\n你抓住他的袖子，问就不能先亲一下再早睡？\n他的笑总算藏不住。后来桌上还留着签筒，里面什么签都有。抽到不顺心的，你们就放回去，先商量今天做什么。至少要不要牵手，用不着让竹片决定。",
    "g": 4
  },
  "yao_be": {
    "name": "空签也能好好收场",
    "type": "姚少司 BE",
    "text": "最后一天，姚少司收好招牌，没再说抽支签看看缘分。你们没有约定恋人关系，手上的合作也要重新商量。\n他说本来准备了好多吉利话，临到头，一句都不太合适。\n你让他讲实话。他低头笑了笑，说有点难过，今晚可能不想摆摊。\n你点头，帮他把最后一箱茶搬回去。关上门，你们各自回去吃饭，谁都没把这场落空说成谁不够幸运。",
    "g": 4
  },
  "yao_double": {
    "name": "开张大吉，闭店约会",
    "type": "姚少司 · 爱情事业双丰收",
    "text": "旧欠还清，茶楼赚的钱终于留得住。姚少司提议在门前挂开张大吉，你补上营业时辰，免得他为了好彩头通宵待客。\n新茶第一天没卖完。他没有喊最后一杯喝了发财，拿来客人的意见，跟你重新试味。你也承认杯子买大了，别光看便宜。\n下一回客人再来，茶和杯子都顺手多了。\n收摊时他递来一张纸，路线查过，位置订好。你问求签了没。他牵你的手，说没有，这回先问你。",
    "g": 4
  }
};
function valid(s){return s&&s.version===2&&Number.isInteger(s.day)&&s.day>=1&&s.day<=7&&Number.isFinite(s.cash)&&s.cash>=0&&Number.isFinite(s.debt)&&s.debt>=0&&s.buildings&&['temple','tea','treasure'].every(k=>s.buildings[k]&&Number.isInteger(s.buildings[k].level)&&s.buildings[k].level>=0&&s.buildings[k].level<=3&&Number.isFinite(s.buildings[k].value))&&Array.isArray(s.love)&&s.love.length===5&&Array.isArray(s.trust)&&s.trust.length===5&&s.daily&&Array.isArray(s.daily.rewards)&&Array.isArray(s.story)&&Array.isArray(s.ledger)&&s.memory&&Array.isArray(s.memory.games)&&(!s.ending||ENDINGS[s.ending]);}
// 5-card evaluator, then all 21 subsets of seven cards. Ace supports low straight.
function rank5(cards){let rs=cards.map(c=>c.r).sort((a,b)=>b-a),counts={};rs.forEach(r=>counts[r]=(counts[r]||0)+1);let groups=Object.keys(counts).map(Number).sort((a,b)=>counts[b]-counts[a]||b-a);let unique=[...new Set(rs)],straight=unique.length===5&&(unique[0]-unique[4]===4?unique[0]:unique.join(',')==='14,5,4,3,2'?5:0),flush=cards.every(c=>c.s===cards[0].s);let v=flush&&straight?[8,straight]:counts[groups[0]]===4?[7,...groups]:counts[groups[0]]===3&&counts[groups[1]]===2?[6,...groups]:flush?[5,...rs]:straight?[4,straight]:counts[groups[0]]===3?[3,...groups]:counts[groups[0]]===2&&counts[groups[1]]===2?[2,Math.max(groups[0],groups[1]),Math.min(groups[0],groups[1]),groups[2]]:counts[groups[0]]===2?[1,...groups]:[0,...rs];return v;}
function cmp(a,b){for(let i=0;i<Math.max(a.length,b.length);i++){let d=(a[i]||0)-(b[i]||0);if(d)return d;}return 0;}
function rank7(c){let best=[-1];for(let a=0;a<c.length-4;a++)for(let b=a+1;b<c.length-3;b++)for(let d=b+1;d<c.length-2;d++)for(let e=d+1;e<c.length-1;e++)for(let f=e+1;f<c.length;f++){let r=rank5([c[a],c[b],c[d],c[e],c[f]]);if(cmp(r,best)>0)best=r;}return best;}
return {forecastReward,deliveryReward,Fortunes,Routes,routeOf,getStory,canChooseRoute,orderGod,endingGod,fresh,daily,assets,income,act,rand,valid,ending,STORY,ENDINGS,NAMES,COSTS,rank5,rank7,cmp};
});
