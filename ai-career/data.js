export const questions=[
  {
    "title": "突然多出一个完全自由的周末，你最想做什么",
    "group": "生活驱动力",
    "kind": "drive",
    "options": [
      {
        "text": "完全按自己的节奏安排",
        "key": "A"
      },
      {
        "text": "集中练习一项能力",
        "key": "B"
      },
      {
        "text": "做一个自己的作品",
        "key": "C"
      },
      {
        "text": "去陌生地方或研究新主题",
        "key": "D"
      },
      {
        "text": "和亲近的人深入相处",
        "key": "E"
      },
      {
        "text": "帮一个人解决实际问题",
        "key": "F"
      },
      {
        "text": "完成一个明确目标",
        "key": "G"
      },
      {
        "text": "休息整理，让生活恢复稳定",
        "key": "H"
      }
    ],
    "id": "q01",
    "prompt": "按你最近一年的真实偏好选择",
    "context": "假设没有必须处理的工作、家务或约定，这个周末完全由你安排。"
  },
  {
    "title": "完成一件困难的事，哪个结果最让你满足",
    "group": "生活驱动力",
    "kind": "drive",
    "options": [
      {
        "text": "事情由我自己决定推进",
        "key": "A"
      },
      {
        "text": "明显感觉自己的能力变强",
        "key": "B"
      },
      {
        "text": "一个新想法被真正实现",
        "key": "C"
      },
      {
        "text": "发现意料之外的新可能",
        "key": "D"
      },
      {
        "text": "感到被理解和接纳",
        "key": "E"
      },
      {
        "text": "给别人带来实际改善",
        "key": "F"
      },
      {
        "text": "达到一个有挑战的目标",
        "key": "G"
      },
      {
        "text": "风险降低，生活更可控",
        "key": "H"
      }
    ],
    "id": "q02",
    "prompt": "回想最近一年完成的一件难事",
    "context": "可以是工作、学习或生活中的事。想一想：完成后，哪一点最让你觉得值得？"
  },
  {
    "title": "收入相同，你更愿意选择哪种工作",
    "group": "生活驱动力",
    "kind": "drive",
    "options": [
      {
        "text": "拥有较大的决策权",
        "key": "A"
      },
      {
        "text": "能持续钻研复杂能力",
        "key": "B"
      },
      {
        "text": "可以从零创造产品",
        "key": "C"
      },
      {
        "text": "经常接触陌生问题",
        "key": "D"
      },
      {
        "text": "团队关系紧密可信",
        "key": "E"
      },
      {
        "text": "能产生明确的社会价值",
        "key": "F"
      },
      {
        "text": "晋升和奖励非常清楚",
        "key": "G"
      },
      {
        "text": "收入和节奏稳定可预测",
        "key": "H"
      }
    ],
    "id": "q03",
    "prompt": "想象你有几种收入相同的工作可选",
    "context": "假设工作时长、通勤等条件也差不多，只比较下面这些特点；没有工作经历也可以想象。"
  },
  {
    "title": "未来三年，你最希望增加什么",
    "group": "生活驱动力",
    "kind": "drive",
    "options": [
      {
        "text": "更多属于自己的选择权",
        "key": "A"
      },
      {
        "text": "更明显的能力提升",
        "key": "B"
      },
      {
        "text": "更多真正完成的作品",
        "key": "C"
      },
      {
        "text": "更多陌生经历和可能",
        "key": "D"
      },
      {
        "text": "更深、更稳定的关系",
        "key": "E"
      },
      {
        "text": "更大的实际影响",
        "key": "F"
      },
      {
        "text": "更突出的成绩和认可",
        "key": "G"
      },
      {
        "text": "更充足的资源和安全感",
        "key": "H"
      }
    ],
    "id": "q04",
    "prompt": "按你现在对未来的期待选择",
    "context": "从现在往后三年看，你最希望自己的生活在哪方面变得更好？"
  },
  {
    "id": "q05",
    "kind": "activity",
    "key": "activity",
    "group": "工作偏好",
    "prompt": "想象你有半天自由安排",
    "title": "下面哪件事，你最想亲手做一做？",
    "context": "可以选你感兴趣但还不熟练的事。这里问你愿意把时间花在哪里，不要求已经做过。",
    "options": [
      {
        "text": "把一个故事做成视频、图片或声音作品",
        "value": "creative"
      },
      {
        "text": "为一个商品想办法找到顾客",
        "value": "business"
      },
      {
        "text": "比较资料和证据，弄清一个问题",
        "value": "research"
      },
      {
        "text": "发现一个生活麻烦，设计出解决它的小工具",
        "value": "product"
      },
      {
        "text": "帮一个人学会某件事，或解决实际困难",
        "value": "service"
      },
      {
        "text": "研究工具怎样连接，让一项重复任务自动完成",
        "value": "technical"
      }
    ]
  },
  {
    "id": "q06",
    "group": "工作偏好",
    "key": "social",
    "kind": "scale",
    "title": "和别人一起完成一件事，你喜欢怎样配合？",
    "context": "例如一起做活动、小组作业或工作任务。请按自己舒服的日常节奏选择。",
    "prompt": "按最近半年的实际经历选择",
    "options": [
      {
        "text": "主要自己做，最后交流结果",
        "value": 0
      },
      {
        "text": "大部分自己做，遇到问题再讨论",
        "value": 0.3333333333333333
      },
      {
        "text": "和小团队经常沟通、一起推进",
        "value": 0.6666666666666666
      },
      {
        "text": "经常面对不同的人，协调需求与行动",
        "value": 1
      }
    ]
  },
  {
    "id": "q07",
    "group": "工作偏好",
    "key": "management",
    "kind": "scale",
    "title": "一群人一起做事时，你愿意承担多少组织责任？",
    "context": "例如准备一次活动。这里问你是否愿意协调别人，不是在判断你有没有领导能力。",
    "prompt": "按最近半年的实际经历选择",
    "options": [
      {
        "text": "把分给自己的事做好即可",
        "value": 0
      },
      {
        "text": "偶尔协助安排，但不想牵头",
        "value": 0.3333333333333333
      },
      {
        "text": "愿意协调几个人，把事情推进",
        "value": 0.6666666666666666
      },
      {
        "text": "愿意负责目标、分工和后续管理",
        "value": 1
      }
    ]
  },
  {
    "id": "q08",
    "group": "工作偏好",
    "key": "business",
    "kind": "scale",
    "title": "如果你做出一个作品或工具，你愿意花多少精力找使用者？",
    "context": "例如做了模板、视频或小应用。这里的找使用者包括了解需求、介绍作品，以及讨论是否付费。",
    "prompt": "按最近半年的实际经历选择",
    "options": [
      {
        "text": "只想做好作品，不想主动找人推广",
        "value": 0
      },
      {
        "text": "愿意听反馈，但希望别人帮忙推广",
        "value": 0.3333333333333333
      },
      {
        "text": "愿意主动找使用者，了解需求并介绍作品",
        "value": 0.6666666666666666
      },
      {
        "text": "愿意持续找客户、谈价格并改进经营",
        "value": 1
      }
    ]
  },
  {
    "id": "q09",
    "group": "可迁移能力",
    "key": "writing",
    "kind": "scale",
    "title": "把一件事写清楚，让别人容易看懂，你目前做起来怎么样？",
    "context": "例如写活动介绍、学习笔记或经验分享。按自己实际做过的程度回答，不是按兴趣回答。 未尝试只代表证据未知，不计为能力低；可以跳过，两者按相同规则处理。",
    "prompt": "按最近半年的实际经历选择",
    "options": [
      {
        "text": "还没尝试过／暂时没有实践证据",
        "value": null
      },
      {
        "text": "尝试过，目前仍很难完成",
        "value": 0
      },
      {
        "text": "在别人帮助下可以完成",
        "value": 0.3333333333333333
      },
      {
        "text": "可以独立完成",
        "value": 0.6666666666666666
      },
      {
        "text": "可以独立完成，也能指导别人",
        "value": 1
      }
    ]
  },
  {
    "id": "q10",
    "group": "可迁移能力",
    "key": "design",
    "kind": "scale",
    "title": "修改一份图片、文字或声音作品时，你能指出具体问题并说明改法吗？",
    "context": "只按你最熟悉的一类作品回答，不推断你在其他媒介也熟练。后续要做视频、音乐等方向，还需要分别用作品验证。未尝试选择第一项，不计为能力低。",
    "prompt": "按最近半年的实际经历选择",
    "options": [
      {
        "text": "还没尝试过／暂时没有实践证据",
        "value": null
      },
      {
        "text": "尝试过，目前仍很难完成",
        "value": 0
      },
      {
        "text": "在别人帮助下可以完成",
        "value": 0.3333333333333333
      },
      {
        "text": "可以独立完成",
        "value": 0.6666666666666666
      },
      {
        "text": "可以独立完成，也能指导别人",
        "value": 1
      }
    ]
  },
  {
    "id": "q11",
    "group": "可迁移能力",
    "key": "analysis",
    "kind": "scale",
    "title": "整理和比较信息，再说出判断依据，你目前做起来怎么样？",
    "context": "例如比较商品、核对旅行信息、查一个问题的资料。能区分证据和猜测，比收集得多更重要。 未尝试只代表证据未知，不计为能力低；可以跳过，两者按相同规则处理。",
    "prompt": "按最近半年的实际经历选择",
    "options": [
      {
        "text": "还没尝试过／暂时没有实践证据",
        "value": null
      },
      {
        "text": "尝试过，目前仍很难完成",
        "value": 0
      },
      {
        "text": "在别人帮助下可以完成",
        "value": 0.3333333333333333
      },
      {
        "text": "可以独立完成",
        "value": 0.6666666666666666
      },
      {
        "text": "可以独立完成，也能指导别人",
        "value": 1
      }
    ]
  },
  {
    "id": "q12",
    "group": "可迁移能力",
    "key": "people",
    "kind": "scale",
    "title": "问清别人遇到的问题和需要，你目前做起来怎么样？",
    "context": "例如朋友来求助，先听他说、问清情况，再确认自己有没有理解对；不需要有客户服务经验。 未尝试只代表证据未知，不计为能力低；可以跳过，两者按相同规则处理。",
    "prompt": "按最近半年的实际经历选择",
    "options": [
      {
        "text": "还没尝试过／暂时没有实践证据",
        "value": null
      },
      {
        "text": "尝试过，目前仍很难完成",
        "value": 0
      },
      {
        "text": "在别人帮助下可以完成",
        "value": 0.3333333333333333
      },
      {
        "text": "可以独立完成",
        "value": 0.6666666666666666
      },
      {
        "text": "可以独立完成，也能指导别人",
        "value": 1
      }
    ]
  },
  {
    "id": "q13",
    "group": "可迁移能力",
    "key": "delivery",
    "kind": "scale",
    "title": "把一件事分步骤、安排好并做完，你目前做起来怎么样？",
    "context": "例如组织聚会、准备考试或完成一个小项目。这里看你做完一件事的经验，不要求带过团队。 未尝试只代表证据未知，不计为能力低；可以跳过，两者按相同规则处理。",
    "prompt": "按最近半年的实际经历选择",
    "options": [
      {
        "text": "还没尝试过／暂时没有实践证据",
        "value": null
      },
      {
        "text": "尝试过，目前仍很难完成",
        "value": 0
      },
      {
        "text": "在别人帮助下可以完成",
        "value": 0.3333333333333333
      },
      {
        "text": "可以独立完成",
        "value": 0.6666666666666666
      },
      {
        "text": "可以独立完成，也能指导别人",
        "value": 1
      }
    ]
  },
  {
    "id": "q14",
    "group": "AI协作与技术",
    "key": "tech",
    "kind": "scale",
    "title": "用软件的进阶功能或代码减少重复劳动，你目前做起来怎么样？",
    "context": "例如用表格公式自动算账、批量整理文件，或写一个小程序。只会打开软件不算；没做过可选第一项。 未尝试只代表证据未知，不计为能力低；可以跳过，两者按相同规则处理。",
    "prompt": "按最近半年的实际经历选择",
    "options": [
      {
        "text": "还没尝试过／暂时没有实践证据",
        "value": null
      },
      {
        "text": "尝试过，目前仍很难完成",
        "value": 0
      },
      {
        "text": "在别人帮助下可以完成",
        "value": 0.3333333333333333
      },
      {
        "text": "可以独立完成",
        "value": 0.6666666666666666
      },
      {
        "text": "可以独立完成，也能指导别人",
        "value": 1
      }
    ]
  },
  {
    "id": "q15",
    "group": "AI协作与技术",
    "key": "ai",
    "kind": "scale",
    "title": "看到一个可能用得上的 AI 工具，你现在愿意尝试到哪一步？",
    "context": "例如输入一句描述就能生成海报。没有用过也可以想象自己最愿意做的事，这里不考AI知识。",
    "prompt": "按你现在的意愿选择",
    "options": [
      {
        "text": "目前不想尝试",
        "value": 0
      },
      {
        "text": "愿意跟着教程体验一次",
        "value": 0.3333333333333333
      },
      {
        "text": "愿意自己尝试，并修改要求",
        "value": 0.6666666666666666
      },
      {
        "text": "愿意反复比较工具和做法，直到做出可用的小成果",
        "value": 1
      }
    ]
  },
  {
    "id": "q16",
    "group": "AI协作与技术",
    "key": "verify",
    "kind": "scale",
    "title": "AI 整理了一份看起来完整的旅行建议，你会怎样使用？",
    "context": "里面有交通时间、景点和路线。即使没用过AI，也请想象：你会为核对和修改这份回答投入多少精力？",
    "prompt": "按你最可能的做法选择",
    "options": [
      {
        "text": "看起来合理，就直接使用",
        "value": 0
      },
      {
        "text": "只检查明显可疑的地方",
        "value": 0.3333333333333333
      },
      {
        "text": "核对会影响行程的重要信息",
        "value": 0.6666666666666666
      },
      {
        "text": "逐项核对重要信息，指出问题并让AI修改",
        "value": 1
      }
    ]
  },
  {
    "id": "q17",
    "group": "发展选择",
    "key": "stability",
    "kind": "scale",
    "title": "尝试新方向时，你目前多需要一份稳定收入？",
    "context": "这里的收入指维持日常生活的钱。按自己现在的现实条件选择，不用填金额；这题只调整发展模式，不影响职业方向分数。",
    "prompt": "按你现在的现实条件选择",
    "options": [
      {
        "text": "非常需要，尝试必须不影响稳定收入",
        "value": 0
      },
      {
        "text": "比较需要，可以在现有安排之外做小项目",
        "value": 0.3333333333333333
      },
      {
        "text": "有一定缓冲，可以接受一段时间收入波动",
        "value": 0.6666666666666666
      },
      {
        "text": "已有其他稳定支持，当前不依赖新方向马上赚钱",
        "value": 1
      }
    ]
  },
  {
    "id": "q18",
    "group": "发展选择",
    "kind": "goal",
    "key": "goal",
    "prompt": "按你现在最想探索的路线选择",
    "title": "如果找到一个愿意尝试的方向，你更想怎样开始？",
    "context": "选你目前想走的路线，不等于马上作决定。副业接单属于自由职业；经营自己的产品或业务属于创业。",
    "options": [
      {
        "text": "在现有工作里用起来，或去公司做相关岗位",
        "value": "employment"
      },
      {
        "text": "先接一些项目，做副业或自由职业",
        "value": "freelance"
      },
      {
        "text": "自己经营一个小产品、内容账号或服务业务",
        "value": "solo"
      },
      {
        "text": "和伙伴一起组建团队、经营业务",
        "value": "team"
      },
      {
        "text": "还没想好，先了解各种可能",
        "value": "unsure"
      }
    ]
  }
];
export const careers=[
  {
    "id": "c01",
    "name": "AIGC视频创作",
    "prototype": "creative",
    "also": [],
    "description": "把故事或商品做成短视频、广告或MV",
    "opportunity": "AI辅助分镜、生成画面与初剪，减少部分拍摄和后期工作",
    "drives": [
      "C",
      "A"
    ],
    "skills": {
      "writing": 0.425,
      "design": 0.425,
      "tech": 0.15
    },
    "social": 0.3,
    "management": 0.2,
    "business": 0.4,
    "bridge": 0.85,
    "task": "用一个熟悉话题写15秒脚本，画或生成3张分镜，配一段旁白",
    "output": "脚本＋3张分镜",
    "observe": "镜头能否连起来讲清一件事",
    "tools": "视频生成、字幕与剪辑工具",
    "risk": "内容版权、人物肖像与平台规则；播放量不等于收入",
    "difficulty": "可先从低成本小作品体验",
    "barriers": "补可展示作品、质量判断与使用者反馈"
  },
  {
    "id": "c02",
    "name": "AI短剧／漫画创作",
    "prototype": "creative",
    "also": [],
    "description": "写故事、设计角色并制作连续画面",
    "opportunity": "AI辅助角色草图、场景与画面迭代",
    "drives": [
      "C",
      "A"
    ],
    "skills": {
      "writing": 0.45,
      "design": 0.45,
      "tech": 0.1
    },
    "social": 0.3,
    "management": 0.2,
    "business": 0.4,
    "bridge": 0.8,
    "task": "写一个双人物冲突场景，做6格分镜，检查角色动机",
    "output": "6格故事草稿",
    "observe": "读者能否说出人物想要什么",
    "tools": "分镜与图像生成工具",
    "risk": "连续角色和剧情质量仍需打磨；制作与运营耗时",
    "difficulty": "可先从低成本小作品体验",
    "barriers": "补可展示作品、质量判断与使用者反馈"
  },
  {
    "id": "c03",
    "name": "AI音乐／音频创作",
    "prototype": "creative",
    "also": [],
    "description": "制作音乐、音效、配音或播客片段",
    "opportunity": "AI提供旋律、声音或编辑草稿，帮助快速试风格",
    "drives": [
      "C",
      "A"
    ],
    "skills": {
      "design": 0.425,
      "writing": 0.425,
      "tech": 0.15
    },
    "social": 0.3,
    "management": 0.2,
    "business": 0.4,
    "bridge": 0.7,
    "task": "为一个日常场景写四句歌词或旁白，做两版15秒音频草稿",
    "output": "两版音频或声音脚本",
    "observe": "能否说明哪版更适合场景",
    "tools": "音乐生成、音频编辑工具",
    "risk": "声音授权和商用条款需核对；原创判断不能外包",
    "difficulty": "可先从低成本小作品体验",
    "barriers": "补可展示作品、质量判断与使用者反馈"
  },
  {
    "id": "c04",
    "name": "AI游戏／互动内容制作",
    "prototype": "creative",
    "also": [
      "product"
    ],
    "description": "制作小游戏、互动故事或虚拟角色体验",
    "opportunity": "AI可辅助代码和素材草稿，让非程序员先做小原型",
    "drives": [
      "C",
      "A"
    ],
    "skills": {
      "design": 0.375,
      "writing": 0.375,
      "tech": 0.25
    },
    "social": 0.3,
    "management": 0.2,
    "business": 0.4,
    "bridge": 1,
    "task": "画出一个单按钮小游戏的规则和3个画面，用纸面走一遍",
    "output": "规则卡＋3个画面",
    "observe": "别人能否不听解释完成一轮",
    "tools": "代码助手、互动原型与素材生成工具",
    "risk": "可玩性、调试与发行需要长期投入；原型不代表可售产品",
    "difficulty": "可先从低成本小作品体验",
    "barriers": "补可展示作品、质量判断与使用者反馈"
  },
  {
    "id": "c05",
    "name": "AI视觉／品牌设计",
    "prototype": "creative",
    "also": [
      "product"
    ],
    "description": "为品牌制作图像、视觉规范或界面草稿",
    "opportunity": "AI帮助快速探索视觉方案，仍需人选择和修改",
    "drives": [
      "C",
      "A"
    ],
    "skills": {
      "design": 0.45,
      "people": 0.45,
      "tech": 0.1
    },
    "social": 0.3,
    "management": 0.2,
    "business": 0.4,
    "bridge": 0.65,
    "task": "为虚构咖啡店做两版海报草图，写清受众和视觉取舍",
    "output": "两版海报草图",
    "observe": "是否让人快速读懂活动信息",
    "tools": "图像生成、排版与设计工具",
    "risk": "素材授权、字体和品牌一致性需要人工把关",
    "difficulty": "可先从低成本小作品体验",
    "barriers": "补可展示作品、质量判断与使用者反馈"
  },
  {
    "id": "c06",
    "name": "AI自媒体／IP经营",
    "prototype": "business",
    "also": [],
    "description": "围绕一个主题持续经营内容账号与个人品牌",
    "opportunity": "AI协助选题、草稿和多种形式改写",
    "drives": [
      "G",
      "A"
    ],
    "skills": {
      "writing": 0.45,
      "delivery": 0.45,
      "tech": 0.1
    },
    "social": 0.8,
    "management": 0.6,
    "business": 1,
    "bridge": 0.7,
    "task": "选一个熟悉主题，写出受众、3个选题和一篇短稿",
    "output": "主题定位＋3个选题＋短稿",
    "observe": "是否能清楚说出内容帮助谁",
    "tools": "内容规划、写作与图像工具",
    "risk": "获客和持续更新成本高；关注不等于付费",
    "difficulty": "可先从低成本小作品体验",
    "barriers": "补可展示作品、质量判断与使用者反馈"
  },
  {
    "id": "c07",
    "name": "AI电商经营",
    "prototype": "business",
    "also": [],
    "description": "处理商品研究、介绍、店铺与客户体验",
    "opportunity": "AI协助商品资料、文案和重复客服流程",
    "drives": [
      "G",
      "A"
    ],
    "skills": {
      "analysis": 0.425,
      "delivery": 0.425,
      "tech": 0.15
    },
    "social": 0.8,
    "management": 0.6,
    "business": 1,
    "bridge": 0.55,
    "task": "比较3件同类商品的公开评价，整理一个需求与一版介绍",
    "output": "评价表＋商品介绍草稿",
    "observe": "卖点是否有公开证据支持",
    "tools": "表格分析、文案与商品图片工具",
    "risk": "库存、平台规则、广告成本与售后责任不可忽略",
    "difficulty": "可先从低成本小作品体验",
    "barriers": "补可展示作品、质量判断与使用者反馈"
  },
  {
    "id": "c08",
    "name": "AI营销与增长",
    "prototype": "business",
    "also": [],
    "description": "提出获客假设、制作素材并设计测试",
    "opportunity": "AI加速素材变体和分析草稿",
    "drives": [
      "G",
      "A"
    ],
    "skills": {
      "analysis": 0.425,
      "writing": 0.425,
      "tech": 0.15
    },
    "social": 0.8,
    "management": 0.6,
    "business": 1,
    "bridge": 0.5,
    "task": "给虚构产品写3版介绍，并设计一个比较点击意愿的小测试",
    "output": "3版素材＋测试计划",
    "observe": "是否只改一个因素且定义了观察指标",
    "tools": "文案生成、素材设计与分析工具",
    "risk": "点击不等于收入；投放与测试需预算和真实数据",
    "difficulty": "可先从低成本小作品体验",
    "barriers": "补可展示作品、质量判断与使用者反馈"
  },
  {
    "id": "c09",
    "name": "AI品牌／商业策略",
    "prototype": "business",
    "also": [],
    "description": "明确受众、定位和对外表达",
    "opportunity": "AI辅助梳理资料和生成策略备选",
    "drives": [
      "G",
      "A"
    ],
    "skills": {
      "people": 0.45,
      "writing": 0.45,
      "tech": 0.1
    },
    "social": 0.8,
    "management": 0.6,
    "business": 1,
    "bridge": 0.4,
    "task": "为虚构小店写一句定位，列出受众、理由和不服务谁",
    "output": "一页定位说明",
    "observe": "能否解释和竞争方案的区别",
    "tools": "研究整理、写作与演示工具",
    "risk": "漂亮方案不等于有效策略；需要真实顾客反馈",
    "difficulty": "可先从低成本小作品体验",
    "barriers": "补可展示作品、质量判断与使用者反馈"
  },
  {
    "id": "c10",
    "name": "AI商业分析",
    "prototype": "business",
    "also": [
      "research"
    ],
    "description": "整理经营信息、解释变化并提出待验证行动",
    "opportunity": "AI协助数据清理、计算和图表初稿",
    "drives": [
      "G",
      "A"
    ],
    "skills": {
      "analysis": 0.35,
      "delivery": 0.35,
      "tech": 0.3
    },
    "social": 0.8,
    "management": 0.6,
    "business": 1,
    "bridge": 0.6,
    "task": "用一份虚构销售表比较两个时期，列出变化和三个待查原因",
    "output": "对比表＋待查清单",
    "observe": "是否分清观察、推测与证据",
    "tools": "表格分析、图表和代码助手",
    "risk": "数据口径错误会误导决策；不能把相关当因果",
    "difficulty": "需要作品与一定工具基础",
    "barriers": "补完整作品、工具使用与真实反馈"
  },
  {
    "id": "c11",
    "name": "AI行业研究",
    "prototype": "research",
    "also": [],
    "description": "研究行业、竞争方案与市场问题",
    "opportunity": "AI辅助资料检索、归类和摘要",
    "drives": [
      "B",
      "D"
    ],
    "skills": {
      "analysis": 0.425,
      "writing": 0.425,
      "tech": 0.15
    },
    "social": 0.4,
    "management": 0.2,
    "business": 0.3,
    "bridge": 0.3,
    "task": "围绕一个行业问题找3条公开来源，分清事实、推测和空白",
    "output": "带来源的一页研究笔记",
    "observe": "每个结论能否回到原始来源",
    "tools": "检索、来源整理与摘要工具",
    "risk": "资料可能过时或有偏差；摘要必须回查原文",
    "difficulty": "可先从低成本小作品体验",
    "barriers": "补可展示作品、质量判断与使用者反馈"
  },
  {
    "id": "c12",
    "name": "AI用户研究",
    "prototype": "research",
    "also": [
      "service"
    ],
    "description": "通过访谈与观察理解用户需求",
    "opportunity": "AI协助转录、归类和整理访谈线索",
    "drives": [
      "B",
      "D"
    ],
    "skills": {
      "people": 0.45,
      "analysis": 0.45,
      "tech": 0.1
    },
    "social": 0.4,
    "management": 0.2,
    "business": 0.3,
    "bridge": 0.3,
    "task": "写5个不诱导的访谈问题，找一位同意的朋友试问并记原话",
    "output": "访谈提纲＋匿名笔记",
    "observe": "是否保留原话并避免诱导答案",
    "tools": "转录、笔记与定性整理工具",
    "risk": "小样本不代表总体；录音和资料使用先征得同意",
    "difficulty": "可先从低成本小作品体验",
    "barriers": "补可展示作品、质量判断与使用者反馈"
  },
  {
    "id": "c13",
    "name": "AI质量评测（Evaluation）",
    "prototype": "research",
    "also": [
      "technical"
    ],
    "description": "用标准与样例评估模型、Agent或产品表现",
    "opportunity": "AI协助生成候选用例和批量整理结果",
    "drives": [
      "B",
      "D"
    ],
    "skills": {
      "analysis": 0.325,
      "delivery": 0.325,
      "tech": 0.35
    },
    "social": 0.4,
    "management": 0.2,
    "business": 0.3,
    "bridge": 0.45,
    "task": "给旅行问答写5条测试用例，定义事实错误、漏答和通过条件",
    "output": "5条用例＋判断标准",
    "observe": "不同人能否按同一标准判断",
    "tools": "评测表格、用例与数据分析工具",
    "risk": "少量样例不能代表整体质量；AI评分也需要校准",
    "difficulty": "需要作品与一定工具基础",
    "barriers": "补完整作品、工具使用与真实反馈"
  },
  {
    "id": "c14",
    "name": "AI决策分析",
    "prototype": "research",
    "also": [],
    "description": "用实验和数据检验策略，辅助判断",
    "opportunity": "AI协助计算、模拟和分析草稿",
    "drives": [
      "B",
      "D"
    ],
    "skills": {
      "analysis": 0.25,
      "delivery": 0.25,
      "tech": 0.5
    },
    "social": 0.4,
    "management": 0.2,
    "business": 0.3,
    "bridge": 0.3,
    "task": "为一个虚构改版写问题、对照方式、指标和可能混淆因素",
    "output": "一页实验设计",
    "observe": "能否说清什么证据支持什么结论",
    "tools": "统计分析、模拟与代码助手",
    "risk": "需要统计与领域训练；不能凭AI输出作重大决策",
    "difficulty": "需要作品与一定工具基础",
    "barriers": "补完整作品、工具使用与真实反馈"
  },
  {
    "id": "c15",
    "name": "AI安全与治理",
    "prototype": "research",
    "also": [],
    "description": "识别系统风险、资料权限与使用边界",
    "opportunity": "AI可辅助梳理案例和检查清单",
    "drives": [
      "B",
      "D"
    ],
    "skills": {
      "analysis": 0.275,
      "delivery": 0.275,
      "tech": 0.45
    },
    "social": 0.4,
    "management": 0.2,
    "business": 0.3,
    "bridge": 0.2,
    "task": "为虚构客服AI列5种失败情境，并写人工升级与资料使用规则",
    "output": "风险清单＋处理规则",
    "observe": "每种风险是否有可执行的处理人和步骤",
    "tools": "资料检索、风险记录与测试工具",
    "risk": "专业知识与组织职责要求高；检查清单不等于合规认证",
    "difficulty": "需要作品与一定工具基础",
    "barriers": "补完整作品、工具使用与真实反馈"
  },
  {
    "id": "c16",
    "name": "AI产品策划",
    "prototype": "product",
    "also": [
      "research"
    ],
    "description": "发现用户问题，设计AI产品流程和验收条件",
    "opportunity": "AI帮助快速做界面与方案草稿",
    "drives": [
      "C",
      "F"
    ],
    "skills": {
      "analysis": 0.4,
      "people": 0.4,
      "tech": 0.2
    },
    "social": 0.6,
    "management": 0.5,
    "business": 0.6,
    "bridge": 0.65,
    "task": "选择一个日常痛点，写用户、输入输出、失败处理和成功观察",
    "output": "一页产品草案",
    "observe": "是否有人有这个问题且能判断有没有改善",
    "tools": "界面原型、需求整理与代码助手",
    "risk": "原型不等于需求成立；还需验证成本与可靠性",
    "difficulty": "可先从低成本小作品体验",
    "barriers": "补可展示作品、质量判断与使用者反馈"
  },
  {
    "id": "c17",
    "name": "小工具与数字产品制作",
    "prototype": "product",
    "also": [
      "technical"
    ],
    "description": "制作模板、小应用或网站，并迭代使用体验",
    "opportunity": "AI降低一部分代码与视觉实现门槛",
    "drives": [
      "C",
      "F"
    ],
    "skills": {
      "design": 0.325,
      "delivery": 0.325,
      "tech": 0.35
    },
    "social": 0.6,
    "management": 0.5,
    "business": 0.6,
    "bridge": 1,
    "task": "把一个日常麻烦画成3页小工具界面，模拟一条完整流程",
    "output": "3页草图＋操作流程",
    "observe": "别人能否完成一个真实的小任务",
    "tools": "代码助手、无代码搭建与原型工具",
    "risk": "上线后的安全、维护和使用支持仍需承担",
    "difficulty": "需要作品与一定工具基础",
    "barriers": "补完整作品、工具使用与真实反馈"
  },
  {
    "id": "c18",
    "name": "AI行业应用开发",
    "prototype": "product",
    "also": [
      "technical"
    ],
    "description": "把AI能力组合成特定场景的应用",
    "opportunity": "AI辅助原型与代码，帮助快速验证场景",
    "drives": [
      "C",
      "F"
    ],
    "skills": {
      "analysis": 0.3,
      "delivery": 0.3,
      "tech": 0.4
    },
    "social": 0.6,
    "management": 0.5,
    "business": 0.6,
    "bridge": 0.9,
    "task": "为一个具体行业任务画输入、人工检查和输出流程",
    "output": "场景说明＋流程图",
    "observe": "是否比原有做法更容易检查和使用",
    "tools": "代码助手、应用原型与工作流工具",
    "risk": "数据权限、可靠性与付费需求必须逐项验证",
    "difficulty": "需要作品与一定工具基础",
    "barriers": "补完整作品、工具使用与真实反馈"
  },
  {
    "id": "c19",
    "name": "AI产品运营",
    "prototype": "product",
    "also": [
      "business"
    ],
    "description": "改进产品使用、留存与用户反馈处理",
    "opportunity": "AI帮助整理反馈、分组与运营素材",
    "drives": [
      "C",
      "F"
    ],
    "skills": {
      "people": 0.425,
      "analysis": 0.425,
      "tech": 0.15
    },
    "social": 0.6,
    "management": 0.5,
    "business": 0.6,
    "bridge": 0.5,
    "task": "为虚构AI工具写首次体验流程，列出3个可能放弃的位置",
    "output": "体验流程＋问题清单",
    "observe": "是否分清使用动作和真正得到的价值",
    "tools": "反馈整理、文案与分析工具",
    "risk": "增长动作可能无效；要避免把使用次数当成功",
    "difficulty": "可先从低成本小作品体验",
    "barriers": "补可展示作品、质量判断与使用者反馈"
  },
  {
    "id": "c20",
    "name": "AI交互体验设计",
    "prototype": "product",
    "also": [
      "creative"
    ],
    "description": "设计人与AI之间的提示、修改与失败恢复流程",
    "opportunity": "AI辅助原型和多方案探索",
    "drives": [
      "C",
      "F"
    ],
    "skills": {
      "design": 0.4,
      "people": 0.4,
      "tech": 0.2
    },
    "social": 0.6,
    "management": 0.5,
    "business": 0.6,
    "bridge": 0.7,
    "task": "设计一个AI做海报的三步界面，补上生成失败和修改入口",
    "output": "三步原型＋失败界面",
    "observe": "用户是否知道下一步和怎样改错",
    "tools": "交互原型、界面设计与代码助手",
    "risk": "需要真实可用性测试；界面流畅不代表输出可靠",
    "difficulty": "可先从低成本小作品体验",
    "barriers": "补可展示作品、质量判断与使用者反馈"
  },
  {
    "id": "c21",
    "name": "AI教育／课程设计",
    "prototype": "service",
    "also": [],
    "description": "把知识变成例子、练习和学习反馈",
    "opportunity": "AI协助出草稿与不同难度的练习",
    "drives": [
      "F",
      "E"
    ],
    "skills": {
      "writing": 0.45,
      "people": 0.45,
      "tech": 0.1
    },
    "social": 1,
    "management": 0.4,
    "business": 0.5,
    "bridge": 0.4,
    "task": "把一个熟悉知识点做成例子、练习和答案，请人试做",
    "output": "一页微课程",
    "observe": "学习者能否独立完成一个新例子",
    "tools": "课程草稿、图示与练习设计工具",
    "risk": "会生成内容不等于教学有效；答案需核验",
    "difficulty": "可先从低成本小作品体验",
    "barriers": "补可展示作品、质量判断与使用者反馈"
  },
  {
    "id": "c22",
    "name": "AI培训与应用咨询",
    "prototype": "service",
    "also": [],
    "description": "教个人或团队在具体任务里使用AI",
    "opportunity": "AI辅助演示、练习与使用说明",
    "drives": [
      "F",
      "E"
    ],
    "skills": {
      "people": 0.425,
      "delivery": 0.425,
      "tech": 0.15
    },
    "social": 1,
    "management": 0.4,
    "business": 0.5,
    "bridge": 0.4,
    "task": "给一位初学者设计20分钟AI入门练习，包含一次错误识别",
    "output": "练习步骤＋检查表",
    "observe": "对方是否能自己重复完成",
    "tools": "演示、文档与通用AI助手",
    "risk": "培训效果依赖任务和基础；不能承诺效率或收益",
    "difficulty": "可先从低成本小作品体验",
    "barriers": "补可展示作品、质量判断与使用者反馈"
  },
  {
    "id": "c23",
    "name": "课程与知识产品开发",
    "prototype": "service",
    "also": [
      "business"
    ],
    "description": "把经验制作成课程、测试、模板或知识库",
    "opportunity": "AI协助制作草稿、索引和交付材料",
    "drives": [
      "F",
      "E"
    ],
    "skills": {
      "writing": 0.425,
      "delivery": 0.425,
      "tech": 0.15
    },
    "social": 1,
    "management": 0.4,
    "business": 0.5,
    "bridge": 0.65,
    "task": "选一个熟悉问题，做一页可使用的清单或模板，请人试填",
    "output": "可试用模板＋反馈问题",
    "observe": "是否真的省去一个步骤或解释",
    "tools": "写作、表格与知识库整理工具",
    "risk": "内容正确和有人需要都需验证；下载不等于购买",
    "difficulty": "可先从低成本小作品体验",
    "barriers": "补可展示作品、质量判断与使用者反馈"
  },
  {
    "id": "c24",
    "name": "AI客户成功／实施支持",
    "prototype": "service",
    "also": [],
    "description": "帮助客户配置产品、解决采用过程中的问题",
    "opportunity": "AI辅助资料整理、答疑和实施检查",
    "drives": [
      "F",
      "E"
    ],
    "skills": {
      "people": 0.375,
      "delivery": 0.375,
      "tech": 0.25
    },
    "social": 1,
    "management": 0.4,
    "business": 0.5,
    "bridge": 0.4,
    "task": "为虚构AI工具写一页上手指南，标明需要人工支持的地方",
    "output": "上手指南＋升级清单",
    "observe": "新人是否知道如何开始和求助",
    "tools": "知识库、文档与流程工具",
    "risk": "不能擅自承诺产品能力；客户资料需授权",
    "difficulty": "可先从低成本小作品体验",
    "barriers": "补可展示作品、质量判断与使用者反馈"
  },
  {
    "id": "c25",
    "name": "AI赋能专业服务",
    "prototype": "service",
    "also": [
      "business"
    ],
    "description": "用已有专业知识交付咨询、设计等服务",
    "opportunity": "AI辅助资料与初稿，把更多时间留给专业判断",
    "drives": [
      "F",
      "E"
    ],
    "skills": {
      "people": 0.4,
      "analysis": 0.4,
      "tech": 0.2
    },
    "social": 1,
    "management": 0.4,
    "business": 0.5,
    "bridge": 0.5,
    "task": "选一个自己已有经验的主题，做一页服务说明与交付样例",
    "output": "服务范围＋虚构样例",
    "observe": "是否能独立检查交付质量和边界",
    "tools": "领域资料、文档与分析工具",
    "risk": "前提是已有相关专业能力；AI不能替代资质和责任",
    "difficulty": "可先从低成本小作品体验",
    "barriers": "补可展示作品、质量判断与使用者反馈"
  },
  {
    "id": "c26",
    "name": "AI Agent开发",
    "prototype": "technical",
    "also": [],
    "description": "连接模型与工具，让程序按步骤执行任务",
    "opportunity": "AI辅助编写代码和测试，仍需工程控制",
    "drives": [
      "B",
      "C"
    ],
    "skills": {
      "analysis": 0.175,
      "delivery": 0.175,
      "tech": 0.65
    },
    "social": 0.4,
    "management": 0.3,
    "business": 0.4,
    "bridge": 0.55,
    "task": "画一个邮件分类Agent的工具权限、步骤、停止条件与人工确认",
    "output": "任务流程＋权限表",
    "observe": "错误时能否停止且不会越权",
    "tools": "代码助手、Agent开发与测试工具",
    "risk": "需要权限隔离、测试与监控；演示成功不等于可靠运行",
    "difficulty": "需要系统技术训练",
    "barriers": "补工程基础、测试与真实系统交付记录"
  },
  {
    "id": "c27",
    "name": "AI工作流自动化",
    "prototype": "technical",
    "also": [
      "product"
    ],
    "description": "把重复工作整理为可检查的自动流程",
    "opportunity": "AI辅助规则提炼、流程草稿与脚本",
    "drives": [
      "B",
      "C"
    ],
    "skills": {
      "delivery": 0.25,
      "analysis": 0.25,
      "tech": 0.5
    },
    "social": 0.4,
    "management": 0.3,
    "business": 0.4,
    "bridge": 0.7,
    "task": "用3条虚构邮件，手动走通分类到人工复核的流程",
    "output": "规则表＋3条测试记录",
    "observe": "遇到未知输入时是否回到人工",
    "tools": "自动化流程、表格与脚本工具",
    "risk": "错误会被批量放大；上线前要验证回退与维护",
    "difficulty": "需要作品与一定工具基础",
    "barriers": "补完整作品、工具使用与真实反馈"
  },
  {
    "id": "c28",
    "name": "AI解决方案设计与集成",
    "prototype": "technical",
    "also": [
      "service"
    ],
    "description": "设计企业AI应用与现有系统的连接方式",
    "opportunity": "AI辅助查资料、绘图和集成代码草稿",
    "drives": [
      "B",
      "C"
    ],
    "skills": {
      "analysis": 0.175,
      "people": 0.175,
      "tech": 0.65
    },
    "social": 0.4,
    "management": 0.3,
    "business": 0.4,
    "bridge": 0.35,
    "task": "为虚构小店画预约、资料存储与客服AI之间的数据流",
    "output": "数据流图＋权限清单",
    "observe": "是否知道每步数据给谁、失败怎样处理",
    "tools": "系统绘图、接口测试与代码助手",
    "risk": "需要真实系统经验；成本、安全与集成限制要核实",
    "difficulty": "需要系统技术训练",
    "barriers": "补工程基础、测试与真实系统交付记录"
  },
  {
    "id": "c29",
    "name": "AI应用工程",
    "prototype": "technical",
    "also": [
      "product"
    ],
    "description": "开发问答、检索、工具调用等AI功能",
    "opportunity": "AI辅助编码、测试和资料处理",
    "drives": [
      "B",
      "C"
    ],
    "skills": {
      "analysis": 0.15000000000000002,
      "delivery": 0.15000000000000002,
      "tech": 0.7
    },
    "social": 0.4,
    "management": 0.3,
    "business": 0.4,
    "bridge": 0.5,
    "task": "画一个带来源的问答工具，定义检索、回答与无法回答的情况",
    "output": "问答流程＋3条测试题",
    "observe": "没有来源时能否诚实停止回答",
    "tools": "代码助手、检索与应用测试工具",
    "risk": "需要软件工程能力；来源、安全和维护不能省略",
    "difficulty": "需要系统技术训练",
    "barriers": "补工程基础、测试与真实系统交付记录"
  },
  {
    "id": "c30",
    "name": "AI技术产品研发",
    "prototype": "technical",
    "also": [],
    "description": "将技术能力做成可复用的产品或基础组件",
    "opportunity": "AI辅助原型与实现，帮助检验技术假设",
    "drives": [
      "B",
      "C"
    ],
    "skills": {
      "analysis": 0.09999999999999998,
      "delivery": 0.09999999999999998,
      "tech": 0.8
    },
    "social": 0.4,
    "management": 0.3,
    "business": 0.4,
    "bridge": 0.25,
    "task": "写一个技术小产品的输入输出、性能目标和最小验证计划",
    "output": "技术假设＋验证计划",
    "observe": "是否能设计反例推翻自己的技术假设",
    "tools": "代码助手、基准测试与开发工具",
    "risk": "技术壁垒、成本与长期研发要求高；不能把演示当优势",
    "difficulty": "需要系统技术训练",
    "barriers": "补工程基础、测试与真实系统交付记录"
  }
];
export const prototypes=[
  {
    "id": "creative",
    "name": "创意表达型",
    "line": "把想法变成作品",
    "drives": [
      "C",
      "A"
    ],
    "skills": {
      "writing": 0.5,
      "design": 0.5
    },
    "social": 0.3,
    "management": 0.2,
    "business": 0.4,
    "bridge": 0.7
  },
  {
    "id": "business",
    "name": "商业经营型",
    "line": "理解需求，把价值带给顾客",
    "drives": [
      "G",
      "A"
    ],
    "skills": {
      "analysis": 0.3,
      "people": 0.3,
      "delivery": 0.4
    },
    "social": 0.8,
    "management": 0.6,
    "business": 1,
    "bridge": 0.4
  },
  {
    "id": "research",
    "name": "分析研究型",
    "line": "比较证据，找到可靠答案",
    "drives": [
      "B",
      "D"
    ],
    "skills": {
      "analysis": 0.7,
      "writing": 0.3
    },
    "social": 0.4,
    "management": 0.2,
    "business": 0.3,
    "bridge": 0.3
  },
  {
    "id": "product",
    "name": "产品创造型",
    "line": "发现问题，设计解决办法",
    "drives": [
      "C",
      "F"
    ],
    "skills": {
      "analysis": 0.35,
      "design": 0.25,
      "delivery": 0.4
    },
    "social": 0.6,
    "management": 0.5,
    "business": 0.6,
    "bridge": 0.9
  },
  {
    "id": "service",
    "name": "人际服务型",
    "line": "理解他人，把经验变成帮助",
    "drives": [
      "F",
      "E"
    ],
    "skills": {
      "people": 0.6,
      "writing": 0.2,
      "delivery": 0.2
    },
    "social": 1,
    "management": 0.4,
    "business": 0.5,
    "bridge": 0.35
  },
  {
    "id": "technical",
    "name": "技术构建型",
    "line": "连接工具，让系统真正运转",
    "drives": [
      "B",
      "C"
    ],
    "skills": {
      "analysis": 0.35,
      "delivery": 0.25,
      "tech": 0.4
    },
    "social": 0.4,
    "management": 0.3,
    "business": 0.4,
    "bridge": 0.45
  }
];
export const modes=[
  {
    "id": "employment",
    "name": "企业就业",
    "income": "薪酬或现有工作收益；具体稳定性取决于岗位与雇主",
    "challenge": "核对真实岗位要求、经验与作品证据"
  },
  {
    "id": "freelance",
    "name": "自由职业",
    "income": "按项目或服务收费；订单与回款有波动",
    "challenge": "需自己获客、谈范围、交付与跟进回款"
  },
  {
    "id": "solo",
    "name": "独立创业",
    "income": "自己的产品、内容或服务收入；前期可能没有收入",
    "challenge": "需要持续验证需求、成本与付费意愿"
  },
  {
    "id": "team",
    "name": "团队创业",
    "income": "团队经营产品或服务；回报和支出均不确定",
    "challenge": "需要伙伴分工、管理、资源与长期投入"
  }
];
export const drives={
  "A": "自主",
  "B": "精进",
  "C": "创造",
  "D": "探索",
  "E": "归属",
  "F": "贡献",
  "G": "成就",
  "H": "安全"
};
export const skills={
  "writing": "表达与写作",
  "design": "审美与创意判断",
  "analysis": "分析与证据判断",
  "people": "理解与沟通",
  "delivery": "拆解与完成任务",
  "tech": "工具与技术实现"
};
