# 前端样式链路修复记录

时间：2026-03-09 16:41:32

## 问题现象

前端页面出现以下症状：

- 导航栏在桌面端仍然表现为移动端折叠状态
- 大量间距、颜色、圆角、布局类没有生效
- 页面像“只有部分样式存在”

## 根因

问题不在 Vue 组件本身，而在 Tailwind 的入口写法。

项目当前使用的是 Tailwind CSS v4，但 `src/index.css` 仍然沿用旧的：

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

这导致前端很多实际用到的类没有被正确纳入产物，尤其是：

- `px-4`
- `max-w-7xl`
- `text-white`
- `rounded-xl`
- `md:hidden`
- `lg:flex`

结果就是页面只剩下一部分基础样式和少量工具类，桌面断点相关布局基本失效。

## 本次修复

更新文件：

- `src/index.css`

修复方式：

- 改为 Tailwind v4 的入口写法：`@import "tailwindcss";`
- 显式声明前端扫描源：
  - `@source "../index.html";`
  - `@source "./**/*.{vue,js,ts,jsx,tsx}";`

## 验证结果

已执行：

- `npm run build`

构建后重新检查新的 CSS 产物，确认以下关键类已重新进入产物：

- `.px-4`
- `.max-w-7xl`
- `.text-white`
- `.rounded-xl`
- `.md\\:hidden`
- `.lg\\:flex`

同时前端开发服务已重启：

- `http://127.0.0.1:5173/`

启动日志：

- `DevelopmentLog/Codex-20260309-164039-frontend-service.log`
- `DevelopmentLog/Codex-20260309-164039-frontend-service.err.log`

## 说明

这次修的是样式产出链路，不是单个页面补 class。

如果你接下来刷新前端后仍看到某一块样式不对，那就不是“样式没加载”，而更可能是具体组件自己的布局或文案问题，可以继续逐块收。
