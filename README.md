# 摸鱼之神温迪的游戏仓库

这是一个展示我开发的独立游戏作品的作品集网站，包含《逃离宏业电子厂》和《肌肉的诱惑》两款游戏。网站支持路径转发功能，可以直接部署到GitHub仓库的main分支，并自动将访问`/super-broccoli`和`/lure_for_fitness`路径的请求转发到对应的GitHub Pages项目。

## 项目结构

```
├── .gitignore
├── README.md
├── index.html
├── package.json
├── pnpm-lock.yaml
├── postcss.config.js
├── src
│   ├── App.tsx
│   ├── components
│   ├── contexts
│   ├── hooks
│   ├── index.css
│   ├── lib
│   ├── main.tsx
│   ├── pages
│   └── vite-env.d.ts
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

## 技术栈

- React 18+
- TypeScript
- Tailwind CSS
- Vite
- React Router DOM
- Framer Motion (动画效果)
- Font Awesome (图标)

## 本地开发

1. 克隆仓库
   ```bash
   git clone https://github.com/windygame96-stack/[你的主仓库名].git
   cd [你的主仓库名]
   ```

2. 安装依赖
   ```bash
   pnpm install
   ```

3. 启动开发服务器
   ```bash
   pnpm dev
   ```

4. 浏览器访问 `http://localhost:3000` 查看效果

## 部署教程

### 准备工作

1. 确保你有GitHub账号，并已经创建了以下仓库：
   - 主仓库（用于部署这个作品集网站）
   - 游戏项目仓库：`super-broccoli`（逃离宏业电子厂）
   - 游戏项目仓库：`lure_for_fitness`（肌肉的诱惑）

2. 修改项目配置
   - 在 `src/App.tsx` 中确认 `GITHUB_USERNAME`、`PROJECT_1_NAME` 和 `PROJECT_2_NAME` 的值是否正确
   - 在 `index.html` 中更新网站标题、描述和作者信息

### 部署到GitHub Pages

#### 方法1：直接部署main分支（推荐）

1. 构建项目
   ```bash
   pnpm build
   ```

2. 将构建产物推送到GitHub仓库的main分支
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

3. 配置GitHub Pages
   - 进入GitHub仓库页面，点击 "Settings"
   - 在左侧菜单中选择 "Pages"
   - 在 "Build and deployment" 部分：
     - Source 选择 "Deploy from a branch"
     - Branch 选择 "main"
     - 点击 "Save"

4. 等待GitHub Pages部署完成，通常需要几分钟时间

#### 方法2：使用GitHub Actions自动部署

1. 在项目根目录创建 `.github/workflows/deploy.yml` 文件
   ```yaml
   name: Deploy to GitHub Pages

   on:
     push:
       branches: [ main ]

   jobs:
     deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         - uses: pnpm/action-setup@v2
           with:
             version: latest
         - name: Use Node.js
           uses: actions/setup-node@v3
           with:
             node-version: '20'
             cache: 'pnpm'
         - run: pnpm install
         - run: pnpm build
         - name: Deploy to GitHub Pages
           uses: peaceiris/actions-gh-pages@v3
           with:
             github_token: ${{ secrets.GITHUB_TOKEN }}
             publish_dir: ./dist
             publish_branch: gh-pages
   ```

2. 提交并推送更改
   ```bash
   git add .github/workflows/deploy.yml
   git commit -m "Add deployment workflow"
   git push origin main
   ```

3. 配置GitHub Pages使用gh-pages分支
   - 进入GitHub仓库页面，点击 "Settings"
   - 在左侧菜单中选择 "Pages"
   - 在 "Build and deployment" 部分：
     - Source 选择 "Deploy from a branch"
     - Branch 选择 "gh-pages"
     - 点击 "Save"

### 路径转发功能说明

网站包含自动路径转发功能，当用户访问：
- `https://[你的域名]/super-broccoli` 或 `https://[你的用户名].github.io/[主仓库名]/super-broccoli` 时，会自动跳转到 `https://[你的用户名].github.io/super-broccoli`
- `https://[你的域名]/lure_for_fitness` 或 `https://[你的用户名].github.io/[主仓库名]/lure_for_fitness` 时，会自动跳转到 `https://[你的用户名].github.io/lure_for_fitness`

此功能在 `src/App.tsx` 中实现，确保了即使直接访问主域名下的游戏路径，用户也能被正确引导到对应的游戏项目。

## 自定义配置

如需修改域名或项目信息：

1. 更新 `index.html` 中的 `<title>`、`<meta name="description">` 和其他元标签
2. 修改 `src/App.tsx` 中的项目配置常量
3. 更新 `src/pages/Home.tsx` 中的游戏数据和页脚信息

## 注意事项

- 确保你的游戏项目仓库已经正确配置了GitHub Pages
- 部署后，可能需要等待一段时间（通常为几分钟）才能在浏览器中看到更新后的内容
- 如遇到路径转发问题，检查 `src/App.tsx` 中的项目名称和GitHub用户名是否正确
- 网站支持深色/浅色模式切换，可以通过右上角的按钮切换

## 联系我

- GitHub: [windygame96-stack](https://github.com/windygame96-stack)
- 小红书: 摸鱼之神温迪

© 2025 摸鱼之神温迪的游戏仓库