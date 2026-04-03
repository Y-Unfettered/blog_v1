# my_blog 项目开发规范

## 1. 目的

本规范用于约束后续协作开发，避免继续出现以下问题：

- 接口路径混用
- 数据字段重复和语义冲突
- 页面编码混乱
- 备份文件散落在正式目录
- 文档和变更记录无统一格式

默认要求：后续所有参与此项目开发的协作者，都必须遵守本规范。

## 2. 目录职责

### 2.1 正式业务目录

- `src/`
  - 前台博客正式代码
- `admin/`
  - 后台管理正式页面
- `scripts/`
  - Node 端脚本、管理 API、初始化脚本
- `data/seed/`
  - 正式 JSON 数据
- `deploy/`
  - Docker 和 Nginx 部署配置

### 2.2 非业务目录

- `DevelopmentLog/`
  - 项目总结、阶段汇报、开发规范、实施记录
- `CodeTrash/`
  - 回收站，只放已停用、待确认删除、重写前备份的旧文件

## 3. 文档命名规范

放入 `DevelopmentLog/` 的文档，统一命名为：

`名字+时间+任务.md`

示例：

- `Codex-20260308-192601-phase1-implementation-summary.md`
- `Codex-20260308-193340-project-development-standard.md`

要求：

- 时间格式固定为 `yyyyMMdd-HHmmss`
- 文件名使用英文、数字、中划线
- 不允许再使用 `summary.md`、`new plan.md`、`temp.md` 这类无信息量命名

## 4. 回收站规范

所有不再继续使用、但暂时不能直接删除的文件，统一移动到 `CodeTrash/`。

要求：

- 不要在正式目录保留 `.bak`、`.bak2`、`copy`、`new`、`v2`、`final-final` 一类文件
- 需要保留旧文件时，移动到 `CodeTrash/`
- 若是“正式页面重写前备份”，文件名统一带阶段标记

示例：

- `settings.phase1-pre-rewrite.html`
- `categories.phase2-pre-refactor.html`

禁止事项：

- 禁止在 `admin/`、`src/`、`scripts/` 下直接堆积历史备份文件

## 5. 编码与文件格式规范

### 5.1 编码

所有新建或重写文件必须使用：

- `UTF-8`

禁止：

- UTF-16
- GBK/GB18030
- 编码未知的混乱文件

### 5.2 文本规范

- 默认使用 LF 或 CRLF 均可，但同一文件内必须一致
- 新代码、配置、文档默认使用 ASCII 可表达内容
- 中文文案允许使用中文，但不要混入乱码

## 6. API 规范

### 6.1 公共读取接口

公开读取接口保留以下规则：

- `/api/posts`
- `/api/categories`
- `/api/tags`
- `/api/nav`
- `/api/settings`
- `/api/sections`

用途：

- 给前台页面读取公开数据
- 不要求登录

### 6.2 后台管理接口

后台管理统一使用：

- `/api/data/*`

示例：

- `GET /api/data/posts`
- `POST /api/data/posts`
- `PATCH /api/data/posts/:id`
- `DELETE /api/data/posts/:id`

要求：

- 后台页面禁止再直接向 `/api/categories`、`/api/settings` 发写请求
- 后台增删改查只能走 `/api/data/*`
- 401 必须视为登录失效并跳回 `/admin`

### 6.3 SSE 规范

实时更新统一使用：

- `/api/events`

如果前台保留 `EventSource`，服务端和 Nginx 必须同时支持，不允许只写前端不落服务端。

## 7. 数据模型规范

### 7.1 文章 posts

后续以以下字段作为主标准：

- `id`
- `title`
- `slug`
- `summary`
- `content`
- `categories`
- `categoryIds`
- `categoryId`
- `tags`
- `tagIds`
- `status`
- `published`
- `createdAt`
- `updatedAt`
- `created_at`
- `updated_at`

约束：

