import { useEffect, useState } from 'react';

export type Language = 'zh' | 'en';
const english: Record<string, string> = {
  '雨夜盲区': 'Rain Blindspot',
  '暴雨夜，三个人都在等同一个人。你是刑警队长韩岚，找出谁真正动了手。': 'Three people are waiting for the same man on a stormy night. Play as police captain Han Lan and find out who acted. Game in Chinese.',
  '本格推理 · 试玩': 'Detective mystery · Demo',
  '摸鱼之神温迪的 LAB': 'wendi’s Lab',
  '独立游戏': 'Games', '产品实验': 'Experiments', '小红书 ↗': 'Rednote ↗',
  '打开导航': 'Open navigation', '主导航': 'Main navigation',
  '切换到浅色模式': 'Switch to light mode', '切换到深色模式': 'Switch to dark mode',
  '把脑洞，做成': 'Small ideas.', '可以点开的东西。': 'Real things to try.',
  '这里是 wendi 的数字实验场。游戏只是第一章，接下来还有学习工具、音乐产品和智能 Agent。': 'Welcome to wendi’s digital playground. Start with games, then explore learning tools, music experiments and AI agents.',
  '开始玩游戏': 'Play a game', '看看产品实验': 'Explore experiments', '持续增加中 ↗': 'More on the way ↗',
  '熟悉的游戏，原样保留。': 'Pick your next adventure.',
  '个可玩作品，从文字麻将到叙事解谜。每一个都会在新主页里继续被看见。': 'games to explore, from word mahjong to story-driven mysteries.',
  '产品实验，新区域。': 'Beyond the game shelf.',
  '为游戏之外的网页留出一块正式空间。以后只需新增一条项目配置，就能把公开作品接进来。': 'A home for tools, playful experiments and ideas you can try in your browser.',
  '作品不必属于同一个分类，': 'Different ideas,', '只要它值得被打开一次。': 'all worth a click.',
  '在 GitHub 看制作现场': 'Explore the code on GitHub',
  '小红书 @摸鱼之神温迪 ↗': 'Find wendi on Rednote ↗',
  '立即体验': 'Try it', '开始体验': 'Play now', '等待首个项目': 'Coming soon',
  '逃离宏业电子厂': 'Escape from Hongye Factory',
  '在空无一人的工厂里探索线索、破解密码，想办法赶在一切失控前逃出去。': 'Search an abandoned factory, uncover clues and crack the codes before it is too late.',
  '叙事解谜': 'Story puzzle', '肌肉的诱惑': 'The Muscle Mystery',
  '一位学生离奇失踪，你只有他遗落的手机。顺着聊天记录，找出事件背后的真相。': 'A student has vanished. His abandoned phone is your only lead. Follow the messages to uncover the truth.',
  '手机解谜': 'Phone mystery', '地铁抢座大作战': 'Subway Seat Rush',
  '观察乘客、预判路线，在瞬息万变的通勤现场里抢到属于你的那个座位。': 'Read the crowd, plan your route and race for a seat in the chaos of the daily commute.',
  '策略反应': 'Strategy & reflexes', '电梯 ELEV-9': 'ELEV-9',
  '困在一台不太对劲的智能电梯里。识别异常、逐层解谜，直到抵达第九层。': 'Trapped in an unsettling smart elevator, spot anomalies and solve each floor’s puzzles to reach level nine.',
  '异常观察': 'Spot the anomaly', '字雀 · 文字麻将': 'Zique · Word Mahjong',
  '玩法借鉴《白色失明文字麻将》的非官方线上版本。轻登录开房、扫码邀请，2—4 人即可一起玩。': 'An unofficial online game inspired by White Blindness Word Mahjong. Create a room, invite friends by QR code and play with 2–4 people.',
  '多人文字': 'Multiplayer word game', '财神偏爱我': 'Favored by the Gods of Wealth',
  '白天经营财神庙，晚上和五位财神谈恋爱。上香、鉴宝、摸黑虎，在七日相处里解锁 17 种结局与专属插画。': 'Run a temple by day and romance five gods of wealth by night. Make offerings, appraise treasures and unlock 17 endings over seven days.',
  '恋爱养成 · 经营': 'Romance & management',
  '测试实验室': 'Self-Discovery Lab', '从动力，到关系': 'Motivation meets relationships',
  '进入统一测试入口：用 10 道题找出当前生活源动力，或用情境题整理亲密关系中的需求、边界和可协商条件。': 'Explore what drives you with a 10-question quiz, or reflect on your needs, boundaries and room for compromise in relationships.',
  '老板翻译机': 'Boss Translator', '把模糊指令变成行动': 'Turn vague requests into next steps',
  '粘贴老板聊天记录和最新一句话，结合业务背景拆成具体任务、交付物、优先级和确认回复；支持智谱 GLM、DeepSeek 和截图识别。': 'Add a conversation and some context to turn a vague request into tasks, deliverables, priorities and a reply. Supports GLM, DeepSeek and screenshot text recognition.',
  '学习工坊': 'Learning Workshop', '把资料变成练习': 'Turn reading into practice',
  '把教材、文章或笔记粘贴进来，自动变成由浅入深的练习题；边学边答，进度和错题都会帮你记住。': 'Paste a textbook excerpt, article or notes to create exercises that build in difficulty. Practice as you learn, with progress and mistakes saved for review.',
  '有只黑猫': 'A Little Black Cat', '两个人的异步陪伴': 'A shared moment, whenever you’re here',
  '输入同一个房间号，共同照顾一只会回应互动的黑猫。每间房只留两张位置，十几秒也能留下‘我来过’。': 'Share a room code and care for a responsive little black cat together. Each room has space for two—a few seconds is enough to leave a little sign you were here.',
};

