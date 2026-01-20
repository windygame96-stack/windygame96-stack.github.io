import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/lib/utils';

// 游戏数据类型定义
interface Game {
  id: number;
  title: string;
  description: string;
  gameUrl: string;
  imageUrl: string;
}

// 游戏数据
const games: Game[] = [
  {
    id: 1,
    title: "逃离宏业电子厂",
    description: "现在是2024年6月17日，你是一个收债人，你来宏业电子厂收债，但这里空无一人，且大门紧锁，需要密码才能逃出，你被困在了这里，通过探索解谜逃出这里吧。",
    gameUrl: "https://www.escapefromhongye.xyz/super-broccoli",
    imageUrl: "https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=escape+game+factory+setting+pixel+art+style&sign=045d48518ed6589b3a4bbb74d800b983"
  },
  {
    id: 2,
    title: "肌肉的诱惑",
    description: "你是一个大学辅导员，你的一个学生李凌失踪了一整天，你现在只有一个他室友在宿舍找到他的手机，找出他失踪的真相，并前去解救他吧",
    gameUrl: "https://www.escapefromhongye.xyz/lure_for_fitness",
    imageUrl: "https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=fitness+game+muscle+building+cartoon+style&sign=ed050fd4741505427cac33425cce7aa8"
  },
  {
    id: 3,
    title: "地铁抢座大作战",
    description: "在拥挤的地铁中，你需要运用策略和反应速度，在瞬息万变的环境中抢占座位。每一关都有不同的挑战和障碍，展示你的抢座技巧吧！",
    gameUrl: "https://www.escapefromhongye.xyz/hub111",
    imageUrl: "https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=subway+seat+game+cartoon+style+crowded+train+platform&sign=8f66f1158e711fbf800dfc3c9abe02b7"
  }
];

// 游戏卡片组件
const GameCard = ({ game }: { game: Game }) => {
  const { theme } = useTheme();
  
  return (
    <motion.a
      href={game.gameUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "block w-full rounded-xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl",
        theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'
      )}
      whileHover={{ y: -8 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="relative h-48 overflow-hidden">
        <img 
          src={game.imageUrl} 
          alt={game.title} 
          className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
        <div className="absolute bottom-0 left-0 p-4 text-white">
          <h3 className="text-xl font-bold">{game.title}</h3>
        </div>
      </div>
      <div className="p-4">
        <p className={cn("text-sm", theme === 'dark' ? 'text-gray-300' : 'text-gray-600')}>
          {game.description}
        </p>
        <div className="mt-4 flex items-center justify-between">
          <span className={cn("text-sm", theme === 'dark' ? 'text-blue-400' : 'text-blue-600')}>
            <i className="fas fa-gamepad mr-1"></i> 开始游戏
          </span>
          <motion.div 
            className="w-8 h-8 rounded-full flex items-center justify-center"
            whileHover={{ scale: 1.2 }}
          >
            <i className={cn("fas fa-arrow-right", theme === 'dark' ? 'text-blue-400' : 'text-blue-600')}></i>
          </motion.div>
        </div>
      </div>
    </motion.a>
  );
};

// 背景装饰组件
const BackgroundDecorations = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <motion.div 
        className="absolute -top-20 -right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.5, 0.8, 0.5] 
        }}
        transition={{ 
          duration: 10,
          repeat: Infinity,
          repeatType: "reverse" 
        }}
      />
      <motion.div 
        className="absolute -bottom-20 -left-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
        animate={{ 
          scale: [1.2, 1, 1.2],
          opacity: [0.8, 0.5, 0.8] 
        }}
        transition={{ 
          duration: 12,
          repeat: Infinity,
          repeatType: "reverse" 
        }}
      />
    </div>
  );
};

// 主页面组件
export default function Home() {
  const { theme, toggleTheme, isDark } = useTheme();
  const [isLoaded, setIsLoaded] = useState(false);
  
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div className={cn("min-h-screen w-full", theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900')}>
      <BackgroundDecorations />
      
      {/* 导航栏 */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-opacity-80 border-b" style={{ 
        backgroundColor: theme === 'dark' ? 'rgba(17, 24, 39, 0.8)' : 'rgba(255, 255, 255, 0.8)',
        borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
      }}>
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <motion.h1 
            className="text-2xl md:text-3xl font-bold flex items-center"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <i className="fas fa-gamepad mr-2 text-blue-500"></i>
            摸鱼之神温迪的游戏仓库
          </motion.h1>
          
          <motion.button
            onClick={toggleTheme}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
              theme === 'dark' ? 'bg-gray-800 text-yellow-300' : 'bg-blue-100 text-gray-700'
            }`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {isDark ? <i className="fas fa-sun"></i> : <i className="fas fa-moon"></i>}
          </motion.button>
        </div>
      </header>
      
      {/* 主内容 */}
      <main className="container mx-auto px-4 py-8 md:py-16">
        <motion.section
          className="mb-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
           <h2 className="text-3xl md:text-4xl font-bold mb-4">探索我的游戏作品</h2>
           <p className={cn("text-lg max-w-2xl mx-auto", theme === 'dark' ? 'text-gray-400' : 'text-gray-600')}>
             欢迎来到摸鱼之神温迪的游戏仓库！这里存放着我开发的独立游戏作品，欢迎体验和Star支持！</p>
        </motion.section>
        
         <motion.section 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {games.map((game, index) => (
            <GameCard key={game.id} game={game} />
          ))}
        </motion.section>
      </main>
      
      {/* 页脚 */}
      <footer className={cn("py-8 border-t", theme === 'dark' ? 'border-gray-800 text-gray-400' : 'border-gray-200 text-gray-600')}>
        <div className="container mx-auto px-4 text-center">
            <p>© 2025 摸鱼之神温迪的游戏仓库 | <a href="https://www.escapefromhongye.xyz" className="text-blue-500 hover:underline">www.escapefromhongye.xyz</a></p>
           <div className="mt-4 flex justify-center space-x-4">
             <motion.a 
                href="https://github.com/windygame96-stack" 
                target="_blank" 
               rel="noopener noreferrer"
               className="hover:text-blue-500 transition-colors"
               whileHover={{ scale: 1.2 }}
             >
               <i className="fab fa-github text-xl"></i>
             </motion.a>
             <motion.a 
                href="#" 
                className="hover:text-blue-500 transition-colors flex items-center"
                whileHover={{ scale: 1.2 }}
             >
               <i className="fab fa-xiaohongshu text-xl mr-1"></i>
               <span className="text-sm">摸鱼之神温迪</span>
             </motion.a>
           </div>
        </div>
      </footer>
    </div>
  );
}