- `categories`、`categoryIds`、`categoryId` 必须保持一致
- `tags`、`tagIds` 必须保持一致
- 新写入数据时不允许只写单个旧字段而不做同步
- `status` 只能是 `draft` 或 `published`
- `published` 必须与 `status` 保持一致

### 7.2 分类 categories

标准字段：

- `id`
- `name`
- `slug`
- `description`
- `color`
- `icon`
- `order`
- `sectionId`

要求：

- 正式字段统一使用 `description`
- 不要再引入 `desc` 作为新字段

### 7.3 栏目 sections

标准字段：

- `id`
- `name`
- `slug`
- `url`
- `icon`
- `color`
- `order`
- `enabled`
- `description`

要求：

- 历史数据可兼容读取 `desc`
- 新保存数据统一写 `description`

### 7.4 设置 settings

标准字段可以继续扩展，但必须满足：

- 页面保存时使用“合并更新”
- 不允许因保存基础设置把 `profile`、`about`、`markdownTheme` 等扩展字段抹掉

## 8. 前端开发规范

### 8.1 `src/` 代码

- 新功能优先拆分到组件、组合式逻辑或服务层
- 禁止继续把大块新功能直接硬塞进单一超大文件
- 需要保留兼容旧入口时，优先做跳转页，不要保留两套并行逻辑

### 8.2 路由与入口

- 当前主站以 `index.html + App.vue` 为主入口
- `article.html` 仅作为旧链接兼容页
- 后续若继续整理架构，应优先收口入口，而不是新增更多 HTML 入口页

## 9. 后台开发规范

### 9.1 页面规则

`admin/` 下只允许保留正式页面：

- `index.html`
- `dashboard.html`
- `posts.html`
- `editor.html`
- `categories.html`
- `tags.html`
- `sections.html`
- `settings.html`

禁止：

- 新增 `index-v3.html`
- 新增 `editor-new.html`
- 新增 `posts-copy.html`

需要实验时：

- 在分支做
- 或先放临时文件，完成后必须移入 `CodeTrash/`

### 9.2 后台请求规则

- 所有后台请求必须统一处理 token
- 出现 401 必须清理登录态并跳转
- 后台页面不要再写本地演示数据作为正式兜底逻辑

## 10. 服务端开发规范

### 10.1 环境变量

以下变量为必填：

- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`
- `JWT_SECRET`

要求：

- 服务端启动时缺失上述变量应直接报错
- 禁止再回退到默认管理员账号和默认密钥

### 10.2 JSON 写入

- 所有写入必须走统一规范化逻辑
- 新增数据时必须补齐必要字段
- 写入前要保证目录存在
- 任何写操作后，如前台依赖 SSE，应广播变更事件

## 11. 构建与验证规范

任何涉及正式功能的改动，提交前至少完成以下检查：

- `node --check scripts/admin-server.cjs`
- `npm run build`

如果改动涉及接口或数据写入，再额外做最小 smoke test：

- 登录
- 读取列表
- 新建一条记录
- 更新一条记录
- 删除一条记录

## 12. 变更记录规范

完成一阶段或一批关键改动后，必须在 `DevelopmentLog/` 新增记录文档，至少包含：

- 改了什么
- 为什么改
- 改了哪些文件
- 如何验证
- 还剩什么问题

禁止只口头说明，不落文档。

## 13. 禁止事项

以下行为默认禁止：

- 在正式目录堆积 `.bak` 文件
- 新建多个并行 HTML 试验页不清理
- 混用 `/api/*` 和 `/api/data/*` 做后台写操作
- 保存设置时整份覆盖 JSON 造成字段丢失
- 提交乱码文件
- 提交未知编码文件
- 提交未验证的接口改动
- 在未说明的情况下改写正式数据结构

## 14. 执行原则

如果规范与临时需求冲突，优先原则如下：

1. 生产正确性
2. 数据不丢失
3. 接口契约一致
4. 目录清晰
5. 文档可追踪

任何协作者如果要偏离本规范，必须先在 `DevelopmentLog/` 留下说明。
