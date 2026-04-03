# 后台内容管理与图文管理改造

时间：2026-03-09 23:55:45

## 本次完成

- 后台侧边栏结构调整：
  - `概览` 改为 `概览面板`
  - 新增父级分组 `内容管理`
  - `内容管理` 下拆分为 `文章管理` 和 `图文管理`
- 共享后台壳层已支持分组导航，变更文件：
  - `admin/admin-common.js`
  - `admin/admin-common.css`
- 文章管理页面标题和描述已对齐到 `文章管理`
- 新增图文管理页面：
  - `admin/graphics.html`
  - 支持多图上传、本地预览、封面切换、正文编辑、话题、栏目/分类/标签、草稿/发布、右侧列表继续编辑
- 新增图文独立数据集合：
  - `data/seed/graphics.json`
- 服务端已补图文集合规范化与 CRUD 支持：
  - `scripts/admin-server.cjs`
- 初始化和校验脚本已同步：
  - `scripts/init-data.cjs`
  - `scripts/validate-data.cjs`
  - `scripts/smoke-test.cjs`

## 数据模型说明

图文管理当前使用独立集合 `graphics.json`，字段以轻量图文为主：

- `id`
- `title`
- `content`
- `summary`
- `images`
- `cover`
- `topics`
- `sectionId`
- `categoryId`
- `tagIds`
- `slug`
- `status`
- `published`
- `createdAt` / `updatedAt`

服务端会自动做这些归一化：

- 第一张图片自动作为封面
- `topics` 自动补 `#`
- `slug` 自动生成 ASCII 安全值
- `status/published` 自动同步
- 自动补时间字段

## 验证结果

已执行并通过：

- `node --check scripts/admin-server.cjs`
- `admin/graphics.html` 内联脚本抽取后 `node --check`
- `npm run validate:data`
- `npm run lint`
- `npm run build`
- `npm run smoke:test`

## 备注

- 当前图文管理是后台独立内容入口，前台还没有接这套 `graphics` 数据。
- 图片目前以 Data URL 形式直接保存在 JSON 中，适合当前本地管理和原型阶段；后续如果要正式长期使用，建议再切到本地上传目录或对象存储。
