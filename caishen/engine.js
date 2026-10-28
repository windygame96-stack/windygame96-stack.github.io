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
case 'game':{let g=p.g;if(!Number.isInteger(g)||g<0||g>4)return {ok:false,text:'小游戏不存在。'};s.memory.games[g]++;if(g===0)s.memory.tiger+=p.win?3:1;if(g===1&&p.win&&!p.skipKnowledge&&Number.isInteger(p.card)&&p.card>=0&&p.card<2&&!s.memory.knowledge.includes(p.card))s.memory.knowledge.push(p.card);if(g===4&&p.experiment){s.memory.luck.rounds+=p.experiment.rounds;s.memory.luck.stay+=p.experiment.stay;s.memory.luck.swap+=p.experiment.swap;}if(d.rewards.includes(g)){msg='练习完成。今日该角色奖励已领，重复游玩不再增加经济奖励。';break;}d.rewards.push(g);let r=g===3&&Object.prototype.hasOwnProperty.call(p,'deliveryCount')?deliveryReward(p.deliveryCount):{cash:p.win?25:10,love:p.win?5:2,trust:p.win?4:2,independent:p.win?2:0};s.cash+=r.cash;bond(s,g,r.love,r.trust);change(s,'independent',r.independent);log(s,NAMES[g]+'互动奖励',r.cash);msg=(r.count!==undefined?'送达 '+r.count+' / 8 户':p.win?'互动成功':'完成练习')+'：元宝 +'+r.cash+'、好感 +'+r.love+'、信任 +'+r.trust+'、独立 +'+r.independent+'。';break;}
case 'story':{if(d.story)return {ok:false,text:'今日剧情已经读完。'};let chapter=getStory(s),g=s.day===1?0:routeOf(s),choice=chapter.choices[p.choice];if(!choice)return {ok:false,text:'选择不存在。'};d.story=true;bond(s,g,choice.l,choice.t);change(s,'independent',choice.i||0);if(choice.flag)flag(s,choice.flag);if(choice.flags)choice.flags.forEach(f=>flag(s,f));if(s.day===7)s.relationship=p.choice===0?'romance':p.choice===1?'friend':'leave';s.story.push({day:s.day,g,choice:p.choice,title:chapter.title,response:choice.response});msg=choice.response;break;}
case 'next':if(!d.story)return {ok:false,text:'先读完今夜剧情，再结束这一天。'};s.days.push({day:s.day,cash:s.cash,debt:s.debt,net:assets(s),independent:s.independent,collected:d.collected,order:d.order});if(s.day===7){s.ending=ending(s);msg='七日之约已完成。';}else{s.day++;s.daily=daily();msg='第 '+s.day+' 日，财神庙又迎来新的早晨。';}break;
default:return {ok:false,text:'未知操作。'};
}return {ok:true,text:msg};}
const STORY=[
  {
    "title": "财神庙今日招人",
    "place": "序幕 · 雨夜财神庙",
    "text": "旁白：工资刚到账，房租和几笔日常扣款便挨个跳出来。你还没看清余额，手机先提醒电量不足。\n你：财神爷，今晚能不能管管我？钱没留住，想开的茶铺也一直没开成。\n旁白：你抱着那份改了很多遍的茶铺计划进庙躲雨。神像前供着两块饼，其中一块忽然被黑虎叼走。\n你：……财神庙还养真老虎？\n赵公明：别跑。它叼着饼，不会来叼你。\n旁白：一个黑衣男子走下台阶，接住快要漏雨的铜盆。金冠和衣摆都好看，接雨的动作却十分熟练。\n你：你是赵公明？我刚才求财，你听见了？\n赵公明：听见了。你说想让钱留得久些，也想做自己的生意。先坐，衣服都湿了。\n曹宝：坐这边，凳子是干的。顺便问一句，你会看账吗？\n你：我来求财，还要面试？\n曹宝：这里确实在招临时庙主。我是曹宝，账在我这儿。庙里现钱二百二十元宝，旧欠三百，还有一间能开门的茶楼。\n你：你们住财神庙，也会手头紧？\n萧升：财神也得付茶钱、修屋顶。几位前任只管等拨款，茶楼不开，珍宝阁落灰，客人自然不来。\n陈九公：七日后要交经营账册。再不开门做生意，这座庙就保不住日常开支了。\n姚少司：先别被他们的账吓跑。你带着计划，我们有铺子，可以坐下谈谈。\n旁白：你把茶铺计划摊在桌上。萧升挪开供盘，陈九公点灯，曹宝先把一块干净布放到你手机下面。\n你：我会做茶、招呼客人，也做过小摊。可我怕钱没赚到，反倒又多背一笔债。\n赵公明：旧欠记在庙里，用经营收入偿还，不会转到你个人名下。报酬和分账写清楚，你想退出也可以。\n曹宝：庙里用元宝记账，你人间的银行卡另算。家里要用的钱，别糊里糊涂拿来填铺子的账。\n你：那你们五个，除了看我算账，还能帮什么？\n萧升：萧升，管招宝。进货、识物、和商贩谈价，找我。有人拿祖传三天的盆来，我替你问问传了几代。\n陈九公：陈九公，管招财。找客人、送货、跑街坊，我都熟！就是有时跑快了，你记得喊我吃饭。\n姚少司：姚少司，管利市。机会和新消息我去找。有没有用，咱们问清楚再试，别听一句吉利话就掏钱。\n曹宝：我陪你安排收支。留多少进货、多少付工钱，先让这几天过得稳当。\n赵公明：至于想靠赌一把，把窟窿全补上的事，先来找我。钱急用时，人更容易被话哄住。\n你：听起来，像五个管钱又管饭的同事。\n萧升：管饭可以。同事以外的事，等熟一点再说。\n旁白：你被逗笑，伸手接过庙门钥匙。桌角一本旧册被风翻开，写着你名字的那页，竟一片空白。\n你：这个怎么没写完？\n赵公明：旧命簿，得核过档才能说清。先收好，今晚把屋顶和饭解决，别让一页纸吓住你。\n你：好。七日试着把茶楼开起来。钱的事我不懂就问，你们也别端着神仙架子不肯说。\n旁白：黑虎趴到你脚边，尾巴敲了敲凳腿。曹宝把账本翻到新的一页，五个人都给你留出了落笔的位置。",
    "choices": [
      {
        "label": "先看账、谈清分工和报酬，再一起开张",
        "l": 8,
        "t": 10,
        "i": 8,
        "response": "经营的钱、人间生活的钱，都分清楚。明早谁做什么，也先说好。 好。你管茶楼，我先找人修屋顶。今晚先吃口热的。",
        "replyFrames": [
          {
            "who": "你",
            "text": "经营的钱、人间生活的钱，都分清楚。明早谁做什么，也先说好。",
            "g": null,
            "mood": "平静"
          },
          {
            "who": "赵公明",
            "text": "好。你管茶楼，我先找人修屋顶。今晚先吃口热的。",
            "g": 0,
            "mood": "平静"
          }
        ]
      },
      {
        "label": "只想求一次暴富，暂时不愿细看账",
        "l": 2,
        "t": 0,
        "i": 0,
        "response": "我本来还想，财神施个法，明早就不用愁钱了。 我知道你累。今晚可以先歇，账明早再看。可没看清就签下名字的事，别急。",
        "replyFrames": [
          {
            "who": "你",
            "text": "我本来还想，财神施个法，明早就不用愁钱了。",
            "g": null,
            "mood": "平静"
          },
          {
            "who": "赵公明",
            "text": "我知道你累。今晚可以先歇，账明早再看。可没看清就签下名字的事，别急。",
            "g": 0,
            "mood": "平静"
          }
        ]
      }
    ],
    "frames": [
      {
        "who": "旁白",
        "text": "工资刚到账，房租和几笔日常扣款便挨个跳出来。你还没看清余额，手机先提醒电量不足。",
        "g": 0,
        "mood": "平静"
      },
      {
        "who": "你",
        "text": "财神爷，今晚能不能管管我？钱没留住，想开的茶铺也一直没开成。",
        "g": null,
        "mood": "平静"
      },
      {
        "who": "旁白",
        "text": "你抱着那份改了很多遍的茶铺计划进庙躲雨。神像前供着两块饼，其中一块忽然被黑虎叼走。",
        "g": 0,
        "mood": "平静"
      },
      {
        "who": "你",
        "text": "……财神庙还养真老虎？",
        "g": null,
        "mood": "平静"
      },
      {
        "who": "赵公明",
        "text": "别跑。它叼着饼，不会来叼你。",
        "g": 0,
        "mood": "平静"
      },
      {
        "who": "旁白",
        "text": "一个黑衣男子走下台阶，接住快要漏雨的铜盆。金冠和衣摆都好看，接雨的动作却十分熟练。",
        "g": 0,
        "mood": "平静"
      },
      {
        "who": "你",
        "text": "你是赵公明？我刚才求财，你听见了？",
        "g": null,
        "mood": "平静"
      },
      {
        "who": "赵公明",
        "text": "听见了。你说想让钱留得久些，也想做自己的生意。先坐，衣服都湿了。",
        "g": 0,
        "mood": "平静"
      },
      {
        "who": "曹宝",
        "text": "坐这边，凳子是干的。顺便问一句，你会看账吗？",
        "g": 2,
        "mood": "平静"
      },
      {
        "who": "你",
        "text": "我来求财，还要面试？",
        "g": null,
        "mood": "平静"
      },
      {
        "who": "曹宝",
        "text": "这里确实在招临时庙主。我是曹宝，账在我这儿。庙里现钱二百二十元宝，旧欠三百，还有一间能开门的茶楼。",
        "g": 2,
        "mood": "平静"
      },
      {
        "who": "你",
        "text": "你们住财神庙，也会手头紧？",
        "g": null,
        "mood": "平静"
      },
      {
        "who": "萧升",
        "text": "财神也得付茶钱、修屋顶。几位前任只管等拨款，茶楼不开，珍宝阁落灰，客人自然不来。",
        "g": 1,
        "mood": "平静"
      },
      {
        "who": "陈九公",
        "text": "七日后要交经营账册。再不开门做生意，这座庙就保不住日常开支了。",
        "g": 3,
        "mood": "平静"
      },
      {
        "who": "姚少司",
        "text": "先别被他们的账吓跑。你带着计划，我们有铺子，可以坐下谈谈。",
        "g": 4,
        "mood": "平静"
      },
      {
        "who": "旁白",
        "text": "你把茶铺计划摊在桌上。萧升挪开供盘，陈九公点灯，曹宝先把一块干净布放到你手机下面。",
        "g": 0,
        "mood": "平静"
      },
      {
        "who": "你",
        "text": "我会做茶、招呼客人，也做过小摊。可我怕钱没赚到，反倒又多背一笔债。",
        "g": null,
        "mood": "平静"
      },
      {
        "who": "赵公明",
        "text": "旧欠记在庙里，用经营收入偿还，不会转到你个人名下。报酬和分账写清楚，你想退出也可以。",
        "g": 0,
        "mood": "平静"
      },
      {
        "who": "曹宝",
        "text": "庙里用元宝记账，你人间的银行卡另算。家里要用的钱，别糊里糊涂拿来填铺子的账。",
        "g": 2,
        "mood": "平静"
      },
      {
        "who": "你",
        "text": "那你们五个，除了看我算账，还能帮什么？",
        "g": null,
        "mood": "平静"
      },
      {
        "who": "萧升",
        "text": "萧升，管招宝。进货、识物、和商贩谈价，找我。有人拿祖传三天的盆来，我替你问问传了几代。",
        "g": 1,
        "mood": "平静"
      },
      {
        "who": "陈九公",
        "text": "陈九公，管招财。找客人、送货、跑街坊，我都熟！就是有时跑快了，你记得喊我吃饭。",
        "g": 3,
        "mood": "平静"
      },
      {
        "who": "姚少司",
        "text": "姚少司，管利市。机会和新消息我去找。有没有用，咱们问清楚再试，别听一句吉利话就掏钱。",
        "g": 4,
        "mood": "平静"
      },
      {
        "who": "曹宝",
        "text": "我陪你安排收支。留多少进货、多少付工钱，先让这几天过得稳当。",
        "g": 2,
        "mood": "平静"
      },
      {
        "who": "赵公明",
        "text": "至于想靠赌一把，把窟窿全补上的事，先来找我。钱急用时，人更容易被话哄住。",
        "g": 0,
        "mood": "平静"
      },
      {
        "who": "你",
        "text": "听起来，像五个管钱又管饭的同事。",
        "g": null,
        "mood": "平静"
      },
      {
        "who": "萧升",
        "text": "管饭可以。同事以外的事，等熟一点再说。",
        "g": 1,
        "mood": "平静"
      },
      {
        "who": "旁白",
        "text": "你被逗笑，伸手接过庙门钥匙。桌角一本旧册被风翻开，写着你名字的那页，竟一片空白。",
        "g": 0,
        "mood": "平静"
      },
      {
        "who": "你",
        "text": "这个怎么没写完？",
        "g": null,
        "mood": "平静"
      },
      {
        "who": "赵公明",
        "text": "旧命簿，得核过档才能说清。先收好，今晚把屋顶和饭解决，别让一页纸吓住你。",
        "g": 0,
        "mood": "平静"
      },
      {
        "who": "你",
        "text": "好。七日试着把茶楼开起来。钱的事我不懂就问，你们也别端着神仙架子不肯说。",
        "g": null,
        "mood": "平静"
      },
      {
        "who": "旁白",
        "text": "黑虎趴到你脚边，尾巴敲了敲凳腿。曹宝把账本翻到新的一页，五个人都给你留出了落笔的位置。",
        "g": 0,
        "mood": "平静"
      }
    ]
  },
  {
    "title": "今天赚的还没全进袋",
    "place": "第二夜 · 茶楼账房",
    "text": "旁白：茶楼试营业，你守着钱匣数了两遍。白天忙得脚酸，眼下听见铜钱响，连肩膀都轻了些。\n你：收了这么多，明天是不是能换一整套新茶具？\n赵公明：先等一等。茶叶、炭、今天帮忙的工钱，付完再看还剩多少。\n你：还没高兴一会儿，就来找我要账。\n赵公明：高兴可以。我怕你把明早买茶的钱也买成杯子，客人来了，只能请人喝空气。\n旁白：他把白日的小票一张张摊开，留出干净的地方让你写。数到最后，你往椅背上一靠。\n你：原来进匣子的，只有一部分真能拿去花。\n赵公明：嗯。先把已经答应付的钱留出来，剩下的再商量。\n你：我在人间也这样。工资一来，看余额还行，过几天扣款就一笔接一笔。\n旁白：你点亮手机，指着几项扣款。他把身子挪近，先问哪几项方便给他看。\n你：这项试用早就没用了，我居然还在付。\n赵公明：你想停，就把取消入口找出来。别只关提醒，钱还会照扣。\n旁白：你们找了一会儿，终于看见取消成功的页面。你往账边写了一句，下次试用先记到期日。\n你：财神第一次显灵，帮我找取消按钮。\n赵公明：这按钮藏得比黑虎叼走的梳子还深，找它倒花了些本事。\n旁白：黑虎听见名字，竖起一只耳朵。他把茶换成热的，放到你没拿笔的那只手边。",
    "choices": [
      {
        "label": "把成本和近期支出留好，再安排能花的钱",
        "l": 10,
        "t": 8,
        "i": 3,
        "response": "明天进货的钱先留着。新茶具，等看清用不用得上再买。 好。你想添东西时，我陪你去挑。今晚先把腿歇一歇。",
        "replyFrames": [
          {
            "who": "你",
            "text": "明天进货的钱先留着。新茶具，等看清用不用得上再买。",
            "g": null,
            "mood": "平静"
          },
          {
            "who": "赵公明",
            "text": "好。你想添东西时，我陪你去挑。今晚先把腿歇一歇。",
            "g": 0,
            "mood": "平静"
          }
        ]
      },
      {
        "label": "只看钱匣总数，先买全套新茶具再补账",
        "l": 0,
        "t": 5,
        "i": 5,
        "response": "买完再赚回来，总能补上。 也可能明日客少。已经答应别人的工钱不能跟着赌，先把那一笔放回去。 你停住伸向钱匣的手，账上几项还没谈拢。",
        "replyFrames": [
          {
            "who": "你",
            "text": "买完再赚回来，总能补上。",
            "g": null,
            "mood": "平静"
          },
          {
            "who": "赵公明",
            "text": "也可能明日客少。已经答应别人的工钱不能跟着赌，先把那一笔放回去。",
            "g": 0,
            "mood": "平静"
          },
          {
            "who": "旁白",
            "text": "你停住伸向钱匣的手，账上几项还没谈拢。",
            "g": 0,
            "mood": "平静"
          }
        ]
      }
    ],
    "frames": [
      {
        "who": "旁白",
        "text": "茶楼试营业，你守着钱匣数了两遍。白天忙得脚酸，眼下听见铜钱响，连肩膀都轻了些。",
        "g": 0,
        "mood": "平静"
      },
      {
        "who": "你",
        "text": "收了这么多，明天是不是能换一整套新茶具？",
        "g": null,
        "mood": "平静"
      },
      {
        "who": "赵公明",
        "text": "先等一等。茶叶、炭、今天帮忙的工钱，付完再看还剩多少。",
        "g": 0,
        "mood": "平静"
      },
      {
        "who": "你",
        "text": "还没高兴一会儿，就来找我要账。",
        "g": null,
        "mood": "平静"
      },
      {
        "who": "赵公明",
        "text": "高兴可以。我怕你把明早买茶的钱也买成杯子，客人来了，只能请人喝空气。",
        "g": 0,
        "mood": "平静"
      },
      {
        "who": "旁白",
        "text": "他把白日的小票一张张摊开，留出干净的地方让你写。数到最后，你往椅背上一靠。",
        "g": 0,
        "mood": "平静"
      },
      {
        "who": "你",
        "text": "原来进匣子的，只有一部分真能拿去花。",
        "g": null,
        "mood": "平静"
      },
      {
        "who": "赵公明",
        "text": "嗯。先把已经答应付的钱留出来，剩下的再商量。",
        "g": 0,
        "mood": "平静"
      },
      {
        "who": "你",
        "text": "我在人间也这样。工资一来，看余额还行，过几天扣款就一笔接一笔。",
        "g": null,
        "mood": "平静"
      },
      {
        "who": "旁白",
        "text": "你点亮手机，指着几项扣款。他把身子挪近，先问哪几项方便给他看。",
        "g": 0,
        "mood": "平静"
      },
      {
        "who": "你",
        "text": "这项试用早就没用了，我居然还在付。",
        "g": null,
        "mood": "平静"
      },
      {
        "who": "赵公明",
        "text": "你想停，就把取消入口找出来。别只关提醒，钱还会照扣。",
        "g": 0,
        "mood": "平静"
      },
      {
        "who": "旁白",
        "text": "你们找了一会儿，终于看见取消成功的页面。你往账边写了一句，下次试用先记到期日。",
        "g": 0,
        "mood": "平静"
      },
      {
        "who": "你",
        "text": "财神第一次显灵，帮我找取消按钮。",
        "g": null,
        "mood": "平静"
      },
      {
        "who": "赵公明",
        "text": "这按钮藏得比黑虎叼走的梳子还深，找它倒花了些本事。",
        "g": 0,
        "mood": "平静"
      },
      {
        "who": "旁白",
        "text": "黑虎听见名字，竖起一只耳朵。他把茶换成热的，放到你没拿笔的那只手边。",
        "g": 0,
        "mood": "平静"
      }
    ]
  },
  {
    "title": "差一点就想翻本",
    "place": "第三夜 · 人间集市",
    "text": "旁白：修屋顶的报价比你预计高。你在集市转了一圈，正盘算能不能再缓一天，旁边有人喊出翻倍的彩头。\n你：只试一回，中了就能补瓦钱。\n旁白：你刚摸到钱袋，赵公明从人群外走来。他没抢你的手，先挡开往前挤的人。\n赵公明：先陪我出去透口气。\n你：你是不是觉得我特别没出息，才会想靠这个？\n赵公明：我听见修瓦的报价了。你急着把庙撑起来，我知道。\n旁白：你站到茶摊边，手仍攥着钱袋。身后又有人喊差一点，下一回准中。\n赵公明：这句差一点，会让人想再付一回。输了的钱也不会因为你多押一次，就答应回来。\n你：可我现在就是缺这一笔。你叫我别赌，也得让我知道接下来怎么办。\n赵公明：先问屋顶哪块必须今天修，哪些能分着做。再问工匠能不能把材料和工钱列开，咱们核清。\n你：如果还是不够呢？\n赵公明：就按能承受的安排商量，或者暂时少开几张桌。缺的钱要想办法，可吃饭、进货的钱先别押进去。\n旁白：你盯着钱袋看了一会儿，把它放回衣袋。赵公明这才给你端来一碗热茶。\n你：你管过那么多求财的人，也会听他们说自己害怕吗？\n赵公明：肯说的，我就听。怕钱不够，不是什么难以启齿的事。\n旁白：你们回去找工匠，把急着补的漏处圈出来。账还没全解决，但今晚要做什么终于排清了。\n你：回庙以后，能不能让我摸一会儿虎？\n赵公明：可以。它归它，我也在。",
    "choices": [
      {
        "label": "先离开彩头摊，核清修缮安排，保住必需开支",
        "l": 8,
        "t": 12,
        "i": 10,
        "flag": "evidence",
        "response": "先修会漏到茶桌的那块，其他的问清再排。我不拿明天的饭钱试。 我陪你去问。钱袋你自己收好，想回头时喊我一声。",
        "replyFrames": [
          {
            "who": "你",
            "text": "先修会漏到茶桌的那块，其他的问清再排。我不拿明天的饭钱试。",
            "g": null,
            "mood": "平静"
          },
          {
            "who": "赵公明",
            "text": "我陪你去问。钱袋你自己收好，想回头时喊我一声。",
            "g": 0,
            "mood": "平静"
          }
        ]
      },
      {
        "label": "觉得差一点就能赢，仍想再押一次",
        "l": 2,
        "t": -10,
        "i": 0,
        "response": "我知道你说的，可刚才真的就差一点。 正因为舍不得那一次，才更该先停。今天这笔我不能替你算成能赢的钱。 他留在摊外等你，你们没能像原先那样轻松地聊下去。",
        "replyFrames": [
          {
            "who": "你",
            "text": "我知道你说的，可刚才真的就差一点。",
            "g": null,
            "mood": "平静"
          },
          {
            "who": "赵公明",
            "text": "正因为舍不得那一次，才更该先停。今天这笔我不能替你算成能赢的钱。",
            "g": 0,
            "mood": "平静"
          },
          {
            "who": "旁白",
            "text": "他留在摊外等你，你们没能像原先那样轻松地聊下去。",
            "g": 0,
            "mood": "平静"
          }
        ]
      }
    ],
    "frames": [
      {
        "who": "旁白",
        "text": "修屋顶的报价比你预计高。你在集市转了一圈，正盘算能不能再缓一天，旁边有人喊出翻倍的彩头。",
        "g": 0,
        "mood": "平静"
      },
      {
        "who": "你",
        "text": "只试一回，中了就能补瓦钱。",
        "g": null,
        "mood": "平静"
      },
      {
        "who": "旁白",
        "text": "你刚摸到钱袋，赵公明从人群外走来。他没抢你的手，先挡开往前挤的人。",
        "g": 0,
        "mood": "平静"
      },
      {
        "who": "赵公明",
        "text": "先陪我出去透口气。",
        "g": 0,
        "mood": "平静"
      },
      {
        "who": "你",
        "text": "你是不是觉得我特别没出息，才会想靠这个？",
        "g": null,
        "mood": "平静"
      },
      {
        "who": "赵公明",
        "text": "我听见修瓦的报价了。你急着把庙撑起来，我知道。",
        "g": 0,
        "mood": "平静"
      },
      {
        "who": "旁白",
        "text": "你站到茶摊边，手仍攥着钱袋。身后又有人喊差一点，下一回准中。",
        "g": 0,
        "mood": "平静"
      },
      {
        "who": "赵公明",
        "text": "这句差一点，会让人想再付一回。输了的钱也不会因为你多押一次，就答应回来。",
        "g": 0,
        "mood": "平静"
      },
      {
        "who": "你",
        "text": "可我现在就是缺这一笔。你叫我别赌，也得让我知道接下来怎么办。",
        "g": null,
        "mood": "平静"
      },
      {
        "who": "赵公明",
        "text": "先问屋顶哪块必须今天修，哪些能分着做。再问工匠能不能把材料和工钱列开，咱们核清。",
        "g": 0,
        "mood": "平静"
      },
      {
        "who": "你",
        "text": "如果还是不够呢？",
        "g": null,
        "mood": "平静"
      },
      {
        "who": "赵公明",
        "text": "就按能承受的安排商量，或者暂时少开几张桌。缺的钱要想办法，可吃饭、进货的钱先别押进去。",
        "g": 0,
        "mood": "平静"
      },
      {
        "who": "旁白",
        "text": "你盯着钱袋看了一会儿，把它放回衣袋。赵公明这才给你端来一碗热茶。",
        "g": 0,
        "mood": "平静"
      },
      {
        "who": "你",
        "text": "你管过那么多求财的人，也会听他们说自己害怕吗？",
        "g": null,
        "mood": "平静"
      },
      {
        "who": "赵公明",
        "text": "肯说的，我就听。怕钱不够，不是什么难以启齿的事。",
        "g": 0,
        "mood": "平静"
      },
      {
        "who": "旁白",
        "text": "你们回去找工匠，把急着补的漏处圈出来。账还没全解决，但今晚要做什么终于排清了。",
        "g": 0,
        "mood": "平静"
      },
      {
        "who": "你",
        "text": "回庙以后，能不能让我摸一会儿虎？",
        "g": null,
        "mood": "平静"
      },
      {
        "who": "赵公明",
        "text": "可以。它归它，我也在。",
        "g": 0,
        "mood": "平静"
      }
    ]
  },
  {
    "title": "这张担保单得问清",
    "place": "第四夜 · 茶楼账房",
    "text": "旁白：一个商人带来旧式担保单，说付一笔定钱，就能让茶楼每晚坐满客人。\n你：他还说，有财神的印，钱绝不会少。\n赵公明：印从哪里来，客人从哪里来，没做到怎么处理，他说清楚了吗？\n你：问到具体的，他只说名额快没了，让我现在付。\n旁白：你们把单子和往来消息放在桌上。赵公明指着承诺的那行，又翻到没有署名的末页。\n赵公明：这是已经停用的旧印。有人借这个名义卖保证，我得去核查。\n你：我们也差点答应。如果把经过写出来，会不会显得新庙主很好骗？\n赵公明：问过、核过、发现不对再停，很值得写。你不必为了显得从没犯错，让后来的人看不见这件事。\n旁白：你翻出一张旧收据，发现自己已经付过一笔样单钱。你没立刻递给他，纸边在指间折起来。\n你：这一笔，我昨天没问你。我想先办出点成绩。\n赵公明：我看到了。先把时间和收款方式记好，能联系谁、能查哪些记录，我们一项项来。\n你：你不生气？\n赵公明：我担心。但要你以后还肯来告诉我，今晚就不能只顾着责备。\n旁白：他替你铺平收据，把自己的核查责任也写在旁边。有关的通知只保留经过，客人的私事另行遮去。\n你：钱能不能回来，现在还不知道。\n赵公明：对，别先许诺。先停后续付款，把已经发生的说清，再去找可以处理的人。\n旁白：你拿起笔。这次他没有替你落字，只把灯往你这边挪了挪。",
    "choices": [
      {
        "label": "保留单据，如实记录损失和旧印问题，一起核查",
        "l": 10,
        "t": 15,
        "i": 12,
        "flag": "truth",
        "response": "样单钱也写进去。以后接这种保证单，先把来源和条款问清楚。 我会署名说明旧印的问题。你已经知道的，就按知道的写。",
        "replyFrames": [
          {
            "who": "你",
            "text": "样单钱也写进去。以后接这种保证单，先把来源和条款问清楚。",
            "g": null,
            "mood": "平静"
          },
          {
            "who": "赵公明",
            "text": "我会署名说明旧印的问题。你已经知道的，就按知道的写。",
            "g": 0,
            "mood": "平静"
          }
        ]
      },
      {
        "label": "藏起收据，继续替这份保证单招揽别人",
        "l": -8,
        "t": -20,
        "i": -5,
        "flag": "betray",
        "response": "我想先把付出去的赚回来，别让街坊知道。 你可以不向街坊公开自己的私事。但明知单子有问题，还拿它收别人的钱，我不能答应。 他取下已经摆到门边的招牌，你们之间第一次隔出一段沉默。",
        "replyFrames": [
          {
            "who": "你",
            "text": "我想先把付出去的赚回来，别让街坊知道。",
            "g": null,
            "mood": "平静"
          },
          {
            "who": "赵公明",
            "text": "你可以不向街坊公开自己的私事。但明知单子有问题，还拿它收别人的钱，我不能答应。",
            "g": 0,
            "mood": "平静"
          },
          {
            "who": "旁白",
            "text": "他取下已经摆到门边的招牌，你们之间第一次隔出一段沉默。",
            "g": 0,
            "mood": "平静"
          }
        ]
      }
    ],
    "frames": [
      {
        "who": "旁白",
        "text": "一个商人带来旧式担保单，说付一笔定钱，就能让茶楼每晚坐满客人。",
        "g": 0,
        "mood": "平静"
      },
      {
        "who": "你",
        "text": "他还说，有财神的印，钱绝不会少。",
        "g": null,
        "mood": "平静"
      },
      {
        "who": "赵公明",
        "text": "印从哪里来，客人从哪里来，没做到怎么处理，他说清楚了吗？",
        "g": 0,
        "mood": "平静"
      },
      {
        "who": "你",
        "text": "问到具体的，他只说名额快没了，让我现在付。",
        "g": null,
        "mood": "平静"
      },
      {
        "who": "旁白",
        "text": "你们把单子和往来消息放在桌上。赵公明指着承诺的那行，又翻到没有署名的末页。",
        "g": 0,
        "mood": "平静"
      },
      {
        "who": "赵公明",
        "text": "这是已经停用的旧印。有人借这个名义卖保证，我得去核查。",
        "g": 0,
        "mood": "平静"
      },
      {
        "who": "你",
        "text": "我们也差点答应。如果把经过写出来，会不会显得新庙主很好骗？",
        "g": null,
        "mood": "平静"
      },
      {
        "who": "赵公明",
        "text": "问过、核过、发现不对再停，很值得写。你不必为了显得从没犯错，让后来的人看不见这件事。",
        "g": 0,
        "mood": "平静"
      },
      {
        "who": "旁白",
        "text": "你翻出一张旧收据，发现自己已经付过一笔样单钱。你没立刻递给他，纸边在指间折起来。",
        "g": 0,
        "mood": "平静"
      },
      {
        "who": "你",
        "text": "这一笔，我昨天没问你。我想先办出点成绩。",
        "g": null,
        "mood": "平静"
      },
      {
        "who": "赵公明",
        "text": "我看到了。先把时间和收款方式记好，能联系谁、能查哪些记录，我们一项项来。",
        "g": 0,
        "mood": "平静"
      },
      {
        "who": "你",
        "text": "你不生气？",
        "g": null,
        "mood": "平静"
      },
      {
        "who": "赵公明",
        "text": "我担心。但要你以后还肯来告诉我，今晚就不能只顾着责备。",
        "g": 0,
        "mood": "平静"
      },
      {
        "who": "旁白",
        "text": "他替你铺平收据，把自己的核查责任也写在旁边。有关的通知只保留经过，客人的私事另行遮去。",
        "g": 0,
        "mood": "平静"
      },
      {
        "who": "你",
        "text": "钱能不能回来，现在还不知道。",
        "g": null,
        "mood": "平静"
      },
      {
        "who": "赵公明",
        "text": "对，别先许诺。先停后续付款，把已经发生的说清，再去找可以处理的人。",
        "g": 0,
        "mood": "平静"
      },
      {
        "who": "旁白",
        "text": "你拿起笔。这次他没有替你落字，只把灯往你这边挪了挪。",
        "g": 0,
        "mood": "平静"
      }
    ]
  },
  {
    "title": "先吃饭，再说省钱",
    "place": "第五夜 · 庙后小院",
    "text": "旁白：你收完最后一张桌，正想把剩下的冷饼当晚饭，赵公明端着热汤来到院里。\n赵公明：今天在集市看见你，只买了一张饼。\n你：想省一点。账没补齐，吃好的总觉得心虚。\n赵公明：饭钱原本就在安排里。你一整天站着，先坐下来。\n旁白：他把汤放稳，没有端走你的饼，而是掰开一半，放到自己碗边。\n你：你也吃这个？\n赵公明：配热汤，正好。你想省的地方，我们可以一起找，别只从你自己的饭里扣。\n你：那今晚出来吃饭，算你送财？\n赵公明：算我想和你一起吃。\n旁白：你低头喝汤，刚觉得有点烫，面前就多了一只空碟。他已经把饼撕成容易入口的小块。\n你：你平时都这样照顾人？\n赵公明：有时问账，有时拦人赌钱。把饭等到你收摊再吃，是这几天才有的习惯。\n旁白：黑虎从你们脚边绕过去，鼻子朝向肉香，被赵公明轻轻按住脑袋。\n你：它也来分我这份？\n赵公明：它刚吃过。今晚这碗，我特意给你留的。\n旁白：院门被他虚掩上。账本还在屋里，你们坐着把热汤喝完，谁也没先起身。",
    "choices": [
      {
        "label": "好好吃完这顿饭，和他说说今天累在哪里",
        "l": 12,
        "t": 8,
        "i": 3,
        "response": "其实我下午就饿了，还怕你们觉得我不会吃苦。 往后说一声。你来当庙主，也该有吃饭和歇脚的时候。",
        "replyFrames": [
          {
            "who": "你",
            "text": "其实我下午就饿了，还怕你们觉得我不会吃苦。",
            "g": null,
            "mood": "平静"
          },
          {
            "who": "赵公明",
            "text": "往后说一声。你来当庙主，也该有吃饭和歇脚的时候。",
            "g": 0,
            "mood": "平静"
          }
        ]
      },
      {
        "label": "继续硬撑，把吃饭也当成不该有的开销",
        "l": 0,
        "t": 8,
        "i": 6,
        "response": "等赚够了再说，今天还能忍。 钱还没安排好，可以再算。你今天没好好吃饭，不能拖成明天的账。 他把汤留在你手边，却没等到你像白日那样看他一眼。",
        "replyFrames": [
          {
            "who": "你",
            "text": "等赚够了再说，今天还能忍。",
            "g": null,
            "mood": "平静"
          },
          {
            "who": "赵公明",
            "text": "钱还没安排好，可以再算。你今天没好好吃饭，不能拖成明天的账。",
            "g": 0,
            "mood": "平静"
          },
          {
            "who": "旁白",
            "text": "他把汤留在你手边，却没等到你像白日那样看他一眼。",
            "g": 0,
            "mood": "平静"
          }
        ]
      }
    ],
    "frames": [
      {
        "who": "旁白",
        "text": "你收完最后一张桌，正想把剩下的冷饼当晚饭，赵公明端着热汤来到院里。",
        "g": 0,
        "mood": "平静"
      },
      {
        "who": "赵公明",
        "text": "今天在集市看见你，只买了一张饼。",
        "g": 0,
        "mood": "平静"
      },
      {
        "who": "你",
        "text": "想省一点。账没补齐，吃好的总觉得心虚。",
        "g": null,
        "mood": "平静"
      },
      {
        "who": "赵公明",
        "text": "饭钱原本就在安排里。你一整天站着，先坐下来。",
        "g": 0,
        "mood": "平静"
      },
      {
        "who": "旁白",
        "text": "他把汤放稳，没有端走你的饼，而是掰开一半，放到自己碗边。",
        "g": 0,
        "mood": "平静"
      },
      {
        "who": "你",
        "text": "你也吃这个？",
        "g": null,
        "mood": "平静"
      },
      {
        "who": "赵公明",
        "text": "配热汤，正好。你想省的地方，我们可以一起找，别只从你自己的饭里扣。",
        "g": 0,
        "mood": "平静"
      },
      {
        "who": "你",
        "text": "那今晚出来吃饭，算你送财？",
        "g": null,
        "mood": "平静"
      },
      {
        "who": "赵公明",
        "text": "算我想和你一起吃。",
        "g": 0,
        "mood": "平静"
      },
      {
        "who": "旁白",
        "text": "你低头喝汤，刚觉得有点烫，面前就多了一只空碟。他已经把饼撕成容易入口的小块。",
        "g": 0,
        "mood": "平静"
      },
      {
        "who": "你",
        "text": "你平时都这样照顾人？",
        "g": null,
        "mood": "平静"
      },
      {
        "who": "赵公明",
        "text": "有时问账，有时拦人赌钱。把饭等到你收摊再吃，是这几天才有的习惯。",
        "g": 0,
        "mood": "平静"
      },
      {
        "who": "旁白",
        "text": "黑虎从你们脚边绕过去，鼻子朝向肉香，被赵公明轻轻按住脑袋。",
        "g": 0,
        "mood": "平静"
      },
      {
        "who": "你",
        "text": "它也来分我这份？",
        "g": null,
        "mood": "平静"
      },
      {
        "who": "赵公明",
        "text": "它刚吃过。今晚这碗，我特意给你留的。",
        "g": 0,
        "mood": "平静"
      },
      {
        "who": "旁白",
        "text": "院门被他虚掩上。账本还在屋里，你们坐着把热汤喝完，谁也没先起身。",
        "g": 0,
        "mood": "平静"
      }
    ]
  },
  {
    "title": "守财符贴在手机后面",
    "place": "第六夜 · 迎财灯会",
    "text": "旁白：灯会开市，你把茶楼的价牌摆到门边，赵公明递来一张小小的红纸。\n你：终于轮到真的招财法术了？\n赵公明：先翻过来看。\n旁白：红纸背后写着几行小字。付钱前看收款人，看总价，看自己是否真要买。\n你：财神爷亲笔写的购物提醒？\n赵公明：你说急的时候容易忘。我就写短一点，能塞进手机壳。\n你：贴了是不是就不破财？\n赵公明：纸替你记着，决定还得你自己看。买错时也能回来商量，别因为贴着我的字，就不敢承认。\n旁白：你把红纸塞好，正面露出一只画得过分严肃的黑虎。你笑着用手指戳了戳。\n你：这虎是你画的？怎么看着也要来查账。\n赵公明：它看钱袋。你看我，就够了。\n旁白：他说完移开目光，替你把快被风吹倒的价牌扶正。你挪过去，和他一起压住牌角。\n你：我现在还是会担心钱不够，也会看见喜欢的就想买。\n赵公明：那就慢慢商量。你不用为了让我喜欢，立刻变成什么都安排得好的人。\n旁白：你看向他，他终于也看回来。灯会的吆喝从院外传来，他却没有催你出去。\n你：今晚忙完，我们再一起逛一会儿？\n赵公明：我留了时间。专门等你。",
    "choices": [
      {
        "label": "收好小符，也约他下值后一起逛灯会",
        "l": 12,
        "t": 10,
        "i": 8,
        "response": "字我会看。买灯的时候，你也陪我挑。 好。想要哪盏就说，我们一起看价。",
        "replyFrames": [
          {
            "who": "你",
            "text": "字我会看。买灯的时候，你也陪我挑。",
            "g": null,
            "mood": "平静"
          },
          {
            "who": "赵公明",
            "text": "好。想要哪盏就说，我们一起看价。",
            "g": 0,
            "mood": "平静"
          }
        ]
      },
      {
        "label": "把小符当成保证，想借钱去追一次暴富机会",
        "l": 2,
        "t": 10,
        "i": 10,
        "response": "有你的符，我是不是可以放心赌大一点？ 不可以。你拿着它，是为了想起先看清楚，不能把我的名字当成稳赢的保证。 他把手从价牌上收回，重新和你说明那几行字。",
        "replyFrames": [
          {
            "who": "你",
            "text": "有你的符，我是不是可以放心赌大一点？",
            "g": null,
            "mood": "平静"
          },
          {
            "who": "赵公明",
            "text": "不可以。你拿着它，是为了想起先看清楚，不能把我的名字当成稳赢的保证。",
            "g": 0,
            "mood": "平静"
          },
          {
            "who": "旁白",
            "text": "他把手从价牌上收回，重新和你说明那几行字。",
            "g": 0,
            "mood": "平静"
          }
        ]
      }
    ],
    "frames": [
      {
        "who": "旁白",
        "text": "灯会开市，你把茶楼的价牌摆到门边，赵公明递来一张小小的红纸。",
        "g": 0,
        "mood": "平静"
      },
      {
        "who": "你",
        "text": "终于轮到真的招财法术了？",
        "g": null,
        "mood": "平静"
      },
      {
        "who": "赵公明",
        "text": "先翻过来看。",
        "g": 0,
        "mood": "平静"
      },
      {
        "who": "旁白",
        "text": "红纸背后写着几行小字。付钱前看收款人，看总价，看自己是否真要买。",
        "g": 0,
        "mood": "平静"
      },
      {
        "who": "你",
        "text": "财神爷亲笔写的购物提醒？",
        "g": null,
        "mood": "平静"
      },
      {
        "who": "赵公明",
        "text": "你说急的时候容易忘。我就写短一点，能塞进手机壳。",
        "g": 0,
        "mood": "平静"
      },
      {
        "who": "你",
        "text": "贴了是不是就不破财？",
        "g": null,
        "mood": "平静"
      },
      {
        "who": "赵公明",
        "text": "纸替你记着，决定还得你自己看。买错时也能回来商量，别因为贴着我的字，就不敢承认。",
        "g": 0,
        "mood": "平静"
      },
      {
        "who": "旁白",
        "text": "你把红纸塞好，正面露出一只画得过分严肃的黑虎。你笑着用手指戳了戳。",
        "g": 0,
        "mood": "平静"
      },
      {
        "who": "你",
        "text": "这虎是你画的？怎么看着也要来查账。",
        "g": null,
        "mood": "平静"
      },
      {
        "who": "赵公明",
        "text": "它看钱袋。你看我，就够了。",
        "g": 0,
        "mood": "平静"
      },
      {
        "who": "旁白",
        "text": "他说完移开目光，替你把快被风吹倒的价牌扶正。你挪过去，和他一起压住牌角。",
        "g": 0,
        "mood": "平静"
      },
      {
        "who": "你",
        "text": "我现在还是会担心钱不够，也会看见喜欢的就想买。",
        "g": null,
        "mood": "平静"
      },
      {
        "who": "赵公明",
        "text": "那就慢慢商量。你不用为了让我喜欢，立刻变成什么都安排得好的人。",
        "g": 0,
        "mood": "平静"
      },
      {
        "who": "旁白",
        "text": "你看向他，他终于也看回来。灯会的吆喝从院外传来，他却没有催你出去。",
        "g": 0,
        "mood": "平静"
      },
      {
        "who": "你",
        "text": "今晚忙完，我们再一起逛一会儿？",
        "g": null,
        "mood": "平静"
      },
      {
        "who": "赵公明",
        "text": "我留了时间。专门等你。",
        "g": 0,
        "mood": "平静"
      }
    ]
  },
  {
    "title": "庙开着，你也可以留下",
    "place": "第七夜 · 庙后小院",
    "text": "旁白：第七夜，庙门收好，账本和回执摊在桌上。你核过收支，端着两杯茶走进小院。\n你：七天前我来求财，结果修屋顶、擦桌子、算工钱，一件没少干。\n赵公明：后悔进门了吗？\n你：辛苦是真辛苦。但现在钱为什么少、明天该做什么，我好歹敢摊开看了。\n旁白：他接过茶，杯垫正好压住桌角那本旧命簿。末页被风翻起，边缘露出一道浅浅的银痕。\n你：这本还没查清？\n赵公明：只找到旧档的编号。为什么空着，得往后逐件核实，现在还不能下结论。\n你：那先收好。今天这七天的账，总算是我自己写明白的。\n旁白：他把旧册放入匣中，将已经核过的经营账本留在灯下。\n赵公明：庙里的事可以继续做，人间的打算也别耽搁。你想留、想回去试自己的茶铺，都可以谈。\n你：你呢？还会管我取不取消自动扣款，吃不吃晚饭？\n赵公明：你愿意说，我就听。不过，我想谈的不光这些。\n旁白：他把杯子放下，终于没有拿公事挡在中间。\n赵公明：这几日，我总记着你什么时候收摊。你来问账，我高兴。你只来坐一会儿，我也高兴。\n你：如果我以后还是没赚到很多钱呢？\n赵公明：我想见你，和那本账结了多少没有关系。\n旁白：院门外，黑虎的尾巴扫过门槛。他没有伸手拉你，只将身旁的位置空出来。\n赵公明：往后愿不愿意同我一起过？忙的时候一起办事，闲的时候，一起吃饭。",
    "choices": [
      {
        "label": "回应他的心意，往后生意和生活一起商量",
        "l": 8,
        "t": 8,
        "i": 0,
        "response": "愿意。可别只记得问我吃没吃，你也要按时下值。 好。明日收摊后，我来找你。 你坐到他身旁，他的手慢慢覆上你的手背。",
        "replyFrames": [
          {
            "who": "你",
            "text": "愿意。可别只记得问我吃没吃，你也要按时下值。",
            "g": null,
            "mood": "平静"
          },
          {
            "who": "赵公明",
            "text": "好。明日收摊后，我来找你。",
            "g": 0,
            "mood": "平静"
          },
          {
            "who": "旁白",
            "text": "你坐到他身旁，他的手慢慢覆上你的手背。",
            "g": 0,
            "mood": "平静"
          }
        ]
      },
      {
        "label": "想继续做朋友，也认真经营自己的生意",
        "l": 0,
        "t": 5,
        "i": 8,
        "response": "我很高兴认识你，不过现在更想把自己的生意做下去。 好。有要商量的事，仍可以来找我。 他把账本交回你手里，认真听你说下一步的打算。",
        "replyFrames": [
          {
            "who": "你",
            "text": "我很高兴认识你，不过现在更想把自己的生意做下去。",
            "g": null,
            "mood": "平静"
          },
          {
            "who": "赵公明",
            "text": "好。有要商量的事，仍可以来找我。",
            "g": 0,
            "mood": "平静"
          },
          {
            "who": "旁白",
            "text": "他把账本交回你手里，认真听你说下一步的打算。",
            "g": 0,
            "mood": "平静"
          }
        ]
      },
      {
        "label": "先告别财神庙，回人间试试新的生活",
        "l": 0,
        "t": 0,
        "i": 0,
        "response": "我想先回去，把那间茶铺试着开起来。 到了安稳的地方，来信告诉我。 他送你到庙门，替你把手机壳里的红纸重新塞稳。",
        "replyFrames": [
          {
            "who": "你",
            "text": "我想先回去，把那间茶铺试着开起来。",
            "g": null,
            "mood": "平静"
          },
          {
            "who": "赵公明",
            "text": "到了安稳的地方，来信告诉我。",
            "g": 0,
            "mood": "平静"
          },
          {
            "who": "旁白",
            "text": "他送你到庙门，替你把手机壳里的红纸重新塞稳。",
            "g": 0,
            "mood": "平静"
          }
        ]
      }
    ],
    "frames": [
      {
        "who": "旁白",
        "text": "第七夜，庙门收好，账本和回执摊在桌上。你核过收支，端着两杯茶走进小院。",
        "g": 0,
        "mood": "平静"
      },
      {
        "who": "你",
        "text": "七天前我来求财，结果修屋顶、擦桌子、算工钱，一件没少干。",
        "g": null,
        "mood": "平静"
      },
      {
        "who": "赵公明",
        "text": "后悔进门了吗？",
        "g": 0,
        "mood": "平静"
      },
      {
        "who": "你",
        "text": "辛苦是真辛苦。但现在钱为什么少、明天该做什么，我好歹敢摊开看了。",
        "g": null,
        "mood": "平静"
      },
      {
        "who": "旁白",
        "text": "他接过茶，杯垫正好压住桌角那本旧命簿。末页被风翻起，边缘露出一道浅浅的银痕。",
        "g": 0,
        "mood": "平静"
      },
      {
        "who": "你",
        "text": "这本还没查清？",
        "g": null,
        "mood": "平静"
      },
      {
        "who": "赵公明",
        "text": "只找到旧档的编号。为什么空着，得往后逐件核实，现在还不能下结论。",
        "g": 0,
        "mood": "平静"
      },
      {
        "who": "你",
        "text": "那先收好。今天这七天的账，总算是我自己写明白的。",
        "g": null,
        "mood": "平静"
      },
      {
        "who": "旁白",
        "text": "他把旧册放入匣中，将已经核过的经营账本留在灯下。",
        "g": 0,
        "mood": "平静"
      },
      {
        "who": "赵公明",
        "text": "庙里的事可以继续做，人间的打算也别耽搁。你想留、想回去试自己的茶铺，都可以谈。",
        "g": 0,
        "mood": "平静"
      },
      {
        "who": "你",
        "text": "你呢？还会管我取不取消自动扣款，吃不吃晚饭？",
        "g": null,
        "mood": "平静"
      },
      {
        "who": "赵公明",
        "text": "你愿意说，我就听。不过，我想谈的不光这些。",
        "g": 0,
        "mood": "平静"
      },
      {
        "who": "旁白",
        "text": "他把杯子放下，终于没有拿公事挡在中间。",
        "g": 0,
        "mood": "平静"
      },
      {
        "who": "赵公明",
        "text": "这几日，我总记着你什么时候收摊。你来问账，我高兴。你只来坐一会儿，我也高兴。",
        "g": 0,
        "mood": "平静"
      },
      {
        "who": "你",
        "text": "如果我以后还是没赚到很多钱呢？",
        "g": null,
        "mood": "平静"
      },
      {
        "who": "赵公明",
        "text": "我想见你，和那本账结了多少没有关系。",
        "g": 0,
        "mood": "平静"
      },
      {
        "who": "旁白",
        "text": "院门外，黑虎的尾巴扫过门槛。他没有伸手拉你，只将身旁的位置空出来。",
        "g": 0,
        "mood": "平静"
      },
      {
        "who": "赵公明",
        "text": "往后愿不愿意同我一起过？忙的时候一起办事，闲的时候，一起吃饭。",
        "g": 0,
        "mood": "平静"
      }
    ]
  }
];
const ENDINGS={
  "he": {
    "name": "与君同契",
    "type": "赵公明 HE",
    "text": "你回应他的心意，赵公明将庙门钥匙放回你手里，另把自己院门的那枚放到旁边，问你愿不愿意常来坐坐。\n后来你们照常修庙、接待客人，也会为一笔开销商量半天。你还会心急，他偶尔也忙得忘记吃饭，彼此提醒的次数渐渐多了。\n有晚手机又弹出扣款提醒，你点开看清，随后抬头问他吃不吃夜宵。他已经在桌边给你留好位置。"
  },
  "double": {
    "name": "金玉满堂，心有所归",
    "type": "爱情事业双丰收",
    "text": "庙里旧欠清偿，生意也留出了稳定的家底。你和赵公明将收支交接好，约定忙完各自的事，再一起吃晚饭。\n茶楼、庙宇和珍宝阁继续开门，你在人间的打算也慢慢往前做。他陪你问过许多问题，从进货到生活账单，后来最常问的是今晚想吃什么。\n那本旧命簿仍封存在匣中，线索还要后续核查。桌上新的一页，先记了明天的进货，再记一行两个人去逛街。"
  },
  "be": {
    "name": "灯下未完的账",
    "type": "赵公明 BE",
    "text": "你们没能约定往后的日子。赵公明将这七日核过的账交给你，和你把接下来要办的事一项项说清。\n离开时，他仍提醒你，遇到催着立刻付钱的事先停一停。你点点头，将手机壳里的红纸按平。\n后来你偶尔经过财神庙，会想起有人曾陪你站在集市外，认真听你说自己其实很害怕。"
  },
  "sixth": {
    "name": "第六路财神",
    "type": "隐藏 · 独身暴富",
    "text": "庙里旧欠已经还清，也留出了能够继续经营的家底。你选择先把自己的生意做好，五位财神照常与你分工。\n财神司给你送来一枚新牌，街坊打趣叫你第六路财神。你挂到门旁，回身先核了明早的茶叶和工钱。\n你偶尔仍会为钱担忧，也会遇到没卖完的日子。但如今知道该问谁、该看哪张账，也给自己的饭和休息留出了位置。\n命簿的旧档还在等核查。今晚先关好店门，和朋友们吃一顿热饭。"
  },
  "business": {
    "name": "人间好生意",
    "type": "普通经营结局",
    "text": "你没有选择恋爱，也不急着给自己戴上盛大的头衔。七日留下了能够继续经营的庙宇、值得信任的伙伴，和一份还可以慢慢修改的计划。\n赵公明尊重你的决定，另外四位财神也照常来往。生意没有因此失去支持。\n后日谈：有时赚，有时亏。你会算账，会休息，会在下雨前修好屋檐。人生未必一夜暴富，也可以一天比一天，更像自己想要的样子。"
  },
  "xiao_he": {
    "name": "珍宝不入笼",
    "type": "萧升 HE",
    "text": "你与萧升约好，隔日收摊后再来吃饭。他记下你要少糖的茶，问要不要把那把侧门钥匙重新系紧一些。\n后来你常去珍宝阁看货，他也陪你跑过几处铺面。意见不同时，你们就在柜台边争上两句，争完仍记得给对方留饭。\n修簪的小孩再跟着母亲来时，总要先问两个人是不是都在。萧升收着他送的小东西，全放进了你们喝茶的那个小柜子。",
    "g": 1
  },
  "xiao_be": {
    "name": "隔着一扇门",
    "type": "萧升 BE",
    "text": "你们没有约好下一次见面。萧升替你点清账和寄存物，你把侧门钥匙放回桌上，他看见了，没有再递回来。\n临行前，他照常告诉你哪批货要当心，哪里还有便宜的茶具。你听完道谢，他点了点头，将门开得宽些，让你提着行李走出去。\n后来你在自己的铺子收过一封藏品札记，写着辨别新货的小窍门。你认真收好，却没有再去问，那把钥匙如今放在哪里。",
    "g": 1
  },
  "xiao_double": {
    "name": "满阁春光，自由归来",
    "type": "萧升 · 爱情事业双丰收",
    "text": "庙里旧欠还清，你们的生意也攒下了足够的家底。你将下一步的开店计划摆上桌，萧升看完，先问自己能不能同行。\n你们商量好谁看铺子、谁先去探路，连吵架时由谁保管收据都说了一遍。萧升嫌这一条多余，第二日却把收据全装进了你买的夹子。\n往后看过许多贵重的宝物，家里那颗普通玻璃珠仍留着。你有时拿起来逗他，他便把茶放下，过来陪你坐一会儿。",
    "g": 1
  },
  "cao_he": {
    "name": "算不尽的明天",
    "type": "曹宝 HE",
    "text": "你在日历上写下明早一起吃饭，曹宝看过时辰，才在旁边落笔。他收起账册，陪你把已经凉了的茶换成热的。\n此后你们仍一起查账，也一起为进货和桌椅争过意见。曹宝偶尔又想提前安排，你提醒一句，他便停下来先听你说完。\n日历没有写满。有些空白留给睡懒觉，有些留给临时起意的出门，直到那天到了，你们才坐下来商量。",
    "g": 2
  },
  "cao_be": {
    "name": "没有填上的日期",
    "type": "曹宝 BE",
    "text": "账交清后，曹宝合上了那本新日历。你们没有再挑一个约会的日子，桌上的两杯茶也被陆续收走。\n他将进货凭据和账本装进同一个袋子，交代完最后一笔款，送你下楼。你想说点别的，最后还是只说了一声保重。\n回去开铺后，你学着把可能亏损的地方写在纸上。遇到拿不准的数字，仍会想起那个总愿意陪你再算一遍的人。",
    "g": 2
  },
  "cao_double": {
    "name": "生意长明，明日共议",
    "type": "曹宝 · 爱情事业双丰收",
    "text": "庙里旧欠清偿，净资产达到目标，你与曹宝终于能坐下来谈下一间铺子。桌上放着两份计划，一份由你写，一份由他写，改过几轮才定下来。\n公账收进柜里后，你把日历推给他，问明天能不能歇半日。他认真查过排班，点头说可以，又悄悄补上一句，早就想陪你出门了。\n后来账册越来越厚，你们都记得在忙完一阵后空出几日。有时出门什么也没买，吃一碗汤面，沿河慢慢走回去，也算过得很好。",
    "g": 2
  },
  "chen_he": {
    "name": "送到你身边",
    "type": "陈九公 HE",
    "text": "你收下那封信，陈九公高兴得站起来，又被你拉回饭桌。他将答应明日接的早班写好，剩下的时辰全留给和你吃饭。\n后来他照常出门送财，忙不过来会提前交接。你也忙自己的铺子，赶不及赴约时，记得先让人带话。\n有天你收摊很晚，回去看见桌上扣着一碗热饭。他从门边探头，问你累不累，随后才问，明日想不想一起出去。",
    "g": 3
  },
  "chen_be": {
    "name": "未被签收的信",
    "type": "陈九公 BE",
    "text": "那封信没有得到他盼望的回答。陈九公将它叠好，和空下来的财帖袋放到一旁，陪你吃完了这顿饭。\n离开前，他说往后会按时交班，也会好好照看手上的伤。你叮嘱他别又忙忘了，他答应得很认真，没有再笑着说没事。\n后来你偶尔经过旧街，听街坊说他如今能准点歇下了。热饼铺还开着，你买了一份，想起他曾为了陪你吃顿热饭，特意提早跑完一整条街。",
    "g": 3
  },
  "chen_double": {
    "name": "万家灯火，也有归途",
    "type": "陈九公 · 爱情事业双丰收",
    "text": "庙里旧欠还清，店里也有了稳定的家底。你与陈九公一起排出轮班，替忙不过来的伙计补上人手，终于不用每天临时抓人救急。\n最后一册账签完，他先去交好班，回来时带着两份热饼，说这回吃完还能陪你看灯。\n此后生意越做越大，出门的路也越来越远。你们见面的时辰有时会改，却总提前说清，饭凉了能再热，等人的那个也知道对方在哪里。",
    "g": 3
  },
  "yao_he": {
    "name": "不借来的幸运",
    "type": "姚少司 HE",
    "text": "你握住姚少司伸来的手，他先笑，又认真确认明早几时来。你报了个时辰，他立刻找纸记，没再掏出金钱和签筒。\n后来小摊偶尔冷清，你的铺子也有不好卖的时候。你们会算剩下的货，商量明日怎么摆，闷得慌便出去吃点东西。\n他仍爱讲吉利话，只是说完会记得问你累不累。你也渐渐知道，他安静的时候，陪着坐一会儿就很好。",
    "g": 4
  },
  "yao_be": {
    "name": "签落之后",
    "type": "姚少司 BE",
    "text": "姚少司收回放在桌上的手，将最后一只箱子扣好。你们没再抽签，也没有猜对方刚才那句话还有没有别的意思。\n他提着灯送你到街口，想了片刻，说路上小心。你点头，走过一段再回头，他仍站在原处，灯影在脚边轻轻晃。\n后来你路过别的签摊，偶尔也停下来看看。只是决定下一间铺子开在哪里时，你会先摊开计划，想起有人曾认真问过，你到底愿不愿意。",
    "g": 4
  },
  "yao_double": {
    "name": "财路有据，心意由人",
    "type": "姚少司 · 爱情事业双丰收",
    "text": "庙里旧欠清偿，经营也攒下了足够的家底。你把完整账册封好，姚少司站在旁边看，见你松了一口气，才问今晚想吃什么庆祝。\n你们给小摊重写了说明，也给下一次进货留出余钱。谁想冒险多试一点，就先把打算说给对方听。\n日子照样有落空的时候。可有时两个人一起开出空箱，看一眼，再笑着收摊回家。明天要怎么办，吃过饭还来得及慢慢想。",
    "g": 4
  }
};
function valid(s){return s&&s.version===2&&Number.isInteger(s.day)&&s.day>=1&&s.day<=7&&Number.isFinite(s.cash)&&s.cash>=0&&Number.isFinite(s.debt)&&s.debt>=0&&s.buildings&&['temple','tea','treasure'].every(k=>s.buildings[k]&&Number.isInteger(s.buildings[k].level)&&s.buildings[k].level>=0&&s.buildings[k].level<=3&&Number.isFinite(s.buildings[k].value))&&Array.isArray(s.love)&&s.love.length===5&&Array.isArray(s.trust)&&s.trust.length===5&&s.daily&&Array.isArray(s.daily.rewards)&&Array.isArray(s.story)&&Array.isArray(s.ledger)&&s.memory&&Array.isArray(s.memory.games)&&(!s.ending||ENDINGS[s.ending]);}
// 5-card evaluator, then all 21 subsets of seven cards. Ace supports low straight.
function rank5(cards){let rs=cards.map(c=>c.r).sort((a,b)=>b-a),counts={};rs.forEach(r=>counts[r]=(counts[r]||0)+1);let groups=Object.keys(counts).map(Number).sort((a,b)=>counts[b]-counts[a]||b-a);let unique=[...new Set(rs)],straight=unique.length===5&&(unique[0]-unique[4]===4?unique[0]:unique.join(',')==='14,5,4,3,2'?5:0),flush=cards.every(c=>c.s===cards[0].s);let v=flush&&straight?[8,straight]:counts[groups[0]]===4?[7,...groups]:counts[groups[0]]===3&&counts[groups[1]]===2?[6,...groups]:flush?[5,...rs]:straight?[4,straight]:counts[groups[0]]===3?[3,...groups]:counts[groups[0]]===2&&counts[groups[1]]===2?[2,Math.max(groups[0],groups[1]),Math.min(groups[0],groups[1]),groups[2]]:counts[groups[0]]===2?[1,...groups]:[0,...rs];return v;}
function cmp(a,b){for(let i=0;i<Math.max(a.length,b.length);i++){let d=(a[i]||0)-(b[i]||0);if(d)return d;}return 0;}
function rank7(c){let best=[-1];for(let a=0;a<c.length-4;a++)for(let b=a+1;b<c.length-3;b++)for(let d=b+1;d<c.length-2;d++)for(let e=d+1;e<c.length-1;e++)for(let f=e+1;f<c.length;f++){let r=rank5([c[a],c[b],c[d],c[e],c[f]]);if(cmp(r,best)>0)best=r;}return best;}
return {deliveryReward,Fortunes,Routes,routeOf,getStory,canChooseRoute,orderGod,endingGod,fresh,daily,assets,income,act,rand,valid,ending,STORY,ENDINGS,NAMES,COSTS,rank5,rank7,cmp};
});
