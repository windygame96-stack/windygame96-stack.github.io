# 摸鱼之神温迪的 LAB

Windy 的数字作品门户，集中展示独立游戏与游戏之外的产品实验。

## 部署说明

1. 运行 `npm install`
2. 运行 `npm run build:client`
3. 将 `dist/index.html` 与 `dist/assets` 同步到仓库根目录
4. 推送 `main` 分支，等待 GitHub Pages 完成更新

## 页面结构

- `独立游戏`：保留原有 5 个可玩项目
- `产品实验`：已接入学习工坊；DJ 产品与 Trading Agent 为预留展示位
- 支持深色/浅色主题和移动端导航

## 游戏项目

1. 逃离宏业电子厂
2. 肌肉的诱惑
3. 地铁抢座大作战
4. 电梯ELEV-9
5. 字雀 · 文字麻将

## 添加新产品

产品和游戏内容集中在 `src/pages/Home.tsx` 的 `productSlots` 与 `games` 数组中。给产品补充公开链接后，可将预留卡片改为可点击项目卡片。

教育平台源码位于 `projects/learning-workshop`，构建后的线上版本位于 `learning-workshop`，访问路径为 `/learning-workshop/`。

## 本地运行

```bash
npm install
npm run dev:client
```

开发页面位于 `http://localhost:3000/app.html`；根目录的 `index.html` 是供 GitHub Pages 直接使用的构建版本。

构建静态文件：

```bash
npm run build:client
```
