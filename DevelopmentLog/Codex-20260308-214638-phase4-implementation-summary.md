# 第四阶段实施总结

## 阶段目标

第四阶段的目标是把项目从“能跑”推进到“有基本工程化约束”：

- 增加最小可执行的校验、备份、烟雾测试能力。
- 收口前台正式构建链，减少对 CDN 的依赖。
- 清理会影响持续开发的损坏页面和脆弱脚本。

## 本次完成

### 1. 工程脚本与 npm scripts

新增并接入了以下脚本：

- `scripts/lint-project.cjs`
- `scripts/validate-data.cjs`
- `scripts/backup-data.cjs`
- `scripts/smoke-test.cjs`

`package.json` 已补齐：

- `npm run lint`
- `npm run validate:data`
- `npm run backup:data`
- `npm run smoke:test`
- `npm run check`

同时更新了 `.gitignore`，忽略：

- `backups/`
- `.tmp-*/`

### 2. 数据校验与备份机制

完成了种子数据的最小 schema 校验，覆盖：

- JSON 文件结构是否合法。
- `posts/categories/tags/sections/nav` 的 `id` 是否重复。
- `posts.slug` 是否重复。
- 文章对分类、标签、栏目引用是否合法。
- `settings` 中 `profile/about/skills` 的基本结构是否合法。

新增数据备份能力：

- 备份目录：`backups/data/<timestamp>`
- 自动生成 `manifest.json`
- 记录文件大小与 SHA-256
- 支持按 `BLOG_BACKUP_RETAIN` 清理旧备份

本次实际生成的备份目录：

- `backups/data/20260308-213339`

### 3. 前台构建链收口

前台正式入口已收口到本地构建链：

- `src/main.js` 现在正式引入 `src/index.css`
- `index.html` 已移除 Tailwind CDN
- `index.html` 已移除 Iconify CDN
- Markdown 代码块复制按钮改成内联 SVG，不再依赖运行时图标脚本

图标方案已经统一为 `@iconify/vue` 全局组件：

- 在 `src/main.js` 注册全局 `AppIcon`
- 前台组件和视图里的 `span.iconify` 已替换为 `AppIcon`

### 4. 页面修复与重写

修复并重写了会阻断构建或后台使用的页面：

- `admin/tags.html`
  - 重写到后台公共壳子
  - 统一走 `/api/data/tags` 和 `/api/data/posts`
  - 支持搜索、创建、编辑、删除、引用数统计
  - 删除前会校验文章引用

- `src/views/HomeView.vue`
- `src/views/CategoriesView.vue`
- `src/views/ColumnView.vue`
- `src/views/LifeView.vue`
- `src/views/ToolsView.vue`
- `src/views/IssuesView.vue`

这些页面此前存在不同程度的编码污染和闭合标签损坏，已经改成可正常参与 Vite 构建的版本。其中 `Life/Tools/Issues` 这三页的静态文案改成了英文，目的是优先消除乱码和模板损坏风险。

### 5. lint 规则完善

`scripts/lint-project.cjs` 已补这些规则：

- 检查关键 JS/HTML 文件是否可做静态语法解析
- 检查 `src/main.js` 是否引入 `./index.css`
- 检查 `index.html` 不再依赖 Tailwind CDN
- 检查 `index.html` 不再依赖 md-editor CDN CSS
- 检查 `index.html` 不再依赖 Iconify CDN

同时兼容了 ESM 文件中的：

- `import/export`
- `import.meta`

## 备份与回收

旧版 `admin/tags.html` 在重写前已备份到：

- `CodeTrash/Codex-20260308-210657-phase4-pre-rewrite/admin-tags.html.original`

## 验证结果

本阶段已实际执行并通过：

- `npm run lint`
- `npm run validate:data`
- `npm run build`
- `npm run smoke:test`
- `npm run backup:data`

对应结果：

- `LINT_OK`
- `DATA_VALID (10 posts, 50 categories, 20 tags, 5 sections, 7 nav items)`
- `vite build` 通过，前台按视图拆包正常
- `SMOKE_TEST_OK`
- `BACKUP_OK backups/data/20260308-213339`

## 当前已知说明

`npm run check` 在 Codex 当前沙箱里仍然会在 `vite/esbuild` 阶段触发 `spawn EPERM`。这不是项目代码本身的失败，因为：

- 单独执行 `npm run lint` 通过
- 单独执行 `npm run validate:data` 通过
- 单独执行 `npm run build` 通过
- 单独执行 `npm run smoke:test` 通过

也就是说，第四阶段的工程能力已经落地，但 `npm run check` 在这个受限执行环境里还不能作为“单命令验收”使用。正常本地终端是否受影响，需要以后在非沙箱环境再确认一次。

## 阶段结论

第四阶段目标已完成。

项目现在具备了：

- 基础 lint / data validate / smoke test / backup 能力
- 前台正式构建链，不再依赖公共 CDN 图标脚本
- 后台标签管理正式页
- 可通过的生产构建

剩余更高层的后续工作，会进入下一阶段的持续迭代，而不是继续停留在“先把工程底座补齐”的状态。
