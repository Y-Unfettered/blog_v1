# 第一阶段完成总结

## 文档信息

- 执行人：Codex
- 时间：2026-03-08 19:26:01
- 任务：完成第一阶段开发计划

## 本阶段完成内容

### 1. 统一后台 API 契约

- 重写 `scripts/admin-server.cjs`
- 保留公开读取接口 `/api/posts`、`/api/categories`、`/api/tags`、`/api/nav`、`/api/settings`、`/api/sections`
- 统一后台管理使用 `/api/data/*`
- 新增 collection `POST` 创建单条记录能力
- 将 item `PUT/PATCH` 统一为“保留原字段并合并更新”
- 为写操作新增 SSE 广播，配合前台已有 `EventSource`

### 2. 修复后台正式页面的数据读写问题

- 重建为 UTF-8 可维护版本：
  - `admin/categories.html`
  - `admin/settings.html`
  - `admin/sections.html`
- `categories` 页面改为读取 `/api/data/categories`，并基于文章数据实时统计分类使用量
- `settings` 页面改为读取和保存 `/api/data/settings`，保存时与旧设置合并，避免覆盖 `profile/about/markdownTheme`
- `sections` 页面统一使用 `description` 字段，不再混用 `desc`

### 3. 修复文章编辑和列表中的旧字段问题

- `admin/editor.html`
  - 保存草稿/发布时统一生成 `categories/categoryIds/categoryId`
  - 统一生成 `tags/tagIds`
- `admin/posts.html`
  - 列表页展示分类名称时不再直接显示分类 ID

### 4. 处理遗留文章入口

- 重写 `article.html`
- 将旧文章页改为兼容跳转页
- 支持根据旧 `id` 参数请求 `/api/posts` 后重定向到当前 `/#/post/{slug}` 路由
- 更新 `vite.config.js`，确保构建产物中包含 `article.html`

### 5. 补齐初始化和部署配置

- `scripts/init-data.cjs` 补上 `sections` 初始化
- `.env.example` 重新整理
- `docker-compose.yml` / `docker-compose.dev.yml`
  - 补充 `ADMIN_USERNAME`
  - 补充 `ADMIN_PASSWORD`
  - 补充 `JWT_SECRET`
  - 补充 `HOST`
- `deploy/nginx.conf`
  - 增加 `/api/events` 代理配置
  - 关闭 SSE 缓冲

### 6. 保留旧版页面备份

- 因为 `categories/settings/sections` 三个正式页存在编码问题，无法直接安全 patch
- 已将旧版原件移动到回收站，并以 `.phase1-pre-rewrite` 形式保留

## 验证结果

### 已执行

```bash
node --check scripts/admin-server.cjs
npm run build
```

结果：

- 服务端语法检查通过
- 前端构建通过
- 构建产物中已生成 `dist/article.html`

### 已执行 smoke test

使用临时数据目录启动服务，验证以下流程全部通过：

- `GET /api/posts`
- `POST /api/login`
- `GET /api/data/categories`
- `POST /api/data/categories`
- `PATCH /api/data/categories/:id`
- `DELETE /api/data/categories/:id`
- `GET /api/data/settings`
- `PUT /api/data/settings`
- `POST /api/data/sections`

结果：

- `SMOKE_TEST_OK`

## 当前仍未处理的事项

这些不属于第一阶段已完成范围，但建议进入下一阶段：

- 前台 `src/App.vue` 仍然过大，尚未拆分
- 前端产物体积仍然偏大，构建时仍有 chunk size warning
- 后台仪表盘 `dashboard.html` 仍然是模拟数据
- 管理后台仍依赖多个 CDN 资源
- `src/Article.vue` 目前已成为遗留文件，尚未正式移除

## 本阶段修改文件

- `scripts/admin-server.cjs`
- `scripts/init-data.cjs`
- `article.html`
- `vite.config.js`
- `admin/categories.html`
- `admin/settings.html`
- `admin/sections.html`
- `admin/editor.html`
- `admin/posts.html`
- `.env.example`
- `docker-compose.yml`
- `docker-compose.dev.yml`
- `deploy/nginx.conf`