export function translate(text: string, language: Language): string {
  return language === 'en' ? english[text] ?? text : text;
}

export function useLanguage(updateMetadata = true) {
  const [language, setLanguage] = useState<Language>(() => {
    const query = new URLSearchParams(window.location.search).get('lang');
    if (query === 'en' || query === 'zh') return query;
    try { const saved = localStorage.getItem('wendi-language'); if (saved === 'en' || saved === 'zh') return saved; } catch {}
    return navigator.language.toLowerCase().startsWith('zh') ? 'zh' : 'en';
  });
  useEffect(() => {
    try { localStorage.setItem('wendi-language', language); } catch {}
    document.documentElement.lang = language === 'en' ? 'en' : 'zh-CN';
    if (updateMetadata) document.title = language === 'en' ? 'wendi’s Lab · Games & Experiments' : '摸鱼之神温迪的 LAB · 游戏与产品实验';
    const description = language === 'en' ? 'Explore wendi’s indie games, learning tools and digital experiments.' : 'wendi 的数字实验场：独立游戏、教育产品、音乐工具与智能 Agent。';
    if (updateMetadata) {
      document.querySelector('meta[name="description"]')?.setAttribute('content', description);
      document.querySelector('meta[property="og:title"]')?.setAttribute('content', document.title);
      document.querySelector('meta[property="og:description"]')?.setAttribute('content', description);
    }
    const url = new URL(window.location.href);
    url.searchParams.set('lang', language);
    window.history.replaceState(null, '', url);
  }, [language, updateMetadata]);
  const chooseLanguage = (next: Language) => {
    const url = new URL(window.location.href); url.searchParams.set('lang', next);
    window.history.replaceState(null, '', url);
    try { localStorage.setItem('wendi-language', next); } catch {}
    setLanguage(next);
  };
  useEffect(() => {
    const change = (event: Event) => { const next = (event as CustomEvent).detail; if (next === 'en' || next === 'zh') setLanguage(next); };
    window.addEventListener('wendi-language-change', change);
    return () => window.removeEventListener('wendi-language-change', change);
  }, []);
  return { language, setLanguage: chooseLanguage, t: (text: string) => translate(text, language) };
}
