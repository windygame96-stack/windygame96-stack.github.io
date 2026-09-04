import { useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/hooks/useTheme";

type IconName = "spark" | "book" | "wave" | "chart" | "game" | "arrow" | "sun" | "moon";

interface Game {
  title: string;
  description: string;
  url: string;
  image: string;
  tag: string;
}

interface ProductSlot {
  title: string;
  eyebrow: string;
  description: string;
  icon: IconName;
  accent: string;
  url?: string;
}

const games: Game[] = [
  {
    title: "逃离宏业电子厂",
    description: "在空无一人的工厂里探索线索、破解密码，想办法赶在一切失控前逃出去。",
    url: "https://www.escapefromhongye.xyz/super-broccoli",
    image: "https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=escape+game+factory+setting+pixel+art+style&sign=045d48518ed6589b3a4bbb74d800b983",
    tag: "叙事解谜",
  },
  {
    title: "肌肉的诱惑",
    description: "一位学生离奇失踪，你只有他遗落的手机。顺着聊天记录，找出事件背后的真相。",
    url: "https://www.escapefromhongye.xyz/lure_for_fitness",
    image: "https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=fitness+game+muscle+building+cartoon+style&sign=ed050fd4741505427cac33425cce7aa8",
    tag: "手机解谜",
  },
  {
    title: "地铁抢座大作战",
    description: "观察乘客、预判路线，在瞬息万变的通勤现场里抢到属于你的那个座位。",
    url: "https://www.escapefromhongye.xyz/hub111",
    image: "https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=subway+seat+game+cartoon+style+crowded+train+platform&sign=8f66f1158e711fbf800dfc3c9abe02b7",
    tag: "策略反应",
  },
  {
    title: "电梯 ELEV-9",
    description: "困在一台不太对劲的智能电梯里。识别异常、逐层解谜，直到抵达第九层。",
    url: "https://www.escapefromhongye.xyz/ELEV-9",
    image: "https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=elevator+puzzle+game+futuristic+style+digital+interface&sign=1fe57b59130b86e0aa4527600b2619ec",
    tag: "异常观察",
  },
  {
    title: "字雀 · 文字麻将",
    description: "玩法借鉴《白色失明文字麻将》的非官方线上版本。轻登录开房、扫码邀请，2—4 人即可一起玩。",
    url: "https://www.escapefromhongye.xyz/zique-word-mahjong",
    image: "/assets/zique-cover.svg",
    tag: "多人文字",
  },
];

const productSlots: ProductSlot[] = [
  {
    title: "学习工坊",
    eyebrow: "EDUCATION PRODUCT",
    description: "上传自己的教材，生成分级互动课程；也可以直接从示例内容开始学习。",
    icon: "book",
    accent: "product-card--lime",
    url: "/learning-workshop/",
  },
  {
    title: "DJ 产品",
    eyebrow: "MUSIC & PLAY",
    description: "围绕选曲、混音和现场体验的小工具，将从这里开始播放。",
    icon: "wave",
    accent: "product-card--violet",
  },
  {
    title: "Trading Agent",
    eyebrow: "AGENT EXPERIMENTS",
    description: "交易研究与智能 Agent 实验的展示位，只陈列可公开体验的作品。",
    icon: "chart",
    accent: "product-card--coral",
  },
];

const xiaohongshuUrl = "https://www.xiaohongshu.com/user/profile/580cd5526a6a6943b735378c";

function Icon({ name, size = 22 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, ReactNode> = {
    spark: <path d="M12 2l1.7 5.3L19 9l-5.3 1.7L12 16l-1.7-5.3L5 9l5.3-1.7L12 2Zm7 13 .8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15Z" />,
    book: <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11v16H6.5A2.5 2.5 0 0 0 4 21.5v-16Z" /><path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H13v16h4.5a2.5 2.5 0 0 1 2.5 2.5v-16Z" /></>,
    wave: <path d="M3 12h2l2-6 3 12 3-14 3 16 2-8h3" />,
    chart: <><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /><path d="m3 8 7-5 6 8 5-5" /></>,
    game: <><path d="M8 7h8a5 5 0 0 1 4.7 6.7l-1.1 3A2 2 0 0 1 16.4 18L14 16h-4l-2.4 2a2 2 0 0 1-3.2-1.3l-1.1-3A5 5 0 0 1 8 7Z" /><path d="M7 12h4M9 10v4M16.5 11.5h.01M18.5 13.5h.01" /></>,
    arrow: <><path d="M5 12h14" /><path d="m14 7 5 5-5 5" /></>,
    sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.66 6.34l1.41-1.41" /></>,
    moon: <path d="M21 12.8A8.5 8.5 0 1 1 11.2 3 6.6 6.6 0 0 0 21 12.8Z" />,
  };

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={name === "spark" ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[name]}
    </svg>
  );
}

const fadeUp = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } };

function ProductCard({ product, index }: { product: ProductSlot; index: number }) {
  const content = (
    <>
      <div className="product-card__top">
        <span className="product-card__index">0{index + 1}</span>
        <span className="product-card__icon"><Icon name={product.icon} size={28} /></span>
      </div>
      <div>
        <p className="eyebrow">{product.eyebrow}</p>
        <h3>{product.title}</h3>
        <p className="product-card__description">{product.description}</p>
      </div>
      {product.url ? (
        <div className="product-card__status product-card__status--live">立即体验 <Icon name="arrow" size={16} /></div>
      ) : (
        <div className="product-card__status"><span /> 等待首个项目</div>
      )}
    </>
  );

  return product.url ? (
    <motion.a href={product.url} target="_blank" rel="noopener noreferrer" className={`product-card product-card--live ${product.accent}`} variants={fadeUp} transition={{ duration: 0.45, delay: index * 0.08 }}>
      {content}
    </motion.a>
  ) : (
    <motion.article className={`product-card ${product.accent}`} variants={fadeUp} transition={{ duration: 0.45, delay: index * 0.08 }}>
      {content}
    </motion.article>
  );
}

