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
  ],
  [
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
  ],
  [
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
  ],
  [
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
  ],
  [
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
  ],
  [
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
  ],
  [
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
];
const REPLIES=[
  [
    [
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
    ],
    [
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
  ],
  [
    [
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
    ],
    [
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
  ],
  [
    [
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
    ],
    [
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
  ],
  [
    [
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
    ],
    [
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
  ],
  [
    [
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
    ],
    [
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
  ],
  [
    [
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
    ],
    [
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
  ],
  [
    [
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
    ],
    [
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
    ],
    [
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
const NARRATIVE_REVISION=4;
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
