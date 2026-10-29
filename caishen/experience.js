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
      "text": "工资刚到账，房租和几笔日常扣款便挨个跳出来。你还没看清余额，手机先提醒电量不足。",
      "g": null,
      "mood": "平静",
      "hideGod": true
    },
    {
      "who": "你",
      "text": "财神爷，今晚能不能管管我？钱没留住，想开的茶铺也一直没开成。",
      "g": null,
      "mood": "平静",
      "hideGod": true
    },
    {
      "who": "旁白",
      "text": "你抱着那份改了很多遍的茶铺计划进庙躲雨。神像前供着两块饼，其中一块忽然被黑虎叼走。",
      "g": null,
      "mood": "平静",
      "hideGod": true
    },
    {
      "who": "你",
      "text": "……财神庙还养真老虎？",
      "g": null,
      "mood": "平静",
      "hideGod": true
    },
    {
      "who": "赵公明",
      "text": "站住，别跑。它嘴里有饼，顾不上你。到本君这边来。",
      "g": 0,
      "mood": "沉声制止"
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
      "text": "听见了。求留住钱，还求开自己的铺子，两件事倒说得清楚。坐下，把湿袖子拧干。本君没叫你站着回话。",
      "g": 0,
      "mood": "不动声色的关照"
    },
    {
      "who": "曹宝",
      "text": "这边请，凳子我擦过了。雨还没停，不如陪我看一页账？放心，先不考你。",
      "g": 2,
      "mood": "笑着探问"
    },
    {
      "who": "你",
      "text": "我来求财，还要面试？",
      "g": null,
      "mood": "平静"
    },
    {
      "who": "曹宝",
      "text": "既然被你看出来，我就不藏了。曹宝，管账。现钱二百二十元宝，旧欠三百，一间茶楼还能开门。临时庙主一职，确实空着。你先听条件，不急着点头。",
      "g": 2,
      "mood": "温声摊牌"
    },
    {
      "who": "你",
      "text": "你们住财神庙，也会手头紧？",
      "g": null,
      "mood": "平静"
    },
    {
      "who": "萧升",
      "text": "屋顶不会因为住着财神就免收瓦钱。前几任倒很有仙气，等拨款，等客来，连灰都等出三层。你若也打算这么干，茶就当我请你。",
      "g": 1,
      "mood": "淡淡挖苦"
    },
    {
      "who": "陈九公",
      "text": "还有七天就交账啦！你真会开茶铺？那太好了，我去喊街坊！哎，先别喊是吧？行，你先说，我听着！",
      "g": 3,
      "mood": "赶忙接话"
    },
    {
      "who": "姚少司",
      "text": "瞧，一个递账本，一个已经想跑出去揽客。先别怕，我们缺个会做茶的，你恰好缺间铺子。这巧合值不值得坐下聊聊？",
      "g": 4,
      "mood": "笑着打圆场"
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
      "text": "旧欠由庙里偿还，不转到你名下。这条写进契约，本君署名。你的报酬、分账和退出办法，也一项项写明。看清楚，再答。",
      "g": 0,
      "mood": "郑重划清责任"
    },
    {
      "who": "曹宝",
      "text": "还有一处，得请你亲自答应。庙里的元宝与人间银行卡分开记，家用不填公账。你若想偷偷垫钱，可瞒不过我这本账。",
      "g": 2,
      "mood": "温柔设问"
    },
    {
      "who": "你",
      "text": "那你们五个，除了看我算账，还能帮什么？",
      "g": null,
      "mood": "平静"
    },
    {
      "who": "萧升",
      "text": "萧升，招宝的。进货、验物、谈价，都能找我。尤其那种祖传三天的聚宝盆，记得留给我，我想听听他祖上这三天怎么过的。",
      "g": 1,
      "mood": "漫不经心的自荐"
    },
    {
      "who": "陈九公",
      "text": "陈九公！跑街坊、找客人、送货，这城里我闭着眼都熟！你只管把茶做好，跑腿叫我。还有，开饭也叫我，别把这个落下！",
      "g": 3,
      "mood": "笑着拍胸脯"
    },
    {
      "who": "姚少司",
      "text": "姚少司，利市的。好消息归我找，坏条件也归我打听。吉利话我会说，先掏钱就算了，我还想多蹭你几杯茶呢。",
      "g": 4,
      "mood": "眨眼卖关子"
    },
    {
      "who": "曹宝",
      "text": "我管收支，替你留住进货与工钱。至于每天何时对账，等你方便再定。我这张凳子，先给你留着。",
      "g": 2,
      "mood": "含笑接过话"
    },
    {
      "who": "赵公明",
      "text": "若有人劝你赌一把补窟窿，叫他来见本君。越急着用钱，越不能把钱袋交给一句好听话。记住了？",
      "g": 0,
      "mood": "语气一沉"
    },
    {
      "who": "你",
      "text": "听起来，像五个管钱又管饭的同事。",
      "g": null,
      "mood": "平静"
    },
    {
      "who": "萧升",
      "text": "管饭可以。至于只做同事，掌柜现在就把话说满，往后可不好改口。",
      "g": 1,
      "mood": "挑眉逗弄"
    },
    {
      "who": "旁白",
      "text": "你被逗笑，接过庙门钥匙。曹宝把约好的报酬与分工写下来，推到你面前。",
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
  ],
  [
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
      "text": "且慢。茶叶、炭、伙计工钱，逐项付完。剩下的，才轮到新茶具。",
      "g": 0,
      "mood": "抬手按住钱匣"
    },
    {
      "who": "你",
      "text": "还没高兴一会儿，就来找我要账。",
      "g": null,
      "mood": "平静"
    },
    {
      "who": "赵公明",
      "text": "本君没拦你高兴。只是明早茶叶钱都成了杯子，你打算请客人喝什么？仙气？",
      "g": 0,
      "mood": "一本正经的揶揄"
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
      "text": "嗯，先留答应给别人的钱。一文也别混。余下怎么花，你说，本君听着。",
      "g": 0,
      "mood": "耐心等你动笔"
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
      "text": "要停就找取消入口。只关提醒，那钱照扣。这小东西倒会躲，本君陪你找。",
      "g": 0,
      "mood": "俯身盯着屏幕"
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
      "text": "藏成这样。黑虎叼走本君的梳子，都没它难找。",
      "g": 0,
      "mood": "难得有些不服气"
    },
    {
      "who": "旁白",
      "text": "黑虎听见名字，竖起一只耳朵。他把茶换成热的，放到你没拿笔的那只手边。",
      "g": 0,
      "mood": "平静"
    }
  ],
  [
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
      "text": "随本君出来。先离开这摊子，透口气。",
      "g": 0,
      "mood": "沉声唤你"
    },
    {
      "who": "你",
      "text": "你是不是觉得我特别没出息，才会想靠这个？",
      "g": null,
      "mood": "平静"
    },
    {
      "who": "赵公明",
      "text": "修瓦的报价，本君听到了。你急着撑住这座庙，这份心，本君领。但别拿自己去赌。",
      "g": 0,
      "mood": "放缓声音"
    },
    {
      "who": "旁白",
      "text": "你站到茶摊边，手仍攥着钱袋。身后又有人喊差一点，下一回准中。",
      "g": 0,
      "mood": "平静"
    },
    {
      "who": "赵公明",
      "text": "又是差一点。它哄你再付一回，可输了的钱，何曾答应下回一定回来？",
      "g": 0,
      "mood": "盯住那张彩头单"
    },
    {
      "who": "你",
      "text": "可我现在就是缺这一笔。你叫我别赌，也得让我知道接下来怎么办。",
      "g": null,
      "mood": "平静"
    },
    {
      "who": "赵公明",
      "text": "先去找工匠。哪处漏雨必须修，哪处可以缓，材料与工钱各多少，当面列清。本君同你去。",
      "g": 0,
      "mood": "当即安排"
    },
    {
      "who": "你",
      "text": "如果还是不够呢？",
      "g": null,
      "mood": "平静"
    },
    {
      "who": "赵公明",
      "text": "那就少开几张桌，按撑得住的数来。办法可以再找，吃饭与进货的钱，一文都不押。",
      "g": 0,
      "mood": "定下底线"
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
      "text": "怕钱不够，尽管说。本君在这里，难道只听得了你报喜？",
      "g": 0,
      "mood": "压低了声音"
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
      "text": "可以。虎归虎。本君也在，不必事事先找它。",
      "g": 0,
      "mood": "别开目光"
    }
  ],
  [
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
      "text": "印出何处，客从何来，做不到如何赔？三件事，他可曾说清？",
      "g": 0,
      "mood": "接过单据审视"
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
      "text": "停用的旧印，竟拿到这里收钱。单据留下，本君查。后续付款，先停。",
      "g": 0,
      "mood": "神色冷下来"
    },
    {
      "who": "你",
      "text": "我们也差点答应。如果把经过写出来，会不会显得新庙主很好骗？",
      "g": null,
      "mood": "平静"
    },
    {
      "who": "赵公明",
      "text": "查过才发现不对，也照实写。你是庙主，不是要交一张从不犯错的脸面。后面的人，得看得见这处坑。",
      "g": 0,
      "mood": "郑重纠正"
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
      "text": "看到了。手别抖。先记时间、收款方式，再查联系人与往来。一项项办，本君没走。",
      "g": 0,
      "mood": "稳住你的手"
    },
    {
      "who": "你",
      "text": "你不生气？",
      "g": null,
      "mood": "平静"
    },
    {
      "who": "赵公明",
      "text": "担心。也有气。但若本君今夜只顾责备，下回你还肯把收据拿出来吗？",
      "g": 0,
      "mood": "坦白得很低"
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
      "text": "对，不许先许诺追回。先止付，记清已发生的事，再找能处理的人。能查到哪一步，就说哪一步。",
      "g": 0,
      "mood": "沉声确认"
    },
    {
      "who": "旁白",
      "text": "你拿起笔。这次他没有替你落字，只把灯往你这边挪了挪。",
      "g": 0,
      "mood": "平静"
    }
  ],
  [
    {
      "who": "旁白",
      "text": "你收完最后一张桌，正想把剩下的冷饼当晚饭，赵公明端着热汤来到院里。",
      "g": 0,
      "mood": "平静"
    },
    {
      "who": "赵公明",
      "text": "集市上那一张饼，就是你今天的饭？",
      "g": 0,
      "mood": "看着桌上的饭"
    },
    {
      "who": "你",
      "text": "想省一点。账没补齐，吃好的总觉得心虚。",
      "g": null,
      "mood": "平静"
    },
    {
      "who": "赵公明",
      "text": "坐下。饭钱早留在账里，少吃这一顿，庙也不会多出一片瓦。",
      "g": 0,
      "mood": "直接拉开椅子"
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
      "text": "配热汤吃。该省的本君陪你找，但账本翻到你这顿饭，先停。",
      "g": 0,
      "mood": "把热汤推近"
    },
    {
      "who": "你",
      "text": "那今晚出来吃饭，算你送财？",
      "g": null,
      "mood": "平静"
    },
    {
      "who": "赵公明",
      "text": "算本君想同你吃。这个理由，够不够？",
      "g": 0,
      "mood": "硬着语气承认"
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
      "text": "问账、拦赌，是职责。等到你收摊再动筷子，是本君这几日自己的事。",
      "g": 0,
      "mood": "有些不自在"
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
      "text": "它吃过了。这碗给你的，本君特意留的。别又让它占先。",
      "g": 0,
      "mood": "拦住伸向黑虎的勺子"
    },
    {
      "who": "旁白",
      "text": "院门被他虚掩上。账本还在屋里，你们坐着把热汤喝完，谁也没先起身。",
      "g": 0,
      "mood": "平静"
    }
  ],
  [
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
      "text": "先看背面。正面有什么好盯的。",
      "g": 0,
      "mood": "掩饰着催促"
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
      "text": "你说心急便忘，本君就写短些。塞得进手机壳，出门也好带。尺寸试过了。",
      "g": 0,
      "mood": "不太自然地解释"
    },
    {
      "who": "你",
      "text": "贴了是不是就不破财？",
      "g": null,
      "mood": "平静"
    },
    {
      "who": "赵公明",
      "text": "纸能记字，不能替你作主。买错了也来找本君，别贴着我的字，反倒学会瞒我。",
      "g": 0,
      "mood": "认真叮嘱"
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
      "text": "它看钱袋。你看本君，就够了。",
      "g": 0,
      "mood": "目光没有避开"
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
      "text": "慢慢来。本君喜欢你，又不是等你把每笔账都做对了才算数。",
      "g": 0,
      "mood": "语气放柔"
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
      "text": "时间留好了。专门等你，不是顺路。",
      "g": 0,
      "mood": "郑重补上一句"
    }
  ],
  [
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
      "text": "这扇门，你可后悔进过？照实说。",
      "g": 0,
      "mood": "静静等你回答"
    },
    {
      "who": "你",
      "text": "辛苦是真辛苦。但现在钱为什么少、明天该做什么，我好歹敢摊开看了。",
      "g": null,
      "mood": "平静"
    },
    {
      "who": "旁白",
      "text": "他接过茶，将核好的账本合上。杯中热气散开，你终于不用再盯着纸上的数字。",
      "g": 0,
      "mood": "平静"
    },
    {
      "who": "你",
      "text": "这七天的账，总算是我自己写明白的。明天要做什么，也不再只有慌张。",
      "g": null,
      "mood": "平静"
    },
    {
      "who": "旁白",
      "text": "赵公明将账本放在一旁，目光仍停在你身上。",
      "g": 0,
      "mood": "平静"
    },
    {
      "who": "赵公明",
      "text": "庙里的事继续办，你人间的打算也继续做。留下或回去开茶铺，由你选。本君要听真话。",
      "g": 0,
      "mood": "将选择交还给你"
    },
    {
      "who": "你",
      "text": "你呢？还会管我取不取消自动扣款，吃不吃晚饭？",
      "g": null,
      "mood": "平静"
    },
    {
      "who": "赵公明",
      "text": "愿意说，本君便听。只是今夜，本君还想谈一件私事。",
      "g": 0,
      "mood": "打断自己的公事语气"
    },
    {
      "who": "旁白",
      "text": "他把杯子放下，终于没有拿公事挡在中间。",
      "g": 0,
      "mood": "平静"
    },
    {
      "who": "赵公明",
      "text": "这几日，本君总记着你何时收摊。你来问账，便高兴；什么也不问，只坐一会儿，也高兴。账里解释不了。",
      "g": 0,
      "mood": "郑重又有些生涩"
    },
    {
      "who": "你",
      "text": "如果我以后还是没赚到很多钱呢？",
      "g": null,
      "mood": "平静"
    },
    {
      "who": "赵公明",
      "text": "本君想见你。那本账结得多少，都不改这句话。",
      "g": 0,
      "mood": "直视着你"
    },
    {
      "who": "旁白",
      "text": "院门外，黑虎的尾巴扫过门槛。他没有伸手拉你，只将身旁的位置空出来。",
      "g": 0,
      "mood": "平静"
    },
    {
      "who": "赵公明",
      "text": "往后，可愿同本君一起过？忙时一道办事，闲时一道吃饭。这个约，得你亲口答应。",
      "g": 0,
      "mood": "郑重求一个回答"
    }
  ]
];
const REPLIES=[
  [
    [
      {
        "who": "你",
        "text": "经营的钱、人间生活的钱，都分清楚。明早谁做什么，也先说好。",
        "g": null,
        "mood": "平静"
      },
      {
        "who": "赵公明",
        "text": "准。明早你管茶楼，本君管屋顶。契约写完就吃饭，不许拿空肚子熬夜。",
        "g": 0,
        "mood": "简短应允"
      }
    ],
    [
      {
        "who": "你",
        "text": "我本来还想，财神施个法，明早就不用愁钱了。",
        "g": null,
        "mood": "平静"
      },
      {
        "who": "赵公明",
        "text": "累了便先歇，没人逼你今夜算清。但不看条件就落款，本君不许你这么糟蹋自己的名字。",
        "g": 0,
        "mood": "严厉里留着余地"
      }
    ]
  ],
  [
    [
      {
        "who": "你",
        "text": "明天进货的钱先留着。新茶具，等看清用不用得上再买。",
        "g": null,
        "mood": "平静"
      },
      {
        "who": "赵公明",
        "text": "这就对了。茶具改日陪你挑。今晚先坐稳，腿都站僵了，还想逞强？",
        "g": 0,
        "mood": "收起账本"
      }
    ],
    [
      {
        "who": "你",
        "text": "买完再赚回来，总能补上。",
        "g": null,
        "mood": "平静"
      },
      {
        "who": "赵公明",
        "text": "若明日客少呢？伙计的工钱不能陪你赌客流。那一笔，放回去。",
        "g": 0,
        "mood": "不容含糊"
      },
      {
        "who": "旁白",
        "text": "你停住伸向钱匣的手，账上几项还没谈拢。",
        "g": 0,
        "mood": "平静"
      }
    ]
  ],
  [
    [
      {
        "who": "你",
        "text": "先修会漏到茶桌的那块，其他的问清再排。我不拿明天的饭钱试。",
        "g": null,
        "mood": "平静"
      },
      {
        "who": "赵公明",
        "text": "走，本君陪你问。钱袋自己握紧。若又想回那个摊子，先看本君一眼。",
        "g": 0,
        "mood": "站在你身侧"
      }
    ],
    [
      {
        "who": "你",
        "text": "我知道你说的，可刚才真的就差一点。",
        "g": null,
        "mood": "平静"
      },
      {
        "who": "赵公明",
        "text": "舍不得那一次，更该停。你想听本君说下一次会赢？这句话，本君不会说。",
        "g": 0,
        "mood": "毫不退让"
      },
      {
        "who": "旁白",
        "text": "他留在摊外等你，你们没能像原先那样轻松地聊下去。",
        "g": 0,
        "mood": "平静"
      }
    ]
  ],
  [
    [
      {
        "who": "你",
        "text": "样单钱也写进去。以后接这种保证单，先把来源和条款问清楚。",
        "g": null,
        "mood": "平静"
      },
      {
        "who": "赵公明",
        "text": "旧印的问题，本君署名说明。你知道多少便写多少，别替旁人遮，也别替自己多认。",
        "g": 0,
        "mood": "落笔署名"
      }
    ],
    [
      {
        "who": "你",
        "text": "我想先把付出去的赚回来，别让街坊知道。",
        "g": null,
        "mood": "平静"
      },
      {
        "who": "赵公明",
        "text": "私事可以不向街坊公开。可明知是假保证，还借它收别人的钱？这一步，本君不会让。",
        "g": 0,
        "mood": "明确拒绝"
      },
      {
        "who": "旁白",
        "text": "他取下已经摆到门边的招牌，你们之间第一次隔出一段沉默。",
        "g": 0,
        "mood": "平静"
      }
    ]
  ],
  [
    [
      {
        "who": "你",
        "text": "其实我下午就饿了，还怕你们觉得我不会吃苦。",
        "g": null,
        "mood": "平静"
      },
      {
        "who": "赵公明",
        "text": "以后累了就说。庙主也得吃饭歇脚，这条若没人写，本君补上。",
        "g": 0,
        "mood": "终于松了眉头"
      }
    ],
    [
      {
        "who": "你",
        "text": "等赚够了再说，今天还能忍。",
        "g": null,
        "mood": "平静"
      },
      {
        "who": "赵公明",
        "text": "钱没算好，尚可重算。今日的饭，不能拖成明日的账。先吃。",
        "g": 0,
        "mood": "把筷子放到你手里"
      },
      {
        "who": "旁白",
        "text": "他把汤留在你手边，却没等到你像白日那样看他一眼。",
        "g": 0,
        "mood": "平静"
      }
    ]
  ],
  [
    [
      {
        "who": "你",
        "text": "字我会看。买灯的时候，你也陪我挑。",
        "g": null,
        "mood": "平静"
      },
      {
        "who": "赵公明",
        "text": "好。想看哪盏，指给本君。价一起问，别自己走远。",
        "g": 0,
        "mood": "藏不住期待"
      }
    ],
    [
      {
        "who": "你",
        "text": "有你的符，我是不是可以放心赌大一点？",
        "g": null,
        "mood": "平静"
      },
      {
        "who": "赵公明",
        "text": "不可。本君的名字不替谁担保稳赢。这张符是提醒你看清楚，不是准你借钱冒险。",
        "g": 0,
        "mood": "当即否决"
      },
      {
        "who": "旁白",
        "text": "他把手从价牌上收回，重新和你说明那几行字。",
        "g": 0,
        "mood": "平静"
      }
    ]
  ],
  [
    [
      {
        "who": "你",
        "text": "愿意。可别只记得问我吃没吃，你也要按时下值。",
        "g": null,
        "mood": "平静"
      },
      {
        "who": "赵公明",
        "text": "好。明日收摊，本君来接你。往后也一样。",
        "g": 0,
        "mood": "笑意终于露出来"
      },
      {
        "who": "旁白",
        "text": "你坐到他身旁，他的手慢慢覆上你的手背。",
        "g": 0,
        "mood": "平静"
      }
    ],
    [
      {
        "who": "你",
        "text": "我很高兴认识你，不过现在更想把自己的生意做下去。",
        "g": null,
        "mood": "平静"
      },
      {
        "who": "赵公明",
        "text": "明白。合伙的事照旧。日后有难处，仍来找本君，不必避着。",
        "g": 0,
        "mood": "收好自己的心意"
      },
      {
        "who": "旁白",
        "text": "他把账本交回你手里，认真听你说下一步的打算。",
        "g": 0,
        "mood": "平静"
      }
    ],
    [
      {
        "who": "你",
        "text": "我想先回去，把那间茶铺试着开起来。",
        "g": null,
        "mood": "平静"
      },
      {
        "who": "赵公明",
        "text": "路上当心。到了安稳处，寄封信来。本君等着。",
        "g": 0,
        "mood": "克制地叮嘱"
      },
      {
        "who": "旁白",
        "text": "他送你到庙门，替你把手机壳里的红纸重新塞稳。",
        "g": 0,
        "mood": "平静"
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
const NARRATIVE_REVISION=2;
function storyCursorIndex(cursor,day,g,total){
 if(!cursor||cursor.day!==day||!Number.isInteger(cursor.index)||cursor.index<0)return 0;
 let index=cursor.index;
 if(!Number.isInteger(cursor.revision)||cursor.revision<NARRATIVE_REVISION){const removed=day===1?[28,29]:day===7?(g===0?[5,6]:[0,1]):[];index-=removed.filter(i=>i<cursor.index).length}
 return Math.max(0,Math.min(index,total));
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
 const isHeroine=['你','你的决定','你的选择'].includes(frame.who),narrator=frame.who==='旁白';
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
{title:'选一单，先把账看明白',text:'街坊茶会稳妥；黄金商队有亏损风险；调查并谈判还能增加同行者的好感与信任，未选同行时给今日协作角色。确认后才扣启动资金，也可以暂时跳过。',target:'#orderChoices .panel',action:'暂时跳过委托 →',tab:'business',g:2},
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
