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
case 'order':{if(d.order)return {ok:false,text:'今日委托已完成。'};let kinds={safe:{cost:40,income:100},risk:{cost:80,income:0},investigate:{cost:60,income:150}},o=kinds[p.kind];if(!o)return {ok:false,text:'委托不存在。'};if(s.cash<o.cost)return {ok:false,text:'启动资金不足；可以先领取店铺收益。'};let gain=o.income;if(p.kind==='risk'){let success=rand(s)<.6;gain=success?190:(d.collab===0?70:20);msg=success?'商队顺利到达。':'商队遇雨，'+(d.collab===0?'赵公明止损，收回 70 元宝。':'仅收回 20 元宝。');change(s,'independent',1);}else{change(s,'independent',p.kind==='investigate'?8:3);change(s,'reputation',4);if(p.kind==='investigate'){let g=orderGod(s);if(g!==null){bond(s,g,2,4);msg=NAMES[g]+'好感 +2、信任 +4。'}else msg='尚未选择同行者或安排协作，本次仅结算经营奖励。';flag(s,'investigated');msg='已核对送货凭据，与欠款商铺谈妥还款安排，茶商支付酬劳 150 元宝。 '+msg}}s.cash+=gain-o.cost;d.order=true;log(s,'委托 '+({safe:'茶会订单',risk:'黄金商队',investigate:'帮茶商催货款'})[p.kind]+'（支出 '+o.cost+' / 回款 '+gain+'）',gain-o.cost);msg+=' 委托结算：支出 '+o.cost+'，回款 '+gain+'，净变化 '+(gain-o.cost)+'。';break;}
case 'game':{let g=p.g;if(!Number.isInteger(g)||g<0||g>4)return {ok:false,text:'小游戏不存在。'};s.memory.games[g]++;if(g===0)s.memory.tiger+=p.win?3:1;if(g===1&&p.win&&!p.skipKnowledge&&Number.isInteger(p.card)&&p.card>=0&&p.card<2&&!s.memory.knowledge.includes(p.card))s.memory.knowledge.push(p.card);if(g===4&&p.experiment){s.memory.luck.rounds+=p.experiment.rounds;s.memory.luck.stay+=p.experiment.stay;s.memory.luck.swap+=p.experiment.swap;}if(d.rewards.includes(g)){msg='练习完成。今日该角色奖励已领，重复游玩不再增加经济奖励。';break;}d.rewards.push(g);let r=g===3&&Object.prototype.hasOwnProperty.call(p,'deliveryCount')?deliveryReward(p.deliveryCount):g===2&&Object.prototype.hasOwnProperty.call(p,'forecastCorrect')?forecastReward(p.forecastCorrect):{cash:p.win?25:10,love:p.win?5:2,trust:p.win?4:2,independent:p.win?2:0};s.cash+=r.cash;bond(s,g,r.love,r.trust);change(s,'independent',r.independent);log(s,NAMES[g]+'互动奖励',r.cash);msg=(r.correct!==undefined?'商品合约猜中 '+r.correct+' 次':r.count!==undefined?'送达 '+r.count+' / 8 户':p.win?'互动成功':'完成练习')+'：元宝 +'+r.cash+'、好感 +'+r.love+'、信任 +'+r.trust+'、独立 +'+r.independent+'。';break;}
case 'story':{if(d.story)return {ok:false,text:'今日剧情已经读完。'};let chapter=getStory(s),g=s.day===1?0:routeOf(s),choice=chapter.choices[p.choice];if(!choice)return {ok:false,text:'选择不存在。'};d.story=true;bond(s,g,choice.l,choice.t);change(s,'independent',choice.i||0);if(choice.flag)flag(s,choice.flag);if(choice.flags)choice.flags.forEach(f=>flag(s,f));if(s.day===7)s.relationship=p.choice===0?'romance':p.choice===1?'friend':'leave';s.story.push({day:s.day,g,choice:p.choice,title:chapter.title,response:choice.response});msg=choice.response;break;}
case 'next':if(!d.story)return {ok:false,text:'先读完今夜剧情，再结束这一天。'};s.days.push({day:s.day,cash:s.cash,debt:s.debt,net:assets(s),independent:s.independent,collected:d.collected,order:d.order});if(s.day===7){s.ending=ending(s);msg='七日之约已完成。';}else{s.day++;s.daily=daily();msg='第 '+s.day+' 日，财神庙又迎来新的早晨。';}break;
default:return {ok:false,text:'未知操作。'};
}return {ok:true,text:msg};}
const STORY=[
  {
    "title": "我来求财，财神给我排班",
    "place": "序幕 · 雨夜财神庙",
    "text": "旁白：你下班回来，刚收到房租扣款的消息，又被雨堵在路边。附近只有一座小庙亮着灯，你赶紧进去躲雨。\n旁白：供桌上放着香。你往功德箱里投了零钱，点好一支，双手合在胸前。\n你：财神爷，救急呀！房租一扣，我这茶铺又白想了一个月。您看，先让我买得起茶壶也行啊？\n旁白：话没说完，一只黑虎从供桌底下钻出来。你手一抖，香差点掉了，人已经退到门边。\n赵公明：站住！门槛湿，别再退。它不伤你。\n旁白：你顺着声音抬头。一名黑衣男子正从殿后出来，手里端着接雨的铜盆。黑虎走到他脚边，趴下了。\n你：你、你养的？！这可是真虎啊！\n赵公明：有本君在。过来，踩干处。\n旁白：你没敢靠近，目光在他和神像之间来回看。一样的金冠，一样的黑袍，连身边那只虎都对得上。\n你：等会儿，您该不会真是……赵公明吧？\n赵公明：正是本君。方才求开茶铺的，是你？\n你：是我！可您先容我缓缓……财神都亲自来了，这盆总不能也是法器吧？\n萧升：法器？倒也贴切，再不让路，它便要给你鞋里施雨了。劳驾，让一让。\n旁白：白衣男子从你身后绕过去，接走铜盆。赵公明腾出手，将门边的椅子拉到干处。\n赵公明：坐下。先救你的计划，都湿了。\n旁白：你低头一看，包里那叠茶铺计划湿了半边。你忙着往外抽，坐在桌后的男子递过一块干布。\n曹宝：先擦封面，内页别揭，湿纸会破。写了很久吧？\n你：半年啦。钱没攒上，计划倒越改越厚……先别笑，我真想开的。\n曹宝：我没笑。这几样茶，都实际做过？\n你：做过！周末摆摊，还有人专程回来买呢。我就想，能有间让他们坐着喝的铺子，多好啊。\n旁白：他听完，等你把纸放好，才翻开自己桌上的账册。\n曹宝：那么，后街那间茶楼或许合适。庙里的，空着。你要不要先看一眼？\n你：我开？好啊……不对，租金多少？！先说好，今天只求财，没带定金！\n萧升：瞧这护钱袋的架势。收着吧，这回有求于人的，是我们。\n你：你们……求我？我还有这行情呢？\n曹宝：缺一位主理生意的人。现钱二百二十元宝，旧欠三百，茶楼能用。先试七日，报酬另计，不从你的家用里出。\n你：等等，欠三百？！财神的庙也负债啊？那我刚才那支香……\n旁白：院里又走进两人，一个抱着货箱，一个提着饭篮。抱箱子的先把箱子放下，连连摆手。\n陈九公：别急别急！修屋顶、修后墙，几笔旧账赶一起了！我们还，我们还，绝不让你白干！\n你：可你们自己的财运都这样，我来……真能行？别是想再凑个倒霉蛋吧？\n萧升：看货我在行，算账有曹宝，送货有这位。至于煮一壶客人喝过还肯回来买的茶……九公，你自己说？\n陈九公：我上回煮的，虎闻了一下就走了！真就闻一下，脸都没给我留。\n旁白：你忍不住笑出声。提饭篮的年轻男子趁机把热饭摆上桌。\n姚少司：所以这顿放心吃，买的，没让他下厨！先认个人，我叫姚少司，他是陈九公。新掌柜，肚子是不是还空着？\n你：空得很！但丑话先说，吃饭归吃饭，不能吃完就给我算入职了啊。\n赵公明：不算。旧债归庙里，你的家用不动。报酬、分账、交接，白纸黑字。没看清，不许签。\n你：那七日后，我觉得不合适，拍拍屁股就能走？\n赵公明：能。本君请你做事，没买你的去路。\n旁白：你看看桌上的热饭，又看看自己那叠湿透的计划，将椅子往桌边挪了一点。\n你：行，那我看看！顺便再问一嘴……刚才那支香，能不能报销？入职之前就花钱，我有点心疼。\n萧升：好么，人还没招进来，先来一笔报销。这位掌柜，看来是真不白给。",
    "choices": [
      {
        "label": "先看契约，把工钱和香钱问清楚",
        "l": 8,
        "t": 10,
        "i": 8,
        "response": "那当然！都到财神庙了，总不能领工钱还得回家磕头求吧？ 陈九公憋着笑，给你搬来一盏灯。曹宝取出纸，先写下报酬二字。 准你问。灯在这里，契约也在这里，今晚一条条说清。",
        "replyFrames": [
          {
            "who": "你",
            "text": "那当然！都到财神庙了，总不能领工钱还得回家磕头求吧？",
            "g": null,
            "mood": ""
          },
          {
            "who": "旁白",
            "text": "陈九公憋着笑，给你搬来一盏灯。曹宝取出纸，先写下报酬二字。",
            "g": 1,
            "mood": ""
          },
          {
            "who": "赵公明",
            "text": "准你问。灯在这里，契约也在这里，今晚一条条说清。",
            "g": 0,
            "mood": ""
          }
        ]
      },
      {
        "label": "先吃饭，吃完再仔细看契约",
        "l": 2,
        "t": 0,
        "i": 0,
        "response": "先给我盛碗饭！饿得我看见七日，都快认成七碗了。 哟，那可得快点盛！虎都在盯锅啦，你再盯着纸，锅里真就只剩空碗了。 你刚拿起碗又停了。姚少司笑着把盛满的饭递过来，告诉你虎有单独的一份。",
        "replyFrames": [
          {
            "who": "你",
            "text": "先给我盛碗饭！饿得我看见七日，都快认成七碗了。",
            "g": null,
            "mood": ""
          },
          {
            "who": "姚少司",
            "text": "哟，那可得快点盛！虎都在盯锅啦，你再盯着纸，锅里真就只剩空碗了。",
            "g": 4,
            "mood": ""
          },
          {
            "who": "旁白",
            "text": "你刚拿起碗又停了。姚少司笑着把盛满的饭递过来，告诉你虎有单独的一份。",
            "g": 4,
            "mood": ""
          }
        ]
      }
    ],
    "frames": [
      {
        "who": "旁白",
        "text": "你下班回来，刚收到房租扣款的消息，又被雨堵在路边。附近只有一座小庙亮着灯，你赶紧进去躲雨。",
        "g": null,
        "mood": "",
        "hideGod": true
      },
      {
        "who": "旁白",
        "text": "供桌上放着香。你往功德箱里投了零钱，点好一支，双手合在胸前。",
        "g": null,
        "mood": "",
        "hideGod": true
      },
      {
        "who": "你",
        "text": "财神爷，救急呀！房租一扣，我这茶铺又白想了一个月。您看，先让我买得起茶壶也行啊？",
        "g": null,
        "mood": "",
        "hideGod": true
      },
      {
        "who": "旁白",
        "text": "话没说完，一只黑虎从供桌底下钻出来。你手一抖，香差点掉了，人已经退到门边。",
        "g": null,
        "mood": "",
        "hideGod": true
      },
      {
        "who": "赵公明",
        "text": "站住！门槛湿，别再退。它不伤你。",
        "g": 0,
        "mood": ""
      },
      {
        "who": "旁白",
        "text": "你顺着声音抬头。一名黑衣男子正从殿后出来，手里端着接雨的铜盆。黑虎走到他脚边，趴下了。",
        "g": 0,
        "mood": ""
      },
      {
        "who": "你",
        "text": "你、你养的？！这可是真虎啊！",
        "g": null,
        "mood": ""
      },
      {
        "who": "赵公明",
        "text": "有本君在。过来，踩干处。",
        "g": 0,
        "mood": ""
      },
      {
        "who": "旁白",
        "text": "你没敢靠近，目光在他和神像之间来回看。一样的金冠，一样的黑袍，连身边那只虎都对得上。",
        "g": 0,
        "mood": ""
      },
      {
        "who": "你",
        "text": "等会儿，您该不会真是……赵公明吧？",
        "g": null,
        "mood": ""
      },
      {
        "who": "赵公明",
        "text": "正是本君。方才求开茶铺的，是你？",
        "g": 0,
        "mood": ""
      },
      {
        "who": "你",
        "text": "是我！可您先容我缓缓……财神都亲自来了，这盆总不能也是法器吧？",
        "g": null,
        "mood": ""
      },
      {
        "who": "萧升",
        "text": "法器？倒也贴切，再不让路，它便要给你鞋里施雨了。劳驾，让一让。",
        "g": 1,
        "mood": ""
      },
      {
        "who": "旁白",
        "text": "白衣男子从你身后绕过去，接走铜盆。赵公明腾出手，将门边的椅子拉到干处。",
        "g": 1,
        "mood": ""
      },
      {
        "who": "赵公明",
        "text": "坐下。先救你的计划，都湿了。",
        "g": 0,
        "mood": ""
      },
      {
        "who": "旁白",
        "text": "你低头一看，包里那叠茶铺计划湿了半边。你忙着往外抽，坐在桌后的男子递过一块干布。",
        "g": 0,
        "mood": ""
      },
      {
        "who": "曹宝",
        "text": "先擦封面，内页别揭，湿纸会破。写了很久吧？",
        "g": 2,
        "mood": ""
      },
      {
        "who": "你",
        "text": "半年啦。钱没攒上，计划倒越改越厚……先别笑，我真想开的。",
        "g": null,
        "mood": ""
      },
      {
        "who": "曹宝",
        "text": "我没笑。这几样茶，都实际做过？",
        "g": 2,
        "mood": ""
      },
      {
        "who": "你",
        "text": "做过！周末摆摊，还有人专程回来买呢。我就想，能有间让他们坐着喝的铺子，多好啊。",
        "g": null,
        "mood": ""
      },
      {
        "who": "旁白",
        "text": "他听完，等你把纸放好，才翻开自己桌上的账册。",
        "g": 2,
        "mood": ""
      },
      {
        "who": "曹宝",
        "text": "那么，后街那间茶楼或许合适。庙里的，空着。你要不要先看一眼？",
        "g": 2,
        "mood": ""
      },
      {
        "who": "你",
        "text": "我开？好啊……不对，租金多少？！先说好，今天只求财，没带定金！",
        "g": null,
        "mood": ""
      },
      {
        "who": "萧升",
        "text": "瞧这护钱袋的架势。收着吧，这回有求于人的，是我们。",
        "g": 1,
        "mood": ""
      },
      {
        "who": "你",
        "text": "你们……求我？我还有这行情呢？",
        "g": null,
        "mood": ""
      },
      {
        "who": "曹宝",
        "text": "缺一位主理生意的人。现钱二百二十元宝，旧欠三百，茶楼能用。先试七日，报酬另计，不从你的家用里出。",
        "g": 2,
        "mood": ""
      },
      {
        "who": "你",
        "text": "等等，欠三百？！财神的庙也负债啊？那我刚才那支香……",
        "g": null,
        "mood": ""
      },
      {
        "who": "旁白",
        "text": "院里又走进两人，一个抱着货箱，一个提着饭篮。抱箱子的先把箱子放下，连连摆手。",
        "g": 2,
        "mood": ""
      },
      {
        "who": "陈九公",
        "text": "别急别急！修屋顶、修后墙，几笔旧账赶一起了！我们还，我们还，绝不让你白干！",
        "g": 3,
        "mood": ""
      },
      {
        "who": "你",
        "text": "可你们自己的财运都这样，我来……真能行？别是想再凑个倒霉蛋吧？",
        "g": null,
        "mood": ""
      },
      {
        "who": "萧升",
        "text": "看货我在行，算账有曹宝，送货有这位。至于煮一壶客人喝过还肯回来买的茶……九公，你自己说？",
        "g": 1,
        "mood": ""
      },
      {
        "who": "陈九公",
        "text": "我上回煮的，虎闻了一下就走了！真就闻一下，脸都没给我留。",
        "g": 3,
        "mood": ""
      },
      {
        "who": "旁白",
        "text": "你忍不住笑出声。提饭篮的年轻男子趁机把热饭摆上桌。",
        "g": 3,
        "mood": ""
      },
      {
        "who": "姚少司",
        "text": "所以这顿放心吃，买的，没让他下厨！先认个人，我叫姚少司，他是陈九公。新掌柜，肚子是不是还空着？",
        "g": 4,
        "mood": ""
      },
      {
        "who": "你",
        "text": "空得很！但丑话先说，吃饭归吃饭，不能吃完就给我算入职了啊。",
        "g": null,
        "mood": ""
      },
      {
        "who": "赵公明",
        "text": "不算。旧债归庙里，你的家用不动。报酬、分账、交接，白纸黑字。没看清，不许签。",
        "g": 0,
        "mood": ""
      },
      {
        "who": "你",
        "text": "那七日后，我觉得不合适，拍拍屁股就能走？",
        "g": null,
        "mood": ""
      },
      {
        "who": "赵公明",
        "text": "能。本君请你做事，没买你的去路。",
        "g": 0,
        "mood": ""
      },
      {
        "who": "旁白",
        "text": "你看看桌上的热饭，又看看自己那叠湿透的计划，将椅子往桌边挪了一点。",
        "g": 0,
        "mood": ""
      },
      {
        "who": "你",
        "text": "行，那我看看！顺便再问一嘴……刚才那支香，能不能报销？入职之前就花钱，我有点心疼。",
        "g": null,
        "mood": ""
      },
      {
        "who": "萧升",
        "text": "好么，人还没招进来，先来一笔报销。这位掌柜，看来是真不白给。",
        "g": 1,
        "mood": ""
      }
    ]
  },
  {
    "title": "客人进门要过几道关",
    "place": "第二夜 · 茶楼账房",
    "text": "旁白：试营业刚开门，茶已经沏好，却迟迟没人进来。你端着托盘出去，看见赵公明站在门前，正拦住一位客人。\n赵公明：脚下留神。地滑，那只虎也别碰。\n客人：……我就想喝口茶。算了，我去隔壁。\n旁白：客人走了。你把托盘放下，发现门口除了赵公明，还横着一道绳，墙上贴了三张提醒。\n你：哎，人怎么走了？！赵公明，你刚才招呼的，还是劝退的？\n赵公明：阶上有水，黑虎也不认生客。本君须先说清。\n你：你这一说，喝杯茶都快要签生死状了！水擦干，虎领走，人家不就能进来？\n旁白：你拿来拖布擦干台阶，把绳解开。赵公明伸手拦了一下，又停住。\n赵公明：热壶谁管？黑虎安置何处？你先同本君说定。\n你：我管壶，你管虎！壶放柜后，我倒。虎先去后院，今天别让它亲自迎宾啦。\n赵公明：你独自一人，当真应付得来？\n你：忙不过来我会喊呀！你往门口一站，别说客人，我端个杯子都觉得得先打报告。\n旁白：他看了你一会儿，牵着黑虎去了后院。回来时，茶楼里终于坐下了两桌人。\n赵公明：……罢了。还有何事，交给本君。\n你：三只干净杯子，劳驾！送去就好啊，别再端着杯子给人讲防烫，我刚讲过了。\n旁白：他把杯子放到你手边。你让出半张柜台，两个人总算没再撞来撞去。\n你：看，坐下了吧！先让人喝上，明天咱们才有回头钱赚呀。",
    "choices": [
      {
        "label": "让他帮忙端茶，自己招呼客人",
        "l": 10,
        "t": 8,
        "i": 3,
        "response": "这桌我记好了，你去送！等人少点，咱们再数数今天赚了多少。 好。本君在，有事便喊。 他端起托盘，经过门口时，顺手收走了最后一张多余的告示。",
        "replyFrames": [
          {
            "who": "你",
            "text": "这桌我记好了，你去送！等人少点，咱们再数数今天赚了多少。",
            "g": null,
            "mood": ""
          },
          {
            "who": "赵公明",
            "text": "好。本君在，有事便喊。",
            "g": 0,
            "mood": ""
          },
          {
            "who": "旁白",
            "text": "他端起托盘，经过门口时，顺手收走了最后一张多余的告示。",
            "g": 0,
            "mood": ""
          }
        ]
      },
      {
        "label": "还是想让他替自己把每桌都安排好",
        "l": 0,
        "t": 5,
        "i": 5,
        "response": "可我又有点怕漏……要不你把每桌添水的时辰也排排？就今天！ 方才嫌本君管得多，现在又往回推？先试。真忙不过来，本君接着。 你把排到一半的单子收回来，重新看向正在招手的客人。",
        "replyFrames": [
          {
            "who": "你",
            "text": "可我又有点怕漏……要不你把每桌添水的时辰也排排？就今天！",
            "g": null,
            "mood": ""
          },
          {
            "who": "赵公明",
            "text": "方才嫌本君管得多，现在又往回推？先试。真忙不过来，本君接着。",
            "g": 0,
            "mood": ""
          },
          {
            "who": "旁白",
            "text": "你把排到一半的单子收回来，重新看向正在招手的客人。",
            "g": 0,
            "mood": ""
          }
        ]
      }
    ],
    "frames": [
      {
        "who": "旁白",
        "text": "试营业刚开门，茶已经沏好，却迟迟没人进来。你端着托盘出去，看见赵公明站在门前，正拦住一位客人。",
        "g": 0,
        "mood": ""
      },
      {
        "who": "赵公明",
        "text": "脚下留神。地滑，那只虎也别碰。",
        "g": 0,
        "mood": ""
      },
      {
        "who": "客人",
        "text": "……我就想喝口茶。算了，我去隔壁。",
        "g": 0,
        "mood": ""
      },
      {
        "who": "旁白",
        "text": "客人走了。你把托盘放下，发现门口除了赵公明，还横着一道绳，墙上贴了三张提醒。",
        "g": 0,
        "mood": ""
      },
      {
        "who": "你",
        "text": "哎，人怎么走了？！赵公明，你刚才招呼的，还是劝退的？",
        "g": null,
        "mood": ""
      },
      {
        "who": "赵公明",
        "text": "阶上有水，黑虎也不认生客。本君须先说清。",
        "g": 0,
        "mood": ""
      },
      {
        "who": "你",
        "text": "你这一说，喝杯茶都快要签生死状了！水擦干，虎领走，人家不就能进来？",
        "g": null,
        "mood": ""
      },
      {
        "who": "旁白",
        "text": "你拿来拖布擦干台阶，把绳解开。赵公明伸手拦了一下，又停住。",
        "g": 0,
        "mood": ""
      },
      {
        "who": "赵公明",
        "text": "热壶谁管？黑虎安置何处？你先同本君说定。",
        "g": 0,
        "mood": ""
      },
      {
        "who": "你",
        "text": "我管壶，你管虎！壶放柜后，我倒。虎先去后院，今天别让它亲自迎宾啦。",
        "g": null,
        "mood": ""
      },
      {
        "who": "赵公明",
        "text": "你独自一人，当真应付得来？",
        "g": 0,
        "mood": ""
      },
      {
        "who": "你",
        "text": "忙不过来我会喊呀！你往门口一站，别说客人，我端个杯子都觉得得先打报告。",
        "g": null,
        "mood": ""
      },
      {
        "who": "旁白",
        "text": "他看了你一会儿，牵着黑虎去了后院。回来时，茶楼里终于坐下了两桌人。",
        "g": 0,
        "mood": ""
      },
      {
        "who": "赵公明",
        "text": "……罢了。还有何事，交给本君。",
        "g": 0,
        "mood": ""
      },
      {
        "who": "你",
        "text": "三只干净杯子，劳驾！送去就好啊，别再端着杯子给人讲防烫，我刚讲过了。",
        "g": null,
        "mood": ""
      },
      {
        "who": "旁白",
        "text": "他把杯子放到你手边。你让出半张柜台，两个人总算没再撞来撞去。",
        "g": 0,
        "mood": ""
      },
      {
        "who": "你",
        "text": "看，坐下了吧！先让人喝上，明天咱们才有回头钱赚呀。",
        "g": null,
        "mood": ""
      }
    ]
  },
  {
    "title": "财神没收了我的发财机会",
    "place": "第三夜 · 人间集市",
    "text": "旁白：你和赵公明来集市请瓦匠。听完报价，你捏着钱袋没出声，赵公明却又指了指图上的两根旧梁。\n赵公明：这两根梁，也换掉。\n你：等会儿等会儿！师傅，分开写行不行？我们俩得先商量一下！\n旁白：瓦匠去取纸。你把赵公明拉到一边，压低声音。\n你：两根梁再一加，明天茶叶拿什么买呀？人家能一口气修完，我的钱袋又不能一口气生钱！\n赵公明：尚可支撑。本君是想，工匠既已来了，索性……\n你：别索性啦！先把客人头上的漏补好，其他的请他查过，约个时日。总得让我先活到明天吧？\n旁白：赵公明接过报价，重新圈了几项。瓦匠同意先做急处，约好回头再查其余部分。\n你：呼！这才对嘛，省下一大截！等我一下，我取个包。\n旁白：你走到隔壁的彩头摊，想取回刚才寄放的小包。摊主立刻拦住你，说你方才差一点就中了，再试一次准行。\n赵公明：你下过注了？\n你：就等师傅的时候……一点零钱！我知道他哄人，可刚才真差一点，就那么一点！\n旁白：你取出钱袋，手伸进去，又没拿出来。赵公明没有抢，只把刚谈好的报价放到你眼前。\n赵公明：看这张单。省下的，已经在手。那边再押一次，谁敢担保？\n你：万一呢……真中了，这屋顶我今晚看它都顺眼！\n赵公明：若不中，明日茶钱又少一笔。方才那番道理，只许教训本君，不许自己听？走，定修瓦的时辰。\n旁白：摊主还在喊你。你看看他，又看看手里的钱袋。",
    "choices": [
      {
        "label": "收好钱袋，去找瓦匠定时辰",
        "l": 8,
        "t": 12,
        "i": 10,
        "flag": "evidence",
        "response": "走走走！刚还嫌你花得猛，转头我自己也上头了，怪丢人的…… 知道便收手。包给本君，你去问时辰。 你把小包交过去。这次经过锣边，脚没再停。",
        "replyFrames": [
          {
            "who": "你",
            "text": "走走走！刚还嫌你花得猛，转头我自己也上头了，怪丢人的……",
            "g": null,
            "mood": ""
          },
          {
            "who": "赵公明",
            "text": "知道便收手。包给本君，你去问时辰。",
            "g": 0,
            "mood": ""
          },
          {
            "who": "旁白",
            "text": "你把小包交过去。这次经过锣边，脚没再停。",
            "g": 0,
            "mood": ""
          }
        ]
      },
      {
        "label": "知道不该再玩，还是迟迟舍不得走",
        "l": 2,
        "t": -10,
        "i": 0,
        "response": "道理我懂……心里就是痒！你等我一下，别让我自己在这儿编中奖梦。 本君等。钱袋先系好，别给那摊主看。 他往摊外退了两步，没催你。你站了一会儿，最后还是拎起了自己的包。",
        "replyFrames": [
          {
            "who": "你",
            "text": "道理我懂……心里就是痒！你等我一下，别让我自己在这儿编中奖梦。",
            "g": null,
            "mood": ""
          },
          {
            "who": "赵公明",
            "text": "本君等。钱袋先系好，别给那摊主看。",
            "g": 0,
            "mood": ""
          },
          {
            "who": "旁白",
            "text": "他往摊外退了两步，没催你。你站了一会儿，最后还是拎起了自己的包。",
            "g": 0,
            "mood": ""
          }
        ]
      }
    ],
    "frames": [
      {
        "who": "旁白",
        "text": "你和赵公明来集市请瓦匠。听完报价，你捏着钱袋没出声，赵公明却又指了指图上的两根旧梁。",
        "g": 0,
        "mood": ""
      },
      {
        "who": "赵公明",
        "text": "这两根梁，也换掉。",
        "g": 0,
        "mood": ""
      },
      {
        "who": "你",
        "text": "等会儿等会儿！师傅，分开写行不行？我们俩得先商量一下！",
        "g": null,
        "mood": ""
      },
      {
        "who": "旁白",
        "text": "瓦匠去取纸。你把赵公明拉到一边，压低声音。",
        "g": 0,
        "mood": ""
      },
      {
        "who": "你",
        "text": "两根梁再一加，明天茶叶拿什么买呀？人家能一口气修完，我的钱袋又不能一口气生钱！",
        "g": null,
        "mood": ""
      },
      {
        "who": "赵公明",
        "text": "尚可支撑。本君是想，工匠既已来了，索性……",
        "g": 0,
        "mood": ""
      },
      {
        "who": "你",
        "text": "别索性啦！先把客人头上的漏补好，其他的请他查过，约个时日。总得让我先活到明天吧？",
        "g": null,
        "mood": ""
      },
      {
        "who": "旁白",
        "text": "赵公明接过报价，重新圈了几项。瓦匠同意先做急处，约好回头再查其余部分。",
        "g": 0,
        "mood": ""
      },
      {
        "who": "你",
        "text": "呼！这才对嘛，省下一大截！等我一下，我取个包。",
        "g": null,
        "mood": ""
      },
      {
        "who": "旁白",
        "text": "你走到隔壁的彩头摊，想取回刚才寄放的小包。摊主立刻拦住你，说你方才差一点就中了，再试一次准行。",
        "g": 0,
        "mood": ""
      },
      {
        "who": "赵公明",
        "text": "你下过注了？",
        "g": 0,
        "mood": ""
      },
      {
        "who": "你",
        "text": "就等师傅的时候……一点零钱！我知道他哄人，可刚才真差一点，就那么一点！",
        "g": null,
        "mood": ""
      },
      {
        "who": "旁白",
        "text": "你取出钱袋，手伸进去，又没拿出来。赵公明没有抢，只把刚谈好的报价放到你眼前。",
        "g": 0,
        "mood": ""
      },
      {
        "who": "赵公明",
        "text": "看这张单。省下的，已经在手。那边再押一次，谁敢担保？",
        "g": 0,
        "mood": ""
      },
      {
        "who": "你",
        "text": "万一呢……真中了，这屋顶我今晚看它都顺眼！",
        "g": null,
        "mood": ""
      },
      {
        "who": "赵公明",
        "text": "若不中，明日茶钱又少一笔。方才那番道理，只许教训本君，不许自己听？走，定修瓦的时辰。",
        "g": 0,
        "mood": ""
      },
      {
        "who": "旁白",
        "text": "摊主还在喊你。你看看他，又看看手里的钱袋。",
        "g": 0,
        "mood": ""
      }
    ]
  },
  {
    "title": "假财神保证我发财",
    "place": "第四夜 · 茶楼账房",
    "text": "旁白：赵公明核今日的支出时，停在一张样单前。你把收据推过去，说下午有人推销招客服务，你付了一笔小额试用费。\n赵公明：你信的，是这枚印？\n你：也不全是嘛……他说不满意能退，我才试一点点的。怎么，你认识？\n旁白：赵公明将样单放到灯下。印上写着玄坛担保，底下还有一句保证客似云来。\n赵公明：停用的旧印！本司从未担保此人。往来消息还有多少，全拿来。\n你：有有有，我找给你！你别一看这印，就把我也当骗子了啊。\n旁白：你找出往来记录，他一并收起来，起身就往外走。你忙拉住他的袖子。\n你：哎！去哪儿？！刚还叫我找，找着了你倒要一个人跑了？\n赵公明：查印。事出本司，本君亲自去。\n你：带我呀！钱是我付的，话是我听的，你连证人都想一个人当啊？问漏一句，还得折回来抓我！\n旁白：他低头看了一眼手里的材料，把椅子拉了回来。\n赵公明：……是本君急了。坐回来，先听你讲完。\n你：还有这笔样单钱，别漏。幸亏我没来得及推荐给客人，不然这回真丢人丢大发了！\n赵公明：先止付。能追回多少，查过才有准话，本君不拿空话宽你的心。\n你：知道！我付过钱也照写，别替我藏。以后谁还说财神包发财，我就请他来参观咱们屋顶！\n旁白：赵公明望向墙边的接雨盆，神色总算松了一点。他把那张收据铺平，留出让你落笔的位置。",
    "choices": [
      {
        "label": "一起写明经过，各自负责该查的部分",
        "l": 10,
        "t": 15,
        "i": 12,
        "flag": "truth",
        "response": "我写付款，你查印！有消息先喊我啊，不许一看我低头，又拎着东西悄悄走了。 记住了。明日联名，你我各担一份。 你们坐在同一盏灯下，把收到的承诺逐条核了一遍。",
        "replyFrames": [
          {
            "who": "你",
            "text": "我写付款，你查印！有消息先喊我啊，不许一看我低头，又拎着东西悄悄走了。",
            "g": null,
            "mood": ""
          },
          {
            "who": "赵公明",
            "text": "记住了。明日联名，你我各担一份。",
            "g": 0,
            "mood": ""
          },
          {
            "who": "旁白",
            "text": "你们坐在同一盏灯下，把收到的承诺逐条核了一遍。",
            "g": 0,
            "mood": ""
          }
        ]
      },
      {
        "label": "先各自处理，暂时不再联名合作",
        "l": -8,
        "t": -20,
        "i": -5,
        "flag": "betray",
        "response": "经过我会写，退单我也问。但联名先算了……我今天还不想替咱俩挂在一起的招牌担保。 好。不勉强。材料留你一份，查到什么，本君照实告知。 他将纸分成两叠。你接过自己的那份，没再拉回刚移开的椅子。",
        "replyFrames": [
          {
            "who": "你",
            "text": "经过我会写，退单我也问。但联名先算了……我今天还不想替咱俩挂在一起的招牌担保。",
            "g": null,
            "mood": ""
          },
          {
            "who": "赵公明",
            "text": "好。不勉强。材料留你一份，查到什么，本君照实告知。",
            "g": 0,
            "mood": ""
          },
          {
            "who": "旁白",
            "text": "他将纸分成两叠。你接过自己的那份，没再拉回刚移开的椅子。",
            "g": 0,
            "mood": ""
          }
        ]
      }
    ],
    "frames": [
      {
        "who": "旁白",
        "text": "赵公明核今日的支出时，停在一张样单前。你把收据推过去，说下午有人推销招客服务，你付了一笔小额试用费。",
        "g": 0,
        "mood": ""
      },
      {
        "who": "赵公明",
        "text": "你信的，是这枚印？",
        "g": 0,
        "mood": ""
      },
      {
        "who": "你",
        "text": "也不全是嘛……他说不满意能退，我才试一点点的。怎么，你认识？",
        "g": null,
        "mood": ""
      },
      {
        "who": "旁白",
        "text": "赵公明将样单放到灯下。印上写着玄坛担保，底下还有一句保证客似云来。",
        "g": 0,
        "mood": ""
      },
      {
        "who": "赵公明",
        "text": "停用的旧印！本司从未担保此人。往来消息还有多少，全拿来。",
        "g": 0,
        "mood": ""
      },
      {
        "who": "你",
        "text": "有有有，我找给你！你别一看这印，就把我也当骗子了啊。",
        "g": null,
        "mood": ""
      },
      {
        "who": "旁白",
        "text": "你找出往来记录，他一并收起来，起身就往外走。你忙拉住他的袖子。",
        "g": 0,
        "mood": ""
      },
      {
        "who": "你",
        "text": "哎！去哪儿？！刚还叫我找，找着了你倒要一个人跑了？",
        "g": null,
        "mood": ""
      },
      {
        "who": "赵公明",
        "text": "查印。事出本司，本君亲自去。",
        "g": 0,
        "mood": ""
      },
      {
        "who": "你",
        "text": "带我呀！钱是我付的，话是我听的，你连证人都想一个人当啊？问漏一句，还得折回来抓我！",
        "g": null,
        "mood": ""
      },
      {
        "who": "旁白",
        "text": "他低头看了一眼手里的材料，把椅子拉了回来。",
        "g": 0,
        "mood": ""
      },
      {
        "who": "赵公明",
        "text": "……是本君急了。坐回来，先听你讲完。",
        "g": 0,
        "mood": ""
      },
      {
        "who": "你",
        "text": "还有这笔样单钱，别漏。幸亏我没来得及推荐给客人，不然这回真丢人丢大发了！",
        "g": null,
        "mood": ""
      },
      {
        "who": "赵公明",
        "text": "先止付。能追回多少，查过才有准话，本君不拿空话宽你的心。",
        "g": 0,
        "mood": ""
      },
      {
        "who": "你",
        "text": "知道！我付过钱也照写，别替我藏。以后谁还说财神包发财，我就请他来参观咱们屋顶！",
        "g": null,
        "mood": ""
      },
      {
        "who": "旁白",
        "text": "赵公明望向墙边的接雨盆，神色总算松了一点。他把那张收据铺平，留出让你落笔的位置。",
        "g": 0,
        "mood": ""
      }
    ]
  },
  {
    "title": "这张桌上，虎吃得最准时",
    "place": "第五夜 · 庙后小院",
    "text": "旁白：忙过了饭点，你拿半张饼垫肚子。赵公明端来一碗热汤，放到你摊开的货单上。\n你：哎哎，单子！压湿了要重抄的……嗯？给我的？\n赵公明：把饼放下，吃热的。\n你：你那份呢？别装没听见，我中午留给你的饭，原封不动！\n赵公明：尚有几张单。核过便吃。\n旁白：你没有接勺子。他看看你，终于把手里的单子也放了下来。\n你：又来！合着我饿着不行，你就能靠核账顶饱？那我等你，谁也别吃了。\n赵公明：胡闹。汤都端来了，还同本君赌气？\n你：对，赌！你现在去盛，我现在就吃。去不去？\n旁白：他进厨房取了汤，回来坐到你对面。黑虎闻着味凑近，你们一人护住一碗，它只好趴回桌下。\n你：瞧它多会过日子！一桌子人忙来忙去，就它一顿没耽误。\n赵公明：下午那包肉干，是谁瞒着本君又喂的？\n你：我喂的，怎么啦！……等等，你把蛋全搁我这儿了？\n旁白：你那碗卧着一只蛋，他的只有汤。你用勺子分开，挑了一半放回他碗里。\n赵公明：给你的，吃便是。\n你：我吃半个！另外半个归你，别推来推去了。再推汤都凉了，谁也别想占便宜。\n旁白：这回他没再把蛋夹回来。你们各自拿起勺子，黑虎在桌底叹了一口气。",
    "choices": [
      {
        "label": "吃完再核账，顺便约好明天一起吃饭",
        "l": 12,
        "t": 8,
        "i": 3,
        "response": "明天到点叫我！你要还拿核账当借口，我就把单子搬走，让你对着空桌子核。 那你也不许躲在柜后啃饼。本君会来，躲不掉。 你点点头，把剩下半张饼收好，没再偷偷往嘴里塞。",
        "replyFrames": [
          {
            "who": "你",
            "text": "明天到点叫我！你要还拿核账当借口，我就把单子搬走，让你对着空桌子核。",
            "g": null,
            "mood": ""
          },
          {
            "who": "赵公明",
            "text": "那你也不许躲在柜后啃饼。本君会来，躲不掉。",
            "g": 0,
            "mood": ""
          },
          {
            "who": "旁白",
            "text": "你点点头，把剩下半张饼收好，没再偷偷往嘴里塞。",
            "g": 0,
            "mood": ""
          }
        ]
      },
      {
        "label": "还想先赶完手里的活，端起碗又放下",
        "l": 0,
        "t": 8,
        "i": 6,
        "response": "我就抄三个数！三个，马上好，你先别收…… 勺子拿好。方才教训本君的气势呢？吃。 他把你的货单抽走，整齐压在自己那叠下面。你只好先喝一口汤。",
        "replyFrames": [
          {
            "who": "你",
            "text": "我就抄三个数！三个，马上好，你先别收……",
            "g": null,
            "mood": ""
          },
          {
            "who": "赵公明",
            "text": "勺子拿好。方才教训本君的气势呢？吃。",
            "g": 0,
            "mood": ""
          },
          {
            "who": "旁白",
            "text": "他把你的货单抽走，整齐压在自己那叠下面。你只好先喝一口汤。",
            "g": 0,
            "mood": ""
          }
        ]
      }
    ],
    "frames": [
      {
        "who": "旁白",
        "text": "忙过了饭点，你拿半张饼垫肚子。赵公明端来一碗热汤，放到你摊开的货单上。",
        "g": 0,
        "mood": ""
      },
      {
        "who": "你",
        "text": "哎哎，单子！压湿了要重抄的……嗯？给我的？",
        "g": null,
        "mood": ""
      },
      {
        "who": "赵公明",
        "text": "把饼放下，吃热的。",
        "g": 0,
        "mood": ""
      },
      {
        "who": "你",
        "text": "你那份呢？别装没听见，我中午留给你的饭，原封不动！",
        "g": null,
        "mood": ""
      },
      {
        "who": "赵公明",
        "text": "尚有几张单。核过便吃。",
        "g": 0,
        "mood": ""
      },
      {
        "who": "旁白",
        "text": "你没有接勺子。他看看你，终于把手里的单子也放了下来。",
        "g": 0,
        "mood": ""
      },
      {
        "who": "你",
        "text": "又来！合着我饿着不行，你就能靠核账顶饱？那我等你，谁也别吃了。",
        "g": null,
        "mood": ""
      },
      {
        "who": "赵公明",
        "text": "胡闹。汤都端来了，还同本君赌气？",
        "g": 0,
        "mood": ""
      },
      {
        "who": "你",
        "text": "对，赌！你现在去盛，我现在就吃。去不去？",
        "g": null,
        "mood": ""
      },
      {
        "who": "旁白",
        "text": "他进厨房取了汤，回来坐到你对面。黑虎闻着味凑近，你们一人护住一碗，它只好趴回桌下。",
        "g": 0,
        "mood": ""
      },
      {
        "who": "你",
        "text": "瞧它多会过日子！一桌子人忙来忙去，就它一顿没耽误。",
        "g": null,
        "mood": ""
      },
      {
        "who": "赵公明",
        "text": "下午那包肉干，是谁瞒着本君又喂的？",
        "g": 0,
        "mood": ""
      },
      {
        "who": "你",
        "text": "我喂的，怎么啦！……等等，你把蛋全搁我这儿了？",
        "g": null,
        "mood": ""
      },
      {
        "who": "旁白",
        "text": "你那碗卧着一只蛋，他的只有汤。你用勺子分开，挑了一半放回他碗里。",
        "g": 0,
        "mood": ""
      },
      {
        "who": "赵公明",
        "text": "给你的，吃便是。",
        "g": 0,
        "mood": ""
      },
      {
        "who": "你",
        "text": "我吃半个！另外半个归你，别推来推去了。再推汤都凉了，谁也别想占便宜。",
        "g": null,
        "mood": ""
      },
      {
        "who": "旁白",
        "text": "这回他没再把蛋夹回来。你们各自拿起勺子，黑虎在桌底叹了一口气。",
        "g": 0,
        "mood": ""
      }
    ]
  },
  {
    "title": "今天到底来见谁",
    "place": "第六夜 · 迎财灯会",
    "text": "旁白：你拎着新买的肉干进院。黑虎立刻迎过来，赵公明在廊下看着，等你喂完才叫你。\n赵公明：又给它买？\n你：是啊！上回那包都吃光啦，你又不是没看见。\n赵公明：本君看见了。也看见你这几日进门，只顾找它。\n旁白：你愣了一下，看看黑虎，又看看他。\n你：啊？你吃它的醋？！它一听见我来就迎，我找你，还得排在修缮单后头呢！\n赵公明：那张单不能耽搁，本君……\n旁白：他话说了一半，自己停住了。你把肉干收好，走到廊下。\n你：行，今天有单没？有我去等，可你得先吱一声，我又不会算你的心思。\n赵公明：没有。今夜不当值。灯会，你同本君去不去？\n你：陪我去呀？可别到那儿，又说顺道巡街啊！\n赵公明：只陪你。不巡街，不看账。\n旁白：你确认似的看了他片刻，从包里取出两张早买好的票，递给他一张。\n你：早问不就好啦！喏，两张。一直揣着，生怕你又说没空呢。\n赵公明：你早就买了……倒让本君等到今日才开口。\n你：再晚点，我真找别人去啦！票可不能砸手里。\n旁白：他接过票，立刻起身。黑虎又抬起头，被他按了回去。",
    "choices": [
      {
        "label": "同他去看灯，让今晚的安排自己慢慢定",
        "l": 12,
        "t": 10,
        "i": 8,
        "response": "不带虎啊？那我买了肉串吃不完，谁接后半截？ 本君接。别再找它了，走。 你笑着跟上去。他放慢了脚步，等你和他并肩。",
        "replyFrames": [
          {
            "who": "你",
            "text": "不带虎啊？那我买了肉串吃不完，谁接后半截？",
            "g": null,
            "mood": ""
          },
          {
            "who": "赵公明",
            "text": "本君接。别再找它了，走。",
            "g": 0,
            "mood": ""
          },
          {
            "who": "旁白",
            "text": "你笑着跟上去。他放慢了脚步，等你和他并肩。",
            "g": 0,
            "mood": ""
          }
        ]
      },
      {
        "label": "仍想让他替自己把一路安排妥当",
        "l": 2,
        "t": 10,
        "i": 10,
        "response": "去哪儿、花多少，你都替我定吧！今天这脑子，我想歇歇。 陪你出门，倒成替你作主了？先走到街口，喜欢什么，指给本君看。 你想了想，先指了卖花灯的那条街。这一项，倒很快就选好了。",
        "replyFrames": [
          {
            "who": "你",
            "text": "去哪儿、花多少，你都替我定吧！今天这脑子，我想歇歇。",
            "g": null,
            "mood": ""
          },
          {
            "who": "赵公明",
            "text": "陪你出门，倒成替你作主了？先走到街口，喜欢什么，指给本君看。",
            "g": 0,
            "mood": ""
          },
          {
            "who": "旁白",
            "text": "你想了想，先指了卖花灯的那条街。这一项，倒很快就选好了。",
            "g": 0,
            "mood": ""
          }
        ]
      }
    ],
    "frames": [
      {
        "who": "旁白",
        "text": "你拎着新买的肉干进院。黑虎立刻迎过来，赵公明在廊下看着，等你喂完才叫你。",
        "g": 0,
        "mood": ""
      },
      {
        "who": "赵公明",
        "text": "又给它买？",
        "g": 0,
        "mood": ""
      },
      {
        "who": "你",
        "text": "是啊！上回那包都吃光啦，你又不是没看见。",
        "g": null,
        "mood": ""
      },
      {
        "who": "赵公明",
        "text": "本君看见了。也看见你这几日进门，只顾找它。",
        "g": 0,
        "mood": ""
      },
      {
        "who": "旁白",
        "text": "你愣了一下，看看黑虎，又看看他。",
        "g": 0,
        "mood": ""
      },
      {
        "who": "你",
        "text": "啊？你吃它的醋？！它一听见我来就迎，我找你，还得排在修缮单后头呢！",
        "g": null,
        "mood": ""
      },
      {
        "who": "赵公明",
        "text": "那张单不能耽搁，本君……",
        "g": 0,
        "mood": ""
      },
      {
        "who": "旁白",
        "text": "他话说了一半，自己停住了。你把肉干收好，走到廊下。",
        "g": 0,
        "mood": ""
      },
      {
        "who": "你",
        "text": "行，今天有单没？有我去等，可你得先吱一声，我又不会算你的心思。",
        "g": null,
        "mood": ""
      },
      {
        "who": "赵公明",
        "text": "没有。今夜不当值。灯会，你同本君去不去？",
        "g": 0,
        "mood": ""
      },
      {
        "who": "你",
        "text": "陪我去呀？可别到那儿，又说顺道巡街啊！",
        "g": null,
        "mood": ""
      },
      {
        "who": "赵公明",
        "text": "只陪你。不巡街，不看账。",
        "g": 0,
        "mood": ""
      },
      {
        "who": "旁白",
        "text": "你确认似的看了他片刻，从包里取出两张早买好的票，递给他一张。",
        "g": 0,
        "mood": ""
      },
      {
        "who": "你",
        "text": "早问不就好啦！喏，两张。一直揣着，生怕你又说没空呢。",
        "g": null,
        "mood": ""
      },
      {
        "who": "赵公明",
        "text": "你早就买了……倒让本君等到今日才开口。",
        "g": 0,
        "mood": ""
      },
      {
        "who": "你",
        "text": "再晚点，我真找别人去啦！票可不能砸手里。",
        "g": null,
        "mood": ""
      },
      {
        "who": "旁白",
        "text": "他接过票，立刻起身。黑虎又抬起头，被他按了回去。",
        "g": 0,
        "mood": ""
      }
    ]
  },
  {
    "title": "财神申请下班以后见你",
    "place": "第七夜 · 庙后小院",
    "text": "旁白：茶楼收摊，你端着两杯茶进院，发现赵公明已经在桌边坐好。平日放账册的位置，今天只有一碟糕。\n你：哟，账册呢？不会藏袖子里，等我坐下才掏出来吧？\n赵公明：白日便核完了。本君今夜只等这杯茶。给我的？\n旁白：你把茶推过去，自己坐下。他等你喝了一口，才将桌边的椅子往近处挪了挪。\n赵公明：昨夜有句话，你还没答。\n你：什么？！肉串多算钱了？我明明数过……\n赵公明：钱倒记得清。本君问明晚还能否见，你怎么就听不见？\n旁白：你原本想拿糕，手停在半空。昨晚你只当他问今天何时收摊，顺口报了时辰。\n你：你问的是我啊？我还当你问茶楼几点收摊呢！这种话，能不能直着说？\n赵公明：是本君没说清。见了面便管公事，倒把该说的话挤没了。今夜不管那些。\n你：这才像话嘛……连糕都备了，还挺有诚意。\n赵公明：你看了两回，本君记着。\n旁白：你低头看那碟糕，拿起一块，忽然没那么好意思继续逗他。\n赵公明：往后收摊，留个位置给本君。想同你吃饭，陪你看铺子。本君自己想来，你手里没公事也来。\n你：可我烦起来真挺烦的！今天嫌没赚着，明天看中铺子，又嫌贵……你别到时候后悔啊。\n赵公明：那便一起烦。来本君这里，还得先挑个高兴日子？\n旁白：他把手放到桌上，离你的手很近，却没擅自握过来。\n赵公明：本君心悦你。往后愿不愿同本君在一起？这一句，不许再听成问账了。",
    "choices": [
      {
        "label": "答应他，以后下班再慢慢聊",
        "l": 8,
        "t": 8,
        "i": 0,
        "response": "愿意呀！那明天照来啊，待办单子一张都不许带！ 准。饭也先吃，不劳你再来捉。 你将手挪过去，碰了碰他的指尖。他这才握住，低头笑了一下。",
        "replyFrames": [
          {
            "who": "你",
            "text": "愿意呀！那明天照来啊，待办单子一张都不许带！",
            "g": null,
            "mood": ""
          },
          {
            "who": "赵公明",
            "text": "准。饭也先吃，不劳你再来捉。",
            "g": 0,
            "mood": ""
          },
          {
            "who": "旁白",
            "text": "你将手挪过去，碰了碰他的指尖。他这才握住，低头笑了一下。",
            "g": 0,
            "mood": ""
          }
        ]
      },
      {
        "label": "继续做朋友和合伙人",
        "l": 0,
        "t": 5,
        "i": 8,
        "response": "吃饭好说，可恋爱……我还没那份心思。不能因为你糕买得好吃，就哄你白等。 本君听明白了。不必为难，也不必拿别的来抵。 他坐回一些，将糕碟留在你手边。过了一会儿，才问起你新店想开在哪儿。",
        "replyFrames": [
          {
            "who": "你",
            "text": "吃饭好说，可恋爱……我还没那份心思。不能因为你糕买得好吃，就哄你白等。",
            "g": null,
            "mood": ""
          },
          {
            "who": "赵公明",
            "text": "本君听明白了。不必为难，也不必拿别的来抵。",
            "g": 0,
            "mood": ""
          },
          {
            "who": "旁白",
            "text": "他坐回一些，将糕碟留在你手边。过了一会儿，才问起你新店想开在哪儿。",
            "g": 0,
            "mood": ""
          }
        ]
      },
      {
        "label": "回人间开茶铺，认真同他道别",
        "l": 0,
        "t": 0,
        "i": 0,
        "response": "我还是想先回去开店！开张那天你来不来？可得真带钱买，不能赊财神的账。 来，照价付。地址写清，开张请帖若漏了本君，本君可要亲自上门讨。 你找纸记下地址。他等墨干了才折好，收进袖中。",
        "replyFrames": [
          {
            "who": "你",
            "text": "我还是想先回去开店！开张那天你来不来？可得真带钱买，不能赊财神的账。",
            "g": null,
            "mood": ""
          },
          {
            "who": "赵公明",
            "text": "来，照价付。地址写清，开张请帖若漏了本君，本君可要亲自上门讨。",
            "g": 0,
            "mood": ""
          },
          {
            "who": "旁白",
            "text": "你找纸记下地址。他等墨干了才折好，收进袖中。",
            "g": 0,
            "mood": ""
          }
        ]
      }
    ],
    "frames": [
      {
        "who": "旁白",
        "text": "茶楼收摊，你端着两杯茶进院，发现赵公明已经在桌边坐好。平日放账册的位置，今天只有一碟糕。",
        "g": 0,
        "mood": ""
      },
      {
        "who": "你",
        "text": "哟，账册呢？不会藏袖子里，等我坐下才掏出来吧？",
        "g": null,
        "mood": ""
      },
      {
        "who": "赵公明",
        "text": "白日便核完了。本君今夜只等这杯茶。给我的？",
        "g": 0,
        "mood": ""
      },
      {
        "who": "旁白",
        "text": "你把茶推过去，自己坐下。他等你喝了一口，才将桌边的椅子往近处挪了挪。",
        "g": 0,
        "mood": ""
      },
      {
        "who": "赵公明",
        "text": "昨夜有句话，你还没答。",
        "g": 0,
        "mood": ""
      },
      {
        "who": "你",
        "text": "什么？！肉串多算钱了？我明明数过……",
        "g": null,
        "mood": ""
      },
      {
        "who": "赵公明",
        "text": "钱倒记得清。本君问明晚还能否见，你怎么就听不见？",
        "g": 0,
        "mood": ""
      },
      {
        "who": "旁白",
        "text": "你原本想拿糕，手停在半空。昨晚你只当他问今天何时收摊，顺口报了时辰。",
        "g": 0,
        "mood": ""
      },
      {
        "who": "你",
        "text": "你问的是我啊？我还当你问茶楼几点收摊呢！这种话，能不能直着说？",
        "g": null,
        "mood": ""
      },
      {
        "who": "赵公明",
        "text": "是本君没说清。见了面便管公事，倒把该说的话挤没了。今夜不管那些。",
        "g": 0,
        "mood": ""
      },
      {
        "who": "你",
        "text": "这才像话嘛……连糕都备了，还挺有诚意。",
        "g": null,
        "mood": ""
      },
      {
        "who": "赵公明",
        "text": "你看了两回，本君记着。",
        "g": 0,
        "mood": ""
      },
      {
        "who": "旁白",
        "text": "你低头看那碟糕，拿起一块，忽然没那么好意思继续逗他。",
        "g": 0,
        "mood": ""
      },
      {
        "who": "赵公明",
        "text": "往后收摊，留个位置给本君。想同你吃饭，陪你看铺子。本君自己想来，你手里没公事也来。",
        "g": 0,
        "mood": ""
      },
      {
        "who": "你",
        "text": "可我烦起来真挺烦的！今天嫌没赚着，明天看中铺子，又嫌贵……你别到时候后悔啊。",
        "g": null,
        "mood": ""
      },
      {
        "who": "赵公明",
        "text": "那便一起烦。来本君这里，还得先挑个高兴日子？",
        "g": 0,
        "mood": ""
      },
      {
        "who": "旁白",
        "text": "他把手放到桌上，离你的手很近，却没擅自握过来。",
        "g": 0,
        "mood": ""
      },
      {
        "who": "赵公明",
        "text": "本君心悦你。往后愿不愿同本君在一起？这一句，不许再听成问账了。",
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
    "text": "后来，赵公明学会先把轮值交好，再来茶楼找你。有时还是忍不住问，屋顶查过没有，门闩换过没有。你便停下手里的活，看他一眼。\n他自己也知道，问完这些，饭又要凉了。于是把后半句话咽回去，替你拉开椅子。\n黑虎偶尔跟来，你先摸虎，他便在旁边等。等得久了，也会叫你的名字。如今你听见，便知道该回头看看他。"
  },
  "double": {
    "name": "庙有余钱，财神有空",
    "type": "爱情事业双丰收",
    "text": "旧欠清了，店里也留出了周转的钱。你想另开茶铺，拿着看好的铺面来找赵公明，他却先问，你自己最喜欢哪一处。\n你指给他看。他陪你走了一趟，问清要修的地方，回来才慢慢算。意见不同时，你们也会争两句，争完再一起吃饭。\n新店开张那日，他带着贺礼来。你问虎怎么没跟，他说，特意把肉干留在庙里了。今日先让你看看他。"
  },
  "be": {
    "name": "铜盆还在，各自接雨",
    "type": "赵公明 BE",
    "text": "七日的交接办好，你们没有再约往后的见面。赵公明将材料一份份交来，末了问，还有没有要问的。\n你摇头，想了想，又问那盆还漏不漏。他说屋顶修过了，盆已经收起来。\n你笑了一下，拎起自己的包。他送你到街口，没有替你选回去的路。你们都还有些话没想明白，临别只说，保重。"
  },
  "sixth": {
    "name": "第六路财神，正在催款",
    "type": "隐藏 · 独身暴富",
    "text": "庙里旧欠还清，街坊凑钱送来一块第六路财神的牌匾。你伸手摸了半天，第一句问，是不是金的。\n萧升说，镀的。你立刻让陈九公扶稳，镀的也别磕。众人笑成一团，赵公明在下面托住梯子，等你慢慢挂好。\n后来来求财的人多了，你总先请人坐，问遇到了什么事。能一起看的就看，拿不准的也直说。忙完回头，那五个人照旧在等你吃饭。"
  },
  "business": {
    "name": "恋爱先放放，茶要趁热卖",
    "type": "普通经营结局",
    "text": "你留下经营，暂时不谈恋爱。大家仍来帮忙，排班、报酬和分工重新讲清，日子就照常往下过。\n有一回客人问，五位财神都在，怎么还要收茶钱。你刚想解释，陈九公先认真指了指价牌。茶叶、炭和跑腿，都是有成本的。\n你在柜后听得直笑。等人走了，给他倒了一杯，记在赠茶那栏。曹宝看过，这回没有漏。"
  },
  "xiao_he": {
    "name": "鉴宝满分，约会重学",
    "type": "萧升 HE",
    "text": "你后来常在收摊后去珍宝阁。圆鱼杯一直放在柜里，萧升见你来，不再先问带了什么货。\n有时两个人意见不合，声音又会高起来。柜边的铃被碰响，他停一下，等你说完；换你抢话，他也会把铃推过来。\n一回你笑着说，铃比自己忙。他伸手按住铃，问那今晚可不可以都不吵，先陪他吃饭。你看了看他，答应了。",
    "g": 1
  },
  "xiao_be": {
    "name": "铃响了，门仍开着",
    "type": "萧升 BE",
    "text": "你来取自己的东西时，萧升已经包好。最后那只圆鱼杯还没封盒，他问你要不要带走。\n你说不用了，放这里吧。他点头，把它收回柜内。\n出门时铃响了一声，你们都回了头。他问漏了什么，你摇摇头，认真道了谢。这回他没有再找一张货单，请你多留一会儿。",
    "g": 1
  },
  "xiao_double": {
    "name": "满柜珠玉，最怕你摇铃",
    "type": "萧升 · 爱情事业双丰收",
    "text": "珍宝阁和茶楼都攒下家底，你开始筹备自己的新铺子。萧升帮你看货，不再连柜子怎么摆都要先考你一遍。\n你们还是会吵，尤其你一看折扣就想多买时。他也偶尔嘴快，说完便看你的脸色，再把那句话好好说一遍。\n搬柜子那日，你翻到装着便宜珠子的盒子，问放哪儿。他指指你们常喝茶的那层，说就这里，别同待售的混了。",
    "g": 1
  },
  "cao_he": {
    "name": "今晚留白，先亲一下",
    "type": "曹宝 HE",
    "text": "曹宝仍喜欢提前安排，只是会先问你有没有空。你说今日不想出门，他便收起路线，陪你在店里喝一杯。\n有一晚你抱怨买贵了东西，自己越说越气。他想拿纸来算，手伸到一半又停住，问你现在想不想看账。\n你摇头。他便坐近些，听你说完。第二天你自己拿着收据来找，两个人才把那一笔慢慢算清。",
    "g": 2
  },
  "cao_be": {
    "name": "下一页，各自填写",
    "type": "曹宝 BE",
    "text": "交接完，曹宝将账袋系好，递到你手里。你们没有挑出下一次见面的日子，他也没再拿出那张列满去处的纸。\n临走，你问凭据若有不明白的，还能不能写信。他说能，地址没改。\n你将账袋收好，点了点头。他送你下楼，等你走到转角，才慢慢回去收桌上的第二只杯子。",
    "g": 2
  },
  "cao_double": {
    "name": "有钱有闲，表上没填",
    "type": "曹宝 · 爱情事业双丰收",
    "text": "店里留足周转的钱后，你第一次主动提出歇两日。曹宝看过排班，答应了，没有再劝你把那两日也开着。\n出门前，他只问你想带哪件外衣。你翻他的包，仍找到了两张备用路线。他有些窘，说怕遇上封路。\n你将其中一张收进自己包里，另一张留给他。遇事有得商量就好，不必为了陪你出来，连原本的习惯都藏得干干净净。",
    "g": 2
  },
  "chen_he": {
    "name": "这回专程来约你",
    "type": "陈九公 HE",
    "text": "陈九公后来来约你，路上也会遇见熟人喊帮忙。他先问做什么、要多久，真的赶不上，便约别的时辰。\n你等在门边，看他终于走过来，故意问今天怎么不顺路了。他脸红着笑，说就是专程来的。\n吃饭时，你给他看那笔旧款到账的消息。他比你还高兴，差点站起来，被你按回椅子。饭先吃，下回高兴也不能把自己的忘了。",
    "g": 3
  },
  "chen_be": {
    "name": "信已读，路各自走",
    "type": "陈九公 BE",
    "text": "陈九公收回那封信，陪你吃完了饭。你说抱歉，他摇头，说这些日子帮过的忙，不用拿答应恋爱来还。\n离开前，你又叮嘱他，跑过的活记得问钱。他点头，反过来提醒你，未付的稿费也别就这么算了。\n后来你在街上碰见他，他仍会停下来打招呼。只是这次真有差事，问过你近况，便准时去交货，没有再绕回来。",
    "g": 3
  },
  "chen_double": {
    "name": "财神终于准点下班",
    "type": "陈九公 · 爱情事业双丰收",
    "text": "庙里还清旧欠，送货也排出了轮班。熟客最初不习惯，后来要加单，都会先来问今日接不接得下。\n你开新茶铺那天，陈九公提前到了。剪彩、摆花篮、搬桌子，他都先问你要不要帮，忙完就坐到你留的那张椅子上。\n有人在门口喊他送一趟，他说今日休息，替人指了接班伙伴的位置。回头见你看着，便小声问，晚上那顿约好了吗，别又忙忘了。",
    "g": 3
  },
  "yao_he": {
    "name": "宜约会，本人同意",
    "type": "姚少司 HE",
    "text": "姚少司依然爱说吉利话，但真问到你想要什么，会等你说完。约会偶尔遇上下雨，他也不再忙着把坏天气讲成好兆头。\n你们在檐下挤着吃热面，你埋怨鞋湿，他便低头看看哪里能买到干布。找不到，就老实陪你等雨小些。\n有天你翻出那支宜独处的签，他见了直笑，问还没扔？你说留着，以后你再不肯直说，就拿这个提醒。他说行，只要别因此真不来见他。",
    "g": 4
  },
  "yao_be": {
    "name": "空签也能好好收场",
    "type": "姚少司 BE",
    "text": "姚少司将桌上的手收回来，安静了一会儿，说自己需要缓缓。你点头，陪他收好最后一只箱子。\n原本备了很多话，真到分别，他只说了路上小心。你也没有拿一句以后再说，让他继续等。\n后来你们仍有书信往来，讲茶味，讲集市的新摊位。有回他写那天有些难过，你看完回信，说自己也舍不得，但当时那句回答，还是认真想过的。",
    "g": 4
  },
  "yao_double": {
    "name": "开张大吉，闭店约会",
    "type": "姚少司 · 爱情事业双丰收",
    "text": "后来茶摊慢慢做稳，庙里的旧欠也还清了。新茶仍有卖得不好的时候，你们先问客人，再一点点改，没人能每次都猜准。\n收摊后，姚少司会把当日没办完的事写下，明日接着来。你见他又想通宵改牌子，便把饭摆到旁边，等他自己放笔。\n有晚他抬头说，想约你出去，位置已经看过。你问这回用不用抽签，他笑着伸手，说不用，先等你答应。",
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
