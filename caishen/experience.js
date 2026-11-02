/* V2.1 presentation layer: portraits, visual novel, opening and optional guided play. */
'use strict';
const defer=fn=>setTimeout(fn,0);
let vn=null,vnTypeTimer=null,vnAutoTimer=null,openingTimer=null,openingFrame=0,openingDone=null,guideFrame=null;
const reduced=()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const line=(who,text,g=null,mood='平静')=>({who,text,g,mood});
const DIALOGUES=[
  [
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
  ],
  [
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
  ],
  [
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
  ],
  [
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
  ],
  [
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
  ],
  [
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
  ],
  [
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
];
const REPLIES=[
  [
    [
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
    ],
    [
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
  ],
  [
    [
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
    ],
    [
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
  ],
  [
    [
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
    ],
    [
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
  ],
  [
    [
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
    ],
    [
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
  ],
  [
    [
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
    ],
    [
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
  ],
  [
    [
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
    ],
    [
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
  ],
  [
    [
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
    ],
    [
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
    ],
    [
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
  ]
];
function stopVN(){clearInterval(vnTypeTimer);clearTimeout(vnAutoTimer);vnTypeTimer=null;vnAutoTimer=null;vn=null;document.getElementById('modal')?.classList.remove('vn-dialog');}
const basicClose=close;close=function(){stopVN();basicClose();defer(drawGuide)};
const basicModal=modal;modal=function(...args){stopVN();basicModal(...args);defer(drawGuide)};
const basicRender=render;render=function(){basicRender();decorateViews();defer(drawGuide)};
function presentData(){if(!state.presentation)state.presentation={introDone:true,tutorial:{status:'off',step:0}};return state.presentation;}
const STORY_SCENES={
 'rain-temple':{name:'雨夜破庙',position:'50% 44%'},
 'tea-room':{name:'茶楼账房',position:'50% 48%'},
 market:{name:'人间集市',position:'50% 45%'},
 archive:{name:'财神司旧库',position:'50% 45%'},
 festival:{name:'迎财灯会',position:'50% 45%'},
 treasure:{name:'珍宝阁',position:'50% 45%'},
 courtyard:{name:'庙后小院',position:'50% 45%'},
 'rain-bridge':{name:'雨后旧桥',position:'50% 45%'}
};
const STORY_BG_IMG=id=>'assets/story-'+id+'-v2.webp';
const STORY_SCENE_ROUTES=[
 ['rain-temple','tea-room','market','tea-room','courtyard','festival','courtyard'],
 ['rain-temple','treasure','treasure','treasure','treasure','festival','treasure'],
 ['rain-temple','tea-room','tea-room','tea-room','tea-room','tea-room','tea-room'],
 ['rain-temple','market','tea-room','tea-room','market','festival','courtyard'],
 ['rain-temple','market','market','market','courtyard','festival','market']
];
const storyBackgroundWarmups=new Map();
function warmStoryBackground(id){
 if(!STORY_SCENES[id]||storyBackgroundWarmups.has(id))return;
 const image=new Image();image.decoding='async';image.fetchPriority='low';
 storyBackgroundWarmups.set(id,image);
 image.onerror=()=>storyBackgroundWarmups.delete(id);
 image.onload=()=>image.decode().catch(()=>{});
 image.src=STORY_BG_IMG(id);
}
function warmNextStoryBackground(v){
 const next=STORY_SCENE_ROUTES[Game.routeOf(state)][v.day];
 if(!next||next===storyScene(v)||navigator.connection?.saveData||/2g/.test(navigator.connection?.effectiveType||''))return;
 if('requestIdleCallback' in window)window.requestIdleCallback(()=>warmStoryBackground(next),{timeout:1500});
 else setTimeout(()=>warmStoryBackground(next),400);
}
function storyScene(v){return STORY_SCENE_ROUTES[Game.routeOf(state)][v.day-1]||'rain-temple'}
function paintStoryBackground(v){
 const id=storyScene(v),stage=$('vnStage'),img=$('vnBackground');
 if(!stage||!img||stage.dataset.scene===id)return;
 const scene=STORY_SCENES[id];stage.dataset.scene=id;
 img.alt=scene.name+' · 剧情场景';img.style.objectPosition=scene.position;
 const reveal=()=>{if(stage.isConnected&&stage.dataset.scene===id){stage.classList.add('has-story-bg');warmNextStoryBackground(v)}};
 img.onload=()=>img.decode().then(reveal,()=>{});
 img.onerror=()=>stage.classList.remove('has-story-bg');
 img.src=STORY_BG_IMG(id);
 if(img.complete&&img.naturalWidth)img.onload();
}
function theatreFrame(){return `<div class="vn-stage" id="vnStage"><img class="vn-background" id="vnBackground" alt="" decoding="async"><div class="vn-backdrop-shade" aria-hidden="true"></div><div class="vn-moon"></div><div class="vn-dust">${Array.from({length:14},(_,i)=>`<i style="--n:${i}"></i>`).join('')}</div><div class="vn-landscape">${sceneSVG()}</div><div class="vn-location" id="vnLocation"></div><div class="vn-cast" id="vnCast"></div><div class="vn-letter" id="vnLetter"></div><div class="vn-toolbar"><button data-a="vnHistory">前文</button><button data-a="vnBack">上一句</button><button id="vnAuto" data-a="vnAuto">自动</button><button data-a="vnSkip">快进至选择</button><button data-a="close">离开 ×</button></div><div class="vn-lower"><div class="vn-choice-list" id="storyChoices"></div><button class="vn-dialogue" data-a="vnNext" aria-label="点击显示完整句子或继续下一句"><span class="vn-name" id="vnName"></span><span class="vn-mood" id="vnMood"></span><span class="vn-text" id="vnText"></span><span class="vn-hint" id="vnHint">点击继续 ▾</span></button><div class="vn-progress" id="vnProgress"></div></div><div class="vn-history hidden" id="vnHistory"></div></div>`}
const NARRATIVE_REVISION=3;
function storyCursorIndex(cursor,day,g,total){
 if(!cursor||cursor.day!==day||!Number.isInteger(cursor.index)||cursor.index<0)return 0;
 // Rewritten scenes have no reliable positional mapping. Only unfinished scenes restart.
 if(cursor.revision!==NARRATIVE_REVISION)return 0;
 return Math.max(0,Math.min(cursor.index,total));
}
showStory=function(day=state.day,review=false){let record=state.story.find(s=>s.day===day),data=presentData(),chapter=Game.getStory(state,day),frames=chapter.frames||DIALOGUES[day-1];modal(chapter.place,theatreFrame(),'vn-shell');$('modal').classList.add('vn-dialog');vn={day,index:!review&&!record?storyCursorIndex(data.vn,day,Game.routeOf(state),frames.length):0,frames:frames.map(x=>({...x})),baseLength:frames.length,chapter,record,review,auto:false,complete:false,atChoice:false,actor:null,previous:null};$('vnLocation').textContent=chapter.place+' · '+chapter.title;paintVN()};
const HEROINE_IMG=()=>'assets/heroine-modern-web-v1.webp';
const portraitWarmups=new Map();
function warmNextPortrait(v,current){
 if(navigator.connection?.saveData||/2g/.test(navigator.connection?.effectiveType||''))return;
 let next=v.frames.slice(v.index+1).map(f=>GODS.findIndex(g=>g.name===f.who)).find(g=>g>=0&&g!==current);
 if(next===undefined||portraitWarmups.has(next))return;
 const warm=()=>{if(vn!==v||!$('vnCast'))return;const img=new Image();img.fetchPriority='low';img.decoding='async';portraitWarmups.set(next,img);img.onerror=()=>portraitWarmups.delete(next);img.src=IMG(next)};
 if('requestIdleCallback' in window)requestIdleCallback(warm,{timeout:1500});else setTimeout(warm,600);
}
function storyActorAt(v,frame){
 if(frame.hideGod)return null;
 const speaker=GODS.findIndex(g=>g.name===frame.who);
 if(speaker>=0)return speaker;
 if(Number.isInteger(frame.g)&&frame.g>=0&&frame.g<GODS.length)return frame.g;
 // Derive from the visible timeline, not the actor left over after going back.
 for(let i=Math.min(v.index,v.frames.length-1);i>=0;i--){const f=v.frames[i];if(f.hideGod)return null;const g=GODS.findIndex(x=>x.name===f.who);if(g>=0)return g;if(Number.isInteger(f.g)&&f.g>=0&&f.g<GODS.length)return f.g}
 return null;
}
function paintStoryCast(v,frame){
 const actor=storyActorAt(v,frame);v.actor=actor;
 const cast=$('vnCast');cast.classList.add('with-heroine');
 if(!cast.querySelector('.vn-heroine'))cast.innerHTML=`<img class="vn-heroine" decoding="async" fetchpriority="high" src="${HEROINE_IMG()}" alt="你 · 现代女主"><span class="vn-portrait-status" role="status" hidden></span>`;
 const status=cast.querySelector('.vn-portrait-status');let god=cast.querySelector('.vn-god');
 cast.classList.toggle('heroine-only',actor===null);
 if(actor===null){if(god){god.onload=god.onerror=null;god.remove()}delete cast.dataset.actor;status.hidden=true;status.textContent=''}
 else{
  if(!god){god=document.createElement('img');god.className='vn-god portrait-loading';god.decoding='async';god.fetchPriority='high';cast.insertBefore(god,status)}
  if(cast.dataset.actor!==String(actor)){
   cast.dataset.actor=String(actor);god.classList.add('portrait-loading');god.classList.remove('god-enters');
   god.alt=GODS[actor].name;status.textContent=GODS[actor].name+'正在走近…';status.hidden=false;
   const reveal=()=>{if(vn===v&&god.isConnected&&cast.dataset.actor===String(actor)){god.classList.remove('portrait-loading');god.classList.add('god-enters');status.hidden=true;warmNextPortrait(v,actor)}};
   god.onload=()=>god.decode().then(reveal,reveal);
   god.onerror=()=>{if(vn===v&&god.isConnected&&cast.dataset.actor===String(actor))status.textContent=GODS[actor].name+'的立绘暂未加载，仍可继续对话'};
   god.src=IMG(actor);if(god.complete&&god.naturalWidth)god.onload();
  }
 }
 const isHeroine=['你','你的决定','你的选择'].includes(frame.who),narrator=frame.who==='旁白'||!isHeroine&&!GODS.some(g=>g.name===frame.who);
 cast.dataset.speaker=narrator?'narrator':isHeroine?'heroine':'god';cast.classList.toggle('narrating',narrator);
 cast.querySelector('.vn-heroine').classList.toggle('is-speaking',isHeroine);god?.classList.toggle('is-speaking',!narrator&&!isHeroine);
}

function replyFrames(v,i){return v.chapter.choices[i].replyFrames||REPLIES[v.day-1][i];}
function paintVN(){if(!vn)return;clearInterval(vnTypeTimer);clearTimeout(vnAutoTimer);let v=vn,frame=v.frames[v.index];paintStoryBackground(v);$('storyChoices').innerHTML='';if(!frame){if(v.record){if(!v.responded){v.responded=true;v.frames.push(line('你的决定',v.chapter.choices[v.record.choice].label),...replyFrames(v,v.record.choice));paintVN();return}close();return}v.atChoice=true;paintStoryCast(v,{who:'你的选择',g:null});$('vnName').textContent='你的选择';$('vnMood').textContent='心意由你来定';$('vnText').textContent='你想怎样回应？';$('vnHint').textContent='请选择下方心意';$('storyChoices').innerHTML=v.chapter.choices.map((c,i)=>`<button class="choice" data-a="chooseStory" data-choice="${i}">${c.label}</button>`).join('');$('vnProgress').textContent='重要抉择 · 只有确认选择后才会结算';return}
v.atChoice=false;paintStoryCast(v,frame);$('vnName').textContent=frame.who;$('vnMood').textContent=frame.who==='旁白'?'夜色流转':frame.who==='你'?'你的心声':frame.mood;$('vnText').textContent='';$('vnHint').textContent='点击补全 · 再点继续 ▾';$('vnProgress').textContent=`${v.index+1} / ${v.frames.length} · 点击对话框或按空格继续`;
let chars=[...frame.text],n=0;v.fullText=frame.text;v.complete=false;function done(){clearInterval(vnTypeTimer);v.complete=true;$('vnHint').textContent=v.record&&v.index===v.frames.length-1?'点击返回财神庙 ▾':'点击继续 ▾';if(v.auto)vnAutoTimer=setTimeout(vnAdvance,Math.max(1400,chars.length*55));}
if(reduced()){ $('vnText').textContent=frame.text;done();}else vnTypeTimer=setInterval(()=>{if(vn!==v){clearInterval(vnTypeTimer);return}n+=1;$('vnText').textContent=chars.slice(0,n).join('');if(n>=chars.length)done();},26);
if(!v.record&&!v.review){dataCursor(v.day,v.index)}
}
function dataCursor(day,index){presentData().vn={day,index,revision:NARRATIVE_REVISION};persist()}
function vnAdvance(){if(!vn||vn.atChoice)return;if(!vn.complete){clearInterval(vnTypeTimer);$('vnText').textContent=vn.fullText;vn.complete=true;$('vnHint').textContent='点击继续 ▾';return}vn.index++;paintVN()}
chooseStory=function(i){if(!vn||!vn.atChoice||vn.record||vn.day!==state.day)return;let r=perform('story',{choice:i});if(!r.ok)return;let rec=state.story.find(x=>x.day===vn.day);vn.record=rec;vn.responded=true;vn.auto=false;$('vnAuto').textContent='自动';vn.frames.push(line('你的决定',vn.chapter.choices[i].label),...replyFrames(vn,i));presentData().vn=null;persist();paintVN();scenePulse('heart');};
function vnHistory(){if(!vn)return;let box=$('vnHistory');box.classList.toggle('hidden');if(!box.classList.contains('hidden'))box.innerHTML=`<div class="row between"><h3>前尘回声</h3><button class="plain" data-a="vnHistory">关闭 ×</button></div>`+vn.frames.slice(0,Math.min(vn.index+1,vn.frames.length)).map(f=>`<p><b>${f.who}</b><span>${escapeHTML(f.text)}</span></p>`).join('');}
function liveActor(g,context='陪你一起'){return `<div class="live-actor" data-g="${g}"><div class="actor-aura"></div><img src="${IMG(g)}" alt="${GODS[g].name}陪伴立绘"><div class="actor-caption"><span>${GODS[g].name} · ${context}</span><p id="actorWords">${memoryLine(g)}</p></div><div class="actor-motes"><i></i><i></i><i></i></div></div>`}
function decorateViews(){if(!state)return;document.querySelectorAll('.village svg').forEach(el=>el.classList.add('village-animated'));document.querySelectorAll('.shrine-stage').forEach(el=>{el.classList.add('shrine-animated');if(!el.querySelector('.shrine-sparks'))el.insertAdjacentHTML('beforeend','<div class="shrine-sparks">'+Array.from({length:9},(_,i)=>`<i style="--n:${i}"></i>`).join('')+'</div>');});
if(tab==='business'&&!$('businessTheatre')){let g=state.daily.collab>=0?state.daily.collab:2;let view=$('view');if(view){let theatre=document.createElement('div');theatre.id='businessTheatre';theatre.className='business-theatre';theatre.innerHTML=`<div class="business-scene">${sceneSVG()}<div class="walking-visitor one"></div><div class="walking-visitor two"></div><div class="business-scene-title"><span class="badge">${state.daily.collected?'今日收益已领':'今日营业中'}</span></div></div>${liveActor(g,'同你经营')}`;view.querySelector('.sectionhead')?.after(theatre);
let cast=document.createElement('div');cast.className='business-cast';cast.id='businessCast';cast.innerHTML=GODS.map((x,i)=>`<button data-a="castCollab" data-g="${i}" class="${state.daily.collab===i?'chosen':''}" ${state.daily.collected?'disabled':''}><img src="${IMG(i,true)}" alt="${x.name}" decoding="async"><span>${x.name}</span></button>`).join('');theatre.after(cast)}}
if(state.daily.prayed)$('stick')?.classList.add('lit');
if(state.ending)return;
if(!document.querySelector('[data-a="replayOpening"]')){let top=document.querySelector('.top .row');top?.insertAdjacentHTML('beforeend','<button class="plain" data-a="replayOpening">序幕</button>')}
}
function mountMiniActor(g){if(!$('miniBoard'))return;let parent=$('miniBoard').parentElement;parent.classList.add('mini-experience');if(!$('miniActor')){let actor=document.createElement('aside');actor.id='miniActor';actor.innerHTML=liveActor(g,'陪你互动');$('miniBoard').before(actor)}$('miniBoard').classList.add('mini-stage');
$('miniBoard').querySelectorAll('.poker-card').forEach((el,i)=>{el.style.setProperty('--deal',i);el.classList.add('card-deal')});$('miniBoard').querySelectorAll('.box').forEach(el=>el.classList.add('box-animated'));$('miniBoard').querySelectorAll('.cell.player').forEach(el=>{el.innerHTML=`<img src="${IMG(3,true)}" alt="陈九公正在送财">`;el.classList.add('delivery-avatar')});}
const basicStartMini=startMini;startMini=function(g){basicStartMini(g);mountMiniActor(Number(g));defer(drawGuide)};
for(const name of ['tigerRender','treasureRender','pokerRender','deliveryRender','montyRender']){const old=window[name];window[name]=function(...args){let r=old(...args);if(mini)mountMiniActor(mini.g);return r}}
function actorSay(text){let p=$('actorWords');if(p){p.textContent=text;p.classList.remove('say-pop');void p.offsetWidth;p.classList.add('say-pop')}}
const basicBrush=brush;brush=function(){basicBrush();if(mini?.g===0){$('tigerZone')?.classList.add('tiger-purr');emitParticles($('tigerZone'),'♥',6);actorSay(mini.strokes>=3?'“它很喜欢你。别问我怎么知道的。”':'“顺着毛来。对，就是这样。”')}};
const basicMoveTo=moveTo;moveTo=function(pos){let before=mini?.pos,del=mini?.delivered;basicMoveTo(pos);if(mini?.g===3&&mini.pos!==before){if(mini.delivered>del){actorSay('“送到啦！下一站，我和你一起走。”');emitParticles($('deliveryMap'),'✦',7)}else actorSay('“这条路没问题，跟紧我！”')}};
function emitParticles(anchor,symbol='✦',count=12){if(!anchor||reduced())return;let r=anchor.getBoundingClientRect(),layer=document.createElement('div');layer.className='fx-particles';layer.setAttribute('aria-hidden','true');for(let i=0;i<count;i++){let el=document.createElement('span');el.textContent=symbol;el.style.cssText=`left:${r.left+r.width/2}px;top:${r.top+r.height/2}px;--dx:${(Math.random()-.5)*250}px;--dy:${-70-Math.random()*180}px;--delay:${i*30}ms`;layer.append(el)}($('modal').open?$('modal'):document.body).append(layer);setTimeout(()=>layer.remove(),1900)}
function scenePulse(kind){let stage=$('vnStage')||$('view');if(stage){stage.classList.remove('scene-pulse');void stage.offsetWidth;stage.classList.add('scene-pulse');emitParticles(stage,kind==='heart'?'♥':'✦',10)}}
let reactionTimer;
function reaction(g,title,text,kind='gold'){document.querySelector('.role-reaction')?.remove();let el=document.createElement('aside');el.className='role-reaction '+kind;el.setAttribute('role','status');el.innerHTML=`<img src="${IMG(g,true)}" alt="${GODS[g].name}"><div><small>${title}</small><p>${escapeHTML(text)}</p><button class="plain" data-a="dismissReaction">收下心意 ×</button></div>`;document.body.append(el);clearTimeout(reactionTimer);reactionTimer=setTimeout(()=>el.remove(),6500);}
function voiceReaction(g,kind,item=''){
 const replies={
 collect:['今日账已核，辛苦。先坐下，别一结完账又跑出去。','账收妥了。掌柜今日很能干，夸完可别又给自己加活。','账结好了。现在能不能把对面的凳子，借我留给你一会儿？','结清啦！今天跑得值！来，歇一歇，晚饭我去端！','铜钱有了落处，今天的笑也别省。来坐，我请你喝茶。'],
 upgrade:['这处修妥了。余下逐项来，本君同你盯着。','像样些了。掌柜的眼光，总算没让那张报价单独占风头。','又办成一件。账我来核，你先看看，这回修得可合心意？','你看，亮起来了！等开门我得叫街坊都来看，这可是咱们一起修的！','新地方，新彩头！放心，吉利话我说，花了多少也替你问清。'],
 order:['这单办妥。回执收好，别光顾往下一单赶。','这单有个明白来回了。掌柜歇会儿，货单又不会自己逃。','委托核过了。下一笔先缓缓，你这杯茶已经等了一会儿。','送到啦！你的那份也算好！现在先歇，谁再喊顺路我都先问清！','回音到！这次靠的可不止一句吉利话。来，先把该收的收好。'],
 offer:['这份'+item+'，本君收下。下回人来便好，别又花心思省自己的饭钱。','这份'+item+'倒很会挑。只是掌柜空手来，我也给倒茶，记住了。','这份'+item+'收好了。礼物记得，送礼的人更记得，下回不用回回带。','给我的'+item+'？太好了！等会儿，我把手擦干净，可别碰坏了！','哎呀，这份'+item+'给我？今日这张凳子果然没白留！不带礼物也一样留。']
 };
 return '“'+replies[kind][g]+'”';
}
const basicPerform=perform;perform=function(a,p={},refresh=true){let prior=state?JSON.parse(JSON.stringify({cash:state.cash,incense:state.incense,love:state.love})):null;let r=basicPerform(a,p,refresh);if(r.ok){if(a==='collect'){emitParticles(document.querySelector('.resources'),'🪙',18);reaction(state.daily.collab>=0?state.daily.collab:2,'今日账已收好',voiceReaction(state.daily.collab>=0?state.daily.collab:2,'collect'));document.querySelector('.business-scene')?.classList.add('business-boom')}if(a==='upgrade'){scenePulse('gold');reaction(state.daily.collab>=0?state.daily.collab:3,'修缮完成',voiceReaction(state.daily.collab>=0?state.daily.collab:3,'upgrade'));document.querySelector('.business-scene')?.classList.add('building-rise')}if(a==='order'){emitParticles(document.querySelector('.resources'),'✦',12);reaction(Game.orderGod(state)??2,'委托有回音',voiceReaction(Game.orderGod(state)??2,'order'))}if(a==='collab')reaction(p.g,'今日的合伙人',memoryLine(p.g));if(a==='pray'){emitParticles($('incenseArea'),'🧧',16);$('shrinePortrait')?.classList.add('prayer-appear');reaction(p.g,'心愿已送达，财神接单！',prayerReply(p.g,p.wish),'prayer')}if(a==='offer'){emitParticles($('offeringDrop'),'♥',12);reaction(p.g,'心意已收到',voiceReaction(p.g,'offer',p.item))}if(a==='game'){actorSay(r.text);emitParticles($('miniBoard'),p.win?'♥':'✦',12)}if(prior&&state.cash!==prior.cash)document.querySelector('.resource b')?.classList.add('counter-pop');tutorialEvent(a,p)}return r;};
const OPENING=[
{title:'你只是进庙躲一场雨。',text:'结果，接下了五位财神的开店邀请。',kind:'rain',g:null},
{title:'一座快要倒闭的财神庙。',text:'三百元宝的旧债，七日为期。',kind:'temple',g:0},
{title:'五路财神，与你同局。',text:'有人守护秩序，有人试探真心。',kind:'cast',g:null},
{title:'白天，把自己的生意做大。',text:'夜晚，听清那些没有写在账上的心意。',kind:'night',g:0},
{title:'财神偏爱我',text:'这一次，你的人生，由你自己定价。',kind:'title',g:null}
];
function opening(onDone){clearTimeout(openingTimer);openingDone=onDone;openingFrame=0;let d=$('introDialog');if(!d){d=document.createElement('dialog');d.id='introDialog';d.className='intro-dialog';d.setAttribute('aria-label','游戏开场动画');document.body.append(d);d.addEventListener('cancel',e=>{e.preventDefault();finishOpening()})}if(!d.open)d.showModal();paintOpening()}
function paintOpening(){let d=$('introDialog'),f=OPENING[openingFrame];if(!f){finishOpening();return}d.innerHTML=`<div class="opening-shot ${f.kind} ${reduced()?'still':''}" data-frame="${openingFrame}"><div class="opening-rain">${Array.from({length:28},(_,i)=>`<i style="--n:${i}"></i>`).join('')}</div><div class="opening-moon"></div>${f.kind==='temple'?'<div class="opening-temple">'+sceneSVG()+'</div>':''}${f.kind==='cast'?'<div class="opening-cast">'+[1,2,0,3,4].map((g,i)=>`<img src="${IMG(g)}" alt="${GODS[g].name}" style="--i:${i}">`).join('')+'</div>':f.g!==null?`<img class="opening-person" src="${IMG(f.g)}" alt="${GODS[f.g].name}">`:''}${f.kind==='rain'?'<div class="empty-book"><span>茶铺计划</span><i>一间小铺，<br>从今天开始。</i></div>':''}<div class="opening-copy"><span class="eyebrow">序幕 · ${String(openingFrame+1).padStart(2,'0')} / 05</span><h1>${f.title}</h1><p>${f.text}</p></div><div class="opening-controls"><button data-a="skipOpening" class="plain">跳过开场 →</button><div>${OPENING.map((_,i)=>`<i class="${i===openingFrame?'on':''}"></i>`).join('')}</div><button data-a="nextOpening" class="btn outline">${openingFrame===4?'开启七日之约 →':'下一幕 →'}</button></div></div>`;d.querySelector('[data-a="nextOpening"]').focus({preventScroll:true});if(!reduced())openingTimer=setTimeout(()=>{openingFrame++;paintOpening()},4500)}
function finishOpening(){clearTimeout(openingTimer);$('introDialog')?.close();let cb=openingDone;openingDone=null;cb?.()}
const oldBegin=begin;begin=function(){close();state=Game.fresh();state.presentation={introDone:false,tutorial:{status:'pending',step:0}};tab='temple';selectedGod=0;persist();render();window.scrollTo(0,0);opening(()=>{presentData().introDone=true;persist();startTutorial(false)})};
function startTutorial(force=true){if(!state||state.ending){toast('请先开启一局七日之约，再体验新手教学。');return}close();let p=presentData();if(force||!p.tutorial||p.tutorial.status!=='active')p.tutorial={status:'active',step:0,version:2};else p.tutorial.status='active';persist();drawGuide()}
const GUIDE=[
{title:'新庙主，先跟我走一圈。',text:'我是陈九公。先祈福、再经营和接委托，最后去见他。每一步都由你亲手做，也可以随时跳过。',action:'带我上香 →',g:3},
{title:'第一步 · 点燃你的心愿',text:'选一位财神和愿望，点「开始上香」，进入女主的互动窗口。香火会引来客流，求财还会增加今日收益。',target:'[data-a="light"]',tab:'shrine',g:4},
{title:'把香，亲手敬上去。',text:'在上香窗口点燃香火，再向上拖动女主手中的香，或点击「双手敬香」。完成后愿望才会生效。',target:'#incenseArea',tab:'shrine',g:0},
{title:'第二步 · 开门做生意',text:'元宝是手头现金，净资产还要算上建筑和债务。现在去经营，选一位合伙人。',action:'去经营 →',g:2},
{title:'选一位今天的合伙人',text:'点选任一财神立绘，或使用协作下拉框。商业合作不需要恋爱好感。',target:'#businessCast',tab:'business',g:2},
{title:'收下今日第一笔收入',text:'先祈愿、安排协作，再领收益。收支会单独记账，每天只能领一次。',target:'[data-a="collect"]',tab:'business',g:2},
{title:'第三步 · 接一笔今日委托',text:'领取店铺收益之后，还可以接一笔委托。先看启动资金、回款和风险，每天三选一，不会全都收费。',action:'看看今日委托 →',tab:'business',g:2},
{title:'选一单，先把账看明白',text:'街坊茶会稳妥；黄金商队有亏损风险；帮茶商催货款还能增加同行者的好感与信任，未选同行时给今日协作角色。确认后才扣启动资金，也可以暂时跳过。',target:'#orderChoices .panel',action:'暂时跳过委托 →',tab:'business',g:2},
{title:'第四步 · 工作之外，也见见他',text:'到财神录任选小游戏。成功有奖励，轻量练习也算完成，今天不必追求满分。',action:'去财神录 →',tab:'gods',g:3},
{title:'最后，赴今夜之约。',text:'剧情里点一下补全当前句，再点推进；空格也可以继续。读到选项，再决定心意。读完今夜剧情，就能结束今天。',action:'开始今晚剧情 →',g:0}
];
function tutorialState(){let t=state?.presentation?.tutorial;if(t&&t.version!==2){if(t.step>=6&&t.step<=7)t.step+=2;t.version=2}return t}
function guideTargets(t,cfg){
 let selectors=cfg.target?[cfg.target]:[];
 if(t.step===1)selectors.push('#prayGod','#wish');
 if(t.step===2)selectors.push('[data-a="incense"]');
 if(t.step===4)selectors.push('#collabSelect');
 if(t.step===8&&tab==='gods')selectors=['.god-card [data-a="mini"]'];
 return [...new Set(selectors.flatMap(selector=>[...document.querySelectorAll(selector)]))].filter(el=>{let r=el.getBoundingClientRect();return r.width>0&&r.height>0});
}
function guideSpotlight(targets){
 $('tutorialSpotlight')?.remove();
 let veil=document.createElementNS('http://www.w3.org/2000/svg','svg');
 veil.id='tutorialSpotlight';veil.classList.add('tutorial-spotlight');veil.setAttribute('aria-hidden','true');veil.setAttribute('width',innerWidth);veil.setAttribute('height',innerHeight);
 let rects=targets.map(el=>{let r=el.getBoundingClientRect(),pad=8;return {x:Math.max(0,r.left-pad),y:Math.max(0,r.top-pad),right:Math.min(innerWidth,r.right+pad),bottom:Math.min(innerHeight,r.bottom+pad)}}).filter(r=>r.right>r.x&&r.bottom>r.y);
 let holes=rects.map(r=>`<rect x="${r.x}" y="${r.y}" width="${r.right-r.x}" height="${r.bottom-r.y}" rx="8" fill="black"/>`).join('');
 let rings=rects.map(r=>`<rect class="spotlight-ring" x="${r.x+1}" y="${r.y+1}" width="${Math.max(0,r.right-r.x-2)}" height="${Math.max(0,r.bottom-r.y-2)}" rx="7"/>`).join('');
 veil.innerHTML=`<defs><mask id="tutorialSpotlightMask" maskUnits="userSpaceOnUse" x="0" y="0" width="${innerWidth}" height="${innerHeight}"><rect width="${innerWidth}" height="${innerHeight}" fill="white"/>${holes}</mask></defs><rect class="spotlight-dimmer" width="${innerWidth}" height="${innerHeight}" mask="url(#tutorialSpotlightMask)"/>${rings}`;
 document.body.append(veil);
}
function drawGuide(){
 cancelAnimationFrame(guideFrame);guideFrame=null;
 document.querySelectorAll('.tutorial-highlight').forEach(e=>e.classList.remove('tutorial-highlight'));
 let t=tutorialState();
 if(!t||t.status!=='active'||$('modal').open||$('introDialog')?.open){$('tutorialGuide')?.remove();$('tutorialSpotlight')?.remove();return}
 let cfg=t.step===9&&state.daily.story?{...GUIDE[9],title:'今天的开始，你已经经历。',text:'序幕就是第一天的共通剧情，不会再重复结算。现在可以继续经营，或结束今日，第二夜再选择同行者。',action:'完成教学 →'}:GUIDE[t.step];if(!cfg){$('tutorialGuide')?.remove();$('tutorialSpotlight')?.remove();return}
 let aside=$('tutorialGuide');
 if(!aside||aside.dataset.step!==String(t.step)){
  aside?.remove();aside=document.createElement('aside');aside.id='tutorialGuide';aside.className='tutorial-guide';aside.dataset.step=t.step;aside.setAttribute('role','region');aside.setAttribute('aria-label','新手教学');
  aside.innerHTML=`<img src="${IMG(cfg.g,true)}" alt="${GODS[cfg.g].name}"><div class="tutorial-copy"><div class="row between"><small>新手指引 ${t.step+1} / ${GUIDE.length}</small><button class="plain" data-a="skipTutorial">跳过教学 ×</button></div><h3>${cfg.title}</h3><p>${cfg.text}</p>${cfg.action?btn(cfg.action,'tutorialNext','','gold small'):btn('前往这一步','tutorialLocate','','outline small')}</div>`;
  document.body.append(aside);
 }
 let targets=guideTargets(t,cfg);targets.forEach(el=>el.classList.add('tutorial-highlight'));guideSpotlight(targets);
 let visible=targets.find(el=>{let r=el.getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight})||targets.find(el=>{let r=el.getBoundingClientRect();return r.bottom>0&&r.top<innerHeight});
 if(visible){let rect=visible.getBoundingClientRect();aside.classList.toggle('guide-top',rect.top>innerHeight*.52)}else aside.classList.remove('guide-top');
}

function guideStep(step){let t=tutorialState();if(!t||t.status!=='active')return;t.step=step;persist();drawGuide()}
function tutorialEvent(a,p){let t=tutorialState();if(!t||t.status!=='active')return;if(a==='pray'&&t.step<=2)guideStep(3);else if(a==='collab'&&t.step===4)guideStep(5);else if(a==='collect'&&t.step>=3&&t.step<=5)guideStep(6);else if(a==='order'&&t.step>=6&&t.step<=7)guideStep(8);else if(a==='game'&&t.step===8)guideStep(9)}
function routeGuide(){let t=tutorialState();if(!t)return;let cfg=GUIDE[t.step];if(cfg.tab){tab=cfg.tab;render()}requestAnimationFrame(()=>{let el=cfg.target&&document.querySelector(cfg.target);el?.scrollIntoView({block:'center'});drawGuide()})}
function tutorialNext(){let t=tutorialState();if(!t)return;if(t.step===0){guideStep(state.daily.prayed?3:1);routeGuide()}else if(t.step===3){guideStep(state.daily.collected?6:state.daily.collab>=0?5:4);routeGuide()}else if(t.step===6){guideStep(state.daily.order?8:7);routeGuide()}else if(t.step===7){guideStep(8);routeGuide()}else if(t.step===8){tab='gods';render();document.querySelector('[data-a="mini"]')?.scrollIntoView({block:'center'});toast('选一个小游戏，完成后再去今夜之约。')}else if(t.step===9){t.status='done';persist();drawGuide();tab='temple';render();showStory()}}
function pauseTutorial(){let t=tutorialState();if(t){t.status='skipped';persist()}drawGuide();toast('教学已跳过；设置里可以重新开始。')}
// Capture only presentation actions, leaving the original game economy and daily logic intact.
document.addEventListener('click',e=>{let b=e.target.closest('[data-a]');if(!b||b.disabled)return;let a=b.dataset.a,handled=true;switch(a){
case 'vnNext':vnAdvance();break;case 'vnBack':if(vn&&vn.index>0){vn.index--;paintVN()}break;case 'vnHistory':vnHistory();break;case 'vnSkip':if(vn){clearInterval(vnTypeTimer);clearTimeout(vnAutoTimer);vn.index=vn.baseLength;paintVN()}break;case 'vnAuto':if(vn){vn.auto=!vn.auto;$('vnAuto').textContent=vn.auto?'自动 · 开':'自动';if(vn.auto&&vn.complete&&!vn.atChoice)vnAutoTimer=setTimeout(vnAdvance,1500);else if(!vn.auto)clearTimeout(vnAutoTimer)}break;
case 'skipOpening':finishOpening();break;case 'nextOpening':clearTimeout(openingTimer);openingFrame++;paintOpening();break;
case 'replayOpening':replayPrologue();break;
case 'startTutorial':startTutorial(true);break;case 'tutorialNext':tutorialNext();break;case 'tutorialLocate':routeGuide();break;case 'skipTutorial':pauseTutorial();break;
case 'dismissReaction':document.querySelector('.role-reaction')?.remove();break;
case 'castCollab':perform('collab',{g:Number(b.dataset.g)});break;
default:handled=false;
}
if(handled){e.preventDefault();e.stopImmediatePropagation();return}
if(a==='light')defer(()=>{if(tutorialState()?.status==='active'&&tutorialState().step===1)guideStep(2)});
if(a==='continue'||a==='confirmLoad')defer(()=>{if(state?.presentation?.introDone===false)opening(()=>{presentData().introDone=true;persist();startTutorial(false)});else if(tutorialState()?.status==='active'){if(tutorialState().step===2&&!state.daily.prayed)guideStep(1);routeGuide()}});
if(a==='settings')defer(()=>{$('modalContent').querySelector('.choices')?.insertAdjacentHTML('beforeend',btn('重看开场动画','replayOpening','','outline')+btn('重新体验新手教学','startTutorial','','outline'))});
if(['inspect','pokerAction','box','montyDecision','feed'].includes(a))defer(()=>{if(!mini)return;if(a==='inspect')actorSay('“'+['先看材质。别急着给它定价。','形制会留下用途的线索。','把线索和题卡对照，再写结论。'][Number(b.dataset.index)]+'”');if(a==='pokerAction')actorSay(mini.finished?'“这一局结束了。愿意的话，我们还能慢慢下。”':'“不用猜我在想什么，先看你已经知道的牌。”');if(a==='box')actorSay('“我已经打开一只空箱。现在，该你决定了。”');if(a==='montyDecision')actorSay('“一局只是运气，长久才看得清规律。”');if(a==='feed')actorSay('“……它今天倒是格外听你的话。”');});
if(a==='sign')defer(()=>{let card=$('modalContent').querySelector('.end-view');if(card){card.insertAdjacentHTML('afterbegin',`<div class="sign-reveal"><div class="sign-sticks">〡 〡 〡</div><img src="${IMG(selectedGod)}" alt="${GODS[selectedGod].name}为你解签"></div>`);card.classList.add('sign-animated')}});
},true);
document.addEventListener('keydown',e=>{if(vn&&!e.altKey&&!e.ctrlKey&&!e.metaKey&&[' ','Enter','ArrowRight'].includes(e.key)&&!e.target.closest('.choice,.vn-toolbar,.vn-history')){e.preventDefault();e.stopImmediatePropagation();vnAdvance()}},true);
$('modal').addEventListener('close',()=>{if(!$('modal').open)stopVN();defer(drawGuide)});
window.addEventListener('resize',()=>{if(tutorialState()?.status==='active')drawGuide()});
window.addEventListener('scroll',()=>{if(tutorialState()?.status==='active'&&!guideFrame)guideFrame=requestAnimationFrame(()=>{guideFrame=null;drawGuide()})},{passive:true});
render();
