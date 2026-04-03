# 第二阶段实施总结

## 任务目标

本阶段目标是整理前台架构，降低 `src/App.vue` 的耦合度，抽离前台数据访问与路由状态，并完成页面级拆分与构建优化。

## 本次完成内容

### 1. 前台数据与状态模块化

- 新增 `src/constants/blog.js`，统一维护前台默认导航、默认资料、栏目图片和分页常量。
- 新增 `src/utils/blog.js`，收口文章/分类/标签规范化、Markdown 渲染、TOC 构建、搜索匹配、路径处理等纯函数。
- 新增 `src/services/blogApi.js`，统一公共接口读取与前台数据模型标准化。
- 新增 `src/composables/useBlogData.js`，统一管理前台公开数据、设置、SSE 实时刷新与映射表。
- 新增 `src/composables/useBlogRouting.js`，把原本写死在 `App.vue` 的 hash 路由、列表状态恢复、栏目切换、筛选切换全部独立出来。
- 新增 `src/composables/useBlogComputedState.js`，集中管理首页、专栏页、设计页、详情页相关派生数据。

### 2. 页面级拆分与异步加载

- 新增 `src/views/HomeView.vue`
- 新增 `src/views/PostDetailView.vue`
- 新增 `src/views/CategoriesView.vue`
- 新增 `src/views/ColumnView.vue`
- 新增 `src/views/TagsView.vue`
- 新增 `src/views/AboutView.vue`
- 新增 `src/views/DesignView.vue`
- 新增 `src/views/ToolsView.vue`
- 新增 `src/views/IssuesView.vue`
- 新增 `src/views/LifeView.vue`

现在 `src/App.vue` 只保留：

- 导航与页脚壳层
- 各视图异步装载与组装
- TOC、回到顶部、邮箱复制、代码块复制、Hero 自动轮播等少量 UI 交互

### 3. 打包与性能优化

- `App.vue` 的页面分支改为异步组件，形成真正的按视图拆包。
- `vite.config.js` 增加 `manualChunks`，把 `vue` 和 Markdown 相关依赖拆出主包。
- `src/utils/blog.js` 改为按常用语言注册 `highlight.js`，不再打全量语言包。

## 验证结果

已执行：

- `npm run build`

验证结果：

- 构建通过
- 原先前台主包约 `1.14 MB`，当前主入口包降到约 `83.19 kB`
- Markdown 相关依赖独立成约 `56.75 kB` 的单独 chunk
- 各页面视图已经拆成独立 chunk，首页不再一次性加载全部页面代码

## 本阶段的取舍说明

原计划里提到“引入 Vue Router”。这次我没有直接加第三方路由依赖，而是先完成了：

- 路由状态抽象
- 页面拆分
- 数据层规范化
- 首屏拆包

原因是当前项目已经稳定运行在 hash 路由模型上，这一轮优先解决的是维护性与包体问题。现在路由逻辑已经从 `App.vue` 抽离，后续如果要正式切到 `vue-router`，改造成本会比现在低很多。

## 当前遗留项

- 目前仍然是 hash 路由，不是正式的 `vue-router` 实现。
- `tools / issues / life` 三个页面仍然是静态演示内容，尚未接入后台数据。
- 我只做了构建级验证，没有做浏览器手工回归。

## 建议的下一步

建议进入第三阶段：

- 后台公共壳与请求封装统一
- 仪表盘改为真实数据
- 让 `tools / issues / life` 与后台数据联通
- 清理更多遗留静态页与试验性实现
