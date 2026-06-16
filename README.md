# 蛋与兔 · 碎梦童话

> 像素风暗黑童话 **互动 Web 绘本** — 滚动叙事 · 点击探索 · 章内小游戏｜个人独立创作

**在线试玩 → [qiadastrachen-bit.github.io/DamnRabit](https://qiadastrachen-bit.github.io/DamnRabit/)**

---

## 这是什么

一款在浏览器中阅读的 **互动绘本**：长滚动叙事、可点击彩蛋、章节式分支体验，并内置像素风平台小游戏 **「拾梦夜行」**（收集 15 枚梦碎片、跳跃闯关）。

适合展示 **交互设计 · 前端实现 · 叙事型产品** 能力。

---

## 功能一览

| 模块 | 说明 |
|------|------|
| 📖 滚动叙事 | 序 / 三章 / 终章，暗黑童话文本与视觉节奏 |
| 🖱️ 点击交互 | 批注、切换、聆听、拾句等微互动 |
| 🎮 拾梦夜行 | 键盘移动跳跃，收集梦碎片，ESC 暂停 |
| 🎨 像素视觉 | CSS 动画、粒子、近场触发叙事 |
| 📱 响应式 | 手机 / 电脑均可试玩 |

---

## 技术栈

| 类别 | 技术 |
|------|------|
| 结构 | HTML5 |
| 样式 | CSS3（动画、布局、像素风） |
| 逻辑 | 原生 JavaScript（无框架） |
| 部署 | GitHub Pages |

**主要脚本：** `js/game.js` 游戏 · `js/interactions.js` 交互 · `js/particles.js` 粒子 · `js/audio.js` 音效 · `js/hero-proximity.js` 近场叙事

---

## 本地预览

```bash
git clone https://github.com/qiadastrachen-bit/DamnRabit.git
cd DamnRabit
python -m http.server 8765
```

浏览器打开 http://localhost:8765

---

## GitHub Pages 部署

1. **最简单**：Settings → Pages → Source 选 **Deploy from a branch** → Branch **master** → Folder **/ (root)** → Save
2. **或用 Actions**：workflow 跑完后，Source 选 **gh-pages** 分支

---

## 作者

**陈锦彤** · 北邮智能交互设计  
GitHub：[qiadastrachen-bit](https://github.com/qiadastrachen-bit)

---

个人创作项目，欢迎试玩与反馈。