function GameCard({ game, index }: { game: Game; index: number }) {
  return (
    <motion.a href={game.url} target="_blank" rel="noopener noreferrer" className="game-card" variants={fadeUp} transition={{ duration: 0.45, delay: Math.min(index * 0.06, 0.24) }}>
      <div className="game-card__visual">
        <img src={game.image} alt="" loading="lazy" />
        <span className="game-card__tag">{game.tag}</span>
      </div>
      <div className="game-card__body">
        <h3>{game.title}</h3>
        <p>{game.description}</p>
        <span className="text-link">开始体验 <Icon name="arrow" size={18} /></span>
      </div>
    </motion.a>
  );
}

export default function Home() {
  const { toggleTheme, isDark } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="site-shell">
      <header className="site-header">
        <a href="#top" className="brand" onClick={closeMenu} aria-label="摸鱼之神温迪的 LAB 首页">
          <span className="brand__mark">W</span><span>摸鱼之神温迪的 LAB</span>
        </a>
        <button className="menu-toggle" type="button" onClick={() => setMenuOpen((open) => !open)} aria-expanded={menuOpen} aria-label="打开导航"><span /><span /></button>
        <nav className={menuOpen ? "site-nav site-nav--open" : "site-nav"} aria-label="主导航">
          <a href="#games" onClick={closeMenu}>独立游戏</a>
          <a href="#products" onClick={closeMenu}>产品实验</a>
          <a href={xiaohongshuUrl} target="_blank" rel="noopener noreferrer">小红书 ↗</a>
          <a href="https://github.com/windygame96-stack" target="_blank" rel="noopener noreferrer">GitHub ↗</a>
          <button className="theme-button" type="button" onClick={toggleTheme} aria-label={isDark ? "切换到浅色模式" : "切换到深色模式"}><Icon name={isDark ? "sun" : "moon"} size={19} /></button>
        </nav>
      </header>

      <main id="top">
        <section className="hero">
          <div className="hero__glow hero__glow--one" /><div className="hero__glow hero__glow--two" />
          <motion.div className="hero__content" initial="hidden" animate="visible" variants={fadeUp} transition={{ duration: 0.65 }}>
            <p className="hero__kicker"><Icon name="spark" size={17} /> SMALL IDEAS, REAL EXPERIENCES</p>
            <h1>把脑洞，做成<br /><span>可以点开的东西。</span></h1>
            <p className="hero__lead">这里是 Windy 的数字实验场。游戏只是第一章，接下来还有学习工具、音乐产品和智能 Agent。</p>
            <div className="hero__actions">
              <a className="button button--primary" href="#games"><Icon name="game" size={19} /> 开始玩游戏</a>
              <a className="button button--ghost" href="#products">看看产品实验 <Icon name="arrow" size={19} /></a>
            </div>
          </motion.div>
          <motion.div className="hero__note" initial={{ opacity: 0, rotate: 2, y: 18 }} animate={{ opacity: 1, rotate: -2, y: 0 }} transition={{ duration: 0.55, delay: 0.35 }}>
            <span>NOW EXPANDING</span><strong>PLAY<br />LEARN<br />BUILD</strong><small>持续增加中 ↗</small>
          </motion.div>
        </section>

        <section className="section" id="games">
          <div className="section-heading">
            <div><p className="eyebrow">THE GAME SHELF</p><h2>熟悉的游戏，原样保留。</h2></div>
            <p><strong>{games.length}</strong> 个可玩作品，从文字麻将到叙事解谜。每一个都会在新主页里继续被看见。</p>
          </div>
          <motion.div className="game-grid" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.08 }}>
            {games.map((game, index) => <GameCard key={game.title} game={game} index={index} />)}
          </motion.div>
        </section>

        <section className="section section--products" id="products">
          <div className="section-heading section-heading--divided">
            <div><p className="eyebrow">BEYOND GAMES</p><h2>产品实验，新区域。</h2></div>
            <p>为游戏之外的网页留出一块正式空间。以后只需新增一条项目配置，就能把公开作品接进来。</p>
          </div>
          <motion.div className="product-grid" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.18 }}>
            {productSlots.map((product, index) => <ProductCard key={product.title} product={product} index={index} />)}
          </motion.div>
        </section>

        <section className="manifesto">
          <Icon name="spark" size={28} /><p>作品不必属于同一个分类，<br />只要它值得被打开一次。</p>
          <a href="https://github.com/windygame96-stack" target="_blank" rel="noopener noreferrer">在 GitHub 看制作现场 <Icon name="arrow" size={18} /></a>
        </section>
      </main>

      <footer className="site-footer">
        <a href="#top" className="brand"><span className="brand__mark">W</span><span>摸鱼之神温迪的 LAB</span></a>
        <a className="footer-social" href={xiaohongshuUrl} target="_blank" rel="noopener noreferrer">小红书 @摸鱼之神温迪 ↗</a>
        <span>© {new Date().getFullYear()} Windy</span>
      </footer>
    </div>
  );
}
